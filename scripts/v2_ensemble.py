"""
v2_ensemble.py - menggabungkan beberapa model embedding menjadi SATU file embedding_model.keras.

Keluaran model gabungan = gabungan embedding tiap model (masing-masing sudah L2-normalized) dibagi sqrt(n),
sehingga hasilnya juga berpanjang 1 dan jarak gabungan = sqrt(rata-rata kuadrat jarak tiap model).
Backend tidak perlu diubah: ia hanya memanggil model(gambar) dan menghitung jarak Euclid.

  python v2_ensemble.py <keluaran.keras> <model1.keras> <model2.keras> [...]
"""
import os
import sys

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
import keras
import numpy as np


def bangun(paths):
    inp = keras.Input(shape=(128, 256, 1), name="signature")
    keluar = []
    for i, p in enumerate(paths):
        m = keras.saving.load_model(p, compile=False)
        keluar.append(keras.Model(m.inputs[0], m.outputs[0], name=f"emb{i}")(inp))
    z = keras.layers.Concatenate(name="gabung")(keluar)
    z = keras.layers.Rescaling(1.0 / float(np.sqrt(len(paths))), name="skala")(z)
    return keras.Model(inp, z, name="ensemble_embedding")


if __name__ == "__main__":
    dst, paths = sys.argv[1], sys.argv[2:]
    model = bangun(paths)
    os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
    model.save(dst)
    x = np.random.rand(2, 128, 256, 1).astype("float32")
    e = model.predict(x, verbose=0)
    print("tersimpan:", dst, "| keluaran", e.shape, "| norma", np.linalg.norm(e, axis=1))
