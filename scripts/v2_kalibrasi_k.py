"""
v2_kalibrasi_k.py - kalibrasi batas keputusan PER JUMLAH PEMBANDING (k = 1..5) dengan skor = jarak TERDEKAT ke pembanding.

Kenapa jarak terdekat: pada percobaan, memakai jarak terdekat (bukan rata-rata) menaikkan AUC di CEDAR (0.923 -> 0.943),
BHSig260 (0.945 -> 0.961) dan foto sendiri (0.840 -> 0.882) pada k=3. Karena skornya berubah, batas harus dikalibrasi ulang per k.

Batas tiap k dipilih di VALIDASI: paling ketat dari CEDAR dan BHSig260 sehingga tiruan mahir lolos <= target_far.
Juga dihitung batas "pembanding tidak konsisten": persentil ke-95 rata-rata jarak antar-pembanding pada set pembanding ASLI di validasi
(menggantikan aturan lama "rata-rata jarak antar-pembanding > batas", yang terlalu sering menandai pembanding asli milik orang yang sama).

  python v2_kalibrasi_k.py --cache <cache> --model <folder model v2> [--target_far 0.20]
Hasil ditulis ke <folder model v2>/config.json (kunci: threshold_per_k, konsistensi_pembanding, skor_k, metrik_per_k).
"""
import argparse
import json
import os
import sys

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "demo_model_files__6_"))
import keras  # noqa: E402
import v2_kalibrasi as K  # noqa: E402

KS = (1, 2, 3, 4, 5)


def simulasi(E, meta_sub, k, trials, seed):
    """Per orang: k pembanding acak. Return dict group -> (skor_asli, skor_mahir, skor_acak, rata_pair_antar_pembanding)."""
    rng = np.random.default_rng(seed)
    ws = sorted(meta_sub.writer.unique())
    gen = {w: meta_sub.index[(meta_sub.writer == w) & meta_sub.is_genuine].to_numpy() for w in ws}
    frg = {w: meta_sub.index[(meta_sub.writer == w) & ~meta_sub.is_genuine].to_numpy() for w in ws}
    ds = meta_sub.groupby("writer").dataset.first().to_dict()
    out = {g: ([], [], [], []) for g in K.GRUP}
    for w in ws:
        grp = next(g for g, dss in K.GRUP.items() if ds[w] in dss)
        if len(gen[w]) <= k:
            continue
        lain = np.concatenate([gen[x] for x in ws if x != w and ds[x] == ds[w]])
        for _ in range(trials):
            refs = rng.choice(gen[w], k, replace=False)
            qg = np.setdiff1d(gen[w], refs)
            oth = rng.choice(lain, min(len(qg), len(lain)), replace=False)
            R = E[refs]
            sk = lambda idx: np.linalg.norm(E[idx][:, None, :] - R[None, :, :], axis=2).min(1)
            out[grp][0].append(sk(qg)); out[grp][2].append(sk(oth))
            if len(frg[w]):
                out[grp][1].append(sk(frg[w]))
            if k >= 2:
                out[grp][3].append(np.mean([np.linalg.norm(R[i] - R[j]) for i in range(k) for j in range(i + 1, k)]))
    return {g: tuple(np.concatenate(v) if i < 3 and v else np.array(v) for i, v in enumerate(t)) for g, t in out.items()}


def simulasi_sendiri(Es, own, k, trials, seed):
    rng = np.random.default_rng(seed)
    asli, mahir, acak, pair = [], [], [], []
    for o in own.pemilik.unique():
        g = own.index[(own.pemilik == o) & (own.label == "asli")].to_numpy()
        f = own.index[(own.pemilik == o) & (own.label == "tiruan")].to_numpy()
        lain = own.index[(own.pemilik != o) & (own.label == "asli")].to_numpy()
        for _ in range(trials):
            refs = rng.choice(g, k, replace=False); qg = np.setdiff1d(g, refs); R = Es[refs]
            sk = lambda idx: np.linalg.norm(Es[idx][:, None, :] - R[None, :, :], axis=2).min(1)
            asli.append(sk(qg)); mahir.append(sk(f)); acak.append(sk(lain))
            if k >= 2:
                pair.append(np.mean([np.linalg.norm(R[i] - R[j]) for i in range(k) for j in range(i + 1, k)]))
    return np.concatenate(asli), np.concatenate(mahir), np.concatenate(acak), np.array(pair)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", required=True)
    ap.add_argument("--model", required=True)
    ap.add_argument("--target_far", type=float, default=0.10)
    ap.add_argument("--trials", type=int, default=20)
    a = ap.parse_args()

    cfg_path = os.path.join(a.model, "config.json")
    cfg = json.load(open(cfg_path, encoding="utf-8"))
    d = np.load(os.path.join(a.cache, "data.npz"))
    img = d["img"]
    meta = pd.read_csv(os.path.join(a.cache, "meta.csv"))
    m = keras.saving.load_model(os.path.join(a.model, "embedding_model.keras"), compile=False)
    base = meta[~meta.aug]
    idx = base.index[base.split.isin(["val", "test"])].values
    E = np.zeros((len(img), m.output_shape[-1]), np.float32)
    E[idx] = K.embed(m, img[idx])
    Xs, Fs, ps = K.pasangan_sendiri(K.BASE + "/ttd_uji_sendiri")
    own = pd.read_csv(K.BASE + "/ttd_uji_sendiri/metadata.csv")
    Es = K.embed(m, Xs)
    val, test = base[base.split == "val"], base[base.split == "test"]

    thr_k, kons_k, metrik = {}, {}, {}
    for k in KS:
        sv = simulasi(E, val, k, a.trials, 1)
        thr = min(float(np.quantile(sv[g][1], a.target_far)) for g in K.GRUP)       # tiruan mahir lolos <= target di tiap kelompok
        thr_k[str(k)] = thr
        if k >= 2:
            kons_k[str(k)] = float(np.quantile(np.concatenate([sv[g][3] for g in K.GRUP]), 0.95))
        st = simulasi(E, test, k, a.trials, 2)
        ent = {g: st[g][:3] for g in K.GRUP}
        ent["D3"] = simulasi_sendiri(Es, own, k, a.trials, 3)[:3]
        metrik[str(k)] = {
            g: {"FAR_skilled_forgery": float(np.mean(v[1] <= thr)), "FAR_random_forgery": float(np.mean(v[2] <= thr)),
                "FRR": float(np.mean(v[0] > thr))} for g, v in ent.items()}
        print(f"k={k} batas={thr:.4f}" + (f" konsistensi(p95 jarak antar-pembanding)={kons_k[str(k)]:.4f}" if k >= 2 else ""))
        for g, v in metrik[str(k)].items():
            print(f"   {g}: tiruan mahir lolos {v['FAR_skilled_forgery']:.3f} | tiruan acak lolos {v['FAR_random_forgery']:.3f} | asli ditolak {v['FRR']:.3f}")

    thr_k["1"] = float(cfg["threshold"])          # k=1: skor min = rata-rata; pertahankan batas yang sudah dikalibrasi lengkap
    cfg["threshold_per_k"] = thr_k
    cfg["konsistensi_pembanding"] = kons_k
    cfg["skor_k"] = "min"
    cfg["metrik_per_k"] = metrik
    cfg["target_far_per_k"] = a.target_far
    json.dump(cfg, open(cfg_path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print("config diperbarui:", cfg_path)


if __name__ == "__main__":
    main()
