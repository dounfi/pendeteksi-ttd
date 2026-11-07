"""
forensik.py - ciri tanda tangan yang dihitung dengan pengolahan citra klasik (tanpa deep learning).

Ciri ini dipakai untuk dua hal:
  1. Laporan forensik mini: menjelaskan KENAPA dua tanda tangan dianggap mirip / beda.
  2. Digabung dengan jarak dari model Siamese (fusi), lalu diuji apakah error turun.
"""

import cv2
import numpy as np

try:
    from skimage.morphology import skeletonize as _skeletonize
except Exception:  # noqa: BLE001
    _skeletonize = None

NAMA_CIRI = [
    "rasio_lebar_tinggi",
    "kepadatan_tinta",
    "kemiringan",
    "ketebalan_goresan",
    "jumlah_bagian",
    "panjang_goresan",
    "posisi_x",
    "posisi_y",
]

LABEL_CIRI = {
    "rasio_lebar_tinggi": "Bentuk (lebar dibanding tinggi)",
    "kepadatan_tinta": "Kepadatan tinta",
    "kemiringan": "Kemiringan umum",
    "ketebalan_goresan": "Ketebalan goresan",
    "jumlah_bagian": "Jumlah bagian terpisah (angkat pena)",
    "panjang_goresan": "Panjang total goresan",
    "posisi_x": "Letak pusat tinta (kiri-kanan)",
    "posisi_y": "Letak pusat tinta (atas-bawah)",
}

# ciri yang dibandingkan dengan rasio (log) vs selisih biasa
_LOG = {"rasio_lebar_tinggi", "kepadatan_tinta", "ketebalan_goresan", "jumlah_bagian", "panjang_goresan"}


def extract_features(potong):
    """potong: array uint8 hasil crop mask tinta (0/255). return: vektor float32 panjang 8, atau None."""
    if potong is None or potong.size == 0 or not potong.any():
        return None
    h0, w0 = potong.shape
    s = 96.0 / h0
    m = cv2.resize(potong, (max(8, int(round(w0 * s))), 96), interpolation=cv2.INTER_AREA) > 64
    ys, xs = np.nonzero(m)
    if len(ys) < 5:
        return None
    luas = float(m.sum())
    rasio = w0 / h0
    kepadatan = luas / m.size

    mu20, mu02 = float(np.var(xs)), float(np.var(ys))
    mu11 = float(np.mean((xs - xs.mean()) * (ys - ys.mean())))
    miring = float(np.degrees(0.5 * np.arctan2(2 * mu11, mu20 - mu02 + 1e-9)))

    if _skeletonize is not None:
        rangka = _skeletonize(m)
        panjang = float(rangka.sum())
    else:
        panjang = luas / 3.0
    tebal = luas / max(panjang, 1.0)
    n_bagian = float(cv2.connectedComponents(m.astype(np.uint8), connectivity=8)[0] - 1)
    panjang_norm = panjang / float(np.hypot(*m.shape))
    cx, cy = float(xs.mean() / m.shape[1]), float(ys.mean() / m.shape[0])
    return np.array([rasio, kepadatan, miring, tebal, n_bagian, panjang_norm, cx, cy], dtype=np.float32)


def feature_diffs(v1, v2):
    """Selisih per ciri antara dua tanda tangan (selalu >= 0). Dipakai untuk fusi dan untuk laporan."""
    out = np.zeros(len(NAMA_CIRI), dtype=np.float32)
    for i, nama in enumerate(NAMA_CIRI):
        a, b = float(v1[i]), float(v2[i])
        if nama in _LOG:
            out[i] = abs(np.log((a + 1e-3) / (b + 1e-3)))
        elif nama == "kemiringan":
            d = abs(a - b)
            out[i] = min(d, 180.0 - d)
        else:
            out[i] = abs(a - b)
    return out


def _fmt(nama, v):
    if nama == "kemiringan":
        return f"{v:.0f} derajat"
    if nama == "jumlah_bagian":
        return f"{v:.0f} bagian"
    if nama in ("posisi_x", "posisi_y"):
        return f"{v * 100:.0f}%"
    if nama == "kepadatan_tinta":
        return f"{v * 100:.1f}%"
    return f"{v:.2f}"


def explain(v_ref, v_qry, batas):
    """
    Laporan forensik mini.
    batas: dict nama_ciri -> [p75, p95] dari selisih pada pasangan tanda tangan ASLI (dihitung di notebook).
    return: list dict {ciri, label, pembanding, diperiksa, tingkat, kalimat}
    """
    d = feature_diffs(v_ref, v_qry)
    hasil = []
    for i, nama in enumerate(NAMA_CIRI):
        p75, p95 = batas[nama]
        if d[i] <= p75:
            tingkat = "mirip"
        elif d[i] <= p95:
            tingkat = "agak beda"
        else:
            tingkat = "beda"
        a, b = _fmt(nama, v_ref[i]), _fmt(nama, v_qry[i])
        hasil.append({
            "ciri": nama,
            "label": LABEL_CIRI[nama],
            "pembanding": a,
            "diperiksa": b,
            "tingkat": tingkat,
            "kalimat": f"{LABEL_CIRI[nama]}: pembanding {a}, diperiksa {b} ({tingkat}).",
            "selisih": float(d[i]),
        })
    return hasil
