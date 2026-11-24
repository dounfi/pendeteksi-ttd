"""
v2_kalibrasi.py - membandingkan model lama vs baru dan (opsional) menulis config.json untuk model baru.

Semua angka diukur pada orang yang TIDAK dipakai training. Batas keputusan dipilih HANYA dari data validasi
(gabungan CEDAR + BHSig260), lalu dipakai apa adanya di data ujian dan di data foto sendiri (ttd_uji_sendiri).

Dijalankan dengan TensorFlow (lingkungan yang sama dengan backend):
  python v2_kalibrasi.py --cache <cache> --baru <folder model baru> [--tulis <folder keluaran>] [--target_far 0.10]
"""
import argparse
import hashlib
import itertools
import json
import os
import shutil
import sys

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, roc_curve
from sklearn.preprocessing import StandardScaler

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)
LAMA = os.path.join(BASE, "demo_model_files__6_")
sys.path.insert(0, HERE)
sys.path.insert(0, LAMA)
import keras  # noqa: E402
from forensik import NAMA_CIRI, extract_features, feature_diffs  # noqa: E402
from gangguan import shake_variants  # noqa: E402
from preprocess import load_gray, preprocess_signature  # noqa: E402
from v2_umum import SEED, buat_pasangan  # noqa: E402

GRUP = {"D1": ["CEDAR"], "D2": ["BEN", "HIN"]}   # D1 = CEDAR, D2 = BHSig260 (Bengali + Hindi), D3 = data foto sendiri


def embed(model, X, bs=256):
    out = []
    for s in range(0, len(X), bs):
        out.append(model.predict(X[s:s + bs].astype(np.float32)[..., None] / 255.0, verbose=0))
    return np.concatenate(out) if out else np.zeros((0, 64), np.float32)


def eer_thr(y, d):
    fpr, tpr, thr = roc_curve(y, d)
    i = int(np.nanargmin(np.abs((1 - tpr) - fpr)))
    return float((fpr[i] + 1 - tpr[i]) / 2), float(thr[i])


def thr_far(d, tipe, target):
    """Batas terbesar sehingga tiruan mahir yang lolos (jarak < batas) <= target pada data ini."""
    return float(np.quantile(d[tipe == 1], target))


def thr_far_min(d, pv, target):
    """Paling ketat di antara semua kelompok dataset: FAR tiruan mahir <= target di SETIAP kelompok (validasi).
    Mencegah satu dataset yang dominan (BHSig260 punya 39 orang validasi vs CEDAR 8) menentukan batas sendirian."""
    batas = []
    for dss in GRUP.values():
        m = pv.dataset.isin(dss).values & (pv.tipe.values == 1)
        batas.append(float(np.quantile(d[m], target)))
    return min(batas)


def ringkas(d, y, tipe, thr):
    """Prediksi: jarak <= batas -> ASLI (sama dengan backend)."""
    asli = d <= thr
    m = {
        "auc": float(roc_auc_score(y, d)) if len(set(y)) > 1 else None,
        "eer": eer_thr(y, d)[0] if len(set(y)) > 1 else None,
        "accuracy": float(np.mean(asli == (y == 0))),
        "FRR": float(np.mean(~asli[y == 0])),
        "FAR": float(np.mean(asli[y == 1])),
        "FAR_skilled_forgery": float(np.mean(asli[tipe == 1])) if (tipe == 1).any() else None,
        "FAR_random_forgery": float(np.mean(asli[tipe == 2])) if (tipe == 2).any() else None,
        "n": int(len(y)),
    }
    return m


def pasangan_sendiri(folder):
    m = pd.read_csv(os.path.join(folder, "metadata.csv"))
    X, F = [], []
    for f in m.file:
        hasil, steps = preprocess_signature(load_gray(os.path.join(folder, f)), "binary", return_steps=True)
        X.append((hasil * 255).astype(np.uint8))
        fe = extract_features(steps.get("potong"))
        F.append(fe if fe is not None else np.zeros(8, np.float32))
    X, F = np.stack(X), np.stack(F).astype(np.float32)
    idx = {f: i for i, f in enumerate(m.file)}
    own = dict(zip(m.file, m.pemilik))
    org, frg = m[m.label == "asli"], m[m.label == "tiruan"]
    rows = []
    for a, b in itertools.combinations(org.file, 2):
        rows.append((idx[a], idx[b], 0 if own[a] == own[b] else 1, 0 if own[a] == own[b] else 2))
    for _, r in frg.iterrows():
        for a in org[org.pemilik == r.pemilik].file:
            rows.append((idx[a], idx[r.file], 1, 1))
    return X, F, pd.DataFrame(rows, columns=["i1", "i2", "label", "tipe"])


def multi_ref(df, E, thr, ks=(1, 2, 3, 5), trials=8, seed=SEED):
    """k pembanding asli -> skor = rata-rata jarak. Tiruan = tiruan mahir orang itu + asli orang lain."""
    rng = np.random.default_rng(seed)
    ws = sorted(df.writer.unique())
    gen = {w: df.index[(df.writer == w) & df.is_genuine].to_numpy() for w in ws}
    frg = {w: df.index[(df.writer == w) & ~df.is_genuine].to_numpy() for w in ws}
    hasil = {}
    for k in ks:
        aucs, eers, fars, frrs, farm = [], [], [], [], []
        for _ in range(trials):
            S, Y, T = [], [], []
            for w in ws:
                g = gen[w]
                if len(g) < k + 1:
                    continue
                refs = rng.choice(g, k, replace=False)
                qg = np.setdiff1d(g, refs)
                lain = np.concatenate([gen[x] for x in ws if x != w])
                oth = rng.choice(lain, min(len(qg), len(lain)), replace=False)
                q = np.concatenate([qg, frg[w], oth]).astype(int)
                yy = np.concatenate([np.zeros(len(qg)), np.ones(len(frg[w])), np.ones(len(oth))])
                tt = np.concatenate([np.zeros(len(qg)), np.ones(len(frg[w])), 2 * np.ones(len(oth))])
                S.append(np.linalg.norm(E[q][:, None, :] - E[refs][None, :, :], axis=2).mean(1)); Y.append(yy); T.append(tt)
            S, Y, T = np.concatenate(S), np.concatenate(Y), np.concatenate(T)
            aucs.append(roc_auc_score(Y, S)); eers.append(eer_thr(Y, S)[0])
            asli = S <= thr
            frrs.append(np.mean(~asli[Y == 0])); fars.append(np.mean(asli[Y == 1]))
            if (T == 1).any():
                farm.append(np.mean(asli[T == 1]))
        hasil[str(k)] = {"auc": float(np.mean(aucs)), "auc_std": float(np.std(aucs)), "eer": float(np.mean(eers)),
                         "eer_std": float(np.std(eers)), "FAR": float(np.mean(fars)), "FRR": float(np.mean(frrs)),
                         "FAR_skilled_forgery": float(np.mean(farm)) if farm else None}
    return hasil


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", required=True)
    ap.add_argument("--baru", required=True)
    ap.add_argument("--tulis", default=None)
    ap.add_argument("--target_far", type=float, default=0.20, help="target FAR tiruan mahir pada validasi")
    ap.add_argument("--sendiri", default=os.path.join(BASE, "ttd_uji_sendiri"))
    ap.add_argument("--lanjut_lama", action="store_true", help="juga hitung ulang model lama")
    a = ap.parse_args()

    d = np.load(os.path.join(a.cache, "data.npz"))
    img, feat = d["img"], d["feat"]
    meta = pd.read_csv(os.path.join(a.cache, "meta.csv"))

    pv = buat_pasangan(meta, "val", 60, SEED + 1)
    pt = buat_pasangan(meta, "test", 100, SEED + 2)
    Xs, Fs, ps = pasangan_sendiri(a.sendiri)
    perlu = np.unique(np.concatenate([pv.i1, pv.i2, pt.i1, pt.i2]))
    print("pasangan val:", len(pv), "| ujian:", len(pt), "| sendiri:", len(ps), flush=True)

    modelinfo = {"lama": LAMA, "baru": a.baru}
    hasil = {}
    EMB = {}
    for nama, folder in modelinfo.items():
        mdl = keras.saving.load_model(os.path.join(folder, "embedding_model.keras"), compile=False)
        E = np.zeros((len(img), mdl.output_shape[-1]), np.float32)
        E[perlu] = embed(mdl, img[perlu])
        Es = embed(mdl, Xs)
        EMB[nama] = (E, Es, mdl)
        dv = np.linalg.norm(E[pv.i1] - E[pv.i2], axis=1)
        titik = {}
        _, thr_eer = eer_thr(pv.label.values, dv)
        titik["EER (val)"] = thr_eer
        for tgt in (0.10, 0.05, 0.02):
            titik[f"FAR mahir {int(tgt*100)}% (val gabungan)"] = thr_far(dv, pv.tipe.values, tgt)
            titik[f"FAR mahir {int(tgt*100)}% (val tiap dataset)"] = thr_far_min(dv, pv, tgt)
        if nama == "lama":
            cfg_lama = json.load(open(os.path.join(LAMA, "config.json")))
            titik["batas terpasang (config lama)"] = float(cfg_lama["threshold"])
        hasil[nama] = {"titik": titik, "eval": {}}
        for tn, thr in titik.items():
            r = {}
            for g, dss in GRUP.items():
                pp = pt[pt.dataset.isin(dss)]
                dd = np.linalg.norm(E[pp.i1] - E[pp.i2], axis=1)
                r[g] = ringkas(dd, pp.label.values, pp.tipe.values, thr)
            ds_ = np.linalg.norm(Es[ps.i1] - Es[ps.i2], axis=1)
            r["D3"] = ringkas(ds_, ps.label.values, ps.tipe.values, thr)
            hasil[nama]["eval"][tn] = r

    # ---- tabel perbandingan
    print("\n" + "=" * 100)
    for nama in ("lama", "baru"):
        print(f"\nMODEL {nama.upper()}")
        for tn, thr in hasil[nama]["titik"].items():
            r = hasil[nama]["eval"][tn]
            print(f"  [{tn}] batas={thr:.4f}")
            for g in ("D1", "D2", "D3"):
                m = r[g]
                print(f"      {g}: AUC {m['auc']:.3f} EER {m['eer']:.3f} | FAR mahir {m['FAR_skilled_forgery']:.3f} "
                      f"FAR acak {('-' if m['FAR_random_forgery'] is None else format(m['FAR_random_forgery'], '.3f'))} "
                      f"FRR {m['FRR']:.3f} Akurasi {m['accuracy']:.3f} (n={m['n']})")
    json.dump(hasil, open(os.path.join(a.cache, "hasil_perbandingan.json"), "w"), indent=1)

    if not a.tulis:
        return

    # ================= tulis config model baru =================
    E, Es, mdl = EMB["baru"]
    dv = np.linalg.norm(E[pv.i1] - E[pv.i2], axis=1)
    thr = thr_far_min(dv, pv, a.target_far)
    ev = {}
    for g, dss in GRUP.items():
        pp = pt[pt.dataset.isin(dss)]
        ev[g] = ringkas(np.linalg.norm(E[pp.i1] - E[pp.i2], axis=1), pp.label.values, pp.tipe.values, thr)
    ev["D3"] = ringkas(np.linalg.norm(Es[ps.i1] - Es[ps.i2], axis=1), ps.label.values, ps.tipe.values, thr)

    # --- fusi (regresi logistik: jarak model + 8 selisih ciri), batas pada FAR mahir yang sama
    def X_fusi(P, EE, FF):
        dist = np.linalg.norm(EE[P.i1] - EE[P.i2], axis=1)
        diffs = np.stack([feature_diffs(FF[a_], FF[b_]) for a_, b_ in zip(P.i1, P.i2)])
        return np.column_stack([dist, diffs])
    Xv = X_fusi(pv, E, feat)
    sc = StandardScaler().fit(Xv)
    lr = LogisticRegression(max_iter=3000, C=1.0).fit(sc.transform(Xv), pv.label.values)
    sv = lr.decision_function(sc.transform(Xv))
    thr_f = float(np.quantile(sv[pv.tipe.values == 1], a.target_far))
    fusi_hasil = []
    for g, dss in GRUP.items():
        pp = pt[pt.dataset.isin(dss)]
        st = lr.decision_function(sc.transform(X_fusi(pp, E, feat)))
        m = ringkas(st, pp.label.values, pp.tipe.values, thr_f)
        fusi_hasil.append({"dataset": g, "skenario": "fusi (model + ciri)", "auc": m["auc"], "eer": m["eer"],
                           "accuracy": m["accuracy"], "FAR": m["FAR"], "FRR": m["FRR"],
                           "FAR_skilled_forgery": m["FAR_skilled_forgery"]})
        fusi_hasil.append({"dataset": g, "skenario": "model saja", "auc": ev[g]["auc"], "eer": ev[g]["eer"],
                           "accuracy": ev[g]["accuracy"], "FAR": ev[g]["FAR"], "FRR": ev[g]["FRR"],
                           "FAR_skilled_forgery": ev[g]["FAR_skilled_forgery"]})
    fusi = {"fitur": ["jarak_model"] + NAMA_CIRI, "mean": sc.mean_.tolist(), "scale": sc.scale_.tolist(),
            "coef": lr.coef_[0].tolist(), "intercept": float(lr.intercept_[0]), "threshold": thr_f, "hasil": fusi_hasil}

    # --- batas laporan forensik: persentil 75/95 selisih ciri pada pasangan ASLI di data latih
    ptr = buat_pasangan(meta, "train", 100, SEED)
    gp = ptr[ptr.label == 0]
    dg = np.stack([feature_diffs(feat[a_], feat[b_]) for a_, b_ in zip(gp.i1, gp.i2)])
    forensik_batas = {n: [float(np.percentile(dg[:, i], 75)), float(np.percentile(dg[:, i], 95))] for i, n in enumerate(NAMA_CIRI)}

    # --- Uji Goyang: kalibrasi batas "ragu" (20% paling tidak yakin) pada validasi, dengan rumus yang SAMA dengan backend
    N_SHAKE, ABSTAIN = 6, 0.20
    sub = pv.sample(min(1500, len(pv)), random_state=SEED).reset_index(drop=True)

    def jarak_goyang(P, IM=None):
        IM = img if IM is None else IM
        uniq = np.unique(np.concatenate([P.i1.values, P.i2.values]))
        pos = {int(u): k for k, u in enumerate(uniq)}
        V = np.concatenate([shake_variants(IM[u].astype(np.float32) / 255.0, N_SHAKE, 42) for u in uniq])
        Ev = mdl.predict(V, batch_size=256, verbose=0).reshape(len(uniq), N_SHAKE, -1)
        A = Ev[[pos[int(i)] for i in P.i1.values]]
        B = Ev[[pos[int(i)] for i in P.i2.values]]
        return np.linalg.norm(A - B, axis=2)

    def keyakinan(dm):
        return np.abs(dm.mean(1) - thr) / (dm.std(1) + 1e-6)

    z_val = keyakinan(jarak_goyang(sub))
    ragu_z = float(np.quantile(z_val, ABSTAIN))
    d_sub = np.linalg.norm(E[sub.i1] - E[sub.i2], axis=1)
    ragu_margin = float(np.quantile(np.abs(d_sub - thr), ABSTAIN))
    goyang_hasil = {}
    status_hasil = {}
    sumber = {g: (pt[pt.dataset.isin(dss)].sample(frac=1, random_state=SEED).head(1500), E, feat, None) for g, dss in GRUP.items()}
    sumber["D3"] = (ps, Es, Fs, Xs)
    for g, (pp, EE, FF, IM) in sumber.items():
        z = keyakinan(jarak_goyang(pp, IM))
        dd = np.linalg.norm(EE[pp.i1] - EE[pp.i2], axis=1)
        y = pp.label.values
        benar = ((dd <= thr) == (y == 0))
        yakin = z >= ragu_z
        asli_yakin = yakin & (dd <= thr)
        palsu_ml = y == 1
        fs = lr.decision_function(sc.transform(X_fusi(pp, EE, FF)))
        fusi_asli = fs <= thr_f
        status_asli = (dd <= thr) & yakin & fusi_asli     # = status "ASLI" (bukan "BELUM YAKIN"/"PALSU") di backend, k=1
        goyang_hasil[g] = {
            "akurasi_semua": float(benar.mean()),
            "akurasi_yakin": float(benar[yakin].mean()) if yakin.any() else None,
            "akurasi_ragu": float(benar[~yakin].mean()) if (~yakin).any() else None,
            "porsi_ragu": float((~yakin).mean()),
            "FAR_semua": float(np.mean((dd <= thr)[palsu_ml])),
            "FAR_hanya_yakin": float(np.sum(asli_yakin & palsu_ml) / max(1, np.sum(palsu_ml))),
        }
        status_hasil[g] = {
            "FAR_keputusan_model": float(np.mean((dd <= thr)[palsu_ml])),
            "FAR_status_ASLI": float(np.mean(status_asli[palsu_ml])),
            "FAR_status_ASLI_mahir": float(np.mean(status_asli[pp.tipe.values == 1])) if (pp.tipe.values == 1).any() else None,
            "asli_dikenali_ASLI": float(np.mean(status_asli[y == 0])),
            "asli_jadi_BELUM_YAKIN_atau_PALSU": float(np.mean(~status_asli[y == 0])),
            "n": int(len(y)),
        }
    goyang = {"n": N_SHAKE, "ragu_z": ragu_z, "ragu_margin": ragu_margin, "abstain_frac": ABSTAIN, "hasil": goyang_hasil}
    print("\nSTATUS AKHIR di aplikasi (k=1; ASLI hanya jika model, Uji Goyang, dan fusi ciri sepakat):")
    for g, v in status_hasil.items():
        print(f"  {g}: FAR keputusan model {v['FAR_keputusan_model']:.3f} -> FAR status ASLI {v['FAR_status_ASLI']:.3f}"
              f" (mahir {v['FAR_status_ASLI_mahir']}) | asli dikenali ASLI {v['asli_dikenali_ASLI']:.3f}")

    # --- banyak pembanding (pada batas yang SAMA dengan keputusan)
    bp = {}
    for g, dss in GRUP.items():
        dfm = meta[(meta.split == "test") & (~meta.aug) & meta.dataset.isin(dss)]
        bp[g] = multi_ref(dfm, E, thr)

    cfg = {
        "model": "v2: CEDAR + BHSig260 (Bengali, Hindi), fokus FAR tiruan mahir",
        "versi": "v2",
        "img_h": 128, "img_w": 256, "preprocess_mode": "binary",
        "threshold": float(thr), "margin": 1.0,
        "catatan_metrik": (
            "D1 = CEDAR (uji), D2 = BHSig260 Bengali+Hindi (uji), D3 = foto/scan buatan sendiri (3 pemilik, tiruan "
            "oleh penirunya; TIDAK dipakai untuk melatih maupun memilih batas). Semua orang uji tidak dipakai saat "
            f"training. Batas dipilih di data validasi (paling ketat dari CEDAR dan BHSig260) sehingga FAR tiruan mahir validasi <= {a.target_far:.0%} di tiap dataset. "
            "Keputusan: jarak <= batas -> ASLI. ragu_z adalah z-score Uji Goyang (tanpa satuan), ragu_margin lebar zona "
            "ragu dalam satuan jarak; keduanya dikalibrasi pada 1 pembanding. Dataset Toloka tidak dipakai di v2."
        ),
        "tensorflow_version": __import__("tensorflow").__version__, "keras_version": keras.__version__,
        "data_latih": {"CEDAR": "55 orang", "BHSig260-Bengali": "50 orang", "BHSig260-Hindi": "160 orang",
                       "pembagian": "per orang 70/15/15", "versi_foto_hp_untuk_latih": True},
        "metrics": {
            "test_auc": ev["D1"]["auc"], "test_eer": ev["D1"]["eer"], "test_accuracy": ev["D1"]["accuracy"],
            "test_FRR": ev["D1"]["FRR"], "test_FAR": ev["D1"]["FAR"],
            "test_FAR_skilled_forgery": ev["D1"]["FAR_skilled_forgery"], "test_FAR_random_forgery": ev["D1"]["FAR_random_forgery"],
            "per_dataset": ev,
        },
        "titik_operasi": {tn: {"batas": hasil["baru"]["titik"][tn], "hasil": hasil["baru"]["eval"][tn]} for tn in hasil["baru"]["titik"]},
        "status_akhir": status_hasil,
        "fusi": fusi, "forensik_batas": forensik_batas, "goyang": goyang, "banyak_pembanding": bp,
    }
    out = a.tulis
    os.makedirs(out, exist_ok=True)
    for f in ("preprocess.py", "forensik.py", "gangguan.py"):
        shutil.copy2(os.path.join(LAMA, f), os.path.join(out, f))
    shutil.copy2(os.path.join(a.baru, "embedding_model.keras"), os.path.join(out, "embedding_model.keras"))
    json.dump(cfg, open(os.path.join(out, "config.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    h = hashlib.sha256(open(os.path.join(out, "embedding_model.keras"), "rb").read()).hexdigest().upper()
    print("\nconfig ditulis ke", out, "\nSHA256 model:", h, "\nbatas:", thr, "ragu_z:", ragu_z, "ragu_margin:", ragu_margin)


if __name__ == "__main__":
    main()
