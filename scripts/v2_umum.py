"""v2_umum.py - bagian yang dipakai bersama oleh skrip training dan kalibrasi model v2 (tanpa Keras/TensorFlow)."""
import random

import pandas as pd

SEED = 42
W_SKILLED = 1.5          # bobot loss pasangan tiruan mahir (dipakai training)
FRAC_SKILLED = 0.75      # porsi tiruan mahir di antara pasangan "beda"
POS_PER_WRITER = {"CEDAR": 200, "BEN": 100, "HIN": 100}
P_AUG_VARIAN = 0.4       # peluang sisi pasangan memakai versi "foto HP" (hanya training)

TIPE = {0: "genuine_pair", 1: "skilled_forgery", 2: "random_forgery"}


def buat_pasangan(meta, split, n_pos, seed, pakai_aug=False, datasets=None):
    """
    meta: DataFrame (index = baris di cache gambar). Kolom: path, dataset, writer, is_genuine, split, aug.
    n_pos: int, atau dict dataset -> jumlah pasangan asli per orang.
    return DataFrame i1, i2, label (0 mirip / 1 beda), tipe (0 asli-asli, 1 tiruan mahir, 2 tiruan acak), dataset.
    Pasangan "beda": FRAC_SKILLED tiruan mahir (asli vs tiruan orang yang sama), sisanya asli milik orang lain
    di dataset yang sama.
    """
    rng = random.Random(seed)
    base = meta[(meta.split == split) & (~meta.aug)]
    if datasets is not None:
        base = base[base.dataset.isin(datasets)]
    aug_idx = {}
    if pakai_aug:
        for i, p in zip(meta.index[meta.aug], meta.path[meta.aug]):
            aug_idx[p] = i
    ws = sorted(base.writer.unique())
    gen = {w: base.index[(base.writer == w) & base.is_genuine].tolist() for w in ws}
    frg = {w: base.index[(base.writer == w) & ~base.is_genuine].tolist() for w in ws}
    ws = [w for w in ws if len(gen[w]) >= 2]      # orang tanpa tanda tangan asli (mis. HIN_123) dilewati
    ds = base.groupby("writer").dataset.first().to_dict()
    path = meta.path.to_dict()
    rows = []

    def varian(i):
        if pakai_aug and rng.random() < P_AUG_VARIAN:
            return aug_idx.get(path[i], i)
        return i

    def add(a, b, y, t, d):
        if rng.random() < 0.5:
            a, b = b, a
        rows.append((varian(a), varian(b), y, t, d))

    for w in ws:
        g, f = gen[w], frg[w]
        if len(g) < 2:
            continue
        n = n_pos[ds[w]] if isinstance(n_pos, dict) else n_pos
        semua = [(a, b) for ia, a in enumerate(g) for b in g[ia + 1:]]
        pos = rng.sample(semua, min(n, len(semua)))
        for a, b in pos:
            add(a, b, 0, 0, ds[w])
        n_skl = int(round(len(pos) * FRAC_SKILLED)) if f else 0
        if f:
            kombinasi = [(a, b) for a in g for b in f]
            for a, b in rng.sample(kombinasi, min(n_skl, len(kombinasi))):
                add(a, b, 1, 1, ds[w])
        lain = [x for x in ws if x != w and ds[x] == ds[w]]
        for _ in range(len(pos) - n_skl):
            o = rng.choice(lain)
            add(rng.choice(g), rng.choice(gen[o]), 1, 2, ds[w])
    df = pd.DataFrame(rows, columns=["i1", "i2", "label", "tipe", "dataset"])
    return df.sample(frac=1, random_state=seed).reset_index(drop=True)
