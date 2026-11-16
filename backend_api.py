"""
backend_api.py - Server API FastAPI untuk SignaCheck (Verifikasi Tanda Tangan)
Menghubungkan frontend React ke model Keras, preprocessing, dan analisis forensik.
"""

import sys
import os
import io
import base64
import hashlib
import json
import logging
import time
from pathlib import Path
from typing import Optional, Dict, Any, List

import cv2
import numpy as np
from PIL import Image
import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Konstanta & konfigurasi
# ---------------------------------------------------------------------------
EXPECTED_HASH = "48B77FEFF782E83EDBF161EF52E6106F0573471E828CFC41BEA573AEAA3CCD01"
EXPECTED_PREPROCESS_MODE = "binary"
MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024  # 8 MB

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("signacheck")

# ---------------------------------------------------------------------------
# Path setup – gunakan HANYA demo_model_files__6_
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "demo_model_files__6_"
CONFIG_PATH = MODEL_DIR / "config.json"
MODEL_PATH = MODEL_DIR / "embedding_model.keras"

if str(MODEL_DIR) not in sys.path:
    sys.path.insert(0, str(MODEL_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import kualitas_foto  # penilaian kualitas foto (peringatan saja, tidak mengubah input model)

# ---------------------------------------------------------------------------
# MOCK_MODE: aktif hanya jika file model tidak tersedia
# ---------------------------------------------------------------------------
MOCK_MODE: bool = False


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest().upper()


# ---------------------------------------------------------------------------
# Startup: validasi hash + config sebelum memuat model
# ---------------------------------------------------------------------------
logger.info("=" * 60)
logger.info("[STARTUP] SignaCheck Backend")
logger.info(f"[STARTUP] Model folder : {MODEL_DIR}")

if not MODEL_PATH.exists() or not CONFIG_PATH.exists():
    logger.warning("[STARTUP] File model tidak ditemukan – aktif dalam MOCK_MODE")
    MOCK_MODE = True
    CONFIG: Dict[str, Any] = {}
    EMBEDDING_MODEL = None
    MODEL_HASH: str = "N/A"
else:
    # 1. Hitung hash aktual
    MODEL_HASH = _sha256_file(MODEL_PATH)
    logger.info(f"[STARTUP] Hash embedding_model.keras : {MODEL_HASH}")

    # 2. Baca config
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        CONFIG = json.load(f)

    actual_mode = CONFIG.get("preprocess_mode", "")
    actual_threshold = CONFIG.get("threshold")
    actual_ragu_z = CONFIG.get("goyang", {}).get("ragu_z")

    logger.info(f"[STARTUP] preprocess_mode : {actual_mode}")
    logger.info(f"[STARTUP] threshold       : {actual_threshold}")
    logger.info(f"[STARTUP] ragu_z          : {actual_ragu_z}")

    # 3. Guard: hentikan proses jika hash atau mode tidak sesuai
    errors = []
    if MODEL_HASH != EXPECTED_HASH:
        errors.append(
            f"Hash model TIDAK COCOK!\n"
            f"  Diharapkan : {EXPECTED_HASH}\n"
            f"  Aktual     : {MODEL_HASH}"
        )
    if actual_mode != EXPECTED_PREPROCESS_MODE:
        errors.append(
            f"preprocess_mode TIDAK COCOK!\n"
            f"  Diharapkan : {EXPECTED_PREPROCESS_MODE}\n"
            f"  Aktual     : {actual_mode}"
        )
    if errors:
        for e in errors:
            logger.critical(f"[STARTUP] VALIDASI GAGAL: {e}")
        logger.critical("[STARTUP] Proses dihentikan untuk mencegah penggunaan model yang salah.")
        sys.exit(1)

    logger.info("[STARTUP] Validasi hash & config: OK")

    # 4. Import modul dari folder model
    import preprocess
    import forensik
    import gangguan

    # 5. Load model Keras
    import keras
    logger.info(f"[STARTUP] Memuat model Keras dari {MODEL_PATH} ...")
    EMBEDDING_MODEL = keras.models.load_model(str(MODEL_PATH))
    logger.info(
        f"[STARTUP] Model berhasil dimuat! "
        f"Input: {EMBEDDING_MODEL.input_shape}, Output: {EMBEDDING_MODEL.output_shape}"
    )

logger.info("=" * 60)

# ---------------------------------------------------------------------------
# Aplikasi FastAPI
# ---------------------------------------------------------------------------
app = FastAPI(
    title="SignaCheck API",
    description="Backend AI Verifikasi Keaslian Tanda Tangan",
    version="2.0.0",
)

# CORS – hanya izinkan origin frontend yang sah (bukan wildcard)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware: tambahkan X-Mock-Mode header jika aktif
@app.middleware("http")
async def add_mock_header(request: Request, call_next):
    response = await call_next(request)
    if MOCK_MODE:
        response.headers["X-Mock-Mode"] = "true"
    return response


# ---------------------------------------------------------------------------
# Pencatatan waktu respons /api/verify
# ---------------------------------------------------------------------------
_verify_times: List[float] = []


# ---------------------------------------------------------------------------
# Helper: konversi gambar
# ---------------------------------------------------------------------------

def img_to_base64_png(arr: np.ndarray) -> str:
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
    if not data_url:
        raise ValueError("Gambar kosong.")
    if "," in data_url:
        data_url = data_url.split(",", 1)[1]
    img_bytes = base64.b64decode(data_url)
    img = Image.open(io.BytesIO(img_bytes))
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
        latar = Image.new("RGBA", img.size, (255, 255, 255, 255))
        latar.alpha_composite(img)
        img = latar
    return np.array(img.convert("L"), dtype=np.uint8)


def file_to_gray(file_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(file_bytes))
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
        latar = Image.new("RGBA", img.size, (255, 255, 255, 255))
        latar.alpha_composite(img)
        img = latar
    return np.array(img.convert("L"), dtype=np.uint8)


# ---------------------------------------------------------------------------
# Endpoint: GET /api/health
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "ok" if not MOCK_MODE else "mock",
        "threshold": CONFIG.get("threshold"),
        "preprocess_mode": CONFIG.get("preprocess_mode"),
        "model_hash": MODEL_HASH,
    }


# ---------------------------------------------------------------------------
# Endpoint: GET /api/model-info  (Tugas 5a / 2a)
# Semua angka dibaca dari CONFIG – tidak ada yang tertanam di kode.
# ---------------------------------------------------------------------------

@app.get("/api/model-info")
def model_info():
    if MOCK_MODE:
        return JSONResponse(
            content={"error": "Server berjalan dalam MOCK_MODE – model tidak tersedia"},
            status_code=503,
        )

    metrics_raw = CONFIG.get("metrics", {})
    per_dataset_raw = metrics_raw.get("per_dataset", {})

    # Bangun per_dataset dengan field yang diminta
    per_dataset: Dict[str, Any] = {}
    for ds_name, ds_vals in per_dataset_raw.items():
        per_dataset[ds_name] = {
            "accuracy": ds_vals.get("accuracy"),
            "auc": ds_vals.get("auc"),
            "eer": ds_vals.get("eer"),
            "FAR": ds_vals.get("FAR"),
            "FRR": ds_vals.get("FRR"),
            "FAR_skilled_forgery": ds_vals.get("FAR_skilled_forgery"),
            "FAR_random_forgery": ds_vals.get("FAR_random_forgery"),
        }

    banyak_pembanding = CONFIG.get("banyak_pembanding", {})

    return {
        "nama_model": CONFIG.get("model"),
        "preprocess_mode": CONFIG.get("preprocess_mode"),
        "threshold": CONFIG.get("threshold"),
        "ragu_z": CONFIG.get("goyang", {}).get("ragu_z"),
        "ragu_margin": CONFIG.get("goyang", {}).get("ragu_margin"),
        "metrics": {
            "per_dataset": per_dataset,
        },
        "banyak_pembanding": banyak_pembanding,
        "model_hash": MODEL_HASH,
    }


# ---------------------------------------------------------------------------
# Endpoint: GET /api/samples
# ---------------------------------------------------------------------------

@app.get("/api/samples")
def get_sample_presets():
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
            out.append(
                {
                    "id": item["id"],
                    "title": item["title"],
                    "subtitle": item["subtitle"],
                    "expected": item["expected"],
                    "ref_preview": ref_b64,
                    "qry_preview": qry_b64,
                }
            )
    return out


@app.get("/api/sample-image/{filename}")
def get_sample_image(filename: str):
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Nama file tidak valid.")
    file_path = BASE_DIR / "ttd_uji_sendiri" / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File contoh tidak ditemukan.")
    return FileResponse(file_path, media_type="image/jpeg")


# ---------------------------------------------------------------------------
# Konstanta pemeriksaan tambahan
# ---------------------------------------------------------------------------
COPY_DIST = 0.02          # jarak embedding sangat kecil -> kemungkinan salinan (bukan tanda tangan baru)
SHAKE_Z_CAP = 99.0        # batas atas z-score supaya tidak meledak saat std ~ 0
OCC_PATCH = (32, 32)      # ukuran jendela peta penjelasan (tinggi, lebar) pada citra 128x256
OCC_STRIDE = (16, 16)


# ---------------------------------------------------------------------------
# Helper: validasi tinta, deduplikasi, peta penjelasan
# ---------------------------------------------------------------------------

def _cek_tinta(gray: np.ndarray, label: str) -> None:
    """Penolakan awal untuk gambar yang jelas tidak berisi tanda tangan (kontras sangat rendah)."""
    if float(np.std(gray)) < 2.0:
        raise HTTPException(
            status_code=400,
            detail=f"{label} tidak mengandung tanda tangan. Pastikan tanda tangan terlihat jelas.",
        )


def _gray_hash(gray: np.ndarray) -> str:
    return hashlib.sha256(gray.tobytes() + str(gray.shape).encode()).hexdigest()


def _occlusion_map(qry_arr: np.ndarray, ref_embs: np.ndarray, base_dist: float) -> Optional[np.ndarray]:
    """
    Peta penjelasan berbasis oklusi pada EMBEDDING model (bukan ciri klasik).
    Setiap jendela pada citra olahan yang diperiksa ditutup (dijadikan latar), lalu dihitung berapa
    jarak ke pembanding berubah. Jika jarak TURUN saat sebuah area ditutup, area itu ikut mendorong
    model menilai 'berbeda'.
    return: heatmap float32 (H, W) 0..1, atau None bila tidak ada tinta.
    """
    h, w = qry_arr.shape
    ph, pw = OCC_PATCH
    sh, sw = OCC_STRIDE
    kotak = []
    for y in range(0, max(1, h - ph + 1), sh):
        for x in range(0, max(1, w - pw + 1), sw):
            if qry_arr[y:y + ph, x:x + pw].sum() > 0:   # lewati jendela tanpa tinta
                kotak.append((y, x))
    if not kotak:
        return None

    batch = np.repeat(qry_arr[None, :, :, None], len(kotak), axis=0).astype(np.float32)
    for i, (y, x) in enumerate(kotak):
        batch[i, y:y + ph, x:x + pw, 0] = 0.0
    emb = EMBEDDING_MODEL(batch, training=False).numpy()                      # (n, d)
    d_occ = np.linalg.norm(emb[:, None, :] - ref_embs[None, :, :], axis=2).mean(axis=1)   # (n,)
    delta = base_dist - d_occ                                                  # >0: area ini memperbesar jarak

    heat = np.zeros((h, w), dtype=np.float32)
    cnt = np.zeros((h, w), dtype=np.float32)
    for (y, x), dv in zip(kotak, delta):
        heat[y:y + ph, x:x + pw] += float(dv)
        cnt[y:y + ph, x:x + pw] += 1.0
    heat = np.where(cnt > 0, heat / np.maximum(cnt, 1.0), 0.0)
    heat = np.clip(heat, 0.0, None)
    mx = float(heat.max())
    if mx <= 1e-9:
        return None
    return (heat / mx).astype(np.float32)


def _overlay_heatmap(qry_arr: np.ndarray, heat: np.ndarray) -> str:
    """Gambar tanda tangan (tinta gelap di kertas putih) dengan sorotan merah pada area pembeda."""
    dasar = (255 - np.clip(qry_arr * 255.0, 0, 255)).astype(np.uint8)
    dasar_bgr = cv2.cvtColor(dasar, cv2.COLOR_GRAY2BGR).astype(np.float32)
    heat_s = cv2.GaussianBlur(heat, (0, 0), sigmaX=6)
    if heat_s.max() > 0:
        heat_s = heat_s / heat_s.max()
    a = (heat_s * 0.75)[..., None]
    merah = np.zeros_like(dasar_bgr)
    merah[..., 2] = 255.0
    hasil = dasar_bgr * (1.0 - a) + merah * a
    return img_to_base64_png(np.clip(hasil, 0, 255).astype(np.uint8))


# ---------------------------------------------------------------------------
# Inti verifikasi (dipakai /api/verify dan /api/verify-json)
# ---------------------------------------------------------------------------

def _run_verification(
    qry_gray: np.ndarray,
    refs_gray: List[np.ndarray],
    preprocess_mode: str,
    perturbation: Optional[str],
    run_shake_test: bool,
    t_start: float,
    tag: str = "VERIFY",
) -> Dict[str, Any]:
    warnings: List[str] = []
    status_reasons: List[str] = []

    # --- Deduplikasi pembanding (file/piksel yang sama tidak menambah informasi) ---
    uniq_refs: List[np.ndarray] = []
    seen = set()
    for r in refs_gray:
        hsh = _gray_hash(r)
        if hsh in seen:
            continue
        seen.add(hsh)
        uniq_refs.append(r)
    n_dup = len(refs_gray) - len(uniq_refs)
    if n_dup > 0:
        warnings.append(
            f"{n_dup} pembanding identik diabaikan. Gunakan tanda tangan asli yang berbeda agar hasil lebih andal."
        )
    refs_gray = uniq_refs

    qry_is_copy = _gray_hash(qry_gray) in seen   # dihitung sebelum perturbasi

    # --- 1. Perturbasi (hanya untuk pengujian ketahanan) ---
    if perturbation and perturbation in gangguan.KONDISI:
        rng = np.random.default_rng(42)
        qry_gray_proc = gangguan.KONDISI[perturbation](qry_gray, rng)
    else:
        qry_gray_proc = qry_gray

    # --- 2. Preprocessing query + validasi hasil ---
    mode = preprocess_mode if preprocess_mode in preprocess.MODES else "binary"
    qry_arr, qry_steps = preprocess.preprocess_signature(qry_gray_proc, mode=mode, return_steps=True)
    if mode != "raw":
        qry_mask = qry_steps.get("mask")
        if qry_mask is None or not qry_mask.any():
            raise HTTPException(
                status_code=422,
                detail="Tanda tangan pada gambar yang diperiksa tidak terdeteksi setelah pengolahan. "
                       "Pastikan tinta kontras dengan kertas, lalu foto ulang.",
            )
    qry_quality = kualitas_foto.nilai_kualitas(qry_gray_proc, qry_steps.get("mask"))

    # --- 3. Embedding query ---
    qry_batch = np.expand_dims(qry_arr, axis=(0, -1)).astype(np.float32)
    qry_emb = EMBEDDING_MODEL(qry_batch, training=False).numpy()

    # --- 4. Embedding semua pembanding ---
    threshold = float(CONFIG.get("threshold", 0.4825))
    distances: List[float] = []
    ref_embs_list: List[np.ndarray] = []
    ref_steps_all: List[Dict[str, Any]] = []
    ref_quality_all: List[Dict[str, Any]] = []

    for idx, r_gray in enumerate(refs_gray):
        ref_arr_i, ref_steps_i = preprocess.preprocess_signature(r_gray, mode=mode, return_steps=True)
        if mode != "raw":
            r_mask = ref_steps_i.get("mask")
            if r_mask is None or not r_mask.any():
                raise HTTPException(
                    status_code=422,
                    detail=f"Tanda tangan pada gambar referensi ke-{idx+1} tidak terdeteksi setelah pengolahan. "
                           "Pastikan tinta kontras dengan kertas, lalu foto ulang.",
                )
        ref_batch_i = np.expand_dims(ref_arr_i, axis=(0, -1)).astype(np.float32)
        ref_emb_i = EMBEDDING_MODEL(ref_batch_i, training=False).numpy()
        distances.append(float(np.linalg.norm(ref_emb_i - qry_emb)))
        ref_embs_list.append(ref_emb_i[0])
        ref_steps_all.append(ref_steps_i)
        ref_quality_all.append(kualitas_foto.nilai_kualitas(r_gray, ref_steps_i.get("mask")))

    ref_embs = np.stack(ref_embs_list, axis=0)                  # (k, d)
    distance = float(np.mean(distances))                        # rata-rata jarak ke k pembanding
    is_genuine = bool(distance <= threshold)
    decision = "ASLI" if is_genuine else "PALSU"

    # Indeks kedekatan (bukan probabilitas): 50% tepat di batas keputusan
    sim_pct = round(max(0.0, min(100.0, (1.0 - (distance / (threshold * 2.0))) * 100.0)), 1)

    # Pembanding terdekat dipakai untuk visualisasi
    j_near = int(np.argmin(distances))

    # --- Konsistensi antar-pembanding ---
    ref_consistency = None
    if len(refs_gray) >= 2:
        pair_d = []
        for a in range(len(ref_embs)):
            for b in range(a + 1, len(ref_embs)):
                pair_d.append(float(np.linalg.norm(ref_embs[a] - ref_embs[b])))
        ref_pair_mean = float(np.mean(pair_d))
        ref_pair_max = float(np.max(pair_d))
        ref_inconsistent = bool(ref_pair_mean > threshold)
        ref_consistency = {
            "mean_pair_dist": round(ref_pair_mean, 4),
            "max_pair_dist": round(ref_pair_max, 4),
            "inconsistent": ref_inconsistent,
        }
        if ref_inconsistent:
            warnings.append(
                "Tanda tangan pembanding tidak konsisten satu sama lain (jarak antar-pembanding melewati batas). "
                "Pastikan semuanya milik orang yang sama dan berkualitas baik."
            )
            status_reasons.append("Pembanding tidak konsisten")

    # --- Deteksi kemungkinan salinan (tanda tangan nyata tidak pernah identik) ---
    copy_suspected = bool(qry_is_copy or min(distances) < COPY_DIST)
    if copy_suspected:
        warnings.append(
            "Gambar yang diperiksa identik/hampir identik dengan salah satu pembanding. Tanda tangan asli yang ditulis "
            "ulang tidak pernah sama persis. Ini bisa berupa salinan atau file yang sama."
        )
        status_reasons.append("Kemungkinan salinan dari pembanding")

    # --- 5. Ciri forensik klasik: dihitung untuk SEMUA pembanding ---
    forensic_report: List[Dict[str, Any]] = []
    forensic_summary = None
    fusion_info = None

    qry_potong = qry_steps.get("potong_biner", qry_steps.get("potong"))
    qry_feat = forensik.extract_features(qry_potong)
    ref_feats = []
    for st in ref_steps_all:
        f = forensik.extract_features(st.get("potong_biner", st.get("potong")))
        if f is not None:
            ref_feats.append(f)

    if qry_feat is not None and ref_feats:
        ref_feat_med = np.median(np.stack(ref_feats, axis=0), axis=0)
        forensic_report = forensik.explain(ref_feat_med, qry_feat, CONFIG["forensik_batas"])
        forensic_summary = {
            "mirip": sum(1 for x in forensic_report if x["tingkat"] == "mirip"),
            "agak_beda": sum(1 for x in forensic_report if x["tingkat"] == "agak beda"),
            "beda": sum(1 for x in forensic_report if x["tingkat"] == "beda"),
            "total": len(forensic_report),
            "n_pembanding": len(ref_feats),
        }

        # Fusi: selisih ciri dirata-ratakan di semua pembanding (konsisten dengan jarak rata-rata)
        diffs = np.mean([forensik.feature_diffs(f, qry_feat) for f in ref_feats], axis=0)
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
                "agrees_with_model": bool(fusion_decision == decision),
            }

    # --- 6. Uji Goyang (jarak per pembanding, margin bertanda sesuai keputusan) ---
    shake_info = None
    goyang_cfg = CONFIG.get("goyang", {})
    ragu_z = float(goyang_cfg.get("ragu_z", 1.74))
    ragu_margin = goyang_cfg.get("ragu_margin")
    if run_shake_test:
        n_shake = int(goyang_cfg.get("n", 6))
        variants = gangguan.shake_variants(qry_arr, n=n_shake, seed=42)
        emb_vars = EMBEDDING_MODEL(variants, training=False).numpy()                  # (n, d)
        # (n, k): jarak tiap varian ke tiap pembanding -> rata-rata per varian, sama seperti keputusan
        D = np.linalg.norm(emb_vars[:, None, :] - ref_embs[None, :, :], axis=2)
        per_var = D.mean(axis=1)
        mean_dist = float(np.mean(per_var))
        std_dist = float(np.std(per_var))

        # Margin bertanda: positif bila varian rata-rata berada di sisi yang SAMA dengan keputusan
        margin = (threshold - mean_dist) if is_genuine else (mean_dist - threshold)
        z_score = float(margin / (std_dist + 1e-6))
        z_score = max(-SHAKE_Z_CAP, min(SHAKE_Z_CAP, z_score))
        flips = int(np.sum((per_var <= threshold) != is_genuine))
        flip_rate = flips / float(len(per_var))
        is_confident = bool(z_score >= ragu_z)

        shake_info = {
            "z_score": round(z_score, 2),
            "ragu_z": round(ragu_z, 2),
            "ragu_margin": None if ragu_margin is None else round(float(ragu_margin), 4),
            "mean_dist": round(mean_dist, 4),
            "std_dist": round(std_dist, 4),
            "n_variants": int(len(per_var)),
            "flip_rate": round(flip_rate, 3),
            "is_confident": is_confident,
            "status": "Sangat Yakin / Stabil" if is_confident else "Ragu / Perbatasan",
        }
        if not is_confident:
            status_reasons.append("Uji Goyang: keputusan tidak stabil terhadap variasi kecil")
        if len(refs_gray) > 1:
            shake_info["catatan"] = "ragu_z dikalibrasi pada 1 pembanding; untuk k>1 gunakan sebagai indikasi."

    # --- Status tiga arah (sumber tunggal untuk UI) ---
    status = decision
    if status_reasons:
        status = "BELUM YAKIN"

    # --- Peringatan kualitas ---
    quality = {"qry": qry_quality, "refs": ref_quality_all}
    for w_ in qry_quality["peringatan"]:
        warnings.append(f"Gambar yang diperiksa: {w_}")
    for i, rq in enumerate(ref_quality_all):
        for w_ in rq["peringatan"]:
            warnings.append(f"Pembanding {i+1}: {w_}")

    # --- 7. Peta penjelasan (oklusi pada embedding) ---
    explain_map = ""
    try:
        heat = _occlusion_map(qry_arr, ref_embs, distance)
        if heat is not None:
            explain_map = _overlay_heatmap(qry_arr, heat)
    except Exception:
        logger.exception("[EXPLAIN] Gagal membuat peta penjelasan")

    # --- 8. Visualisasi ---
    def _vis(steps):
        return {
            "asli": img_to_base64_png(steps.get("asli")),
            "cahaya_rata": img_to_base64_png(steps.get("cahaya_rata")),
            "mask": img_to_base64_png(steps.get("mask")),
            "potong": img_to_base64_png(steps.get("potong")),
            "final": img_to_base64_png(steps.get("hasil")),
            "hasil": img_to_base64_png(steps.get("hasil")),
        }

    elapsed = time.perf_counter() - t_start
    _verify_times.append(elapsed)
    logger.info(
        f"[{tag}] Waktu respons: {elapsed:.3f}s | Pembanding: {len(refs_gray)} | "
        f"Keputusan: {decision} | Status: {status} | Jarak rata-rata: {distance:.4f}"
    )

    return {
        "decision": decision,
        "status": status,
        "status_reasons": status_reasons,
        "is_genuine": is_genuine,
        "distance": round(distance, 4),
        "distances_per_ref": [round(d, 4) for d in distances],
        "n_refs_used": len(refs_gray),
        "threshold": round(threshold, 4),
        "ragu_z": round(ragu_z, 4),
        "ragu_margin": None if ragu_margin is None else round(float(ragu_margin), 4),
        "similarity_pct": sim_pct,
        "fusion": fusion_info,
        "fusion_decision": fusion_info["decision"] if fusion_info else None,
        "shake_test": shake_info,
        "forensic_report": forensic_report,
        "forensic_summary": forensic_summary,
        "ref_consistency": ref_consistency,
        "explain_map": explain_map,
        "quality": quality,
        "warnings": warnings,
        "steps": {
            "ref": _vis(ref_steps_all[j_near]),
            "qry": _vis(qry_steps),
        },
    }


# ---------------------------------------------------------------------------
# Endpoint: POST /api/verify  (multipart/form-data MAUPUN application/json)
# ---------------------------------------------------------------------------

@app.post("/api/verify")
async def verify_signature(request: Request):
    t_start = time.perf_counter()

    if MOCK_MODE:
        return JSONResponse(
            content={"error": "Server berjalan dalam MOCK_MODE – model tidak tersedia"},
            status_code=503,
        )

    content_type = request.headers.get("content-type", "")
    ref_bytes_list: List[bytes] = []
    qry_bytes: Optional[bytes] = None
    preprocess_mode: str = "binary"
    perturbation: Optional[str] = None
    run_shake_test: bool = True

    if "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Format JSON tidak valid.")

        if not isinstance(body, dict):
            raise HTTPException(status_code=400, detail="Body request harus berupa objek JSON.")

        qry_raw = body.get("qry_image")
        if not qry_raw or not isinstance(qry_raw, str):
            raise HTTPException(status_code=400, detail="Gambar tanda tangan yang diperiksa harus disertakan.")

        try:
            clean_b64 = qry_raw.split(",", 1)[1] if "," in qry_raw else qry_raw
            qry_bytes = base64.b64decode(clean_b64)
        except Exception:
            raise HTTPException(status_code=400, detail="Format file tidak didukung. Harap unggah file gambar (JPG, PNG, WEBP).")

        refs_raw = body.get("ref_images")
        if refs_raw is None:
            single = body.get("ref_image")
            refs_raw = [single] if single else []

        if not isinstance(refs_raw, list):
            raise HTTPException(status_code=400, detail="ref_images harus berupa daftar gambar.")

        if len(refs_raw) < 1:
            raise HTTPException(status_code=400, detail="Minimal 1 gambar referensi diperlukan.")
        if len(refs_raw) > 5:
            raise HTTPException(status_code=400, detail="Maks. 5 tanda tangan pembanding. Harap hapus beberapa.")

        for i, r_item in enumerate(refs_raw):
            if not isinstance(r_item, str) or not r_item:
                raise HTTPException(status_code=400, detail=f"Gambar referensi ke-{i+1} kosong atau tidak valid.")
            try:
                r_clean = r_item.split(",", 1)[1] if "," in r_item else r_item
                ref_bytes_list.append(base64.b64decode(r_clean))
            except Exception:
                raise HTTPException(status_code=400, detail=f"Format file gambar referensi ke-{i+1} tidak didukung.")

        preprocess_mode = body.get("preprocess_mode", "binary")
        perturbation = body.get("perturbation")
        run_shake_test = bool(body.get("run_shake_test", True))

    elif "multipart/form-data" in content_type:
        form = await request.form()
        qry_file = form.get("qry_image")
        if not qry_file or not hasattr(qry_file, "read"):
            raise HTTPException(status_code=400, detail="Gambar tanda tangan yang diperiksa harus disertakan.")

        ct = getattr(qry_file, "content_type", "") or ""
        if ct and not ct.startswith("image/"):
            raise HTTPException(status_code=400, detail="Format file tidak didukung. Harap unggah file gambar (JPG, PNG, WEBP).")

        qry_bytes = await qry_file.read()

        ref_files = form.getlist("ref_images")
        if not ref_files:
            single = form.get("ref_image")
            if single and hasattr(single, "read"):
                ref_files = [single]

        if len(ref_files) < 1:
            raise HTTPException(status_code=400, detail="Minimal 1 gambar referensi diperlukan.")
        if len(ref_files) > 5:
            raise HTTPException(status_code=400, detail="Maks. 5 tanda tangan pembanding. Harap hapus beberapa.")

        for i, rf in enumerate(ref_files):
            r_ct = getattr(rf, "content_type", "") or ""
            if r_ct and not r_ct.startswith("image/"):
                raise HTTPException(status_code=400, detail=f"Gambar referensi ke-{i+1} bukan gambar. Format file tidak didukung.")
            ref_bytes_list.append(await rf.read())

        preprocess_mode = form.get("preprocess_mode", "binary")
        perturbation = form.get("perturbation")
        rst_val = form.get("run_shake_test", "true")
        run_shake_test = str(rst_val).lower() in ("true", "1", "yes")

    else:
        raise HTTPException(status_code=400, detail="Content-Type harus application/json atau multipart/form-data.")

    # Validasi ukuran file
    if len(qry_bytes) == 0:
        raise HTTPException(status_code=400, detail="File tampak kosong. Harap pilih file yang valid.")
    if len(qry_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Ukuran file terlalu besar (maks. 8 MB). Kompres gambar terlebih dahulu.")

    for i, rb in enumerate(ref_bytes_list):
        if len(rb) == 0:
            raise HTTPException(status_code=400, detail=f"File referensi ke-{i+1} tampak kosong. Harap pilih file yang valid.")
        if len(rb) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=400, detail=f"Ukuran file referensi ke-{i+1} terlalu besar (maks. 8 MB).")

    # Decode gambar & validasi awal
    try:
        qry_gray = file_to_gray(qry_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Format file tidak didukung. Harap unggah file gambar (JPG, PNG, WEBP).")
    _cek_tinta(qry_gray, "Gambar")

    decoded_refs_gray = []
    for i, rb in enumerate(ref_bytes_list):
        try:
            r_gray = file_to_gray(rb)
        except Exception:
            raise HTTPException(status_code=400, detail=f"Gambar referensi ke-{i+1} bukan gambar yang valid.")
        _cek_tinta(r_gray, f"Gambar referensi ke-{i+1}")
        decoded_refs_gray.append(r_gray)

    try:
        return _run_verification(
            qry_gray, decoded_refs_gray, preprocess_mode, perturbation, run_shake_test, t_start, tag="VERIFY"
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("[VERIFY] Kesalahan tak terduga")
        # Jangan bocorkan path server – gunakan pesan generik
        raise HTTPException(status_code=500, detail="Terjadi kesalahan saat memproses gambar. Periksa format dan kualitas gambar.")


# ---------------------------------------------------------------------------
# Endpoint warisan: POST /api/verify-json
# Dipertahankan agar kompatibel dengan klien lama; memakai inti verifikasi yang sama
# dengan /api/verify (tidak ada lagi logika ganda).
# ---------------------------------------------------------------------------

class VerifyRequest(BaseModel):
    ref_image: str
    qry_image: str
    preprocess_mode: str = "binary"
    perturbation: Optional[str] = None
    run_shake_test: bool = True


@app.post("/api/verify-json")
def verify_signature_json(req: VerifyRequest):
    t_start = time.perf_counter()

    if MOCK_MODE:
        return JSONResponse(
            content={"error": "Server berjalan dalam MOCK_MODE – model tidak tersedia"},
            status_code=503,
        )

    try:
        try:
            ref_gray = base64_to_gray(req.ref_image)
            qry_gray = base64_to_gray(req.qry_image)
        except Exception:
            raise HTTPException(status_code=400, detail="Format file tidak didukung. Harap unggah file gambar (JPG, PNG, WEBP).")
        _cek_tinta(qry_gray, "Gambar")
        _cek_tinta(ref_gray, "Gambar referensi")
        return _run_verification(
            qry_gray, [ref_gray], req.preprocess_mode, req.perturbation, req.run_shake_test, t_start, tag="VERIFY-JSON"
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("[VERIFY-JSON] Kesalahan tak terduga")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan saat memproses gambar. Periksa format dan kualitas gambar.")


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    logger.info("[INFO] Menjalankan server SignaCheck di http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
