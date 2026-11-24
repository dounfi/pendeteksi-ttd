"""
eval_dataset_sendiri.py
=======================
Evaluasi model SignaCheck pada dataset ttd_uji_sendiri (120 JPG).

Jalankan dari folder root proyek:
    python scripts/eval_dataset_sendiri.py

Output:
    results/uji_dataset_sendiri.json
    results/uji_dataset_sendiri.csv
"""

import sys
import os
import json
import csv
import itertools
import hashlib
from pathlib import Path
from collections import defaultdict

import numpy as np

# ── Lokasi ──────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent.resolve()
MODEL_DIR = ROOT / "demo_model_files__6_"
DATASET_DIR = ROOT / "ttd_uji_sendiri"
RESULTS_DIR = ROOT / "results"
CONFIG_PATH = MODEL_DIR / "config.json"
MODEL_PATH = MODEL_DIR / "embedding_model.keras"

# ── 1. Tambah MODEL_DIR ke sys.path ─────────────────────────────────────────
sys.path.insert(0, str(MODEL_DIR))

# ── 2. Import preprocess & forensik ─────────────────────────────────────────
from preprocess import load_gray, preprocess_signature  # noqa: E402

# forensik mungkin tidak dipakai langsung, tapi diimpor sesuai spesifikasi
try:
    import forensik  # noqa: F401
    print("[INFO] forensik.py berhasil diimpor")
except ImportError as e:
    print(f"[WARN] forensik.py tidak dapat diimpor: {e}")

# ── 3. Baca config ───────────────────────────────────────────────────────────
with open(CONFIG_PATH, encoding="utf-8") as f:
    CONFIG = json.load(f)

THRESHOLD = CONFIG["threshold"]
PREPROCESS_MODE = CONFIG.get("preprocess_mode", "binary")
print(f"[INFO] threshold dari config.json : {THRESHOLD}")
print(f"[INFO] preprocess_mode            : {PREPROCESS_MODE}")

EXPECTED_THRESHOLD = 0.4824983775615692
if abs(THRESHOLD - EXPECTED_THRESHOLD) > 1e-10:
    print(
        f"[WARN] threshold di config.json ({THRESHOLD}) berbeda dari yang tercantum "
        f"di spesifikasi ({EXPECTED_THRESHOLD}). Menggunakan nilai dari config.json."
    )

# ── 4. Load model ────────────────────────────────────────────────────────────
import tensorflow as tf  # noqa: E402

print(f"[INFO] Memuat model dari: {MODEL_PATH}")
embedding_model = tf.keras.models.load_model(str(MODEL_PATH))
print("[INFO] Model berhasil dimuat")

# ── 5. Kumpulkan file & hitung embedding ─────────────────────────────────────
print("[INFO] Memproses gambar dan menghitung embedding...")

originals = defaultdict(list)   # {pemilik: [(path, emb), ...]}
forgeries = defaultdict(list)   # {pemilik: [(path, emb), ...]}

jpg_files = sorted(DATASET_DIR.glob("*.jpg"))
print(f"[INFO] Jumlah file JPG ditemukan: {len(jpg_files)}")

for jpg in jpg_files:
    name = jpg.stem  # e.g. "original_1_01" or "forgeries_1_01"
    parts = name.split("_")
    if len(parts) < 3:
        print(f"[WARN] Nama file tidak dikenali: {jpg.name}")
        continue

    kind = parts[0]       # "original" atau "forgeries"
    owner = parts[1]      # "1", "2", "3"

    gray = load_gray(str(jpg))
    img = preprocess_signature(gray, mode=PREPROCESS_MODE)
    # Model input: (1, H, W, 1)
    img_input = img[np.newaxis, :, :, np.newaxis].astype(np.float32)
    emb = embedding_model.predict(img_input, verbose=0)[0]

    if kind == "original":
        originals[owner].append((jpg.name, emb))
    elif kind == "forgeries":
        forgeries[owner].append((jpg.name, emb))
    else:
        print(f"[WARN] Jenis tidak dikenali: {kind} (file: {jpg.name})")

owners = sorted(originals.keys())
print(f"[INFO] Pemilik ditemukan: {owners}")
for o in owners:
    print(f"  pemilik {o}: {len(originals[o])} asli, {len(forgeries[o])} tiruan")


# ── 6. Hitung jarak L2 ──────────────────────────────────────────────────────
def l2_distance(a, b):
    return float(np.linalg.norm(a - b))


# ── 7. Buat pasangan & hitung metrik per pemilik ────────────────────────────
def compute_eer(labels, distances):
    """
    labels   : 1 = pasangan berbeda (impostor/forgery), 0 = pasangan sama (genuine)
    distances: jarak L2; jarak tinggi = lebih mungkin forgery (label 1)
    EER dihitung di titik FAR (fpr) == FRR (fnr = 1 - tpr).
    """
    from sklearn.metrics import roc_curve
    fpr, tpr, _ = roc_curve(labels, distances, pos_label=1)
    fnr = 1 - tpr
    idx = np.argmin(np.abs(fpr - fnr))
    return float((fpr[idx] + fnr[idx]) / 2)


def compute_auc(labels, distances):
    """
    labels   : 1 = forgery/impostor, 0 = genuine
    distances: skor ke arah positif (jarak besar = forgery)
    """
    from sklearn.metrics import roc_auc_score
    return float(roc_auc_score(labels, distances))


rng_global = np.random.default_rng(42)

all_pairs = []          # (label, distance)
per_owner_results = {}

for owner in owners:
    orig_list = originals[owner]   # list of (name, emb)
    forg_list = forgeries[owner]   # list of (name, emb)
    other_owners = [o for o in owners if o != owner]

    pairs_owner = []

    # ── A. Asli-vs-Asli per pemilik (C(n,2), label=0) ───────────────────────
    genuine_pairs = []
    for (na, ea), (nb, eb) in itertools.combinations(orig_list, 2):
        d = l2_distance(ea, eb)
        genuine_pairs.append(d)
        pairs_owner.append((0, d))

    # ── B. Asli-vs-Tiruan per pemilik (n×n, label=1) ────────────────────────
    forgery_pairs = []
    for (na, ea) in orig_list:
        for (nf, ef) in forg_list:
            d = l2_distance(ea, ef)
            forgery_pairs.append(d)
            pairs_owner.append((1, d))

    # ── C. Asli-vs-Asli orang lain (sampel 400, seed=42, label=1) ───────────
    impostor_pairs = []
    other_embs = []
    for other_o in other_owners:
        other_embs.extend([emb for (_, emb) in originals[other_o]])

    rng_owner = np.random.default_rng(42)
    n_sample = 400
    # Semua kombinasi (orig dari owner ini) × (orig dari orang lain)
    all_cross = []
    for (na, ea) in orig_list:
        for other_o in other_owners:
            for (nb, eb) in originals[other_o]:
                all_cross.append((ea, eb))

    if len(all_cross) >= n_sample:
        chosen_idx = rng_owner.choice(len(all_cross), size=n_sample, replace=False)
        chosen = [all_cross[i] for i in chosen_idx]
    else:
        chosen = all_cross

    for ea, eb in chosen:
        d = l2_distance(ea, eb)
        impostor_pairs.append(d)
        pairs_owner.append((1, d))

    # ── Metrik per pemilik ───────────────────────────────────────────────────
    frr_owner = sum(1 for d in genuine_pairs if d >= THRESHOLD) / max(len(genuine_pairs), 1)
    far_tiruan_owner = sum(1 for d in forgery_pairs if d < THRESHOLD) / max(len(forgery_pairs), 1)
    far_orang_lain_owner = sum(1 for d in impostor_pairs if d < THRESHOLD) / max(len(impostor_pairs), 1)

    labels_owner = [p[0] for p in pairs_owner]
    dists_owner = [p[1] for p in pairs_owner]

    try:
        auc_owner = compute_auc(labels_owner, dists_owner)
        eer_owner = compute_eer(labels_owner, dists_owner)
    except Exception as e:
        print(f"[WARN] AUC/EER gagal untuk pemilik {owner}: {e}")
        auc_owner = None
        eer_owner = None

    per_owner_results[owner] = {
        "n_genuine_pairs": len(genuine_pairs),
        "n_forgery_pairs": len(forgery_pairs),
        "n_impostor_pairs": len(impostor_pairs),
        "FRR": round(frr_owner, 6),
        "FAR_tiruan": round(far_tiruan_owner, 6),
        "FAR_orang_lain": round(far_orang_lain_owner, 6),
        "AUC": round(auc_owner, 6) if auc_owner is not None else None,
        "EER": round(eer_owner, 6) if eer_owner is not None else None,
        "genuine_dist_mean": round(float(np.mean(genuine_pairs)), 6),
        "genuine_dist_std": round(float(np.std(genuine_pairs)), 6),
        "forgery_dist_mean": round(float(np.mean(forgery_pairs)), 6),
        "forgery_dist_std": round(float(np.std(forgery_pairs)), 6),
    }

    all_pairs.extend(pairs_owner)

# ── 8. Metrik keseluruhan ────────────────────────────────────────────────────
# Kumpulkan ulang per tipe untuk FRR/FAR global
all_genuine = []
all_forgery = []
all_impostor = []

for owner in owners:
    orig_list = originals[owner]
    forg_list = forgeries[owner]
    other_owners = [o for o in owners if o != owner]

    for (na, ea), (nb, eb) in itertools.combinations(orig_list, 2):
        all_genuine.append(l2_distance(ea, eb))

    for (na, ea) in orig_list:
        for (nf, ef) in forg_list:
            all_forgery.append(l2_distance(ea, ef))

    # Impostor (sama dengan yang dipakai per owner, seed=42)
    rng_owner2 = np.random.default_rng(42)
    all_cross = []
    for (na, ea) in orig_list:
        for other_o in other_owners:
            for (nb, eb) in originals[other_o]:
                all_cross.append((ea, eb))
    if len(all_cross) >= 400:
        chosen_idx = rng_owner2.choice(len(all_cross), size=400, replace=False)
        chosen = [all_cross[i] for i in chosen_idx]
    else:
        chosen = all_cross
    for ea, eb in chosen:
        all_impostor.append(l2_distance(ea, eb))

FRR = sum(1 for d in all_genuine if d >= THRESHOLD) / max(len(all_genuine), 1)
FAR_tiruan = sum(1 for d in all_forgery if d < THRESHOLD) / max(len(all_forgery), 1)
FAR_orang_lain = sum(1 for d in all_impostor if d < THRESHOLD) / max(len(all_impostor), 1)

# AUC & EER dari semua pasangan
all_labels = [p[0] for p in all_pairs]
all_dists = [p[1] for p in all_pairs]
try:
    AUC = compute_auc(all_labels, all_dists)
    EER = compute_eer(all_labels, all_dists)
except Exception as e:
    print(f"[ERROR] AUC/EER global gagal: {e}")
    AUC = None
    EER = None

print("\n" + "=" * 60)
print("HASIL EVALUASI – KESELURUHAN")
print("=" * 60)
print(f"  threshold        : {THRESHOLD}")
print(f"  jumlah pasangan genuine   : {len(all_genuine)}")
print(f"  jumlah pasangan forgery   : {len(all_forgery)}")
print(f"  jumlah pasangan impostor  : {len(all_impostor)}")
print(f"  FRR              : {FRR:.4%}")
print(f"  FAR_tiruan       : {FAR_tiruan:.4%}")
print(f"  FAR_orang_lain   : {FAR_orang_lain:.4%}")
print(f"  AUC              : {AUC:.4f}" if AUC is not None else "  AUC              : ERROR")
print(f"  EER              : {EER:.4%}" if EER is not None else "  EER              : ERROR")
print()

print("HASIL PER PEMILIK")
print("-" * 60)
for owner in owners:
    r = per_owner_results[owner]
    print(f"  Pemilik {owner}:")
    print(f"    FRR            : {r['FRR']:.4%}")
    print(f"    FAR_tiruan     : {r['FAR_tiruan']:.4%}")
    print(f"    FAR_orang_lain : {r['FAR_orang_lain']:.4%}")
    print(f"    AUC            : {r['AUC']}")
    print(f"    EER            : {r['EER']}")
print()

# ── 9. Tabel banyak pembanding ──────────────────────────────────────────────
print("TABEL BANYAK PEMBANDING (k=1,2,3,5; 30 percobaan, seed=42+i)")
print("-" * 60)

K_VALUES = [1, 2, 3, 5]
N_TRIALS = 30

# Untuk setiap pemilik: pisahkan orig_list
# Skenario: pilih k sampel acak dari orig sebagai pembanding, sisanya sebagai query
# Hitung rata-rata jarak dari k pembanding ke query sebagai skor

k_results = {}

for k in K_VALUES:
    trial_aucs = []
    trial_eers = []

    for trial in range(N_TRIALS):
        rng_trial = np.random.default_rng(42 + trial)
        trial_pairs = []

        for owner in owners:
            orig_list = originals[owner]
            forg_list = forgeries[owner]
            other_owners = [o for o in owners if o != owner]

            orig_embs = [emb for (_, emb) in orig_list]
            n_orig = len(orig_embs)

            if n_orig <= k:
                continue

            # Pilih k pembanding acak
            ref_idx = rng_trial.choice(n_orig, size=k, replace=False)
            ref_embs = [orig_embs[i] for i in ref_idx]
            query_orig_idx = [i for i in range(n_orig) if i not in ref_idx]

            # Query genuine: sisa original
            for qi in query_orig_idx:
                q_emb = orig_embs[qi]
                score = float(np.mean([l2_distance(q_emb, r) for r in ref_embs]))
                trial_pairs.append((0, score))

            # Query forgery
            for (_, f_emb) in forg_list:
                score = float(np.mean([l2_distance(f_emb, r) for r in ref_embs]))
                trial_pairs.append((1, score))

            # Query impostor (original dari orang lain — semua)
            for other_o in other_owners:
                for (_, o_emb) in originals[other_o]:
                    score = float(np.mean([l2_distance(o_emb, r) for r in ref_embs]))
                    trial_pairs.append((1, score))

        if not trial_pairs:
            continue

        t_labels = [p[0] for p in trial_pairs]
        t_scores = [p[1] for p in trial_pairs]

        try:
            trial_aucs.append(compute_auc(t_labels, t_scores))
            trial_eers.append(compute_eer(t_labels, t_scores))
        except Exception as e:
            print(f"[WARN] k={k} trial={trial}: {e}")

    k_results[k] = {
        "auc_mean": round(float(np.mean(trial_aucs)), 6) if trial_aucs else None,
        "auc_std": round(float(np.std(trial_aucs)), 6) if trial_aucs else None,
        "eer_mean": round(float(np.mean(trial_eers)), 6) if trial_eers else None,
        "eer_std": round(float(np.std(trial_eers)), 6) if trial_eers else None,
        "n_trials": len(trial_aucs),
    }
    print(f"  k={k:2d}: AUC={k_results[k]['auc_mean']:.4f}±{k_results[k]['auc_std']:.4f}  "
          f"EER={k_results[k]['eer_mean']:.4%}±{k_results[k]['eer_std']:.4%}")

# ── 10. Simpan hasil ─────────────────────────────────────────────────────────
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

output = {
    "threshold_dipakai": THRESHOLD,
    "threshold_dari": str(CONFIG_PATH),
    "threshold_spesifikasi": EXPECTED_THRESHOLD,
    "threshold_match": abs(THRESHOLD - EXPECTED_THRESHOLD) < 1e-10,
    "preprocess_mode": PREPROCESS_MODE,
    "n_pemilik": len(owners),
    "n_gambar_total": len(jpg_files),
    "keseluruhan": {
        "n_genuine_pairs": len(all_genuine),
        "n_forgery_pairs": len(all_forgery),
        "n_impostor_pairs": len(all_impostor),
        "FRR": round(FRR, 6),
        "FAR_tiruan": round(FAR_tiruan, 6),
        "FAR_orang_lain": round(FAR_orang_lain, 6),
        "AUC": round(AUC, 6) if AUC is not None else None,
        "EER": round(EER, 6) if EER is not None else None,
    },
    "per_pemilik": per_owner_results,
    "banyak_pembanding": {str(k): v for k, v in k_results.items()},
    "catatan_protokol": (
        "PERHATIAN: 'keseluruhan' dan 'banyak_pembanding' memakai protokol BERBEDA, jadi angkanya tidak boleh "
        "dibandingkan langsung (mis. EER k=1 vs EER keseluruhan). 'keseluruhan': pasangan asli-asli C(n,2), "
        "asli-tiruan n x n, dan asli-orang-lain disampel maks. 400 per pemilik. 'banyak_pembanding': k pembanding "
        "acak per percobaan; query = sisa asli (label 0), semua tiruan dan SEMUA asli milik orang lain (label 1), "
        "dirata-ratakan pada 30 percobaan. Untuk menilai efek k, bandingkan k=1 dengan k>1 DALAM tabel "
        "banyak_pembanding yang sama."
    ),
    "catatan_target_validasi": (
        "Nilai pada 'target_validasi' diambil dari hasil evaluasi sebelumnya (bukan kebenaran dasar eksternal). "
        "Gunakan hanya sebagai uji regresi reproduksibilitas, bukan bukti bahwa model benar."
    ),
    "target_validasi": {
        "FRR": "~9.3% (±0.3%)",
        "FAR_tiruan": "~52.8% (±0.3%)",
        "FAR_orang_lain": "~4.2% (±1.5%)",
        "AUC": "~0.892 (±0.01)",
        "EER": "~19.2% (±1.5%)",
    },
}

json_path = RESULTS_DIR / "uji_dataset_sendiri.json"
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)
print(f"\n[INFO] Hasil disimpan ke: {json_path}")

# CSV
csv_path = RESULTS_DIR / "uji_dataset_sendiri.csv"
with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["scope", "pemilik", "metrik", "nilai"])
    # keseluruhan
    for metrik, nilai in output["keseluruhan"].items():
        writer.writerow(["keseluruhan", "semua", metrik, nilai])
    # per pemilik
    for owner, r in per_owner_results.items():
        for metrik, nilai in r.items():
            writer.writerow(["per_pemilik", owner, metrik, nilai])
    # banyak pembanding
    for k, r in k_results.items():
        for metrik, nilai in r.items():
            writer.writerow(["banyak_pembanding", f"k={k}", metrik, nilai])
print(f"[INFO] CSV disimpan ke: {csv_path}")

print("\n[SELESAI]")
