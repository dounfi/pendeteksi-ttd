"""
backend_api.py - Server API FastAPI untuk SignaCheck (Verifikasi Tanda Tangan)
Menghubungkan frontend React ke model Keras, preprocessing, dan analisis forensik.
"""

import sys
import os
import io
import base64
import json
from pathlib import Path
from typing import Optional, Dict, Any, List

import cv2
import numpy as np
from PIL import Image
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Pastikan folder demo_model_files__6_ terbaca
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "demo_model_files__6_"
if str(MODEL_DIR) not in sys.path:
    sys.path.insert(0, str(MODEL_DIR))

import preprocess
import forensik
import gangguan

# Load config
CONFIG_PATH = MODEL_DIR / "config.json"
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    CONFIG = json.load(f)

# Load model Keras sekali saat startup
import keras
MODEL_PATH = MODEL_DIR / "embedding_model.keras"
print(f"[INFO] Memuat model Keras dari {MODEL_PATH}...")
EMBEDDING_MODEL = keras.models.load_model(str(MODEL_PATH))
print(f"[SUCCESS] Model berhasil dimuat! Input: {EMBEDDING_MODEL.input_shape}, Output: {EMBEDDING_MODEL.output_shape}")

app = FastAPI(
    title="SignaCheck API",
    description="Backend AI Verifikasi Keaslian Tanda Tangan",
    version="2.0.0"
)

# Aktifkan CORS agar frontend Vite/React (port 8080 / 5173 / dll) bisa request tanpa blokir
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def img_to_base64_png(arr: np.ndarray) -> str:
    """Mengubah numpy array (uint8 atau float 0..1) menjadi data URL PNG base64."""
    if arr is None:
        return ""
    if np.issubdtype(arr.dtype, np.floating):
        arr = np.clip(arr * 255.0, 0, 255).astype(np.uint8)
    else:
        arr = arr.astype(np.uint8)
    
    ok, buf = cv2.imencode(".png", arr)
    if not ok:
        return ""
    b64 = base64.b64encode(buf).decode("utf-8")
    return f"data:image/png;base64,{b64}"


def base64_to_gray(data_url: str) -> np.ndarray:
    """Mengubah string data URL base64 menjadi array grayscale uint8 2D."""
    if not data_url:
        raise ValueError("Gambar kosong.")
    
    if "," in data_url:
        data_url = data_url.split(",", 1)[1]
    
    img_bytes = base64.b64decode(data_url)
    img = Image.open(io.BytesIO(img_bytes))
    
    # Handle transparansi jika dari kanvas pad gambar
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
        latar = Image.new("RGBA", img.size, (255, 255, 255, 255))
        latar.alpha_composite(img)
        img = latar
    
    return np.array(img.convert("L"), dtype=np.uint8)


class VerifyRequest(BaseModel):
    ref_image: str
    qry_image: str
    preprocess_mode: str = "binary"
    perturbation: Optional[str] = None
    run_shake_test: bool = True


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "model": "embedding_model.keras",
        "threshold": CONFIG.get("threshold", 0.4825),
        "input_shape": EMBEDDING_MODEL.input_shape,
        "output_shape": EMBEDDING_MODEL.output_shape,
    }


@app.get("/api/samples")
def get_sample_presets():
    """Mengembalikan daftar preset sampel tanda tangan dari folder ttd_uji_sendiri."""
    samples_dir = BASE_DIR / "ttd_uji_sendiri"
    if not samples_dir.exists():
        return []
    
    curated = [
        {
            "id": "sample-1",
            "title": "Orang 1: Asli vs Asli (Sesi Berbeda)",
            "subtitle": "Dua tanda tangan asli milik Responden 1. Seharusnya diverifikasi ASLI.",
            "expected": "ASLI",
            "ref_file": "original_1_01.jpg",
            "qry_file": "original_1_02.jpg",
        },
        {
            "id": "sample-2",
            "title": "Orang 2: Asli vs Asli (Sesi Berbeda)",
            "subtitle": "Dua tanda tangan asli milik Responden 2. Karakteristik goresan konsisten.",
            "expected": "ASLI",
            "ref_file": "original_2_01.jpg",
            "qry_file": "original_2_02.jpg",
        },
        {
            "id": "sample-3",
            "title": "Orang 1: Asli vs Tiruan Mahir (Skilled Forgery)",
            "subtitle": "Tanda tangan Responden 1 yang ditiru oleh peniru (Responden 2). Seharusnya terdeteksi PALSU.",
            "expected": "PALSU",
            "ref_file": "original_1_01.jpg",
            "qry_file": "forgeries_1_01.jpg",
        },
        {
            "id": "sample-4",
            "title": "Orang 2: Asli vs Tiruan Mahir (Skilled Forgery)",
            "subtitle": "Tanda tangan Responden 2 yang dipalsukan oleh Responden 1. Bentuk mirip tapi dinamika beda.",
            "expected": "PALSU",
            "ref_file": "original_2_01.jpg",
            "qry_file": "forgeries_2_01.jpg",
        },
        {
            "id": "sample-5",
            "title": "Orang 3: Asli vs Tiruan Mahir (Skilled Forgery)",
            "subtitle": "Tanda tangan Responden 3 yang dipalsukan oleh Responden 1. Ciri kemiringan dan ketebalan beda.",
            "expected": "PALSU",
            "ref_file": "original_3_01.jpg",
            "qry_file": "forgeries_3_01.jpg",
        },
    ]

    out = []
    for item in curated:
        ref_p = samples_dir / item["ref_file"]
        qry_p = samples_dir / item["qry_file"]
        if ref_p.exists() and qry_p.exists():
            ref_b64 = "data:image/jpeg;base64," + base64.b64encode(ref_p.read_bytes()).decode("utf-8")
            qry_b64 = "data:image/jpeg;base64," + base64.b64encode(qry_p.read_bytes()).decode("utf-8")
            out.append({
                "id": item["id"],
                "title": item["title"],
                "subtitle": item["subtitle"],
                "expected": item["expected"],
                "ref_preview": ref_b64,
                "qry_preview": qry_b64,
            })
    return out


@app.post("/api/verify")
def verify_signature(req: VerifyRequest):
    try:
        # 1. Decode base64 gambar
        ref_gray = base64_to_gray(req.ref_image)
        qry_gray = base64_to_gray(req.qry_image)

        # 2. Berikan gangguan/perturbasi jika diminta
        if req.perturbation and req.perturbation in gangguan.KONDISI:
            rng = np.random.default_rng(42)
            qry_gray = gangguan.KONDISI[req.perturbation](qry_gray, rng)

        # 3. Preprocessing (dengan langkah-langkah visual)
        mode = req.preprocess_mode if req.preprocess_mode in preprocess.MODES else "binary"
        ref_arr, ref_steps = preprocess.preprocess_signature(ref_gray, mode=mode, return_steps=True)
        qry_arr, qry_steps = preprocess.preprocess_signature(qry_gray, mode=mode, return_steps=True)

        # 4. Inferensi Model Siamese CNN
        ref_batch = np.expand_dims(ref_arr, axis=(0, -1)).astype(np.float32)
        qry_batch = np.expand_dims(qry_arr, axis=(0, -1)).astype(np.float32)

        ref_emb = EMBEDDING_MODEL(ref_batch, training=False).numpy()
        qry_emb = EMBEDDING_MODEL(qry_batch, training=False).numpy()

        distance = float(np.linalg.norm(ref_emb - qry_emb))
        threshold = float(CONFIG.get("threshold", 0.4825))
        is_genuine = bool(distance <= threshold)
        decision = "ASLI" if is_genuine else "PALSU"

        # Kemiripan dalam persentase (100% jika distance 0, 50% di threshold, 0% jika >= 2*threshold)
        sim_pct = max(0.0, min(100.0, (1.0 - (distance / (threshold * 2.0))) * 100.0))
        sim_pct = round(sim_pct, 1)

        # 5. Analisis Ciri Forensik Klasik (Explainable AI)
        ref_potong = ref_steps.get("potong_biner", ref_steps.get("potong"))
        qry_potong = qry_steps.get("potong_biner", qry_steps.get("potong"))
        ref_feat = forensik.extract_features(ref_potong)
        qry_feat = forensik.extract_features(qry_potong)

        forensic_report = []
        fusion_info = None

        if ref_feat is not None and qry_feat is not None:
            forensic_report = forensik.explain(ref_feat, qry_feat, CONFIG["forensik_batas"])
            
            # 6. Fusi Ciri (Model Distance + 8 Classical Features)
            diffs = forensik.feature_diffs(ref_feat, qry_feat)
            x = np.array([distance] + list(diffs), dtype=np.float32)
            
            fusi_cfg = CONFIG.get("fusi", {})
            mean = np.array(fusi_cfg.get("mean", []), dtype=np.float32)
            scale = np.array(fusi_cfg.get("scale", []), dtype=np.float32)
            coef = np.array(fusi_cfg.get("coef", []), dtype=np.float32)
            intercept = float(fusi_cfg.get("intercept", 0.0))
            fusi_thresh = float(fusi_cfg.get("threshold", 0.0))
            
            if len(mean) == len(x) and len(coef) == len(x):
                x_scaled = (x - mean) / np.maximum(scale, 1e-6)
                fusion_score = float(np.dot(x_scaled, coef) + intercept)
                fusion_decision = "ASLI" if fusion_score <= fusi_thresh else "PALSU"
                fusion_info = {
                    "decision": fusion_decision,
                    "score": round(fusion_score, 2),
                    "threshold": round(fusi_thresh, 2),
                    "weight_model": round(float(coef[0]), 2),
                }

        # 7. Uji Goyang (Perturbation Test-Time Augmentation)
        shake_info = None
        if req.run_shake_test:
            goyang_cfg = CONFIG.get("goyang", {})
            n_shake = int(goyang_cfg.get("n", 6))
            ragu_z = float(goyang_cfg.get("ragu_z", 1.74))

            # Buat n variasi transformasi mikro dari qry_arr
            variants = gangguan.shake_variants(qry_arr, n=n_shake, seed=42)
            emb_vars = EMBEDDING_MODEL(variants, training=False).numpy()
            
            # Hitung jarak tiap variasi ke referensi
            shake_dists = np.linalg.norm(ref_emb - emb_vars, axis=1)
            mean_dist = float(np.mean(shake_dists))
            std_dist = float(np.std(shake_dists))
            
            margin_dist = abs(mean_dist - threshold)
            z_score = float(margin_dist / (std_dist + 1e-6))
            is_confident = bool(z_score >= ragu_z)
            status_text = "Sangat Yakin / Stabil" if is_confident else "Ragu / Perbatasan"

            shake_info = {
                "z_score": round(z_score, 2),
                "ragu_z": round(ragu_z, 2),
                "mean_dist": round(mean_dist, 4),
                "std_dist": round(std_dist, 4),
                "is_confident": is_confident,
                "status": status_text,
            }

        # 8. Encode Visualisasi Tahapan Citra ke Base64
        ref_visual_steps = {
            "asli": img_to_base64_png(ref_steps.get("asli")),
            "cahaya_rata": img_to_base64_png(ref_steps.get("cahaya_rata")),
            "mask": img_to_base64_png(ref_steps.get("mask")),
            "potong": img_to_base64_png(ref_steps.get("potong")),
            "final": img_to_base64_png(ref_steps.get("hasil")),
            "hasil": img_to_base64_png(ref_steps.get("hasil")),
        }
        qry_visual_steps = {
            "asli": img_to_base64_png(qry_steps.get("asli")),
            "cahaya_rata": img_to_base64_png(qry_steps.get("cahaya_rata")),
            "mask": img_to_base64_png(qry_steps.get("mask")),
            "potong": img_to_base64_png(qry_steps.get("potong")),
            "final": img_to_base64_png(qry_steps.get("hasil")),
            "hasil": img_to_base64_png(qry_steps.get("hasil")),
        }

        return {
            "decision": decision,
            "is_genuine": is_genuine,
            "distance": round(distance, 4),
            "threshold": round(threshold, 4),
            "similarity_pct": sim_pct,
            "fusion": fusion_info,
            "shake_test": shake_info,
            "forensic_report": forensic_report,
            "steps": {
                "ref": ref_visual_steps,
                "qry": qry_visual_steps,
            },
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    print("[INFO] Menjalankan server SignaCheck di http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000)

