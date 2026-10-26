"""
server.py - REST API Backend untuk Sistem Deteksi Tanda Tangan Siamese CNN
Menggunakan FastAPI + Uvicorn + Keras + OpenCV
"""

import os
import sys
import io
import base64
import json
import numpy as np
import cv2
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

# Setup path modul lokal
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEMO_DIR = os.path.join(BASE_DIR, "demo_model_files (5)")
sys.path.insert(0, DEMO_DIR)

import keras
import preprocess
import forensik
import gangguan

app = FastAPI(title="Signature Verification Siamese CNN API", version="1.0.0")

# Enable CORS for React frontend (Vite default port 5173, 3000, 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and config
CONFIG = {}
MODEL = None

def init_app():
    global CONFIG, MODEL
    cfg_path = os.path.join(DEMO_DIR, "config.json")
    with open(cfg_path, "r", encoding="utf-8") as f:
        CONFIG = json.load(f)
    
    model_path = os.path.join(DEMO_DIR, "embedding_model.keras")
    print(f"Loading Siamese CNN model from {model_path}...")
    MODEL = keras.models.load_model(model_path, compile=False)
    print("Model loaded successfully!")

init_app()

def img_to_base64(img_arr):
    """Convert numpy array (uint8 or float 0..1) to Base64 PNG data URI."""
    if img_arr is None:
        return None
    if img_arr.dtype == np.float32 or img_arr.dtype == np.float64:
        img_arr = np.clip(img_arr * 255.0, 0, 255).astype(np.uint8)
    if len(img_arr.shape) == 3 and img_arr.shape[-1] == 1:
        img_arr = img_arr[:, :, 0]
    
    is_success, buffer = cv2.imencode(".png", img_arr)
    if not is_success:
        return None
    b64_str = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

def decode_base64_or_bytes(data):
    """Parse image from either data URI or base64 raw or raw bytes."""
    if isinstance(data, str):
        if "," in data:
            data = data.split(",", 1)[1]
        raw_bytes = base64.b64decode(data)
    else:
        raw_bytes = data
    
    pil_img = Image.open(io.BytesIO(raw_bytes))
    if pil_img.mode in ("RGBA", "LA") or (pil_img.mode == "P" and "transparency" in pil_img.info):
        pil_img = pil_img.convert("RGBA")
        latar = Image.new("RGBA", pil_img.size, (255, 255, 255, 255))
        latar.alpha_composite(pil_img)
        pil_img = latar
    return np.array(pil_img.convert("L"), dtype=np.uint8)

@app.get("/api/health")
def health():
    return {"status": "ok", "model": CONFIG.get("model", "Siamese CNN")}

@app.get("/api/info")
def get_info():
    return {
        "model_name": CONFIG.get("model", "gabungan D1+D2"),
        "threshold": CONFIG.get("threshold", 0.4811),
        "img_size": [CONFIG.get("img_h", 128), CONFIG.get("img_w", 256)],
        "preprocess_mode": CONFIG.get("preprocess_mode", "binary"),
        "metrics": CONFIG.get("metrics", {}),
        "fusi": bool(CONFIG.get("fusi")),
        "forensik_fitur": forensik.NAMA_CIRI
    }

@app.get("/api/samples")
def get_samples():
    sample_dir = os.path.join(BASE_DIR, "contoh_ttd")
    samples = [
        {
            "id": "sample-1",
            "title": "Rajshree (Asli vs Asli)",
            "subtitle": "Pasangan tanda tangan dari penulis yang sama",
            "expected": "ASLI",
            "ref_file": "ttd_rajshree_1.png",
            "qry_file": "ttd_rajshree_2.png"
        },
        {
            "id": "sample-2",
            "title": "Gaya Miring (Asli vs Asli)",
            "subtitle": "Variasi tanda tangan asli dengan sudut miring dinamis",
            "expected": "ASLI",
            "ref_file": "ttd_miring_1.png",
            "qry_file": "ttd_miring_2.png"
        },
        {
            "id": "sample-3",
            "title": "Pemalsuan / Beda (Asli vs Palsu)",
            "subtitle": "Tanda tangan dari penulis berbeda yang berusaha meniru",
            "expected": "PALSU",
            "ref_file": "palsu_pair3_ref.png",
            "qry_file": "palsu_pair3_forgery.png"
        }
    ]
    
    for s in samples:
        p_ref = os.path.join(sample_dir, s["ref_file"])
        p_qry = os.path.join(sample_dir, s["qry_file"])
        if os.path.exists(p_ref):
            s["ref_preview"] = img_to_base64(cv2.imread(p_ref, cv2.IMREAD_GRAYSCALE))
        if os.path.exists(p_qry):
            s["qry_preview"] = img_to_base64(cv2.imread(p_qry, cv2.IMREAD_GRAYSCALE))
            
    return samples

class VerifyPayload(BaseModel):
    ref_image: str                      # base64 data URI
    qry_image: str                      # base64 data URI
    preprocess_mode: Optional[str] = "binary"
    perturbation: Optional[str] = None  # None, "foto_hp", "bayangan", "buram", "miring", "redup", "noise"
    run_shake_test: Optional[bool] = True

@app.post("/api/verify")
def verify_signatures(payload: VerifyPayload):
    try:
        gray_ref = decode_base64_or_bytes(payload.ref_image)
        gray_qry = decode_base64_or_bytes(payload.qry_image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal memproses gambar: {str(e)}")

    mode = payload.preprocess_mode or CONFIG.get("preprocess_mode", "binary")
    threshold = float(CONFIG.get("threshold", 0.4811))

    # Simulasi gangguan foto HP jika dipilih
    if payload.perturbation and payload.perturbation in gangguan.KONDISI:
        rng = np.random.default_rng(42)
        fn_gangguan = gangguan.KONDISI[payload.perturbation]
        gray_qry = fn_gangguan(gray_qry, rng)

    # Preprocessing
    proc_ref, steps_ref = preprocess.preprocess_signature(gray_ref, mode=mode, return_steps=True)
    proc_qry, steps_qry = preprocess.preprocess_signature(gray_qry, mode=mode, return_steps=True)

    inp_ref = proc_ref[np.newaxis, :, :, np.newaxis]
    inp_qry = proc_qry[np.newaxis, :, :, np.newaxis]

    # Prediksi Model Siamese CNN
    emb_ref = MODEL.predict(inp_ref, verbose=0)
    emb_qry = MODEL.predict(inp_qry, verbose=0)
    distance = float(np.linalg.norm(emb_ref - emb_qry))

    is_asli = distance < threshold
    decision = "ASLI" if is_asli else "PALSU"
    similarity_pct = max(0.0, min(100.0, (1.0 - (distance / 1.0)) * 100.0))

    # Analisis Ciri Forensik Klasik (8 Fitur)
    crop1 = steps_ref.get("potong_biner", steps_ref.get("potong"))
    crop2 = steps_qry.get("potong_biner", steps_qry.get("potong"))
    feat_ref = forensik.extract_features(crop1)
    feat_qry = forensik.extract_features(crop2)

    forensic_items = []
    batas_forensik = CONFIG.get("forensik_batas", {})
    if feat_ref is not None and feat_qry is not None and batas_forensik:
        lap = forensik.explain(feat_ref, feat_qry, batas_forensik)
        forensic_items = lap

    # Keputusan Fusi (Siamese CNN + Forensik Klasik)
    fusion_result = None
    fusi_cfg = CONFIG.get("fusi", None)
    if fusi_cfg and feat_ref is not None and feat_qry is not None:
        diffs = forensik.feature_diffs(feat_ref, feat_qry)
        x_fusi = np.array([distance] + diffs.tolist())
        x_scaled = (x_fusi - np.array(fusi_cfg["mean"])) / np.array(fusi_cfg["scale"])
        skor_fusi = float(np.dot(x_scaled, np.array(fusi_cfg["coef"])) + fusi_cfg["intercept"])
        fusi_decision = "PALSU" if skor_fusi >= fusi_cfg["threshold"] else "ASLI"
        fusion_result = {
            "decision": fusi_decision,
            "score": skor_fusi,
            "threshold": fusi_cfg["threshold"],
            "weight_model": float(fusi_cfg["coef"][0])
        }

    # Uji Goyang (Shake Test) - Keyakinan Stabilitas
    shake_result = None
    if payload.run_shake_test:
        goyang_cfg = CONFIG.get("goyang", {})
        n_shake = goyang_cfg.get("n", 6)
        var1 = gangguan.shake_variants(proc_ref, n=n_shake, seed=123)
        var2 = gangguan.shake_variants(proc_qry, n=n_shake, seed=123)
        e_var1 = MODEL.predict(var1, verbose=0)
        e_var2 = MODEL.predict(var2, verbose=0)
        dists_g = np.linalg.norm(e_var1 - e_var2, axis=1)
        mean_d = float(np.mean(dists_g))
        std_d = float(np.std(dists_g))
        z_score = float(abs(mean_d - threshold) / (std_d + 1e-3))
        ragu_z = float(goyang_cfg.get("ragu_z", 1.74))
        is_confident = z_score >= ragu_z
        shake_result = {
            "z_score": round(z_score, 2),
            "ragu_z": round(ragu_z, 2),
            "mean_dist": round(mean_d, 4),
            "std_dist": round(std_d, 4),
            "is_confident": is_confident,
            "status": "Sangat Yakin / Stabil" if is_confident else "Ragu-ragu (Batas Margin)"
        }

    # Visual Preprocessing Steps
    steps_visual = {
        "ref": {
            "asli": img_to_base64(gray_ref),
            "cahaya_rata": img_to_base64(steps_ref.get("cahaya_rata")),
            "mask": img_to_base64(steps_ref.get("mask")),
            "potong": img_to_base64(steps_ref.get("potong")),
            "final": img_to_base64(proc_ref)
        },
        "qry": {
            "asli": img_to_base64(gray_qry),
            "cahaya_rata": img_to_base64(steps_qry.get("cahaya_rata")),
            "mask": img_to_base64(steps_qry.get("mask")),
            "potong": img_to_base64(steps_qry.get("potong")),
            "final": img_to_base64(proc_qry)
        }
    }

    return {
        "decision": decision,
        "is_genuine": is_asli,
        "distance": round(distance, 4),
        "threshold": round(threshold, 4),
        "similarity_pct": round(similarity_pct, 1),
        "fusion": fusion_result,
        "shake_test": shake_result,
        "forensic_report": forensic_items,
        "steps": steps_visual
    }
