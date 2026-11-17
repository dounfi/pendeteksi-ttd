"""
v2_evaluasi.py - menghasilkan ROC, AUC, akurasi, dan confusion matrix untuk model lama dan model v2
pada data UJI (orang yang tidak dipakai melatih), di titik operasi target_far 0.20 / 0.10 / 0.08 / 0.05.

Pasangan uji identik dengan v2_kalibrasi.py (buat_pasangan split "test", seed SEED+2; foto sendiri = ttd_uji_sendiri).
Batas diambil dari demo_model_files_v2/config_target_far_<target>.json (k = 1 pembanding, skor = jarak pasangan);
model lama memakai batas 0.4825. Aturan keputusan sama dengan backend: jarak <= batas -> ASLI.

Definisi:
  ROC          : kelas positif = PALSU. Skor = jarak. Sumbu x = FPR = asli yang salah ditolak (FRR);
                 sumbu y = TPR = tiruan yang terdeteksi (1 - FAR).
  Confusion    : kelas positif = ASLI. TP asli diterima, FN asli ditolak, FP palsu diterima, TN palsu ditolak.
  "Palsu"      : tiruan mahir (skilled forgery) + tanda tangan orang lain (random forgery) dalam pasangan uji.

Dijalankan dengan TensorFlow (lingkungan yang sama dengan backend). Grafik butuh matplotlib (pip install matplotlib);
tanpa matplotlib, tabel/CSV/JSON tetap dibuat dan grafik dilewati.

  python scripts/v2_evaluasi.py --cache <cache> [--model demo_model_files_v2] [--out hasil_evaluasi_v2]
"""
import argparse
import json
import os
import sys

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score, roc_curve

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import keras  # noqa: E402
import v2_kalibrasi as K  # noqa: E402
from v2_umum import SEED, buat_pasangan  # noqa: E402

BASE = os.path.dirname(HERE)
TARGETS = ("0.20", "0.10", "0.08", "0.05")
DATASET = {"D1": "CEDAR", "D2": "BHSig260 (Bengali + Hindi)", "D3": "foto sendiri (3 pemilik)"}

# warna (palet referensi dataviz, mode terang; sudah divalidasi): seri 1 biru, seri 2 jingga
BIRU, JINGGA = "#2a78d6", "#eb6834"
INK, INK2, GRID, SURFACE = "#0b0b0b", "#52514e", "#e3e2de", "#fcfcfb"
RAMP = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"]   # biru 100..700 (sequential)


def jarak_per_dataset(model_dir, img, pt, ps, Xs):
    m = keras.saving.load_model(os.path.join(model_dir, "embedding_model.keras"), compile=False)
    perlu = np.unique(np.concatenate([pt.i1, pt.i2]))
    E = np.zeros((len(img), m.output_shape[-1]), np.float32)
    E[perlu] = K.embed(m, img[perlu])
    Es = K.embed(m, Xs)
    out = {}
    for g, dss in K.GRUP.items():
        pp = pt[pt.dataset.isin(dss)]
        out[g] = (np.linalg.norm(E[pp.i1] - E[pp.i2], axis=1), pp.label.values, pp.tipe.values)
    out["D3"] = (np.linalg.norm(Es[ps.i1] - Es[ps.i2], axis=1), ps.label.values, ps.tipe.values)
    return out


def confusion(d, y, tipe, thr):
    asli = d <= thr
    tp = int(np.sum(asli & (y == 0)))
    fn = int(np.sum(~asli & (y == 0)))
    fp = int(np.sum(asli & (y == 1)))
    tn = int(np.sum(~asli & (y == 1)))
    n = tp + fn + fp + tn
    div = lambda a, b: float(a / b) if b else None
    rec, spec = div(tp, tp + fn), div(tn, tn + fp)
    prec = div(tp, tp + fp)
    return {
        "batas": float(thr), "n": n, "TP_asli_diterima": tp, "FN_asli_ditolak": fn, "FP_palsu_diterima": fp, "TN_palsu_ditolak": tn,
        "akurasi": div(tp + tn, n), "akurasi_seimbang": (rec + spec) / 2, "presisi_ASLI": prec, "recall_ASLI": rec,
        "spesifisitas": spec, "F1_ASLI": div(2 * prec * rec, prec + rec) if prec and rec else None,
        "FRR": div(fn, tp + fn), "FAR": div(fp, fp + tn),
        "mahir_lolos": int(np.sum(asli & (tipe == 1))), "mahir_n": int(np.sum(tipe == 1)),
        "acak_lolos": int(np.sum(asli & (tipe == 2))), "acak_n": int(np.sum(tipe == 2)),
    }


def titik_roc(d, y, thr):
    """(x, y) pada kurva ROC untuk batas thr: x = asli ditolak, y = tiruan terdeteksi."""
    return float(np.mean(d[y == 0] > thr)), float(np.mean(d[y == 1] > thr))


def gambar_roc(hasil, titik, out):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, axes = plt.subplots(1, 3, figsize=(15.5, 5.4), facecolor=SURFACE)
    from matplotlib.lines import Line2D
    for ax, g in zip(axes, ("D1", "D2", "D3")):
        ax.set_facecolor(SURFACE)
        ax.plot([0, 1], [0, 1], ls=(0, (4, 4)), color="#a9a8a2", lw=1, zorder=1)
        for nama, warna, label in (("lama", JINGGA, "Model lama"), ("v2", BIRU, "Model v2")):
            r = hasil[nama][g]
            ax.plot(r["fpr"], r["tpr"], color=warna, lw=2, zorder=3,
                    label=f"{label}  (AUC {r['auc']:.3f})")
        # titik operasi
        x, yy = titik["lama"][g]
        ax.scatter([x], [yy], s=70, color=JINGGA, edgecolor=SURFACE, linewidth=2, zorder=5)
        ax.annotate("lama", (x, yy), textcoords="offset points", xytext=(9, -22 if g == "D1" else -8), fontsize=9, color=INK2, va="top")
        for t in TARGETS:
            x, yy = titik[t][g]
            ax.scatter([x], [yy], s=70, color=BIRU, edgecolor=SURFACE, linewidth=2, zorder=5)
            # label vertikal tepat di bawah titik: area di bawah kurva kosong dan titik-titiknya berjarak cukup
            ax.annotate(t, (x, yy), textcoords="offset points", xytext=(0, -9), fontsize=9, color=INK2,
                        rotation=90, ha="center", va="top")
        ax.set_title(f"{g}  {DATASET[g]}", fontsize=12, color=INK, loc="left", fontweight="bold")
        ax.set_xlabel("Asli salah ditolak (FRR)", color=INK2)
        ax.set_ylabel("Tiruan terdeteksi (1 - FAR)", color=INK2)
        ax.set_xlim(-0.01, 1.0)
        ax.set_ylim(0, 1.01)
        ax.set_aspect("equal", adjustable="box")
        ax.grid(color=GRID, lw=0.8, zorder=0)
        for sp in ("top", "right"):
            ax.spines[sp].set_visible(False)
        for sp in ("left", "bottom"):
            ax.spines[sp].set_color("#a9a8a2")
        ax.tick_params(colors=INK2)
        handel, label = ax.get_legend_handles_labels()
        handel += [Line2D([], [], marker="o", color="none", markerfacecolor=BIRU, markersize=8, markeredgecolor=SURFACE),
                   Line2D([], [], marker="o", color="none", markerfacecolor=JINGGA, markersize=8, markeredgecolor=SURFACE)]
        label += ["titik operasi v2 (angka = target_far)", "titik operasi lama (batas 0.4825)"]
        ax.legend(handel, label, loc="lower right", frameon=False, fontsize=9.5, labelcolor=INK)
    fig.suptitle("Kurva ROC pada data uji: model lama vs model v2 (titik = batas keputusan, 1 pembanding)",
                 fontsize=13, color=INK, x=0.01, ha="left")
    fig.tight_layout(rect=(0, 0, 1, 0.95))
    fig.savefig(out, dpi=130, facecolor=SURFACE)
    plt.close(fig)


def gambar_confusion(cm, out):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    kolom = [("lama", "Model lama\nbatas 0.4825")] + [(t, f"v2 target {t}") for t in TARGETS]
    fig, axes = plt.subplots(3, len(kolom), figsize=(12.6, 9.4), facecolor=SURFACE)
    for i, g in enumerate(("D1", "D2", "D3")):
        for j, (kunci, judul) in enumerate(kolom):
            ax = axes[i, j]
            c = cm[kunci][g]
            M = np.array([[c["TP_asli_diterima"], c["FN_asli_ditolak"]], [c["FP_palsu_diterima"], c["TN_palsu_ditolak"]]], float)
            P = M / M.sum(axis=1, keepdims=True)                         # persen per baris (kelas sebenarnya)
            for a in range(2):
                for b in range(2):
                    shade = min(6, int(P[a, b] * 7))
                    ax.add_patch(plt.Rectangle((b, 1 - a), 1, 1, facecolor=RAMP[shade], edgecolor=SURFACE, linewidth=3))
                    warna = "#ffffff" if shade >= 4 else INK       # kontras >= 4.5:1 pada semua langkah
                    ax.text(b + 0.5, 1 - a + 0.56, f"{int(M[a, b]):,}".replace(",", "."), ha="center", va="center",
                            fontsize=13, fontweight="bold", color=warna)
                    ax.text(b + 0.5, 1 - a + 0.30, f"{P[a, b] * 100:.1f}%", ha="center", va="center", fontsize=10, color=warna)
            ax.set_xlim(0, 2)
            ax.set_ylim(0, 2)
            ax.set_aspect("equal")
            ax.set_xticks([0.5, 1.5])
            ax.set_xticklabels(["diterima\nASLI", "ditolak\nPALSU"], fontsize=8.5, color=INK2)
            ax.set_yticks([0.5, 1.5])
            ax.set_yticklabels(["Palsu", "Asli"] if j == 0 else ["", ""], fontsize=10, color=INK2)
            ax.tick_params(length=0)
            for sp in ax.spines.values():
                sp.set_visible(False)
            ax.patch.set_alpha(0)
            if i == 0:
                ax.set_title(judul, fontsize=11, color=INK, fontweight="bold")
            ax.set_xlabel(f"akurasi {c['akurasi'] * 100:.1f}%  |  n = {c['n']:,}".replace(",", "."), fontsize=9, color=INK2)
        axes[i, 0].set_ylabel(f"{g} {DATASET[g]}", fontsize=10, color=INK, fontweight="bold", labelpad=10)
    fig.suptitle("Confusion matrix pada data uji (1 pembanding)\n"
                 "angka = jumlah pasangan, persen = per baris kelas sebenarnya; warna makin gelap = persen makin besar",
                 fontsize=12, color=INK, x=0.01, ha="left")
    fig.subplots_adjust(left=0.1, right=0.99, top=0.87, bottom=0.075, hspace=0.5, wspace=0.12)
    fig.savefig(out, dpi=130, facecolor=SURFACE)
    plt.close(fig)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", required=True)
    ap.add_argument("--model", default=os.path.join(BASE, "demo_model_files_v2"))
    ap.add_argument("--out", default=os.path.join(BASE, "hasil_evaluasi_v2"))
    ap.add_argument("--sendiri", default=os.path.join(BASE, "ttd_uji_sendiri"))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    d = np.load(os.path.join(a.cache, "data.npz"))
    img = d["img"]
    meta = pd.read_csv(os.path.join(a.cache, "meta.csv"))
    pt = buat_pasangan(meta, "test", 100, SEED + 2)
    Xs, _, ps = K.pasangan_sendiri(a.sendiri)
    print("pasangan uji:", len(pt), "| foto sendiri:", len(ps), flush=True)

    batas = {t: float(json.load(open(os.path.join(a.model, f"config_target_far_{t}.json"), encoding="utf-8"))["threshold"]) for t in TARGETS}
    batas["lama"] = float(json.load(open(os.path.join(K.LAMA, "config.json"), encoding="utf-8"))["threshold"])

    jarak = {"lama": jarak_per_dataset(K.LAMA, img, pt, ps, Xs), "v2": jarak_per_dataset(a.model, img, pt, ps, Xs)}

    hasil, titik, cm = {}, {}, {}
    for nama in ("lama", "v2"):
        hasil[nama] = {}
        for g in ("D1", "D2", "D3"):
            dd, y, tipe = jarak[nama][g]
            fpr, tpr, thr = roc_curve(y, dd)
            auc = float(roc_auc_score(y, dd))
            i = int(np.nanargmin(np.abs((1 - tpr) - fpr)))
            hasil[nama][g] = {"auc": auc, "eer": float((fpr[i] + 1 - tpr[i]) / 2), "fpr": fpr, "tpr": tpr, "thr": thr}
            pd.DataFrame({"batas_jarak": thr, "FPR_asli_ditolak": fpr, "TPR_tiruan_terdeteksi": tpr}).to_csv(
                os.path.join(a.out, f"roc_{g}_{nama}.csv"), index=False, float_format="%.6f")
    for g in ("D1", "D2", "D3"):
        for kunci, model_ in (("lama", "lama"), ("0.20", "v2"), ("0.10", "v2"), ("0.08", "v2"), ("0.05", "v2")):
            dd, y, tipe = jarak[model_][g]
            cm.setdefault(kunci, {})[g] = confusion(dd, y, tipe, batas[kunci])
            titik.setdefault(kunci, {})[g] = titik_roc(dd, y, batas[kunci])

    # ---- keluaran data
    baris = []
    for kunci, per in cm.items():
        for g, c in per.items():
            baris.append({"model": "lama" if kunci == "lama" else "v2", "target_far": "-" if kunci == "lama" else kunci, "dataset": g, **c})
    pd.DataFrame(baris).to_csv(os.path.join(a.out, "confusion_matrix.csv"), index=False, float_format="%.6f")
    ringkas = {"definisi": __doc__.strip().split("\n\n")[1] if "\n\n" in __doc__ else "",
               "auc_eer": {n: {g: {"auc": hasil[n][g]["auc"], "eer": hasil[n][g]["eer"]} for g in hasil[n]} for n in hasil},
               "confusion": cm}
    json.dump(ringkas, open(os.path.join(a.out, "evaluasi_v2.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)

    # ---- tabel di terminal + berkas markdown
    md = []
    md.append("AUC / EER (sama untuk semua target)\n\n| Data uji | AUC lama | AUC v2 | EER lama | EER v2 |\n|---|---|---|---|---|")
    for g in ("D1", "D2", "D3"):
        md.append(f"| {g} {DATASET[g]} | {hasil['lama'][g]['auc']:.3f} | {hasil['v2'][g]['auc']:.3f} | "
                  f"{hasil['lama'][g]['eer'] * 100:.1f}% | {hasil['v2'][g]['eer'] * 100:.1f}% |")
    for g in ("D1", "D2", "D3"):
        md.append(f"\nConfusion matrix {g} {DATASET[g]} (positif = ASLI)\n\n"
                  "| Model / target | Batas | Asli diterima (TP) | Asli ditolak (FN) | Palsu diterima (FP) | Palsu ditolak (TN) | Akurasi | Akurasi seimbang | Presisi ASLI | Recall ASLI | Spesifisitas | F1 ASLI |\n"
                  "|---|---|---|---|---|---|---|---|---|---|---|---|")
        for kunci in ("lama", "0.20", "0.10", "0.08", "0.05"):
            c = cm[kunci][g]
            f = lambda v: "-" if v is None else f"{v * 100:.1f}%"
            nama = "Lama" if kunci == "lama" else f"v2 {kunci}"
            md.append(f"| {nama} | {c['batas']:.4f} | {c['TP_asli_diterima']} | {c['FN_asli_ditolak']} | {c['FP_palsu_diterima']} | "
                      f"{c['TN_palsu_ditolak']} | {f(c['akurasi'])} | {f(c['akurasi_seimbang'])} | {f(c['presisi_ASLI'])} | "
                      f"{f(c['recall_ASLI'])} | {f(c['spesifisitas'])} | {f(c['F1_ASLI'])} |")
    teks = "\n".join(md)
    open(os.path.join(a.out, "ringkasan_evaluasi.md"), "w", encoding="utf-8").write(teks + "\n")
    print("\n" + teks)

    # ---- grafik
    try:
        import matplotlib  # noqa: F401
    except ImportError:
        print("\nmatplotlib tidak terpasang -> grafik dilewati. Pasang dengan: pip install matplotlib")
    else:
        gambar_roc(hasil, titik, os.path.join(a.out, "roc_lama_vs_v2.png"))
        gambar_confusion(cm, os.path.join(a.out, "confusion_matrix.png"))
        print("\ngrafik: roc_lama_vs_v2.png, confusion_matrix.png")
    print("hasil disimpan di", a.out)


if __name__ == "__main__":
    main()
