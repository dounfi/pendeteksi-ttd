"""
v2_latih_model.py - melatih ulang Siamese CNN dengan fokus menurunkan FAR (tiruan mahir lolos).

Perbedaan utama dari model lama:
  1. Data tiruan mahir jauh lebih banyak: CEDAR (55 orang) + BHSig260 Bengali (100) + Hindi (160).
  2. Porsi pasangan tiruan mahir diperbesar (75% dari semua pasangan "beda") dan diberi bobot loss lebih besar.
  3. Pasangan diacak ULANG setiap epoch (model melihat jauh lebih banyak kombinasi).
  4. Sebagian gambar latih memakai versi "mirip foto HP" (bayangan/buram/miring/redup/noise).
Arsitektur, ukuran input, dan pengolahan citra SAMA dengan model lama, jadi backend tidak perlu diubah selain
file model, config, dan hash.

Dijalankan dengan backend Keras = torch (GPU):  KERAS_BACKEND=torch python v2_latih_model.py --cache <folder> --out <folder>
"""
import argparse
import json
import os
import random
import sys
import time

os.environ.setdefault("KERAS_BACKEND", "torch")
import cv2
import keras
import numpy as np
import pandas as pd
from keras import ops

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import v2_umum  # noqa: E402
from v2_umum import POS_PER_WRITER, SEED, W_SKILLED, buat_pasangan  # noqa: E402

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_LAMA = os.path.join(BASE, "demo_model_files__6_", "embedding_model.keras")


def augment(img, rng):
    h, w = img.shape
    M = cv2.getRotationMatrix2D((w / 2, h / 2), rng.uniform(-3, 3), 1.0 + rng.uniform(-0.05, 0.05))
    M[0, 2] += rng.uniform(-0.04, 0.04) * w
    M[1, 2] += rng.uniform(-0.04, 0.04) * h
    return cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_LINEAR, borderValue=0)


class Pasangan(keras.utils.PyDataset):
    def __init__(self, img, meta, split, n_pos, seed, batch=64, latih=True, max_pairs=None, **kw):
        super().__init__(**kw)
        self.img, self.meta, self.split, self.n_pos = img, meta, split, n_pos
        self.seed, self.batch, self.latih, self.epoch, self.max_pairs = seed, batch, latih, 0, max_pairs
        self.df = buat_pasangan(meta, split, n_pos, seed, pakai_aug=latih).head(max_pairs or None)

    def __len__(self):
        return int(np.ceil(len(self.df) / self.batch))

    def on_epoch_end(self):
        if self.latih:
            self.epoch += 1
            self.df = buat_pasangan(self.meta, self.split, self.n_pos, self.seed + self.epoch,
                                    pakai_aug=True).head(self.max_pairs or None)

    def __getitem__(self, k):
        b = self.df.iloc[k * self.batch:(k + 1) * self.batch]
        rng = np.random.default_rng(self.seed * 1000 + self.epoch * 100003 + k)
        A = self.img[b.i1.values].copy()
        B = self.img[b.i2.values].copy()
        if self.latih:
            for X in (A, B):
                for j in range(len(X)):
                    if rng.random() < 0.7:
                        X[j] = augment(X[j], rng)
        A = (A.astype(np.float32) / 255.0)[..., None]
        B = (B.astype(np.float32) / 255.0)[..., None]
        y = b.label.values.astype(np.float32)[:, None]
        w = np.where(b.tipe.values == 1, v2_umum.W_SKILLED, 1.0).astype(np.float32)
        return (A, B), y, w


def bangun_siamese(base):
    a = keras.Input(shape=(128, 256, 1), name="image1")
    b = keras.Input(shape=(128, 256, 1), name="image2")
    ea, eb = base(a), base(b)
    d = keras.layers.Lambda(
        lambda t: ops.sqrt(ops.sum(ops.square(t[0] - t[1]), axis=1, keepdims=True) + 1e-9),
        output_shape=(1,), name="jarak")([ea, eb])
    return keras.Model([a, b], d, name="siamese")


def kontrastif(margin=1.0):
    def f(y, d):
        return (1.0 - y) * ops.square(d) + y * ops.square(ops.maximum(margin - d, 0.0))
    return f


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--epochs", type=int, default=20)
    ap.add_argument("--lr", type=float, default=3e-4)
    ap.add_argument("--skilled_weight", type=float, default=W_SKILLED)  # bobot loss tiruan mahir
    ap.add_argument("--max_pairs", type=int, default=None, help="batasi jumlah pasangan latih per epoch (uji cepat / CPU)")
    ap.add_argument("--max_val", type=int, default=None, help="batasi jumlah pasangan validasi")
    ap.add_argument("--init_lama", action="store_true", help="mulai dari bobot model lama (fine-tuning), cocok untuk CPU")
    ap.add_argument("--patience", type=int, default=4)
    a = ap.parse_args()
    v2_umum.W_SKILLED = a.skilled_weight
    os.makedirs(a.out, exist_ok=True)
    random.seed(SEED); np.random.seed(SEED); keras.utils.set_random_seed(SEED)

    d = np.load(os.path.join(a.cache, "data.npz"))
    img = d["img"]
    meta = pd.read_csv(os.path.join(a.cache, "meta.csv"))
    print("gambar:", img.shape, "| backend:", keras.backend.backend(), flush=True)

    lama = keras.saving.load_model(MODEL_LAMA, compile=False)
    if a.init_lama:
        base = lama                                              # fine-tuning dari bobot model lama
    else:
        base = keras.Model.from_config(lama.get_config())       # arsitektur identik, bobot baru
        del lama
    model = bangun_siamese(base)
    model.compile(optimizer=keras.optimizers.Adam(a.lr), loss=kontrastif(1.0))

    tr = Pasangan(img, meta, "train", POS_PER_WRITER, SEED, latih=True, max_pairs=a.max_pairs, workers=4,
                  use_multiprocessing=False)
    va = Pasangan(img, meta, "val", 60, SEED + 1, latih=False, max_pairs=a.max_val)
    print("pasangan latih/epoch:", len(tr.df), tr.df.tipe.value_counts().to_dict(),
          "| val:", len(va.df), va.df.tipe.value_counts().to_dict(), flush=True)

    cb = [
        keras.callbacks.EarlyStopping(monitor="val_loss", patience=a.patience, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6),
    ]
    t0 = time.time()
    h = model.fit(tr, validation_data=va, epochs=a.epochs, callbacks=cb, verbose=2)
    print(f"selesai {(time.time() - t0) / 60:.1f} menit | epoch {len(h.history['loss'])}", flush=True)
    base.save(os.path.join(a.out, "embedding_model.keras"))
    json.dump({k: [float(x) for x in v] for k, v in h.history.items()},
              open(os.path.join(a.out, "riwayat_latih.json"), "w"), indent=1)
    print("model tersimpan di", a.out)


if __name__ == "__main__":
    main()
