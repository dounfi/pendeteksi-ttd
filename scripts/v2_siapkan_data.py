"""
v2_siapkan_data.py - menyiapkan data latih model v2 (fokus menurunkan FAR tiruan mahir).

Masalah model lama: tanda tangan TIRUAN MAHIR (skilled forgery) hanya dilatih dari CEDAR (38 orang latih).
Dataset BHSig260 (Bengali 50 orang, Hindi 160 orang; 24 asli + 30 tiruan mahir per orang) ada di folder data
tetapi TIDAK terpakai di notebook lama (nama file tidak dikenali -> 14.040 gambar dilewati).
Skrip ini membacanya dengan benar, mengolahnya dengan preprocess.py yang SAMA dengan aplikasi
(mode binary), lalu menyimpan cache untuk training.

Keluaran (di --out): data.npz (gambar uint8 0/255 + ciri forensik), meta.csv
Jalankan:  python v2_siapkan_data.py --data "D:/.../Dataset_Project" --out <folder cache>
"""
import argparse
import os
import re
import sys
import time
from concurrent.futures import ProcessPoolExecutor

import numpy as np
import pandas as pd

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE, "demo_model_files__6_")
sys.path.insert(0, MODEL_DIR)

SEED = 42
POLA = {
    "CEDAR": re.compile(r"^(original|forgeries)_(\d+)_(\d+)\.(png|jpg)$", re.I),
    "BEN": re.compile(r"^B-S-(\d+)-([GF])-(\d+)\.tif$", re.I),
    "HIN": re.compile(r"^H-S-(\d+)-([GF])-(\d+)\.tif$", re.I),
}
FOLDER = {
    "CEDAR": "CEDAR/CEDAR",
    "BEN": "BHSig260-Bengali/BHSig260-Bengali",
    "HIN": "BHSig260-Hindi/BHSig260-Hindi",
}


def baca_meta(data_dir):
    baris = []
    for tag, rel in FOLDER.items():
        root = os.path.join(data_dir, rel)
        for akar, _, files in os.walk(root):
            for f in sorted(files):
                m = POLA[tag].match(f)
                if not m:
                    continue
                if tag == "CEDAR":
                    asli, w = m.group(1).lower() == "original", int(m.group(2))
                else:
                    asli, w = m.group(2).upper() == "G", int(m.group(1))
                baris.append({"path": os.path.join(akar, f), "dataset": tag, "writer": f"{tag}_{w}", "is_genuine": asli})
    return pd.DataFrame(baris)


def bagi_orang(meta):
    """Pembagian per orang 70/15/15 per dataset, cara sama dengan notebook lama (CEDAR identik)."""
    from sklearn.model_selection import train_test_split
    peta = {}
    for tag in meta.dataset.unique():
        ws = sorted(meta[meta.dataset == tag].writer.unique())
        tr, tmp = train_test_split(ws, test_size=0.30, random_state=SEED)
        va, te = train_test_split(tmp, test_size=0.50, random_state=SEED)
        for w in tr:
            peta[w] = "train"
        for w in va:
            peta[w] = "val"
        for w in te:
            peta[w] = "test"
    return meta.writer.map(peta)


def _olah(args):
    path, aug, seed = args
    from preprocess import load_gray, preprocess_signature, preprocess_all
    from forensik import extract_features
    try:
        g = load_gray(path)
        if aug:
            import gangguan
            rng = np.random.default_rng(seed)
            nama = list(gangguan.KONDISI)
            g = gangguan.KONDISI[nama[int(rng.integers(len(nama)))]](g, rng)
        arrs, potong = preprocess_all(g, ("binary",))
        fitur = extract_features(potong)
        if fitur is None:
            return None
        return (arrs["binary"] * 255).astype(np.uint8), fitur
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--workers", type=int, default=max(2, (os.cpu_count() or 4) - 2))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    meta = baca_meta(a.data)
    meta["split"] = bagi_orang(meta)
    meta["aug"] = False
    print(meta.groupby(["dataset", "split"]).writer.nunique().unstack())
    print(meta.groupby(["dataset", "is_genuine"]).size().unstack())

    # Versi tambahan "mirip foto HP" (bayangan/buram/miring/redup/noise) HANYA untuk orang latih.
    tr = meta[meta.split == "train"].copy()
    tr["aug"] = True
    semua = pd.concat([meta, tr], ignore_index=True)
    tugas = [(p, bool(au), SEED + i) for i, (p, au) in enumerate(zip(semua.path, semua.aug))]

    t0 = time.time()
    with ProcessPoolExecutor(max_workers=a.workers) as ex:
        hasil = list(ex.map(_olah, tugas, chunksize=64))
    ok = np.array([h is not None for h in hasil])
    print(f"berhasil {int(ok.sum())} dari {len(hasil)} | {time.time() - t0:.0f} detik")
    semua = semua[ok].reset_index(drop=True)
    img = np.stack([h[0] for h in hasil if h is not None])
    feat = np.stack([h[1] for h in hasil if h is not None]).astype(np.float32)
    np.savez(os.path.join(a.out, "data.npz"), img=img, feat=feat)
    semua.to_csv(os.path.join(a.out, "meta.csv"), index=False)
    print("tersimpan:", img.shape, feat.shape)


if __name__ == "__main__":
    main()
