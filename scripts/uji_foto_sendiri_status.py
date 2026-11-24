"""
uji_foto_sendiri_status.py - mengukur status akhir (ASLI / BELUM YAKIN / PALSU) pada foto milik sendiri
(ttd_uji_sendiri) lewat backend yang SEDANG BERJALAN. Ini cara menghasilkan tabel "foto sendiri lewat backend nyata"
di README.md untuk config yang sedang aktif.

Per pemilik: pembanding = K tanda tangan asli pertama; query = 8 asli berikutnya + 15 tiruan pertama.
Total: 24 asli dan 45 tiruan (3 pemilik).

Langkah:
  1. Pilih config:   ganti_target_far.bat 0.08
  2. Jalankan backend (jalankan_semua.bat, atau:  python backend_api.py)
  3. python scripts/uji_foto_sendiri_status.py            (K = 1, 3, 5)
     python scripts/uji_foto_sendiri_status.py --k 1 2 3 --port 8000 --out hasil.csv
Butuh paket: requests, pandas.
"""
import argparse
import base64
import collections
import os
import sys

import pandas as pd
import requests

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "ttd_uji_sendiri")


def b64(nama):
    with open(os.path.join(DATA, nama), "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--k", type=int, nargs="+", default=[1, 3, 5], help="jumlah pembanding yang diuji")
    ap.add_argument("--port", type=int, default=int(os.environ.get("SIGNACHECK_PORT", "8000")))
    ap.add_argument("--out", default=None, help="simpan rincian per gambar ke CSV (opsional)")
    a = ap.parse_args()
    api = f"http://127.0.0.1:{a.port}/api"

    try:
        info = requests.get(f"{api}/model-info", timeout=10).json()
    except requests.RequestException:
        sys.exit(f"Backend tidak menjawab di port {a.port}. Jalankan jalankan_semua.bat dulu.")
    print(f"Backend: model={info.get('model_key')} | batas (1 pembanding)={info.get('threshold'):.4f}")

    meta = pd.read_csv(os.path.join(DATA, "metadata.csv"))
    rows = []
    for k in a.k:
        hasil = collections.defaultdict(collections.Counter)
        for pemilik in sorted(meta.pemilik.unique()):
            asli = meta[(meta.pemilik == pemilik) & (meta.label == "asli")].file.tolist()
            tiruan = meta[(meta.pemilik == pemilik) & (meta.label == "tiruan")].file.tolist()[:15]
            refs, q_asli = asli[:k], asli[k:k + 8]
            for tipe, daftar in (("asli", q_asli), ("tiruan", tiruan)):
                for f in daftar:
                    r = requests.post(f"{api}/verify", json={"ref_images": [b64(x) for x in refs], "qry_image": b64(f)}, timeout=120).json()
                    hasil[tipe][r["status"]] += 1
                    rows.append((k, pemilik, tipe, f, r["status"], r["distance"], "; ".join(r.get("status_reasons", []))))
        print(f"\nK = {k} pembanding")
        for tipe in ("tiruan", "asli"):
            c = hasil[tipe]
            print(f"  {tipe:7s} (n={sum(c.values()):2d}): ASLI {c['ASLI']:2d} | BELUM YAKIN {c['BELUM YAKIN']:2d} | PALSU {c['PALSU']:2d}")
    if a.out:
        pd.DataFrame(rows, columns=["k", "pemilik", "tipe", "file", "status", "jarak", "alasan"]).to_csv(a.out, index=False)
        print("\nRincian disimpan ke", a.out)


if __name__ == "__main__":
    main()
