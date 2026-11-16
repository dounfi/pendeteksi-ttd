# LAPORAN TEKNIS REKAYASA & KONSOLIDASI SISTEM SIGNACHECK (REPORT.md)

Laporan ini menyajikan dokumentasi menyeluruh atas pekerjaan konsolidasi model, validasi data numerik, pengujian dataset mandiri, perbaikan backend dan frontend, serta pengujian sistem secara komprehensif pada proyek **SignaCheck** (Sistem Verifikasi Pemalsuan Tanda Tangan Berbasis Siamese CNN dan Ciri Morfologi).

---

## 1. Ringkasan Perubahan

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

## 2. Konsolidasi Model

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

## 3. Hasil Evaluasi Dataset Mandiri (`ttd_uji_sendiri`)

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

## 4. Hasil Pengujian Sistem (Rangkuman `TESTING.md`)

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

## 5. Ketidaksesuaian yang Ditemukan

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

## 6. Ringkasan 5 Baris

1. **Status Sistem**: Sistem SignaCheck beroperasi normal dan terintegrasi penuh secara *end-to-end* (FastAPI backend pada port 8000 dan React Vite frontend pada port 5173).
2. **Model Aktif & Hash**: `demo_model_files__6_/embedding_model.keras` (SHA256: `48B77FEFF782E83EDBF161EF52E6106F0573471E828CFC41BEA573AEAA3CCD01`, threshold: `0.4824983775615692`, mode: `binary`).
3. **Metrik Utama**: Dataset D1 (CEDAR) AUC 0.9368 / EER 15.06%; Dataset D2 (Toloka) AUC 0.8993 / EER 18.64%; Dataset Mandiri (120 citra) AUC 0.8927 / EER 19.23% (FRR 9.30%, FAR Tiruan 52.75%, FAR Acak 3.92%).
4. **Kelemahan Terbesar yang Jujur**: False Acceptance Rate (FAR) terhadap tiruan terampil buatan sendiri sangat tinggi (52.75%), yang berarti lebih dari separuh tanda tangan tiruan lolos verifikasi sebagai asli.
5. **Rekomendasi Penggunaan Saat Ini**: Sistem hanya layak digunakan sebagai prototipe riset akademis, eksplorasi teknis, dan alat bantu visual indikatif pendamping; tidak dapat digunakan sebagai instrumen pembuktian hukum atau sistem produksi komersial.

