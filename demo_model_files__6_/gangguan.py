"""
gangguan.py - gangguan buatan pada gambar tanda tangan.

Dua kegunaan:
  1. Meniru kondisi foto dari HP (bayangan, buram, miring, redup, noise, kompresi JPEG)
     untuk menguji ketahanan model.
  2. "Uji goyang": membuat beberapa versi sedikit bergeser/berputar dari satu gambar
     untuk mengukur seberapa stabil keputusan model.
"""

import cv2
import numpy as np


def bayangan(gray, rng):
    h, w = gray.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    sudut = rng.uniform(0, 2 * np.pi)
    proj = (xx / w - 0.5) * np.cos(sudut) + (yy / h - 0.5) * np.sin(sudut)
    sig = 1.0 / (1.0 + np.exp(-proj * rng.uniform(4, 9)))
    kuat = rng.uniform(0.35, 0.6)
    faktor = 1.0 - kuat * sig
    return np.clip(gray.astype(np.float32) * faktor, 0, 255).astype(np.uint8)


def buram(gray, rng):
    sigma = rng.uniform(1.0, 2.2) * max(gray.shape) / 300.0
    return cv2.GaussianBlur(gray, (0, 0), sigmaX=max(sigma, 0.8))


def miring(gray, rng):
    h, w = gray.shape
    sudut = rng.uniform(4, 9) * rng.choice([-1, 1])
    M = cv2.getRotationMatrix2D((w / 2, h / 2), sudut, 1.0)
    return cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_LINEAR, borderValue=255)


def redup(gray, rng):
    alpha = rng.uniform(0.45, 0.65)     # kontras turun
    beta = rng.uniform(0, 25)
    return np.clip(gray.astype(np.float32) * alpha + beta, 0, 255).astype(np.uint8)


def derau(gray, rng):
    n = rng.normal(0, rng.uniform(10, 20), gray.shape)
    return np.clip(gray.astype(np.float32) + n, 0, 255).astype(np.uint8)


def kompresi(gray, rng):
    ok, buf = cv2.imencode(".jpg", gray, [cv2.IMWRITE_JPEG_QUALITY, int(rng.integers(15, 35))])
    return cv2.imdecode(buf, cv2.IMREAD_GRAYSCALE)


def foto_hp(gray, rng):
    """Gabungan: agak miring + bayangan + sedikit buram + noise + kompresi (mirip foto kertas dari HP)."""
    g = miring(gray, rng)
    g = bayangan(g, rng)
    g = cv2.GaussianBlur(g, (0, 0), sigmaX=max(0.8, 0.7 * max(g.shape) / 300.0))
    g = derau(g, rng)
    return kompresi(g, rng)


KONDISI = {
    "bayangan": bayangan,
    "buram": buram,
    "miring": miring,
    "redup": redup,
    "noise": derau,
    "foto_hp": foto_hp,
}


def shake_variants(arr, n=10, seed=0, max_shift=0.04, max_rot=3.0, max_scale=0.05):
    """
    arr: array float32 (H, W) hasil pengolahan citra (0..1, latar 0).
    return: array (n, H, W, 1). Setiap versi digeser, diputar, dan diperbesar/diperkecil sedikit.
    """
    rng = np.random.default_rng(seed)
    h, w = arr.shape
    out = np.empty((n, h, w, 1), dtype=np.float32)
    for i in range(n):
        sudut = rng.uniform(-max_rot, max_rot)
        skala = 1.0 + rng.uniform(-max_scale, max_scale)
        M = cv2.getRotationMatrix2D((w / 2, h / 2), sudut, skala)
        M[0, 2] += rng.uniform(-max_shift, max_shift) * w
        M[1, 2] += rng.uniform(-max_shift, max_shift) * h
        out[i, :, :, 0] = cv2.warpAffine(arr, M, (w, h), flags=cv2.INTER_LINEAR, borderValue=0)
    return out
