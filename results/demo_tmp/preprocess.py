"""
preprocess.py - pengolahan citra tanda tangan.

File ini dipakai di DUA tempat supaya hasilnya selalu sama:
  1. notebook training (Google Colab)
  2. aplikasi demo (folder demo/)

Aturan keluaran: gambar ukuran (out_h, out_w), nilai 0..1,
  - latar belakang = 0 (hitam)
  - goresan tanda tangan = mendekati 1 (terang)
"""

import cv2
import numpy as np
from PIL import Image

IMG_H = 128
IMG_W = 256

# raw    : hanya grayscale + resize (cara awal, dipakai sebagai pembanding)
# gray   : koreksi cahaya + buang bintik + crop + resize, tinta tetap abu-abu
# binary : sama seperti gray, tetapi tinta dijadikan hitam-putih murni (Otsu)
MODES = ("raw", "gray", "binary")


def load_gray(source):
    """Baca gambar dari path / file-like object menjadi array uint8 2D (0=hitam, 255=putih)."""
    img = Image.open(source)
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
        latar = Image.new("RGBA", img.size, (255, 255, 255, 255))
        latar.alpha_composite(img)
        img = latar
    return np.array(img.convert("L"), dtype=np.uint8)


def _fit_to_canvas(img, out_h, out_w):
    """Perkecil/perbesar tanpa merusak rasio, lalu taruh di tengah kanvas hitam."""
    h, w = img.shape
    skala = min(out_h / h, out_w / w)
    new_w = max(1, int(round(w * skala)))
    new_h = max(1, int(round(h * skala)))
    kecil = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
    kanvas = np.zeros((out_h, out_w), dtype=np.uint8)
    y0 = (out_h - new_h) // 2
    x0 = (out_w - new_w) // 2
    kanvas[y0:y0 + new_h, x0:x0 + new_w] = kecil
    return kanvas


def _limit_size(gray, max_side=1600):
    """Foto kamera bisa sangat besar; kecilkan dulu supaya proses cepat."""
    h, w = gray.shape
    if max(h, w) <= max_side:
        return gray
    s = max_side / max(h, w)
    return cv2.resize(gray, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)


def _flatten_lighting(gray):
    """Ratakan cahaya (bayangan / kertas tidak rata) dengan membagi gambar dengan latarnya."""
    h, w = gray.shape
    f = max(1, max(h, w) // 400)          # hitung latar pada gambar kecil supaya cepat
    kecil = cv2.resize(gray, (max(1, w // f), max(1, h // f)), interpolation=cv2.INTER_AREA)
    sigma = max(kecil.shape) / 20.0
    latar = cv2.GaussianBlur(kecil, (0, 0), sigmaX=sigma)
    latar = cv2.resize(latar, (w, h), interpolation=cv2.INTER_LINEAR)
    latar = np.maximum(latar, 1)
    return cv2.divide(gray, latar, scale=255)


def _remove_specks(mask, min_area=10):
    """Buang bintik kecil (debu hasil scan). Versi cepat tanpa perulangan per bintik."""
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    simpan = stats[:, cv2.CC_STAT_AREA] >= min_area
    simpan[0] = False                      # label 0 = latar
    return (simpan[labels].astype(np.uint8)) * 255


def _core(gray):
    """Langkah bersama untuk mode gray dan binary: ratakan cahaya, pisahkan tinta (Otsu), buang bintik."""
    gray = _limit_size(np.asarray(gray, dtype=np.uint8))
    rata = _flatten_lighting(gray)
    halus = cv2.GaussianBlur(rata, (3, 3), 0)
    _, mask = cv2.threshold(halus, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    mask = _remove_specks(mask)
    return rata, mask


def _crop(tinta, mask):
    ys, xs = np.where(mask > 0)
    h, w = tinta.shape
    margin = max(2, int(0.03 * max(h, w)))
    y1, y2 = max(0, ys.min() - margin), min(h, ys.max() + margin + 1)
    x1, x2 = max(0, xs.min() - margin), min(w, xs.max() + margin + 1)
    return tinta[y1:y2, x1:x2]


def _raw(gray, out_h, out_w):
    terbalik = 255 - np.asarray(gray, dtype=np.uint8)
    hasil = cv2.resize(terbalik, (out_w, out_h), interpolation=cv2.INTER_AREA)
    return hasil.astype(np.float32) / 255.0


def preprocess_signature(gray, mode="binary", out_h=IMG_H, out_w=IMG_W, return_steps=False):
    """
    gray : array uint8 2D (0=hitam ... 255=putih)
    return: array float32 (out_h, out_w) 0..1  (atau (hasil, dict langkah) bila return_steps=True)
    """
    if mode not in MODES:
        raise ValueError(f"mode harus salah satu dari {MODES}")

    gray = np.asarray(gray, dtype=np.uint8)
    steps = {"asli": gray}

    if mode == "raw":
        hasil = _raw(gray, out_h, out_w)
        steps["hasil"] = hasil
        return (hasil, steps) if return_steps else hasil

    rata, mask = _core(gray)
    steps["cahaya_rata"] = rata
    steps["mask"] = mask

    if not mask.any():
        hasil = np.zeros((out_h, out_w), dtype=np.float32)
        steps["hasil"] = hasil
        return (hasil, steps) if return_steps else hasil

    tinta = mask if mode == "binary" else np.where(mask > 0, 255 - rata, 0).astype(np.uint8)
    potong = _crop(tinta, mask)
    steps["potong"] = potong
    if mode == "gray":                      # untuk ciri forensik selalu sediakan potongan hitam-putih
        steps["potong_biner"] = _crop(mask, mask)
    hasil = _fit_to_canvas(potong, out_h, out_w).astype(np.float32) / 255.0
    steps["hasil"] = hasil
    return (hasil, steps) if return_steps else hasil


def preprocess_all(gray, modes=MODES, out_h=IMG_H, out_w=IMG_W):
    """
    Olah satu gambar untuk beberapa mode sekaligus (lebih cepat dari memanggil satu-satu).
    return: (dict mode -> array float32, potongan_biner uint8 atau None)
    potongan_biner dipakai untuk menghitung ciri forensik.
    """
    gray = np.asarray(gray, dtype=np.uint8)
    hasil, potong_biner = {}, None
    if "raw" in modes:
        hasil["raw"] = _raw(gray, out_h, out_w)
    perlu_inti = any(m in modes for m in ("gray", "binary"))
    if perlu_inti:
        rata, mask = _core(gray)
        if not mask.any():
            for m in ("gray", "binary"):
                if m in modes:
                    hasil[m] = np.zeros((out_h, out_w), dtype=np.float32)
        else:
            potong_biner = _crop(mask, mask)
            if "binary" in modes:
                hasil["binary"] = _fit_to_canvas(potong_biner, out_h, out_w).astype(np.float32) / 255.0
            if "gray" in modes:
                tinta = np.where(mask > 0, 255 - rata, 0).astype(np.uint8)
                hasil["gray"] = _fit_to_canvas(_crop(tinta, mask), out_h, out_w).astype(np.float32) / 255.0
    return hasil, potong_biner
