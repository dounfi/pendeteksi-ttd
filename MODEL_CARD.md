# MODEL_CARD.md — SignaCheck Embedding Model

## Identitas Model

| Atribut | Nilai |
|---------|-------|
| Nama model | SignaCheck Siamese CNN Embedding |
| Versi | gabungan D1+D2 (model final, versi 6) |
| Folder | `demo_model_files__6_` |
| File bobot | `embedding_model.keras` |
| SHA256 | `48B77FEFF782E83EDBF161EF52E6106F0573471E828CFC41BEA573AEAA3CCD01` |
| Framework | Keras **3.13.2** / TensorFlow **2.20.0** |
| Arsitektur | Siamese CNN (embedding distance) |

---

## Mode Pengolahan Citra

| Parameter | Nilai |
|-----------|-------|
| `preprocess_mode` | `binary` |
| Ukuran input | 128 × 256 piksel (grayscale) |
| Threshold keputusan | `0.4824983775615692` |
| `ragu_z` (batas keyakinan) | `1.7437371015548706` |

**Alasan pemilihan mode `binary`:**
Mode `raw` sedikit lebih baik di data scan bersih (EER val D1 ≈ 0.078 vs binary ≈ 0.130), tetapi jatuh ke hampir level tebakan pada foto berbayangan/redup. Karena sistem ditargetkan untuk foto HP yang kondisinya bervariasi, mode `binary` dipilih karena lebih robust terhadap variasi pencahayaan.

---

## Data Pelatihan

### Dataset D1 — CEDAR
| Atribut | Nilai |
|---------|-------|
| Nama | CEDAR (D1) |
| Jumlah penulis | 55 orang |
| Total gambar | 2.640 |
| Jenis forgery | Skilled forgery (tiruan terlatih) |
| Pembagian | Writer-independent 70 : 15 : 15 (train : val : test) |

### Dataset D2 — Toloka
| Atribut | Nilai |
|---------|-------|
| Nama | Toloka (D2) |
| Jumlah penulis | 120 orang |
| Total gambar | 2.640 |
| Jenis forgery | Random forgery (tiruan acak) — **tidak ada skilled forgery** |
| Pembagian | Writer-independent 70 : 15 : 15 (train : val : test) |

---

## Metrik Evaluasi (dari `config.json`)

> Semua angka berikut berasal dari `demo_model_files__6_/config.json`, bagian `metrics.per_dataset`.

### Dataset D1 (CEDAR)

| Metrik | Nilai |
|--------|-------|
| AUC | 0.9368 |
| EER | 0.1506 |
| Accuracy | 0.8472 |
| Precision | 0.8134 |
| Recall | 0.9011 |
| F1 | 0.8550 |
| FAR (keseluruhan) | 0.0989 |
| FRR | 0.2067 |
| FAR (skilled forgery) | 0.1800 |
| FAR (random forgery) | 0.0178 |

### Dataset D2 (Toloka)

| Metrik | Nilai |
|--------|-------|
| AUC | 0.8993 |
| EER | 0.1864 |
| Accuracy | 0.8147 |
| Precision | 0.8154 |
| Recall | 0.8136 |
| F1 | 0.8145 |
| FAR (keseluruhan) | 0.1864 |
| FRR | 0.1842 |
| FAR (skilled forgery) | N/A (tidak ada skilled forgery di D2) |
| FAR (random forgery) | 0.1864 |

### Perbandingan Skenario Fusi (dari `config.json fusi.hasil`)

| Dataset | Skenario | AUC | EER | Accuracy | FAR | FRR |
|---------|----------|-----|-----|----------|-----|-----|
| D1 | Model saja | 0.9368 | 0.1506 | 0.8472 | 0.0989 | 0.2067 |
| D1 | Ciri klasik saja | 0.8688 | 0.2044 | 0.7944 | 0.3600 | 0.0511 |
| D1 | Fusi (model + ciri) | 0.9401 | 0.1472 | 0.8583 | 0.1122 | 0.1711 |
| D2 | Model saja | 0.8993 | 0.1864 | 0.8147 | 0.1864 | 0.1842 |
| D2 | Ciri klasik saja | 0.7945 | 0.2823 | 0.7023 | 0.1064 | 0.4890 |
| D2 | Fusi (model + ciri) | 0.8958 | 0.1886 | 0.8191 | 0.1513 | 0.2105 |

> Sistem aktif menggunakan **model saja** (bukan fusi) sebagai keputusan utama. Fusi tersedia sebagai informasi tambahan di respons API.

---

## Efek Jumlah Pembanding (dari `config.json banyak_pembanding`)

| Jumlah Pembanding | D1 AUC | D1 EER | D2 AUC | D2 EER |
|-------------------|--------|--------|--------|--------|
| 1 | 0.9381 | 0.1468 | 0.8991 | 0.1864 |
| 2 | 0.9490 | 0.1336 | 0.9220 | 0.1619 |
| 3 | 0.9499 | 0.1354 | 0.9261 | 0.1645 |
| 5 | 0.9552 | 0.1226 | 0.9417 | 0.1263 |

> Lebih banyak pembanding meningkatkan akurasi. Sistem menerima 1–5 pembanding.

---

## Keterbatasan

1. **Dataset D2 (Toloka) tidak memiliki skilled forgery**: Toloka hanya mengandung random forgery (tiruan acak tanpa latihan). FAR model terhadap peniru terlatih pada D2 tidak diketahui.

2. **Dataset uji sendiri sangat kecil**: Hanya 3 pemilik, 20 asli + 20 tiruan per pemilik (total 120 gambar). Generalisasi ke populasi yang lebih luas tidak dapat dijamin dari data ini saja.

3. **FAR tiruan terlatih tinggi pada dataset sendiri**: FAR terhadap tiruan yang dikumpulkan secara mandiri sekitar **52%** — artinya lebih dari separuh tiruan tidak terdeteksi. Dataset ini bukan benchmark yang representatif.

4. **Bukan bukti hukum**: Sistem ini adalah prototipe riset. Hasilnya tidak dapat digunakan sebagai bukti di persidangan atau proses hukum apa pun.

5. **Performa menurun pada foto berbayangan/redup**: Mode `binary` membantu, tetapi gambar berkualitas sangat rendah (pencahayaan ekstrem, blur berat) tetap dapat menurunkan akurasi secara signifikan.

6. **Tidak diuji lintas populasi**: Model dilatih pada populasi penanda tangan tertentu (Amerika Utara/CEDAR, platform Toloka). Generalisasi ke gaya tanda tangan dari budaya lain belum dievaluasi.

---

## Penggunaan yang Direkomendasikan

- ✅ Demo interaktif dan eksplorasi teknis
- ✅ Penelitian dan tugas akhir
- ✅ Prototyping sistem verifikasi
- ❌ Penegakan hukum atau forensik digital resmi
- ❌ Sistem produksi yang melayani pengguna nyata tanpa audit
- ❌ Pengambilan keputusan hukum

---

*Dibuat dari `demo_model_files__6_/config.json` — SignaCheck v2.0*
