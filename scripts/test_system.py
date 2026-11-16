import sys
import os
import base64
import json
import time
from pathlib import Path
import numpy as np
import requests
from PIL import Image
import io

BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLES_DIR = BASE_DIR / "ttd_uji_sendiri"
API_URL = "http://127.0.0.1:8000"

def img_to_b64(path):
    with open(path, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

def make_blank_img():
    # Gambar putih polos 128x256 tanpa tinta
    img = Image.new("L", (256, 128), color=255)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

def run_tests():
    results = {}
    
    # TC13: GET /api/health
    r13 = requests.get(f"{API_URL}/api/health")
    data13 = r13.json()
    results["TC13"] = {
        "status_code": r13.status_code,
        "actual": f"Status: {data13.get('status')}, Hash: {data13.get('model_hash')[:10]}..., Threshold: {data13.get('threshold')}",
        "pass": r13.status_code == 200 and data13.get("status") == "ok"
    }

    # TC14: GET /api/model-info
    r14 = requests.get(f"{API_URL}/api/model-info")
    data14 = r14.json()
    has_keys = all(k in data14 for k in ["nama_model", "preprocess_mode", "threshold", "metrics", "model_hash"])
    results["TC14"] = {
        "status_code": r14.status_code,
        "actual": f"Status: {r14.status_code}, Model: {data14.get('nama_model')}, D1 AUC: {data14.get('metrics', {}).get('per_dataset', {}).get('D1', {}).get('auc')}",
        "pass": r14.status_code == 200 and has_keys
    }

    # TC15: Konsistensi threshold
    with open(BASE_DIR / "demo_model_files__6_" / "config.json", encoding="utf-8") as f:
        cfg = json.load(f)
    match_thr = abs(data14.get("threshold") - cfg.get("threshold")) < 1e-9
    results["TC15"] = {
        "status_code": 200,
        "actual": f"API threshold ({data14.get('threshold')}) == config threshold ({cfg.get('threshold')}) -> {match_thr}",
        "pass": match_thr
    }

    # Samples setup
    p_orig1 = SAMPLES_DIR / "original_1_01.jpg"
    p_orig2 = SAMPLES_DIR / "original_1_02.jpg"
    p_orig3 = SAMPLES_DIR / "original_1_03.jpg"
    p_orig4 = SAMPLES_DIR / "original_1_04.jpg"
    p_orig5 = SAMPLES_DIR / "original_1_05.jpg"
    p_orig6 = SAMPLES_DIR / "original_1_06.jpg"
    p_diff = SAMPLES_DIR / "original_2_01.jpg"
    p_forg = SAMPLES_DIR / "forgeries_1_01.jpg"

    b64_1 = img_to_b64(p_orig1)
    b64_2 = img_to_b64(p_orig2)
    b64_3 = img_to_b64(p_orig3)
    b64_4 = img_to_b64(p_orig4)
    b64_5 = img_to_b64(p_orig5)
    b64_6 = img_to_b64(p_orig6)
    b64_diff = img_to_b64(p_diff)
    b64_forg = img_to_b64(p_forg)
    blank_b64 = make_blank_img()

    # TC01: 1 pembanding valid
    t0 = time.perf_counter()
    r01 = requests.post(f"{API_URL}/api/verify", json={"ref_image": b64_1, "qry_image": b64_2})
    elapsed01 = time.perf_counter() - t0
    d01 = r01.json() if r01.status_code == 200 else {}
    results["TC01"] = {
        "status_code": r01.status_code,
        "actual": f"Status 200, Decision: {d01.get('decision')}, Distance: {d01.get('distance')}, Time: {elapsed01:.2f}s",
        "pass": r01.status_code == 200 and d01.get("decision") in ["ASLI", "PALSU"]
    }

    # TC02: 5 pembanding valid
    r02 = requests.post(f"{API_URL}/api/verify", json={"ref_images": [b64_1, b64_2, b64_3, b64_4, b64_5], "qry_image": b64_6})
    d02 = r02.json() if r02.status_code == 200 else {}
    results["TC02"] = {
        "status_code": r02.status_code,
        "actual": f"Status 200, Decision: {d02.get('decision')}, Distance: {d02.get('distance')}, Refs: {len(d02.get('distances_per_ref', []))}",
        "pass": r02.status_code == 200 and len(d02.get("distances_per_ref", [])) == 5
    }

    # TC03: 6 pembanding -> 400
    r03 = requests.post(f"{API_URL}/api/verify", json={"ref_images": [b64_1, b64_2, b64_3, b64_4, b64_5, b64_6], "qry_image": b64_1})
    results["TC03"] = {
        "status_code": r03.status_code,
        "actual": f"Status {r03.status_code}, Detail: {r03.json().get('detail')}",
        "pass": r03.status_code == 400
    }

    # TC04: Bukan gambar (file .txt)
    r04 = requests.post(f"{API_URL}/api/verify", json={"ref_image": "bukan_gambar_ini_cuma_teks", "qry_image": b64_1})
    results["TC04"] = {
        "status_code": r04.status_code,
        "actual": f"Status {r04.status_code}, Detail: {r04.json().get('detail')}",
        "pass": r04.status_code == 400
    }

    # TC05: File kosong
    r05 = requests.post(f"{API_URL}/api/verify", json={"ref_image": "", "qry_image": b64_1})
    results["TC05"] = {
        "status_code": r05.status_code,
        "actual": f"Status {r05.status_code}, Detail: {r05.json().get('detail')}",
        "pass": r05.status_code == 400
    }

    # TC06: File > 8 MB
    huge_bytes = b"0" * (9 * 1024 * 1024)
    huge_b64 = "data:image/jpeg;base64," + base64.b64encode(huge_bytes).decode("utf-8")
    r06 = requests.post(f"{API_URL}/api/verify", json={"ref_image": huge_b64, "qry_image": b64_1})
    results["TC06"] = {
        "status_code": r06.status_code,
        "actual": f"Status {r06.status_code}, Detail: {r06.json().get('detail')}",
        "pass": r06.status_code == 400
    }

    # TC07: Gambar tanpa tinta (blank white image)
    r07 = requests.post(f"{API_URL}/api/verify", json={"ref_image": blank_b64, "qry_image": b64_1})
    results["TC07"] = {
        "status_code": r07.status_code,
        "actual": f"Status {r07.status_code}, Detail: {r07.json().get('detail')}",
        "pass": r07.status_code == 400
    }

    # TC08: Tanpa gambar yang diperiksa
    r08 = requests.post(f"{API_URL}/api/verify", json={"ref_image": b64_1})
    results["TC08"] = {
        "status_code": r08.status_code,
        "actual": f"Status {r08.status_code}, Detail: {r08.json().get('detail')}",
        "pass": r08.status_code == 400
    }

    # TC09: Pasangan asli sama (harapan ASLI atau BELUM YAKIN)
    r09 = requests.post(f"{API_URL}/api/verify", json={"ref_image": b64_1, "qry_image": b64_2})
    d09 = r09.json()
    results["TC09"] = {
        "status_code": r09.status_code,
        "actual": f"Decision: {d09.get('decision')}, Distance: {d09.get('distance')}",
        "pass": r09.status_code == 200 and d09.get("decision") in ["ASLI", "BELUM YAKIN"]
    }

    # TC10: Orang berbeda (harapan PALSU)
    r10 = requests.post(f"{API_URL}/api/verify", json={"ref_image": b64_1, "qry_image": b64_diff})
    d10 = r10.json()
    results["TC10"] = {
        "status_code": r10.status_code,
        "actual": f"Decision: {d10.get('decision')}, Distance: {d10.get('distance')}",
        "pass": r10.status_code == 200 and d10.get("decision") == "PALSU"
    }

    # TC11: Tiruan vs Asli (catat apa adanya)
    r11 = requests.post(f"{API_URL}/api/verify", json={"ref_image": b64_1, "qry_image": b64_forg})
    d11 = r11.json()
    results["TC11"] = {
        "status_code": r11.status_code,
        "actual": f"Decision: {d11.get('decision')}, Distance: {d11.get('distance')}, Threshold: {d11.get('threshold')}",
        "pass": r11.status_code == 200
    }

    # TC12: Foto HP berbayangan (perturbasi bayangan)
    r12 = requests.post(f"{API_URL}/api/verify", json={"ref_image": b64_1, "qry_image": b64_2, "perturbation": "bayangan"})
    d12 = r12.json()
    results["TC12"] = {
        "status_code": r12.status_code,
        "actual": f"Decision: {d12.get('decision')}, Distance: {d12.get('distance')}",
        "pass": r12.status_code == 200
    }

    # TC18: Tombol contoh siap pakai via /api/sample-image/{filename}
    r18_1 = requests.get(f"{API_URL}/api/sample-image/original_1_01.jpg")
    r18_2 = requests.get(f"{API_URL}/api/sample-image/forgeries_2_01.jpg")
    r18_3 = requests.get(f"{API_URL}/api/sample-image/forgeries_3_01.jpg")
    results["TC18"] = {
        "status_code": 200,
        "actual": f"Sample 1: {r18_1.status_code}, Sample 2: {r18_2.status_code}, Sample 3: {r18_3.status_code}",
        "pass": all(s.status_code == 200 for s in [r18_1, r18_2, r18_3])
    }

    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    run_tests()

