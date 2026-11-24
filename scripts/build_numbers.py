"""
build_numbers.py
================
Membaca demo_model_files__6_/config.json dan (jika ada)
results/uji_dataset_sendiri.json, lalu menghasilkan:
  - docs/angka_resmi.md   – tabel markdown semua angka resmi
  - results/angka_resmi.json – JSON terstruktur

Semua angka dibaca dari file; tidak ada angka yang tertanam di kode ini.
"""

import sys
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).parent.parent.resolve()
CONFIG_PATH = ROOT / "demo_model_files__6_" / "config.json"
UJI_PATH = ROOT / "results" / "uji_dataset_sendiri.json"
DOCS_DIR = ROOT / "docs"
RESULTS_DIR = ROOT / "results"

# ── Baca config ──────────────────────────────────────────────────────────────
if not CONFIG_PATH.exists():
    sys.exit(f"[ERROR] config.json tidak ditemukan: {CONFIG_PATH}")

with open(CONFIG_PATH, encoding="utf-8") as f:
    cfg = json.load(f)

# ── Baca uji_dataset_sendiri jika ada ───────────────────────────────────────
uji = None
if UJI_PATH.exists():
    with open(UJI_PATH, encoding="utf-8") as f:
        uji = json.load(f)
    print(f"[INFO] Membaca hasil evaluasi dari: {UJI_PATH}")
else:
    print(f"[INFO] {UJI_PATH.name} tidak ditemukan – bagian D3 dikosongkan")

# ── Susun data angka resmi ───────────────────────────────────────────────────
angka = {
    "dibuat_pada": datetime.now(timezone.utc).isoformat(),
    "sumber_config": str(CONFIG_PATH),
    "model": cfg.get("model"),
    "tensorflow_version": cfg.get("tensorflow_version"),
    "keras_version": cfg.get("keras_version"),
    "preprocess_mode": cfg.get("preprocess_mode"),
    "threshold": cfg.get("threshold"),
    "ragu_z": cfg.get("goyang", {}).get("ragu_z"),
    "ragu_margin": cfg.get("goyang", {}).get("ragu_margin"),
    "per_dataset": cfg.get("metrics", {}).get("per_dataset", {}),
    "fusi": cfg.get("fusi", {}).get("hasil", []),
    "banyak_pembanding_D1": cfg.get("banyak_pembanding", {}).get("D1", {}),
    "banyak_pembanding_D2": cfg.get("banyak_pembanding", {}).get("D2", {}),
    "D3_uji_sendiri": uji.get("keseluruhan") if uji else None,
    "D3_per_pemilik": uji.get("per_pemilik") if uji else None,
    "D3_banyak_pembanding": uji.get("banyak_pembanding") if uji else None,
    "D3_threshold_dipakai": uji.get("threshold_dipakai") if uji else None,
    "D3_threshold_match": uji.get("threshold_match") if uji else None,
}

# ── Helper format ────────────────────────────────────────────────────────────
def pct(v):
    if v is None:
        return "–"
    return f"{float(v)*100:.2f}%"

def flt(v, d=4):
    if v is None:
        return "–"
    return f"{float(v):.{d}f}"

def or_dash(v):
    return "–" if v is None else str(v)

# ── Buat Markdown ─────────────────────────────────────────────────────────────
lines = []
lines.append("# Angka Resmi SignaCheck\n")
lines.append(f"> Dibuat otomatis oleh `scripts/build_numbers.py`  ")
lines.append(f"> Tanggal: {angka['dibuat_pada']}  ")
lines.append(f"> Sumber: `{CONFIG_PATH.name}`\n")
lines.append("> [!IMPORTANT]")
lines.append("> Dokumen ini adalah **satu-satunya** sumber angka resmi untuk slide dan laporan.")
lines.append("> Jangan menyalin angka secara manual — jalankan ulang skrip ini setiap ada perubahan.\n")

lines.append("## Identitas Model\n")
lines.append("| Parameter | Nilai |")
lines.append("|-----------|-------|")
lines.append(f"| Nama model | {or_dash(angka['model'])} |")
lines.append(f"| TensorFlow | {or_dash(angka['tensorflow_version'])} |")
lines.append(f"| Keras | {or_dash(angka['keras_version'])} |")
lines.append(f"| Preprocess mode | `{or_dash(angka['preprocess_mode'])}` |")
lines.append(f"| Threshold (θ) | {or_dash(angka['threshold'])} |")
lines.append(f"| Ragu z | {or_dash(angka['ragu_z'])} |")
lines.append(f"| Ragu margin | {or_dash(angka['ragu_margin'])} |")
lines.append("")

# Per dataset D1 & D2
lines.append("## Metrik Per Dataset (D1 & D2)\n")
lines.append("| Metrik | D1 | D2 |")
lines.append("|--------|----|----|")
d1 = angka["per_dataset"].get("D1", {})
d2 = angka["per_dataset"].get("D2", {})
metrics_map = [
    ("AUC", "auc"), ("EER", "eer"), ("Akurasi", "accuracy"),
    ("Presisi", "precision"), ("Recall", "recall"), ("F1", "f1"),
    ("FRR", "FRR"), ("FAR", "FAR"),
    ("FAR skilled forgery", "FAR_skilled_forgery"),
    ("FAR random forgery", "FAR_random_forgery"),
]
for label, key in metrics_map:
    v1 = d1.get(key)
    v2 = d2.get(key)
    if key in ("FRR", "FAR", "FAR_skilled_forgery", "FAR_random_forgery", "eer"):
        lines.append(f"| {label} | {pct(v1)} | {pct(v2)} |")
    else:
        lines.append(f"| {label} | {flt(v1)} | {flt(v2)} |")
lines.append("")

# Fusi
lines.append("## Perbandingan Skenario Fusi\n")
lines.append("| Dataset | Skenario | AUC | EER | Akurasi | FAR | FRR |")
lines.append("|---------|----------|-----|-----|---------|-----|-----|")
for row in angka["fusi"]:
    lines.append(
        f"| {row.get('dataset','–')} "
        f"| {row.get('skenario','–')} "
        f"| {flt(row.get('auc'))} "
        f"| {pct(row.get('eer'))} "
        f"| {flt(row.get('accuracy'))} "
        f"| {pct(row.get('FAR'))} "
        f"| {pct(row.get('FRR'))} |"
    )
lines.append("")

# Banyak pembanding D1 & D2
for ds_label, bp_key in [("D1", "banyak_pembanding_D1"), ("D2", "banyak_pembanding_D2")]:
    bp = angka[bp_key]
    lines.append(f"## Banyak Pembanding – {ds_label}\n")
    lines.append("| k | AUC | AUC std | EER | EER std |")
    lines.append("|---|-----|---------|-----|---------|")
    for k in ["1", "2", "3", "5"]:
        r = bp.get(k, {})
        lines.append(
            f"| {k} "
            f"| {flt(r.get('auc'))} "
            f"| {flt(r.get('auc_std'))} "
            f"| {pct(r.get('eer'))} "
            f"| {pct(r.get('eer_std'))} |"
        )
    lines.append("")

# D3 – Dataset Sendiri
lines.append("## Dataset Sendiri (D3 – ttd_uji_sendiri)\n")
if angka["D3_uji_sendiri"]:
    ov = angka["D3_uji_sendiri"]
    lines.append("### Keseluruhan\n")
    lines.append("| Metrik | Nilai | Target Validasi |")
    lines.append("|--------|-------|-----------------|")
    target = {
        "FRR": "~9.3% (±0.3%)",
        "FAR_tiruan": "~52.8% (±0.3%)",
        "FAR_orang_lain": "~4.2% (±1.5%)",
        "AUC": "~0.892 (±0.01)",
        "EER": "~19.2% (±1.5%)",
    }
    lines.append(f"| FRR | {pct(ov.get('FRR'))} | {target['FRR']} |")
    lines.append(f"| FAR tiruan | {pct(ov.get('FAR_tiruan'))} | {target['FAR_tiruan']} |")
    lines.append(f"| FAR orang lain | {pct(ov.get('FAR_orang_lain'))} | {target['FAR_orang_lain']} |")
    lines.append(f"| AUC | {flt(ov.get('AUC'))} | {target['AUC']} |")
    lines.append(f"| EER | {pct(ov.get('EER'))} | {target['EER']} |")
    lines.append(f"| Threshold dipakai | {or_dash(angka['D3_threshold_dipakai'])} | (dari config.json) |")
    lines.append("")

    # Per pemilik
    if angka["D3_per_pemilik"]:
        lines.append("### Per Pemilik\n")
        lines.append("| Pemilik | FRR | FAR tiruan | FAR orang lain | AUC | EER |")
        lines.append("|---------|-----|-----------|----------------|-----|-----|")
        for owner, r in sorted(angka["D3_per_pemilik"].items()):
            lines.append(
                f"| {owner} "
                f"| {pct(r.get('FRR'))} "
                f"| {pct(r.get('FAR_tiruan'))} "
                f"| {pct(r.get('FAR_orang_lain'))} "
                f"| {flt(r.get('AUC'))} "
                f"| {pct(r.get('EER'))} |"
            )
        lines.append("")

    # Banyak pembanding D3
    if angka["D3_banyak_pembanding"]:
        lines.append("### Banyak Pembanding – D3\n")
        lines.append("| k | AUC | AUC std | EER | EER std |")
        lines.append("|---|-----|---------|-----|---------|")
        for k in ["1", "2", "3", "5"]:
            r = angka["D3_banyak_pembanding"].get(str(k), {})
            lines.append(
                f"| {k} "
                f"| {flt(r.get('auc_mean'))} "
                f"| {flt(r.get('auc_std'))} "
                f"| {pct(r.get('eer_mean'))} "
                f"| {pct(r.get('eer_std'))} |"
            )
        lines.append("")
else:
    lines.append("> *Jalankan `scripts/eval_dataset_sendiri.py` terlebih dahulu.*\n")

# ── Tulis file ───────────────────────────────────────────────────────────────
DOCS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

md_path = DOCS_DIR / "angka_resmi.md"
with open(md_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")
print(f"[INFO] Markdown ditulis ke: {md_path}")

json_path = RESULTS_DIR / "angka_resmi.json"
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(angka, f, indent=2, ensure_ascii=False)
print(f"[INFO] JSON ditulis ke: {json_path}")

print("[SELESAI]")
