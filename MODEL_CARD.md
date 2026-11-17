# MODEL_CARD.md — SignaCheck Embedding Model v2 (model aktif)

> Kartu ini menggambarkan **model v2**. Kartu model lama (versi 6) dipertahankan di bagian *Lampiran* paling bawah.
> Rincian lengkap dan cara reproduksi: `docs/model_v2.md` dan `README.md` (bagian 4).

## Identitas Model

| Atribut | Nilai |
|---------|-------|
| Nama model | SignaCheck Siamese CNN Embedding v2 (ensemble) |
| Folder | `demo_model_files_v2` |
| File bobot | `embedding_model.keras` |
| SHA256 | `48D9C3A7F52BB7379A37C997BD11F5D656312DC0FF46A8F38006C3FE673E7BD0` |
| Framework (pembuatan) | Keras **3.13.2** / TensorFlow **2.20.0** |
| Framework (diuji juga) | Keras 3.15.1 / TensorFlow 2.22 rc, Python 3.14 (jarak dan status identik) |
| Arsitektur | Gabungan dua Siamese CNN embedding (model lama + hasil fine-tuning). Keluaran **128 angka**, panjang vektor 1; jarak gabungan = akar rata-rata kuadrat jarak kedua model |
| Input | 128 x 256 x 1 (grayscale, mode `binary`) |
| Skor | Jarak **terdekat** ke salah satu pembanding (1-5 pembanding) |
| Keputusan | jarak terdekat <= batas -> ASLI menurut model; status akhir memerlukan kesepakatan Uji Goyang dan ciri forensik |

## Titik Operasi (target_far)

Model sama untuk semua titik; yang berbeda adalah batas keputusan dan ambang pemeriksaan (dipilih di data **validasi**; tiruan mahir lolos <= target di tiap dataset).
Config: `config_target_far_<target>.json`; aktif saat ini 0.08 (`config.json`). Cara berpindah: `ganti_target_far.bat <target>`.

| Jumlah pembanding | 0.20 | 0.10 | **0.08 (aktif)** | 0.05 |
|---|---|---|---|---|
| 1 | 0.4302 | 0.3570 | **0.3369** | 0.3095 |
| 2 | 0.3855 | 0.3253 | 0.3090 | 0.2810 |
| 3 | 0.3708 | 0.3095 | 0.2950 | 0.2668 |
| 4 | 0.3563 | 0.2985 | 0.2828 | 0.2588 |
| 5 | 0.3498 | 0.2919 | 0.2774 | 0.2531 |
| `ragu_z` (Uji Goyang, z-score) | 2.16 | 1.95 | 1.98 | 1.86 |
| `ragu_margin` (satuan jarak) | 0.0899 | 0.0777 | 0.0733 | 0.0653 |

Ambang "pembanding tidak konsisten" (persentil ke-95 jarak antar-pembanding asli di validasi): 0.571 / 0.542 / 0.527 / 0.513 untuk 2 / 3 / 4 / 5 pembanding.
`ragu_z` dan `ragu_margin` dikalibrasi pada 1 pembanding; untuk 2-5 pembanding gunakan sebagai indikasi.

## Mode Pengolahan Citra

Sama dengan model lama: `preprocess_mode = binary` (perataan cahaya, Otsu, pembuangan bintik, crop, kanvas 128 x 256). Dipilih karena lebih tahan terhadap bayangan dan
pencahayaan tidak merata pada foto HP dibanding mode `raw`.

## Data Pelatihan, Validasi, dan Uji

Pembagian per orang 70% / 15% / 15% (seed 42). Orang validasi dan uji tidak pernah dilihat saat pelatihan.

| Dataset | Orang latih / val / uji | Gambar latih | Gambar val | Gambar uji |
|---|---|---|---|---|
| CEDAR (24 asli + 24 tiruan mahir per orang) | 38 / 8 / 9 (55) | 1.824 | 384 | 432 |
| BHSig260 Bengali (24 asli + 30 tiruan mahir) | 70 / 15 / 15 (100) | 3.780 | 810 | 810 |
| BHSig260 Hindi (24 asli + 30 tiruan mahir) | 112 / 24 / 24 (160) | 6.048 | 1.296 | 1.296 |
| **Total** | **220 / 47 / 48 (315)** | **11.652** | **2.490** | **2.538** |

- Data latih ditambah salinan "mirip foto HP" (bayangan, buram, miring, redup, noise): 23.304 baris latih. 75% pasangan "beda" adalah tiruan mahir (bobot loss 1.5); pasangan diacak ulang tiap epoch.
- Validasi (5.640 pasangan): memilih batas keputusan, batas Uji Goyang, batas ciri forensik, dan ambang konsistensi pembanding.
- Uji: D1 = CEDAR (1.800 pasangan), D2 = BHSig260 (39 orang, 7.800 pasangan), **D3 = foto sendiri** (120 citra, 3 pemilik, 20 asli + 20 tiruan per pemilik, 2.970 pasangan; **tidak dipakai melatih maupun memilih batas**).
- Toloka tidak tersedia dan tidak dipakai pada v2.

## Metrik Evaluasi

Semua angka diukur pada orang yang tidak dipakai saat pelatihan.

### Kemampuan memisahkan (sama untuk semua target)

| Data uji | AUC | EER | Model lama: AUC (orang uji sama) |
|---|---|---|---|
| D1 CEDAR | 0.919 | 17.4% | 0.922 |
| D2 BHSig260 | 0.926 | 14.9% | 0.825 |
| D3 foto sendiri | 0.892 | 19.1% | 0.893 |

### Tingkat model, 1 pembanding (tiruan mahir lolos / asli ditolak)

| Data uji | Lama (0.4825) | 0.20 | 0.10 | 0.08 | 0.05 |
|---|---|---|---|---|---|
| D1 CEDAR | 16.1% / 20.0% | 8.9% / 29.8% | 4.6% / 43.3% | 3.4% / 47.3% | 1.2% / 54.0% |
| D2 BHSig260 | 78.8% / 3.2% | 17.7% / 13.2% | 8.5% / 23.1% | 6.9% / 27.3% | 4.5% / 33.9% |
| D3 foto sendiri | 52.7% / 9.3% | 32.8% / 20.4% | 18.1% / 35.1% | 14.6% / 40.2% | 11.8% / 48.2% |

### Status akhir di aplikasi, 1 pembanding (tiruan berstatus ASLI / asli berstatus ASLI)

| Data uji | 0.20 | 0.10 | 0.08 | 0.05 |
|---|---|---|---|---|
| D1 CEDAR | 1.7% / 49.1% | 0.7% / 34.1% | 0.3% / 28.6% | 0.3% / 22.7% |
| D2 BHSig260 | 4.8% / 72.6% | 2.2% / 58.6% | 1.4% / 52.9% | 0.8% / 44.6% |
| D3 foto sendiri | 3.5% / 43.7% | 1.6% / 26.0% | 1.3% / 21.8% | 0.7% / 14.9% |

### Foto sendiri lewat backend nyata (45 tiruan, 24 asli; ASLI / BELUM YAKIN / PALSU)

| Pembanding | Target | Tiruan | Asli |
|---|---|---|---|
| 1 | 0.20 / 0.10 / 0.08 / 0.05 | 2/12/31 · 1/5/39 · 1/4/40 · 1/3/41 | 7/10/7 · 7/9/8 · 4/12/8 · 2/10/12 |
| 3 | 0.20 / 0.10 / 0.08 / 0.05 | 5/25/15 · 2/23/20 · 1/24/20 · 0/22/23 | 11/12/1 · 8/15/1 · 5/18/1 · 3/18/3 |
| 5 | 0.20 / 0.10 / 0.08 / 0.05 | 7/24/14 · 4/25/16 · 2/25/18 · 1/23/21 | 9/14/1 · 4/19/1 · 2/20/2 · 2/17/5 |

## Keterbatasan

1. **Kemampuan memisahkan pada foto sendiri tidak naik** (AUC 0.893 -> 0.892). Penurunan FAR berasal dari batas yang lebih ketat, bukan dari model yang lebih pandai pada data tersebut.
2. **FAR rendah dibayar dengan penolakan asli:** makin kecil target_far, makin banyak tanda tangan asli menjadi BELUM YAKIN atau PALSU (pada target 0.05 dan 5 pembanding hanya 2 dari 24 asli langsung berstatus ASLI).
3. **Dataset foto sendiri sangat kecil:** 3 pemilik; selisih kecil antar target berada dalam derau. D1 uji hanya 9 orang.
4. **Tiruan tertentu tidak terpisahkan:** tiruan terhadap pemilik 1 jaraknya (±0.20-0.24) lebih kecil daripada variasi tanda tangan aslinya sendiri.
5. **Uji Goyang dikalibrasi untuk 1 pembanding** dan menjadi indikasi untuk 2-5 pembanding.
6. **Domain data latih:** CEDAR (Latin, scan) dan BHSig260 (Bengali/Hindi, scan). Foto HP bergaya Latin hanya diwakili augmentasi dan data uji kecil; belum diuji lintas populasi lain.
7. **Toloka tidak dipakai** pada v2.
8. **Bukan bukti hukum:** prototipe riset; hasil adalah indikasi pendukung.

## Penggunaan yang Direkomendasikan

- ✅ Demo interaktif, eksplorasi teknis, penelitian dan tugas akhir
- ✅ Penyaring awal: status ASLI sangat selektif; hasil BELUM YAKIN/PALSU ditinjau manusia
- ✅ Memilih target_far sesuai kebutuhan: 0.20 / 0.10 (lebih banyak asli diterima) atau 0.08 / 0.05 (lebih ketat terhadap tiruan)
- ❌ Penegakan hukum atau forensik digital resmi
- ❌ Sistem produksi yang melayani pengguna nyata tanpa audit
- ❌ Pengambilan keputusan hukum

---

*Dibuat dari `demo_model_files_v2/config.json` dan `config_target_far_*.json` — SignaCheck v2*

---

# Lampiran: Kartu Model Lama (versi 6, arsip)

> Bagian di bawah menjelaskan model lama di `demo_model_files__6_` (ambang 0.4825). Tidak lagi aktif; masih bisa dijalankan dengan `SIGNACHECK_MODEL=lama`.

## Identitas Model (lama) (lama)
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

## Mode Pengolahan Citra (lama)
| Parameter | Nilai |
|-----------|-------|
| `preprocess_mode` | `binary` |
| Ukuran input | 128 × 256 piksel (grayscale) |
| Threshold keputusan | `0.4824983775615692` |
| `ragu_z` (batas keyakinan) | `1.7437371015548706` |

**Alasan pemilihan mode `binary`:**
Mode `raw` sedikit lebih baik di data scan bersih (EER val D1 ≈ 0.078 vs binary ≈ 0.130), tetapi jatuh ke hampir level tebakan pada foto berbayangan/redup. Karena sistem ditargetkan untuk foto HP yang kondisinya bervariasi, mode `binary` dipilih karena lebih robust terhadap variasi pencahayaan.

---

## Data Pelatihan (lama)
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

## Metrik Evaluasi (dari `config.json`) (lama)
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

## Efek Jumlah Pembanding (dari `config.json banyak_pembanding`) (lama)
| Jumlah Pembanding | D1 AUC | D1 EER | D2 AUC | D2 EER |
|-------------------|--------|--------|--------|--------|
| 1 | 0.9381 | 0.1468 | 0.8991 | 0.1864 |
| 2 | 0.9490 | 0.1336 | 0.9220 | 0.1619 |
| 3 | 0.9499 | 0.1354 | 0.9261 | 0.1645 |
| 5 | 0.9552 | 0.1226 | 0.9417 | 0.1263 |

> Lebih banyak pembanding meningkatkan akurasi. Sistem menerima 1–5 pembanding.

---

## Keterbatasan (lama)
1. **Dataset D2 (Toloka) tidak memiliki skilled forgery**: Toloka hanya mengandung random forgery (tiruan acak tanpa latihan). FAR model terhadap peniru terlatih pada D2 tidak diketahui.

2. **Dataset uji sendiri sangat kecil**: Hanya 3 pemilik, 20 asli + 20 tiruan per pemilik (total 120 gambar). Generalisasi ke populasi yang lebih luas tidak dapat dijamin dari data ini saja.

3. **FAR tiruan terlatih tinggi pada dataset sendiri**: FAR terhadap tiruan yang dikumpulkan secara mandiri sekitar **52%** — artinya lebih dari separuh tiruan tidak terdeteksi. Dataset ini bukan benchmark yang representatif.

4. **Bukan bukti hukum**: Sistem ini adalah prototipe riset. Hasilnya tidak dapat digunakan sebagai bukti di persidangan atau proses hukum apa pun.

5. **Performa menurun pada foto berbayangan/redup**: Mode `binary` membantu, tetapi gambar berkualitas sangat rendah (pencahayaan ekstrem, blur berat) tetap dapat menurunkan akurasi secara signifikan.

6. **Tidak diuji lintas populasi**: Model dilatih pada populasi penanda tangan tertentu (Amerika Utara/CEDAR, platform Toloka). Generalisasi ke gaya tanda tangan dari budaya lain belum dievaluasi.

---

## Penggunaan yang Direkomendasikan (lama)
- ✅ Demo interaktif dan eksplorasi teknis
- ✅ Penelitian dan tugas akhir
- ✅ Prototyping sistem verifikasi
- ❌ Penegakan hukum atau forensik digital resmi
- ❌ Sistem produksi yang melayani pengguna nyata tanpa audit
- ❌ Pengambilan keputusan hukum

---

*Dibuat dari `demo_model_files__6_/config.json` — SignaCheck v2.0*
