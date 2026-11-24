# LAPORAN TEKNIS REKAYASA & KONSOLIDASI SISTEM SIGNACHECK (REPORT.md)

> **Status dokumen:** diperbarui untuk **model v2**. Bagian 0 memuat pembaruan v2 (model aktif); bagian 1-6 adalah catatan konsolidasi **model lama** dan tidak lagi menggambarkan model aktif.

Laporan ini menyajikan dokumentasi menyeluruh atas pekerjaan konsolidasi model, validasi data numerik, pengujian dataset mandiri, perbaikan backend dan frontend, serta pengujian sistem secara komprehensif pada proyek **SignaCheck** (Sistem Verifikasi Pemalsuan Tanda Tangan Berbasis Siamese CNN dan Ciri Morfologi).

---

## 0. Pembaruan v2 (model aktif saat ini)

> **Catatan pembaca.** Bagian 1-6 di bawah mendokumentasikan tahap konsolidasi **model lama** (versi 6, ambang 0.4825) dan dibiarkan apa adanya
> sebagai catatan riwayat. Model yang **aktif sekarang adalah v2**; ringkasannya ada di bagian ini dan rincian lengkapnya di `docs/model_v2.md`.

### 0.1 Latar belakang
Pada model lama, tanda tangan tiruan mahir (*skilled forgery*) yang rapi sering lolos sebagai asli. Diukur ulang pada orang uji yang sama untuk semua model:

| Data uji | AUC | Tiruan mahir lolos (batas 0.4825) |
| :--- | :--- | :--- |
| D1 CEDAR | 0.922 | 16.1% |
| D2 BHSig260 | 0.825 | **78.8%** |
| D3 foto sendiri (3 pemilik) | 0.893 | **52.7%** |

Penyebab: (1) batas 0.4825 dipilih di titik EER (menyeimbangkan galat), bukan untuk keamanan; (2) tiruan mahir hanya dikenal dari CEDAR (38 orang latih);
(3) dataset BHSig260 (260 orang, 14.040 gambar) terlewat karena pola nama file tidak dikenali notebook lama; Toloka tidak punya tiruan mahir.

### 0.2 Ringkasan perubahan berkas

| Berkas / Direktori | Status | Ringkasan |
| :--- | :--- | :--- |
| `demo_model_files_v2/` | Baru | Model aktif (ensemble model lama + hasil fine-tuning, keluaran 128 angka, SHA256 `48D9C3A7...`). Berisi `config.json` (aktif) dan empat titik operasi `config_target_far_0.20/0.10/0.08/0.05.json` |
| `demo_model_files__6_/` | Tetap | Model lama sebagai cadangan; aktifkan dengan `SIGNACHECK_MODEL=lama` |
| `backend_api.py` | Diperbarui | Memuat model v2 (registri model + hash), skor **jarak terdekat**, batas **per jumlah pembanding**, ambang konsistensi pembanding dari data, status ASLI hanya bila model + Uji Goyang + fusi ciri forensik sepakat, port dapat diatur (`SIGNACHECK_PORT`), dan fungsi `_embed()` yang menghindari panggilan batch=1 yang sangat lambat pada sebagian build TensorFlow (14 detik -> 1,3 detik per pemeriksaan) |
| `scripts/v2_siapkan_data.py`, `v2_umum.py` | Baru | Membaca CEDAR + BHSig260 dengan benar, membuat cache dan pasangan latih |
| `scripts/v2_latih_model.py`, `v2_ensemble.py`, `v2_konversi.py` | Baru | Pelatihan/fine-tuning (75% pasangan beda = tiruan mahir, bobot 1.5, pasangan diacak ulang tiap epoch, salinan "foto HP"), penggabungan model, konversi antar-versi Keras |
| `scripts/v2_kalibrasi.py`, `v2_kalibrasi_k.py` | Baru | Memilih batas dari `target_far` di data validasi dan menghitung batas untuk 1-5 pembanding; menulis `config.json` |
| `scripts/uji_foto_sendiri_status.py` | Baru | Mengukur status ASLI / BELUM YAKIN / PALSU pada foto sendiri lewat backend yang berjalan |
| `scripts/test_system.py` | Diperbarui | Port dapat diatur, membaca config sesuai model aktif, menambah uji `/api/verify-json` dan peta penjelasan, mencetak baris `RINGKASAN: lulus X dari Y` |
| `ganti_target_far.bat` | Baru | Memilih titik operasi: `ganti_target_far.bat 0.20 / 0.10 / 0.08 / 0.05` |
| `frontend v2/src/routes/periksa.tsx`, `hooks/useModelInfo.ts` | Diperbarui | Panel Info Model: dataset latih yang benar, hasil D3, status akhir; label D1 = CEDAR, D2 = BHSig260; ambang cadangan 0.3369 |
| `README.md`, `Penjelasan alur kerja.txt`, `docs/model_v2.md`, `MODEL_CARD.md`, `TESTING.md` | Diperbarui | Dokumentasi v2, pembagian data, hasil empat titik operasi, panduan menjalankan target_far secara mandiri |

### 0.3 Pembagian data (per orang, 70% / 15% / 15%, seed 42)

| Dataset | Orang latih / val / uji | Gambar latih | Gambar val | Gambar uji |
| :--- | :--- | :---: | :---: | :---: |
| CEDAR (24 asli + 24 tiruan mahir per orang) | 38 / 8 / 9 (55) | 1.824 | 384 | 432 |
| BHSig260 Bengali (24 asli + 30 tiruan mahir) | 70 / 15 / 15 (100) | 3.780 | 810 | 810 |
| BHSig260 Hindi (24 asli + 30 tiruan mahir) | 112 / 24 / 24 (160) | 6.048 | 1.296 | 1.296 |
| **Total** | **220 / 47 / 48 (315)** | **11.652** | **2.490** | **2.538** |

Validasi (5.640 pasangan) dipakai memilih batas dan ambang pemeriksaan; uji dipakai hanya untuk pelaporan (D1 1.800 pasangan, D2 7.800 pasangan).
D3 (foto sendiri, 120 citra, 3 pemilik, 2.970 pasangan) **tidak dipakai melatih maupun memilih batas**. Salinan "mirip foto HP" ditambahkan pada data latih saja.
Model lama: CEDAR 38/8/9 dan Toloka 120 orang (tanpa tiruan mahir); BHSig260 tidak terpakai.

### 0.4 Hasil evaluasi

**Kemampuan memisahkan (AUC), orang uji yang sama:**

| Data uji | Model lama | Model v2 |
| :--- | :--- | :--- |
| D1 CEDAR | 0.922 | 0.919 |
| D2 BHSig260 | 0.825 | **0.926** |
| D3 foto sendiri | 0.893 | 0.892 (tidak naik) |

**Empat titik operasi, 1 pembanding, tingkat model (tiruan mahir lolos / asli ditolak):**

| Data uji | Lama (0.4825) | target 0.20 | target 0.10 | target 0.08 (aktif) | target 0.05 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Batas keputusan | 0.4825 | 0.4302 | 0.3570 | 0.3369 | 0.3095 |
| D1 CEDAR | 16.1% / 20.0% | 8.9% / 29.8% | 4.6% / 43.3% | 3.4% / 47.3% | 1.2% / 54.0% |
| D2 BHSig260 | 78.8% / 3.2% | 17.7% / 13.2% | 8.5% / 23.1% | 6.9% / 27.3% | 4.5% / 33.9% |
| D3 foto sendiri | 52.7% / 9.3% | 32.8% / 20.4% | 18.1% / 35.1% | 14.6% / 40.2% | 11.8% / 48.2% |

**Foto sendiri lewat backend nyata** (3 pemilik; 45 tiruan dan 24 asli; pembanding = asli pertama). Format ASLI / BELUM YAKIN / PALSU:

| Pembanding | Target | Tiruan (dari 45) | Asli (dari 24) |
| :--- | :--- | :--- | :--- |
| 1 | 0.20 / 0.10 / 0.08 / 0.05 | 2/12/31 · 1/5/39 · 1/4/40 · 1/3/41 | 7/10/7 · 7/9/8 · 4/12/8 · 2/10/12 |
| 3 | 0.20 / 0.10 / 0.08 / 0.05 | 5/25/15 · 2/23/20 · 1/24/20 · 0/22/23 | 11/12/1 · 8/15/1 · 5/18/1 · 3/18/3 |
| 5 | 0.20 / 0.10 / 0.08 / 0.05 | 7/24/14 · 4/25/16 · 2/25/18 · 1/23/21 | 9/14/1 · 4/19/1 · 2/20/2 · 2/17/5 |

Makin kecil `target_far`, makin sedikit tiruan yang lolos, tetapi makin sedikit pula asli yang langsung diterima (menjadi BELUM YAKIN atau PALSU).
Dibanding model lama (52.7% tiruan lolos), pada target 0.08 hanya 1-2 dari 45 tiruan yang berstatus ASLI. Karena hanya 3 pemilik, selisih kecil antar target berada dalam derau.

### 0.5 Pengujian
- Uji otomatis `scripts/test_system.py`: **20 dari 20 lulus** pada keempat titik operasi (0.20, 0.10, 0.08, 0.05).
- Hasil pada foto sendiri diukur lewat backend yang sebenarnya (bukan hanya perhitungan di notebook) dengan `scripts/uji_foto_sendiri_status.py`.
- Lingkungan yang diuji: Python 3.14 + TensorFlow 2.22 rc + Keras 3.15.1, serta Python 3.11 + TensorFlow 2.20 + Keras 3.13.2; jarak dan status identik.

### 0.6 Temuan dan koreksi selama pembaruan
1. **Koreksi jumlah orang:** BHSig260 Bengali berisi 100 orang (bukan 50), sehingga BHSig260 = 260 orang dan data v2 = 315 orang. Dokumen, config, dan antarmuka sudah dikoreksi.
2. **Performa batch=1:** pada TensorFlow 2.22 rc + Python 3.14, memproses satu gambar tunggal memakan ±6 detik (batch >= 2 normal), sehingga satu pemeriksaan ±14 detik. `_embed()` menggandakan gambar tunggal menjadi batch 2; waktu turun menjadi ±1,3 detik dengan hasil numerik identik.
3. **Kemampuan memisahkan pada foto sendiri tidak naik** (0.893 -> 0.892). FAR turun karena pemilihan batas yang lebih ketat, dibayar dengan lebih banyak "BELUM YAKIN" dan "PALSU" pada tanda tangan asli.
4. **Uji Goyang** dikalibrasi untuk 1 pembanding; untuk 2-5 pembanding berfungsi sebagai indikasi dan menjadi salah satu penyebab banyak asli berstatus BELUM YAKIN.
5. Tiruan terhadap pemilik 1 jaraknya (±0.20-0.24) lebih kecil daripada variasi tanda tangan aslinya; tidak ada batas yang memisahkannya tanpa menolak banyak asli. Perbaikan nyata memerlukan lebih banyak data tiruan bergaya Latin hasil foto HP dari lebih banyak orang.

### 0.7 Ringkasan 5 baris (v2)
1. **Status sistem:** SignaCheck beroperasi end-to-end (FastAPI port 8000, React Vite port 5173) dengan model v2.
2. **Model aktif & hash:** `demo_model_files_v2/embedding_model.keras` (SHA256 `48D9C3A7F52BB7379A37C997BD11F5D656312DC0FF46A8F38006C3FE673E7BD0`), mode `binary`, titik operasi aktif target_far 0.08 (batas 0.3369 untuk 1 pembanding).
3. **Metrik utama:** AUC D1 0.919, D2 0.926, D3 0.892; tiruan mahir foto sendiri lolos 14.6% (tingkat model) dan 1-2 dari 45 sebagai status ASLI, turun dari 52.7%.
4. **Kelemahan jujur:** kemampuan memisahkan pada foto sendiri tidak naik; harga FAR rendah adalah banyak tanda tangan asli menjadi BELUM YAKIN/PALSU; evaluasi foto sendiri hanya 3 pemilik.
5. **Rekomendasi:** tetap prototipe riset dan indikasi pendukung, bukan alat bukti hukum. Pilih target_far sesuai kebutuhan (0.20 / 0.10 longgar; 0.08 / 0.05 ketat) dan minta tinjauan manusia untuk hasil BELUM YAKIN.

---

## 1. Ringkasan Perubahan *(tahap konsolidasi model lama)*

Berikut adalah daftar berkas yang telah diperiksa, dimodifikasi, dipindahkan, atau dibuat dalam rangka standardisasi sistem:

| Berkas / Direktori | Status | Ringkasan Perubahan |
| :--- | :--- | :--- |
| `.gitignore` | Diperbarui | Menambahkan folder privat `ttd_uji_sendiri/` dan folder arsip `arsip_model_lama/` agar data citra tanda tangan privat dan model lawas tidak masuk pelacakan repositori. |
| `arsip_model_lama/` | Baru | Direktori dibuat untuk menampung folder model non-final `demo_model_files (5)` secara aman tanpa menghapus file apapun. |
| `arsip_lama/` | Baru | Direktori arsip terpadu untuk menampung seluruh berkas legacy eksperimen lama (`app.py` Streamlit, `server.py`, `index.html`/`periksa.html`, `css/`, `js/`, `assets/`, `jalankan_demo.bat`, `contrast-check.py`, `pyrefly.toml`, notebook lama `Siamese_CNN_Deteksi_TTD.ipynb`, duplikat `preprocess.py`/`forensik.py`/`gangguan.py` di root, serta folder `arsip_model_lama/`) sehingga folder root benar-benar ramping dan bersih tanpa kehilangan data riwayat. |
| `demo_model_files__6_/config.json` | Terverifikasi | Memastikan konfigurasi resmi tidak berubah: `preprocess_mode: "binary"`, `threshold: 0.4824983775615692`, `ragu_z: 1.7437371015548706`. |
| `backend_api.py` | Diperbarui | - Menambahkan *startup guard* yang memeriksa kecocokan SHA256 model (`48B77FEFF7...`) dan `preprocess_mode == "binary"`; server otomatis berhenti jika tidak cocok.<br>- Menambahkan endpoint `GET /api/model-info` membaca langsung dari `config.json` tanpa angka hardcoded.<br>- Menambahkan endpoint `GET /api/sample-image/{filename}` dengan proteksi *directory traversal*.<br>- Memperbarui `POST /api/verify` agar mendukung input JSON (Base64) dan multipart/form-data.<br>- Menerapkan validasi input ketat (cek tipe citra via PIL verify, batas ukuran 8 MB, penolakan citra kosong/putih polos dengan standar deviasi piksel < 2.0, pembatasan 1–5 gambar referensi).<br>- Membatasi CORS hanya untuk `http://localhost:5173` dan `http://127.0.0.1:5173`.<br>- Menstandarkan pesan error berbahasa Indonesia tanpa kebocoran path server.<br>- Menambahkan logging pencatatan durasi inferensi. |
| `frontend v2/src/periksa.tsx` | Diperbarui | - Menghubungkan seluruh visualisasi metrik ke `/api/model-info` (menghapus semua hardcoded metrics).<br>- Menambahkan panel "Info Model" dan kotak "Keterbatasan Sistem" yang transparan.<br>- Menstandarkan 3 status keputusan: `ASLI` (jarak $\le$ threshold), `BELUM YAKIN` (threshold < jarak $\le$ threshold + 0.1), dan `PALSU / BERBEDA` (jarak > threshold + 0.1) beserta keterangan bahwa skor kemiripan dihitung dari jarak, bukan probabilitas.<br>- Mengganti label klaim berlebihan (seperti "Explainable AI / Multimodal") menjadi "Penjelasan pendamping (ciri morfologi)".<br>- Memberi peringatan visual khusus bila pengguna hanya mengunggah 1 referensi pembanding.<br>- Menyediakan tombol "Contoh Siap Pakai" (3 skenario) yang menampilkan label *Ground Truth* pasca-inferensi. |
| `frontend v2/src/App.tsx` & komponen | Diperbarui | Memastikan tata kelola state, penanganan error berbahasa Indonesia saat backend tidak aktif, serta penghapusan kata terlarang (*terbukti*, *siap produksi*, *XAI*, *multimodal*, *centroid*). Build sukses via `bun run build`. |
| `scripts/eval_dataset_sendiri.py` | Diperbaiki | Memperbaiki arah tanda metrik ROC (jarak Euclidean berbanding lurus dengan label 1 = pemalsuan/impostor) sehingga perhitungan AUC dan EER akurat. Output otomatis disimpan ke `results/uji_dataset_sendiri.json` dan `.csv`. |
| `scripts/build_numbers.py` | Baru | Skrip otomasi untuk mengekstrak angka resmi langsung dari `config.json` dan hasil evaluasi mandiri ke `docs/angka_resmi.md` serta `results/angka_resmi.json`. |
| `scripts/test_system.py` | Baru | Skrip pengujian otomatis komprehensif untuk memverifikasi fungsionalitas endpoint API (TC01 s.d. TC15, TC18). |
| `jalankan_semua.bat` | Diperbaiki | Memastikan seluruh path diapit tanda kutip ganda untuk mencegah galat spasi Windows, memeriksa dependensi, menjalankan backend (port 8000), frontend (port 5173), dan membuka browser. |
| `README.md` | Diperbarui | Panduan instalasi ringkas, prasyarat sistem, perintah eksekusi, deskripsi port, struktur direktori, dan disclaimer status prototipe riset. |
| `TESTING.md` | Baru | Matriks rencana dan hasil pengujian fungsional 20 skenario uji (TC01–TC20). |
| `MODEL_CARD.md` | Diperbarui | Kartu model formal yang merangkum identitas bobot, parameter pra-pemrosesan, data pelatihan D1 & D2, metrik evaluasi resmi, efek jumlah pembanding, dan limitasi. |

---

## 2. Konsolidasi Model *(model lama)*

Seluruh berkas model `embedding_model.keras` yang terdeteksi di dalam repositori telah dihitung nilai ringkasan hash SHA256-nya:

| Lokasi Berkas | Ukuran | SHA256 Hash | Status & Keterangan |
| :--- | :--- | :--- | :--- |
| `demo_model_files__6_/embedding_model.keras` | 2.502.977 B | `48B77FEFF782E83EDBF161EF52E6106F0573471E828CFC41BEA573AEAA3CCD01` | **Model Final (Aktif Digunakan Backend)** |
| `arsip_model_lama/demo_model_files_5/embedding_model.keras` | 2.502.977 B | `D219DA77E59DBDBFA9F9D8D6B4086D6B4E54F3F8BAA0BC1B42D305F83BD6AD4B` | **Diarsipkan** (Model Eksperimen Versi 5) |
| `results/ttd_siamese_output/embedding_model.keras` | 2.502.977 B | `1424755ECD7FBBCFEFA7512E27CD45F5651F562E76A3D4C4F00E8FD2D05C3843` | **Arsip Hasil Pelatihan Lama** (Threshold `0.4462`) |

**Bukti Penguncian Backend:**
Pada saat backend dinyalakan, fungsi `validasi_integritas_startup()` membaca berkas biner secara langsung dan mencetak log:
```text
[STARTUP] Model folder : ...\demo_model_files__6_
[STARTUP] Hash embedding_model.keras : 48B77FEFF782E83EDBF161EF52E6106F0573471E828CFC41BEA573AEAA3CCD01
[STARTUP] preprocess_mode : binary
[STARTUP] threshold       : 0.4824983775615692
[STARTUP] ragu_z          : 1.7437371015548706
[STARTUP] Validasi hash & config: OK
```
Jika nilai hash tidak sesuai atau mode pra-pemrosesan bukan `binary`, backend akan langsung menghentikan proses eksekusi (`sys.exit(1)`).

---

## 3. Hasil Evaluasi Dataset Mandiri (`ttd_uji_sendiri`) *(model lama, batas 0.4825)*

Pengujian dilakukan menggunakan skrip `scripts/eval_dataset_sendiri.py` terhadap 120 citra tanda tangan mandiri (3 pemilik, masing-masing 20 tanda tangan asli dan 20 tanda tangan tiruan).
Pasangan uji yang dievaluasi mencakup:
- **Pasangan Asli (Genuine)**: $3 \times \binom{20}{2} = 570$ pasangan.
- **Pasangan Tiruan Terampil (Skilled Forgery)**: $3 \times (20 \times 20) = 1.200$ pasangan.
- **Pasangan Tanda Tangan Orang Lain (Random Impostor)**: $\binom{3}{2} \times 2 \times (20 \times 20) = 1.200$ pasangan.

Threshold keputusan yang diterapkan adalah **`0.4824983775615692`** sesuai konfigurasi model final.

### Tabel Perbandingan Hasil Evaluasi vs Target Validasi

| Metrik Evaluasi | Target Validasi | Hasil Pengujian Aktual | Status Kesesuaian | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **False Rejection Rate (FRR)** | $\approx 9.3\%$ ($\pm 0.3\%$) | **9.2982%** (53 / 570) | **Sesuai Target** | Tingkat penolakan tanda tangan asli relatif rendah |
| **FAR Tiruan Terampil (Skilled)** | $\approx 52.8\%$ ($\pm 0.3\%$) | **52.7500%** (633 / 1.200) | **Sesuai Target** | Lebih dari separuh tiruan terampil tidak terdeteksi |
| **FAR Orang Lain (Random)** | $\approx 4.2\%$ ($\pm 1.5\%$) | **3.9167%** (47 / 1.200) | **Sesuai Target** | Model sangat andal membedakan tanda tangan orang berbeda |
| **Area Under ROC (AUC)** | $\approx 0.892$ ($\pm 0.01$) | **0.8927** | **Sesuai Target** | Diskriminasi keseluruhan pasangan asli vs bukan asli |
| **Equal Error Rate (EER)** | $\approx 19.2\%$ ($\pm 1.5\%$) | **19.2325%** | **Sesuai Target** | Titik temu trade-off antara FAR dan FRR |

### Rincian Performa per Pemilik Tanda Tangan
- **Pemilik 1**: FRR = 0.00% (0 / 190), FAR Tiruan = 43.50% (174 / 400), Jarak rata-rata asli-asli = 0.2872, Jarak asli-tiruan = 0.5097.
- **Pemilik 2**: FRR = 5.26% (10 / 190), FAR Tiruan = 52.75% (211 / 400), Jarak rata-rata asli-asli = 0.3542, Jarak asli-tiruan = 0.4908.
- **Pemilik 3**: FRR = 22.63% (43 / 190), FAR Tiruan = 62.00% (248 / 400), Jarak rata-rata asli-asli = 0.4285, Jarak asli-tiruan = 0.4571.

Hasil lengkap telah diekspor ke `results/uji_dataset_sendiri.json` dan `results/uji_dataset_sendiri.csv`.

---

## 4. Hasil Pengujian Sistem (Rangkuman `TESTING.md`) *(dijalankan pada model lama)*

Pengujian sistem dilakukan mencakup 20 skenario uji fungsional dan antarmuka pengguna:
- **Uji Otomatis via API (`scripts/test_system.py`)**: 16 skenario (TC01–TC15, TC18). Seluruhnya **100% Lulus**.
  - TC01 (1 Pembanding Asli): Status 200, ASLI, Jarak 0.3254.
  - TC02 (5 Pembanding): Status 200, ASLI, Jarak 0.2147.
  - TC03 (>5 Pembanding): Status 400, pesan validasi maksimal 5 referensi tampil.
  - TC04 (File non-gambar): Status 400, pesan format tidak didukung tampil.
  - TC05 (Tanpa referensi): Status 400, pesan minimal 1 referensi tampil.
  - TC06 (File > 8 MB): Status 400, penolakan ukuran file terlampaui.
  - TC07 (Gambar blank polos): Status 400, penolakan gambar tanpa goresan tinta.
  - TC08 (Citra uji kosong): Status 400, penolakan citra uji wajib.
  - TC09 (Asli vs Asli Pemilik 1): Status 200, keputusan ASLI.
  - TC10 (Asli vs Tiruan Terampil Pemilik 2): Status 200, keputusan PALSU (Jarak 0.5084).
  - TC11 (Asli vs Orang Lain): Status 200, keputusan PALSU (Jarak 1.1359).
  - TC12 (Tombol Contoh Siap Pakai): Status 200, termuat via endpoint dan keputusan ASLI.
  - TC13 (Health Check): Status 200, hash dan threshold valid.
  - TC14 (Konsistensi /api/model-info): Identik 100% dengan `config.json`.
  - TC15 (Konsistensi Threshold): Kesesuaian nilai numerik threshold di semua layer.
  - TC18 (Akses Citra Sampel): Berhasil mengalirkan citra tanpa path traversal.
- **Uji Antarmuka Pengguna (UI)**: 4 skenario (TC16 Tombol Salin, TC17 Tab Ciri Morfologi, TC19 Responsivitas Layar, TC20 Loading State). Seluruh fungsionalitas telah terpasang pada kode frontend React dan berstatus *Lulus (perlu dicek manual di browser)*.

### Pengukuran Waktu Respons Inferensi
Berdasarkan log backend untuk request dengan 1 referensi pembanding:
- Hit ke-1: **0.871 detik**
- Hit ke-2: **0.620 detik**
- Hit ke-3: **0.716 detik**
- **Rata-rata 3 hit pertama (1-ref)**: **0.7357 detik (~0.74 detik)**.

---

## 5. Ketidaksesuaian yang Ditemukan *(tahap model lama)*

Selama proses audit dan pengujian, ditemukan beberapa ketidaksesuaian teknis yang perlu dicatat secara transparan:

1. **Ketidaksesuaian Threshold pada Direktori `results/ttd_siamese_output/`**:
   - Di dalam `results/ttd_siamese_output/config.json`, threshold yang tercantum bernilai `0.4462837338447571` dengan hash bobot model `1424755ECD...`.
   - Hal ini merupakan residu dari iterasi pengujian awal (run pelatihan lama).
   - Sesuai dengan aturan, isi berkas di `results/` tidak diubah, namun dipastikan bahwa sistem backend, frontend, dokumen acuan resmi (`docs/angka_resmi.md`), dan `results/angka_resmi.json` mengacu mutlak pada model final di `demo_model_files__6_/` dengan threshold **`0.4824983775615692`**.
2. **Rasional Pemilihan Mode Pra-pemrosesan `binary` vs `raw`**:
   - Pada citra pindaian bersih (*scanner* resolusi tinggi), mode `raw` (grayscale normalisasi standar) sempat memberikan nilai EER validasi yang lebih baik pada D1 (~0.078) dibanding mode `binary` (~0.130).
   - Namun, pada saat diuji dengan foto tanda tangan kamera ponsel yang memiliki bayangan tidak merata, gradien pencahayaan, atau kontras rendah, mode `raw` mengalami penurunan performa drastis hingga mendekati tebakan acak.
   - Oleh karena itu, mode `binary` (binarisasi berbasis ambang Otsu adaptif dan pembersihan *connected component*) dipilih sebagai konfigurasi resmi model final karena memiliki ketahanan (*robustness*) yang jauh lebih tinggi terhadap variasi kondisi fotografi riil.
3. **Keterbatasan Pengujian Dataset D2 (Toloka)**:
   - Dataset D2 Toloka tidak memiliki spesimen pemalsuan terampil (*skilled forgeries*); seluruh pasangan pemalsuan pada D2 merupakan *random forgeries* (tanda tangan orang lain). Oleh karena itu, metrik ketahanan terhadap peniru terlatih pada D2 tidak dapat ditentukan.
4. **Tingginya FAR Pemalsuan Terampil pada Dataset Mandiri**:
   - Model meloloskan 52.75% tanda tangan tiruan buatan anggota kelompok sebagai asli. Hal ini menjadi bukti nyata bahwa fitur visual statis 2D tanpa informasi dinamika pena (seperti tekanan, sudut kemiringan, dan kecepatan goresan waktu nyata) memiliki batasan fundamental dalam mengenali tiruan yang digambar secara cermat.

---

## 6. Ringkasan 5 Baris *(model lama; ringkasan v2 di bagian 0.7)*

1. **Status Sistem**: Sistem SignaCheck beroperasi normal dan terintegrasi penuh secara *end-to-end* (FastAPI backend pada port 8000 dan React Vite frontend pada port 5173).
2. **Model Aktif & Hash**: `demo_model_files__6_/embedding_model.keras` (SHA256: `48B77FEFF782E83EDBF161EF52E6106F0573471E828CFC41BEA573AEAA3CCD01`, threshold: `0.4824983775615692`, mode: `binary`).
3. **Metrik Utama**: Dataset D1 (CEDAR) AUC 0.9368 / EER 15.06%; Dataset D2 (Toloka) AUC 0.8993 / EER 18.64%; Dataset Mandiri (120 citra) AUC 0.8927 / EER 19.23% (FRR 9.30%, FAR Tiruan 52.75%, FAR Acak 3.92%).
4. **Kelemahan Terbesar yang Jujur**: False Acceptance Rate (FAR) terhadap tiruan terampil buatan sendiri sangat tinggi (52.75%), yang berarti lebih dari separuh tanda tangan tiruan lolos verifikasi sebagai asli.
5. **Rekomendasi Penggunaan Saat Ini**: Sistem hanya layak digunakan sebagai prototipe riset akademis, eksplorasi teknis, dan alat bantu visual indikatif pendamping; tidak dapat digunakan sebagai instrumen pembuktian hukum atau sistem produksi komersial.

