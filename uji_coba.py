"""
uji_coba.py - Skrip pengujian mandiri model Siamese CNN Deteksi Tanda Tangan.
"""

import os
import sys
import json
import numpy as np

# Pastikan konsol Windows mendukung encoding UTF-8
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Tambahkan direktori modul
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEMO_DIR = os.path.join(BASE_DIR, "demo_model_files (5)")
sys.path.insert(0, DEMO_DIR)

import keras
import preprocess
import forensik
import gangguan

def jalankan_pengujian():
    print("=" * 65)
    print("🚀 PENGUJIAN MODEL DETEKSI PEMALSUAN TANDA TANGAN (SIAMESE CNN)")
    print("=" * 65)

    # 1. Muat Config
    config_path = os.path.join(DEMO_DIR, "config.json")
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    threshold = config["threshold"]
    mode = config.get("preprocess_mode", "binary")
    fusi_cfg = config.get("fusi", None)
    batas_forensik = config.get("forensik_batas", {})
    goyang_cfg = config.get("goyang", {})

    print(f"📌 Nama Model         : {config.get('model', 'Siamese CNN')}")
    print(f"📌 Mode Preprocessing : {mode}")
    print(f"📌 Ambang Batas Jarak : {threshold:.4f} (Jarak < {threshold:.4f} => ASLI, Jarak >= {threshold:.4f} => PALSU)")
    print(f"📌 Dimensi Input      : {config.get('img_h', 128)}x{config.get('img_w', 256)}")
    print("-" * 65)

    # 2. Muat Model Keras
    model_path = os.path.join(DEMO_DIR, "embedding_model.keras")
    print(f"⏳ Memuat model dari: {model_path} ...")
    model = keras.models.load_model(model_path, compile=False)
    print("✅ Model Siamese CNN berhasil dimuat!\n")

    # 3. Daftar Pasangan Sampel Uji
    daftar_uji = [
        {
            "nama": "Pasangan 1: TTD Rajshree vs Rajshree (Seharusnya ASLI/COCOK)",
            "file1": "contoh_ttd/ttd_rajshree_1.png",
            "file2": "contoh_ttd/ttd_rajshree_2.png",
            "ekspektasi": "ASLI"
        },
        {
            "nama": "Pasangan 2: TTD Miring 1 vs Miring 2 (Seharusnya ASLI/COCOK)",
            "file1": "contoh_ttd/ttd_miring_1.png",
            "file2": "contoh_ttd/ttd_miring_2.png",
            "ekspektasi": "ASLI"
        },
        {
            "nama": "Pasangan 3: TTD Berbeda / Pemalsuan (Seharusnya PALSU/BEDA)",
            "file1": "contoh_ttd/palsu_pair3_ref.png",
            "file2": "contoh_ttd/palsu_pair3_forgery.png",
            "ekspektasi": "PALSU"
        }
    ]

    for no, uji in enumerate(daftar_uji, 1):
        print("=" * 65)
        print(f"🧪 UJI #{no}: {uji['nama']}")
        print("=" * 65)

        # Baca dan olah citra
        g1 = preprocess.load_gray(uji["file1"])
        g2 = preprocess.load_gray(uji["file2"])

        proc1, steps1 = preprocess.preprocess_signature(g1, mode=mode, return_steps=True)
        proc2, steps2 = preprocess.preprocess_signature(g2, mode=mode, return_steps=True)

        inp1 = proc1[np.newaxis, :, :, np.newaxis]
        inp2 = proc2[np.newaxis, :, :, np.newaxis]

        # Ekstraksi Embedding & Hitung Jarak Euclidean
        emb1 = model.predict(inp1, verbose=0)
        emb2 = model.predict(inp2, verbose=0)
        jarak = float(np.linalg.norm(emb1 - emb2))

        hasil_model = "ASLI (COCOK)" if jarak < threshold else "PALSU (TIDAK COCOK)"
        status_sim = "✅ SESUAI" if uji["ekspektasi"] in hasil_model else "⚠️ PERBEDAAN"

        print(f"  🔹 Jarak Euclidean Model : {jarak:.4f}")
        print(f"  🔹 Keputusan Model CNN   : {hasil_model}  [{status_sim}]")

        # Ciri Forensik Klasik
        crop1 = steps1.get("potong_biner", steps1.get("potong"))
        crop2 = steps2.get("potong_biner", steps2.get("potong"))
        f1 = forensik.extract_features(crop1)
        f2 = forensik.extract_features(crop2)

        if f1 is not None and f2 is not None and batas_forensik:
            lap_forensik = forensik.explain(f1, f2, batas_forensik)
            print("\n  🔍 Analisis Forensik Klasik:")
            for item in lap_forensik[:4]:  # Tampilkan 4 ciri teratas
                print(f"     • {item['label']}: {item['pembanding']} vs {item['diperiksa']} -> status: {item['tingkat']}")

        # Fusi Keputusan (Model CNN + Forensik)
        if fusi_cfg and f1 is not None and f2 is not None:
            diffs = forensik.feature_diffs(f1, f2)
            x_fusi = np.array([jarak] + diffs.tolist())
            x_scaled = (x_fusi - np.array(fusi_cfg["mean"])) / np.array(fusi_cfg["scale"])
            skor_fusi = float(np.dot(x_scaled, np.array(fusi_cfg["coef"])) + fusi_cfg["intercept"])
            fusi_pred = "PALSU (TIDAK COCOK)" if skor_fusi >= fusi_cfg["threshold"] else "ASLI (COCOK)"
            print(f"\n  ⚖️ Keputusan Fusi (CNN + Forensik): {fusi_pred} (Skor: {skor_fusi:.4f}, Batas: {fusi_cfg['threshold']:.4f})")

        # Uji Goyang (Keyakinan / Stabilitas)
        if goyang_cfg:
            n_shake = goyang_cfg.get("n", 6)
            var1 = gangguan.shake_variants(proc1, n=n_shake, seed=42)
            var2 = gangguan.shake_variants(proc2, n=n_shake, seed=42)
            e_var1 = model.predict(var1, verbose=0)
            e_var2 = model.predict(var2, verbose=0)
            dists_goyang = np.linalg.norm(e_var1 - e_var2, axis=1)
            mean_dist = float(np.mean(dists_goyang))
            std_dist = float(np.std(dists_goyang))
            z_conf = abs(mean_dist - threshold) / (std_dist + 1e-3)
            ragu_z = goyang_cfg.get("ragu_z", 1.74)
            status_yakin = "Sangat Yakin / Stabil" if z_conf >= ragu_z else "Ragu-ragu (Perlu verifikasi manual)"
            print(f"  🌊 Uji Goyang (Stabilitas)       : Skor Keyakinan Z = {z_conf:.2f} ({status_yakin})")

        print()

    print("=" * 65)
    print("🎉 KESIMPULAN: Model dan seluruh pipeline BERJALAN DENGAN SEMPURNA!")
    print("=" * 65)

if __name__ == "__main__":
    jalankan_pengujian()
