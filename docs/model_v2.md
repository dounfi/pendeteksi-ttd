# Model v2: menurunkan FAR (tanda tangan palsu yang lolos)

## Masalah
Model lama memakai batas 0.4825 (titik EER) dan hanya mengenal tiruan mahir dari CEDAR (38 orang latih).
Diukur ulang pada orang uji yang sama untuk semua model (skrip `scripts/v2_kalibrasi.py`):

| Data uji | AUC | Tiruan mahir lolos pada batas lama 0.4825 |
|---|---|---|
| D1 CEDAR | 0.922 | 16.1% |
| D2 BHSig260 (Bengali+Hindi) | 0.825 | **78.8%** |
| D3 foto/scan sendiri (3 pemilik) | 0.893 | **52.7%** |

Penyebab utama: (1) batas yang dipilih untuk EER/FRR rendah, bukan untuk keamanan; (2) kurang data tiruan mahir. Toloka bukan
penyebab langsung: Toloka tidak punya tiruan yang bisa dipasangkan, jadi tidak ikut menyumbang pelajaran tiruan mahir.
Notebook lama juga melewatkan 14.040 gambar BHSig260 (260 orang: 100 Bengali + 160 Hindi, masing-masing 24 asli + 30 tiruan mahir) karena nama file tidak dikenali.

## Perbaikan
1. **Data**: CEDAR (55) + BHSig260 Bengali (100) + Hindi (160) = 315 orang dengan tiruan mahir; versi "foto HP" untuk data latih.
   Pembagian per orang 70/15/15 (CEDAR identik dengan notebook lama). `scripts/v2_siapkan_data.py`.
2. **Pelatihan**: arsitektur sama; 75% pasangan "beda" adalah tiruan mahir, bobot loss 1.5; pasangan diacak ulang tiap epoch. `scripts/v2_latih_model.py`.
3. **Ensemble**: model lama + model hasil fine-tuning (CPU, 5 epoch) digabung menjadi satu file (`scripts/v2_ensemble.py`).
   Model dari nol (GPU) lebih baik di BHSig260 (AUC 0.943) tetapi lebih buruk di data foto sendiri (AUC 0.79), sehingga tidak dipakai.
4. **Batas keputusan**: dipilih di VALIDASI, paling ketat dari CEDAR dan BHSig260, sehingga tiruan mahir lolos <= 20% di tiap dataset
   (batas **0.4302**). Awalnya dipakai target 10% (batas 0.357), tetapi terlalu sering menghasilkan "BELUM YAKIN" (asli dikenali
   hanya 34/59/26%), sehingga dilonggarkan ke 20%. Config target 10% disimpan sebagai cadangan di pembuat config (jalankan ulang kalibrasi).
5. **Backend**: "ASLI" hanya bila model, Uji Goyang, **dan** ciri forensik sepakat; selain itu "BELUM YAKIN". ragu_z (2.16), ragu_margin (0.090),
   fusi, batas forensik dikalibrasi ulang. Model lama bisa dipakai lagi dengan `SIGNACHECK_MODEL=lama`.

## Hasil model v2 (orang yang tidak dipakai training; batas 0.4302)
| Data uji | AUC | EER | Tiruan mahir lolos (model saja) | Asli ditolak (model saja) |
|---|---|---|---|---|
| D1 CEDAR | 0.919 | 17.4% | 8.9% | 29.8% |
| D2 BHSig260 | 0.926 | 14.9% | 17.7% | 13.2% |
| D3 foto sendiri | 0.892 | 19.1% | 32.8% | 20.4% |

**Status akhir "ASLI" di aplikasi** (1 pembanding; model + Uji Goyang + fusi ciri):

| Data uji | Tiruan lolos berstatus ASLI | Asli langsung berstatus ASLI |
|---|---|---|
| D1 | 1.7% (mahir 2.3%) | 49.1% |
| D2 | 4.8% (mahir 5.0%) | 72.6% |
| D3 | 3.5% (mahir 6.9%) | 43.7% |

Sebelumnya pada D3: 52.7%. Sisanya (asli yang tidak langsung berstatus ASLI) menjadi "BELUM YAKIN" atau "PALSU"; menambah pembanding membantu.
Titik lain bisa dipilih ulang: `python scripts/v2_kalibrasi.py --cache <cache> --baru <model> --tulis <folder> --target_far 0.10`
(target 0.10: tiruan lolos 0.7/2.2/1.6% untuk D1/D2/D3, asli dikenali 34/59/26%; batas 0.357).
## Batasan yang jujur
- **Kemampuan memisahkan (AUC) tidak naik pada data foto sendiri** (0.893 -> 0.892). Yang turun adalah FAR karena batas dipindah.
  FAR dan FRR saling menukar; angka FAR rendah dibayar dengan lebih banyak "BELUM YAKIN".
- Data foto sendiri hanya 3 pemilik; angka D3 bersifat indikasi. D1 uji hanya 9 orang.
- Model lama mencapai AUC lebih tinggi pada CEDAR (0.922 vs 0.919 setara) dan jauh lebih buruk pada BHSig260 (0.825 vs 0.926).
- Toloka tidak tersedia di komputer ini dan tidak dipakai di v2; ketahanan foto bergantung pada augmentasi dan pengolahan citra binary.
- Untuk menurunkan FAR tanpa menaikkan FRR dibutuhkan lebih banyak data tiruan mahir bergaya Latin hasil foto HP (data sendiri) dan pelatihan di GPU.

## Pembaruan: skor jarak terdekat dan batas per jumlah pembanding
Pada percobaan dengan k pembanding, memakai jarak **terdekat** ke pembanding (bukan rata-rata) menaikkan AUC pada k=3:
CEDAR 0.923 -> 0.943, BHSig260 0.945 -> 0.961, foto sendiri 0.840 -> 0.882. Karena skornya berubah, batas dikalibrasi ulang
untuk k=1..5 (`scripts/v2_kalibrasi_k.py`; target tiruan mahir lolos <= 20% di validasi; k=1 tetap 0.4302):
batas k=2..5 = 0.386 / 0.371 / 0.356 / 0.350. Batas "pembanding tidak konsisten" kini persentil ke-95 jarak antar-pembanding asli
di validasi (0.57 / 0.54 / 0.53 / 0.51), bukan lagi sama dengan batas keputusan. Cadangan config sebelum perubahan ini tidak disimpan di repo.

Ukuran pada foto sendiri lewat backend nyata (3 pemilik; per pemilik 8 asli dan 15 tiruan sebagai query, pembanding = asli pertama):

| Jumlah pembanding | Tiruan: PALSU / BELUM YAKIN / ASLI (dari 45) | Asli: ASLI / BELUM YAKIN / PALSU (dari 24) |
|---|---|---|
| 1 | 31 / 12 / 2 | 7 / 10 / 7 |
| 3 | 15 / 25 / 5 | 11 / 12 / 1 |
| 5 | 14 / 24 / 7 | 9 / 14 / 1 |

Artinya "BELUM YAKIN" pada tiruan adalah hasil yang aman (bukan lolos), tetapi 5-7 dari 45 tiruan tetap berstatus ASLI. Hampir semuanya
tiruan terhadap pemilik 1 yang jaraknya ke pembanding (~0.20-0.24) lebih kecil daripada variasi tanda tangan aslinya sendiri; model tidak
bisa membedakannya. Penyebab "BELUM YAKIN" terbanyak: Uji Goyang tidak stabil (dikalibrasi pada k=1), pembanding asli pemilik 2 memang bervariasi, dan ciri forensik tidak sepakat.
## Pembaruan: config aktif dengan target_far 0.05 (paling ketat)
Batas k=1: 0.3095; k=2..5: 0.281 / 0.267 / 0.259 / 0.253. ragu_z 1.86, ragu_margin 0.065. Cadangan config target 0.20 tidak disimpan di repo;
buat ulang dengan `v2_kalibrasi.py --target_far 0.20` lalu `v2_kalibrasi_k.py --target_far 0.20`.
Model-level (k=3), tiruan mahir lolos / asli ditolak: CEDAR 2.0% / 44%, BHSig260 4.2% / 23%, foto sendiri 11.8% / 37%.

Foto sendiri lewat backend nyata (45 tiruan, 24 asli), target 0.20 -> 0.05:

| Pembanding | Tiruan berstatus ASLI | Tiruan PALSU / BELUM YAKIN | Asli berstatus ASLI | Asli BELUM YAKIN / PALSU |
|---|---|---|---|---|
| 1 | 2 -> 1 | 41 / 3 | 7 -> 2 | 10 / 12 |
| 3 | 5 -> 0 | 23 / 22 | 11 -> 3 | 18 / 3 |
| 5 | 7 -> 1 | 21 / 23 | 9 -> 2 | 17 / 5 |
## Pembaruan: config aktif dengan target_far 0.08 (pembanding dengan 0.05)
Dipilih sebagai titik tengah: 0.05 terlalu sering menolak tanda tangan asli, 0.20 meloloskan terlalu banyak tiruan.
Dua file config disimpan di `demo_model_files_v2/` untuk dibandingkan di laporan (model `.keras` sama; yang berbeda hanya batas dan kalibrasi):
`config_target_far_0.05.json` (paling ketat) dan `config_target_far_0.08.json` (= `config.json` aktif). Untuk pindah, salin salah satunya menjadi `config.json` lalu jalankan ulang backend.

Batas keputusan (jarak terdekat; makin kecil makin ketat):

| Jumlah pembanding | target 0.05 | target 0.08 |
|---|---|---|
| 1 | 0.3095 | 0.3369 |
| 2 | 0.2810 | 0.3090 |
| 3 | 0.2668 | 0.2950 |
| 4 | 0.2588 | 0.2828 |
| 5 | 0.2531 | 0.2774 |

Tingkat model saja, k=3 (tiruan mahir lolos / asli ditolak):

| Data uji | target 0.05 | target 0.08 |
|---|---|---|
| D1 CEDAR | 2.0% / 44% | 3.1% / 35.8% |
| D2 BHSig260 | 4.2% / 23% | 6.4% / 17.0% |
| D3 foto sendiri | 11.8% / 37% | 16.0% / 26.1% |

Foto sendiri lewat backend nyata (45 tiruan, 24 asli; pembanding = asli pertama). Jumlah dari 45 tiruan / 24 asli:

| Pembanding | Target | Tiruan: ASLI / BELUM YAKIN / PALSU | Asli: ASLI / BELUM YAKIN / PALSU |
|---|---|---|---|
| 1 | 0.20 | 2 / 12 / 31 | 7 / 10 / 7 |
| 1 | 0.08 | 1 / 4 / 40 | 4 / 12 / 8 |
| 1 | 0.05 | 1 / 3 / 41 | 2 / 10 / 12 |
| 3 | 0.20 | 5 / 25 / 15 | 11 / 12 / 1 |
| 3 | 0.08 | 1 / 24 / 20 | 5 / 18 / 1 |
| 3 | 0.05 | 0 / 22 / 23 | 3 / 18 / 3 |
| 5 | 0.20 | 7 / 24 / 14 | 9 / 14 / 1 |
| 5 | 0.08 | 2 / 25 / 18 | 2 / 20 / 2 |
| 5 | 0.05 | 1 / 23 / 21 | 2 / 17 / 5 |

Catatan: selisih 0.08 dan 0.05 pada foto sendiri hanya 0-1 dari 45 tiruan (di dalam derau karena hanya 3 pemilik). Tren yang jelas ada
pada 0.20 -> 0.08 -> 0.05: tiruan yang lolos turun, asli yang langsung diterima juga turun. Keduanya lulus 20 dari 20 uji otomatis.

## Ringkasan empat titik operasi (untuk laporan)
Empat config tersimpan di `demo_model_files_v2/`: `config_target_far_0.20.json`, `_0.10.json`, `_0.08.json`, `_0.05.json`.
Semuanya memakai model `.keras` yang sama dan dibuat dengan prosedur yang sama (`v2_kalibrasi.py --target_far X` lalu
`v2_kalibrasi_k.py --target_far X`); hanya batas dan kalibrasi yang berbeda. `config.json` = config aktif (saat ini 0.08).
Untuk menguji ulang salah satunya: salin file itu menjadi `config.json`, jalankan ulang backend, lalu `python scripts/test_system.py`.
Semua config lulus 20 dari 20 uji otomatis; angka 0.20 dan 0.05 hasil pembuatan ulang identik dengan pengukuran sebelumnya.

Batas keputusan (jarak terdekat) per jumlah pembanding:

| Pembanding | 0.20 | 0.10 | 0.08 | 0.05 |
|---|---|---|---|---|
| 1 | 0.4302 | 0.3570 | 0.3369 | 0.3095 |
| 2 | 0.3855 | 0.3253 | 0.3090 | 0.2810 |
| 3 | 0.3708 | 0.3095 | 0.2950 | 0.2668 |
| 4 | 0.3563 | 0.2985 | 0.2828 | 0.2588 |
| 5 | 0.3498 | 0.2919 | 0.2774 | 0.2531 |

Tingkat model saja, k=3 (tiruan mahir lolos / asli ditolak):

| Data uji | 0.20 | 0.10 | 0.08 | 0.05 |
|---|---|---|---|---|
| D1 CEDAR | 9.6% / 21.0% | 3.9% / 31.8% | 3.1% / 35.8% | 2.0% / 44% |
| D2 BHSig260 | 16.5% / 7.3% | 7.9% / 14.8% | 6.4% / 17.0% | 4.2% / 23% |
| D3 foto sendiri | 32.3% / 10.7% | 20.8% / 21.6% | 16.0% / 26.1% | 11.8% / 37% |

Foto sendiri lewat backend nyata (45 tiruan, 24 asli; pembanding = asli pertama), format ASLI / BELUM YAKIN / PALSU:

| Pembanding | Target | Tiruan | Asli |
|---|---|---|---|
| 1 | 0.20 | 2 / 12 / 31 | 7 / 10 / 7 |
| 1 | 0.10 | 1 / 5 / 39 | 7 / 9 / 8 |
| 1 | 0.08 | 1 / 4 / 40 | 4 / 12 / 8 |
| 1 | 0.05 | 1 / 3 / 41 | 2 / 10 / 12 |
| 3 | 0.20 | 5 / 25 / 15 | 11 / 12 / 1 |
| 3 | 0.10 | 2 / 23 / 20 | 8 / 15 / 1 |
| 3 | 0.08 | 1 / 24 / 20 | 5 / 18 / 1 |
| 3 | 0.05 | 0 / 22 / 23 | 3 / 18 / 3 |
| 5 | 0.20 | 7 / 24 / 14 | 9 / 14 / 1 |
| 5 | 0.10 | 4 / 25 / 16 | 4 / 19 / 1 |
| 5 | 0.08 | 2 / 25 / 18 | 2 / 20 / 2 |
| 5 | 0.05 | 1 / 23 / 21 | 2 / 17 / 5 |

Pola yang konsisten: makin kecil target_far, makin sedikit tiruan yang lolos berstatus ASLI (pada 5 pembanding 7 -> 4 -> 2 -> 1 dari 45),
dan makin sedikit asli yang langsung diterima (9 -> 4 -> 2 -> 2 dari 24). Hanya 3 pemilik, jadi selisih kecil antar target (mis. 0.08 vs 0.05)
berada di dalam derau; arah tren lebih dapat dipercaya daripada angka tunggalnya.

## Pembagian data (latih / validasi / uji)
Per orang, 70/15/15, seed 42. Orang validasi dan uji tidak pernah dilihat saat pelatihan.

| Dataset | Orang latih / val / uji | Gambar latih | Gambar val | Gambar uji |
|---|---|---|---|---|
| CEDAR (24 asli + 24 tiruan mahir per orang) | 38 / 8 / 9 (55) | 1.824 | 384 | 432 |
| BHSig260 Bengali (24 asli + 30 tiruan mahir) | 70 / 15 / 15 (100) | 3.780 | 810 | 810 |
| BHSig260 Hindi (24 asli + 30 tiruan mahir) | 112 / 24 / 24 (160) | 6.048 | 1.296 | 1.296 |
| Total | 220 / 47 / 48 (315) | 11.652 | 2.490 | 2.538 |

- Data latih ditambah satu salinan "mirip foto HP" per gambar (baris latih 23.304).
- Validasi (5.640 pasangan): memilih batas keputusan, batas Uji Goyang, batas ciri forensik, dan batas konsistensi pembanding.
- Uji: D1 CEDAR 1.800 pasangan; D2 BHSig260 7.800 pasangan (39 orang).
- D3 foto sendiri: 120 citra, 3 pemilik, 20 asli + 20 tiruan per pemilik, 2.970 pasangan; hanya untuk uji.
- Model lama: CEDAR 38/8/9 dan Toloka (120 orang, tanpa tiruan mahir); BHSig260 tidak terpakai.

## ROC, AUC, akurasi, dan confusion matrix
Dihitung pada data uji untuk model lama dan v2 (target 0.20 / 0.10 / 0.08 / 0.05; 1 pembanding; keputusan model saja) oleh `scripts/v2_evaluasi.py`.
Hasil di `hasil_evaluasi_v2/` (`roc_lama_vs_v2.png`, `confusion_matrix.png`, `ringkasan_evaluasi.md`, `evaluasi_v2.json`, `confusion_matrix.csv`, `roc_*.csv`);
tabel lengkap dan cara membacanya ada di `README.md` bagian D dan `Penjelasan alur kerja.txt` bagian 10.6-10.9.
- AUC v2: D1 0.919, D2 0.926, D3 0.892 (lama 0.922 / 0.825 / 0.893); sama untuk keempat target karena kurva ROC-nya satu, target hanya menggeser titik pada kurva.
- Akurasi D1/D2 (seimbang): v2 0.20 -> 0.05 = 81.6% -> 72.6% (D1) dan 84.9% -> 81.1% (D2); lama 83.8% dan 62.2%.
- D3 tidak seimbang (570 asli : 2.400 palsu): akurasi mentah naik 75.2% -> 86.3% tetapi akurasi seimbang turun 81.1% -> 72.9%; jangan dibaca sebagai perbaikan.
- D3 target 0.08: palsu lolos 177 (lama 683), asli ditolak 229 (lama 53).
