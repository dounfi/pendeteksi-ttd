"""v2_konversi.py - memuat ulang bobot model hasil training (keras versi lain) ke arsitektur identik dengan keras yang dipakai backend,
lalu menyimpannya sebagai embedding_model.keras yang bisa dibaca backend."""
import os, sys, zipfile, tempfile
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
import keras

LAMA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "demo_model_files__6_", "embedding_model.keras")


def main(src, dst):
    lama = keras.saving.load_model(LAMA, compile=False)
    base = keras.Model.from_config(lama.get_config())
    with tempfile.TemporaryDirectory() as t:
        with zipfile.ZipFile(src) as z:
            z.extract("model.weights.h5", t)
        base.load_weights(os.path.join(t, "model.weights.h5"))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    base.save(dst)
    print("tersimpan:", dst, "| keras", keras.__version__)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
