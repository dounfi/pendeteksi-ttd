"""
kualitas_foto.py - penilaian kualitas foto/scan tanda tangan ("Adaptive Kamera", sisi server).

Modul ini TIDAK mengubah gambar dan TIDAK memengaruhi preprocessing yang dipakai model
(supaya angka evaluasi/threshold di config.json tetap berlaku). Ia hanya mengukur kondisi
gambar lalu memberi peringatan agar pengguna bisa memotret ulang.

Ambang di bawah adalah heuristik praktis (belum dikalibrasi terhadap dataset), karena itu
semuanya hanya bersifat peringatan, bukan penolakan.
"""

import cv2
import numpy as np

# Ambang heuristik (peringatan saja)
BLUR_VAR_MIN = 15.0        # varians Laplacian pada gambar dinormalisasi 800 px
BRIGHT_MIN = 90.0          # rata-rata abu-abu terlalu gelap
BRIGHT_MAX = 252.0         # hampir putih seluruhnya (tinta mungkin hilang/overexposed)
CONTRAST_MIN = 18.0        # simpangan baku abu-abu terlalu rendah
INK_FRAC_MIN = 0.002       # terlalu sedikit tinta
INK_FRAC_MAX = 0.30        # terlalu banyak "tinta": biasanya bayangan / tepi kertas / latar
UNEVEN_MAX = 0.08          # sebaran cahaya latar (std/mean). Terukur: scan bersih p95=0.000 (maks 0.153),
                           # bayangan buatan min 0.104 / median 0.187 pada 120 gambar uji.


def _cahaya_tak_rata(gray):
    """Sebaran kecerahan LATAR (tinta dibuang lewat dilasi) / rata-ratanya. Tinggi = bayangan atau cahaya miring."""
    h, w = gray.shape
    s = 160.0 / float(max(h, w))
    k = cv2.resize(gray, (max(8, int(w * s)), max(8, int(h * s))), interpolation=cv2.INTER_AREA)
    bg = cv2.dilate(k, np.ones((9, 9), np.uint8))
    bg = cv2.GaussianBlur(bg, (0, 0), 6).astype(np.float32)
    return float(bg.std() / max(float(bg.mean()), 1.0))


def _normalisasi(gray, sisi=800):
    h, w = gray.shape
    s = sisi / float(max(h, w))
    if s >= 1.0:
        return gray
    return cv2.resize(gray, (max(1, int(w * s)), max(1, int(h * s))), interpolation=cv2.INTER_AREA)


def _tepi_menyentuh(mask):
    """True bila ada komponen tinta besar yang menempel ke tepi gambar (tepi kertas, meja, jari)."""
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    h, w = mask.shape
    luas_total = float(h * w)
    for i in range(1, n):
        x, y, bw, bh, area = stats[i]
        menempel = x <= 1 or y <= 1 or x + bw >= w - 1 or y + bh >= h - 1
        if menempel and area > 0.05 * luas_total:
            return True
    return False


def nilai_kualitas(gray, mask=None):
    """
    gray : uint8 2D (0=hitam, 255=putih), gambar mentah setelah dikonversi abu-abu.
    mask : (opsional) mask tinta uint8 0/255 dari preprocess.preprocess_signature(...)["mask"].
    return: dict {metrik..., "peringatan": [str, ...]}
    """
    g = _normalisasi(np.asarray(gray, dtype=np.uint8))
    blur_var = float(cv2.Laplacian(g, cv2.CV_64F).var())
    kecerahan = float(g.mean())
    kontras = float(g.std())

    peringatan = []
    ink_frac = None
    tepi = False

    if mask is not None and mask.size:
        ink_frac = float((mask > 0).mean())
        if ink_frac < INK_FRAC_MIN:
            peringatan.append("Tinta sangat sedikit. Pastikan tanda tangan cukup besar dan jelas di dalam bingkai.")
        elif ink_frac > INK_FRAC_MAX:
            peringatan.append(
                "Area 'tinta' terdeteksi terlalu luas. Kemungkinan bayangan, tepi kertas, atau latar ikut terbaca. "
                "Foto ulang pada permukaan polos dengan cahaya merata."
            )
        m = cv2.resize(mask, (g.shape[1], g.shape[0]), interpolation=cv2.INTER_NEAREST)
        tepi = _tepi_menyentuh(m)
        if tepi:
            peringatan.append("Ada objek gelap yang menempel ke tepi gambar (tepi kertas, meja, atau jari). Potong atau foto ulang.")
        # Catatan: kemiringan kertas sengaja TIDAK diperiksa. Orientasi sebaran tinta mengikuti goresan
        # diagonal tanda tangan itu sendiri, bukan kertas. Diuji pada 120 scan bersih, peringatan semacam itu
        # menyala pada mayoritas gambar (positif palsu).

    tak_rata = _cahaya_tak_rata(g)
    if tak_rata > UNEVEN_MAX:
        peringatan.append(
            "Pencahayaan tidak merata (ada bayangan atau sisi lebih gelap). Pengolahan citra mengompensasi sebagian, "
            "tetapi hasil lebih andal bila cahaya merata dari atas."
        )

    if blur_var < BLUR_VAR_MIN:
        peringatan.append("Gambar tampak buram atau kurang fokus. Dekatkan kamera lalu tunggu fokus sebelum memotret.")
    if kecerahan < BRIGHT_MIN:
        peringatan.append("Gambar terlalu gelap. Tambahkan cahaya.")
    elif kecerahan > BRIGHT_MAX:
        peringatan.append("Gambar terlalu terang (overexposed), goresan tipis bisa hilang. Kurangi cahaya langsung.")
    if kontras < CONTRAST_MIN:
        peringatan.append("Kontras antara tinta dan kertas rendah.")

    return {
        "blur_var": round(blur_var, 2),
        "kecerahan": round(kecerahan, 1),
        "kontras": round(kontras, 1),
        "cahaya_tak_rata": round(tak_rata, 3),
        "ink_frac": None if ink_frac is None else round(ink_frac, 4),
        "tepi_menempel": bool(tepi),
        "peringatan": peringatan,
    }
