# SignaCheck ✍️ — Sistem Verifikasi Keaslian Tanda Tangan

> **Mata Kuliah:** Visual Komputasi Cerdas (Smart Computer Vision)  
> **Arsitektur:** Siamese Convolutional Neural Network (CNN) + Ekstraksi Ciri Morfologi Klasik  
> **Pendekatan:** *Writer-Independent* (Dapat mengevaluasi tanda tangan orang baru tanpa perlu melatih ulang model)  
> ⚠️ **Catatan Akademik:** Sistem ini adalah **prototipe riset**, menghasilkan **indikasi pendukung, bukan alat bukti hukum**.

---

## 🚀 Panduan Cepat Menjalankan Aplikasi (Untuk Teman Kelompok)

Hanya perlu **3 Langkah Mudah** untuk menjalankan proyek ini di laptop masing-masing:

### Langkah 1: Pastikan Prasyarat Sudah Terpasang
- **Python 3.10+** (Centang *"Add Python to PATH"* saat instalasi).
- **Node.js 18+** atau **Bun** (untuk menjalankan antarmuka web).

### Langkah 2: Install Dependensi (Cukup Sekali Saja)
Buka terminal (Command Prompt / PowerShell) di folder proyek ini:

1. **Install Library Backend (Python):**
   ```bash
   pip install -r requirements.txt
   ```
2. **Install Library Frontend (Web):**
   ```bash
   cd "frontend v2"
   npm install
   ```
   *(Atau gunakan perintah `bun install` jika kamu menggunakan Bun).*

### Langkah 3: Jalankan Aplikasi Sekali Klik!
Cukup **klik dua kali (double-click)** file:
```text
⚡ jalankan_semua.bat
```
File ini secara otomatis akan:
1. Menyalakan server **Backend FastAPI** di `http://127.0.0.1:8000`.
2. Menyalakan web **Frontend React Vite** di `http://localhost:5173`.
3. Membuka browser kamu secara otomatis ke halaman aplikasi.

*(Untuk mematikan aplikasi, cukup tutup kedua jendela Command Prompt yang terbuka).*

---

## 🎯 Panduan Praktis Saat Demo & Presentasi

Saat maju presentasi di depan dosen atau kelas, gunakan alur demo berikut agar presentasi berjalan mulus:

### 1. Gunakan Fitur "Contoh Siap Pakai" (Paling Aman untuk Demo)
Di halaman **Periksa Tanda Tangan**, sudah disediakan 3 tombol skenario instan yang langsung memuat gambar dan menguji sistem:
- **Contoh 1: Asli vs Asli (Pemilik 1)** $\rightarrow$ Menghasilkan status **ASLI** (Jarak $\approx 0.32$).
- **Contoh 2: Asli vs Tiruan Terampil (Pemilik 2)** $\rightarrow$ Menghasilkan status **PALSU / BELUM YAKIN** (Jarak $\approx 0.50$).
- **Contoh 3: Asli vs Orang Lain (Pemilik 1 vs 3)** $\rightarrow$ Menghasilkan status **PALSU** (Jarak $\approx 1.13$).
*Setelah hasil keluar, sistem akan menampilkan label **Ground Truth** untuk membuktikan kebenaran deteksi.*

### 2. Jika Menguji Tanda Tangan Baru (Live Test)
- Selalu masukkan **minimal 2 sampai 3 tanda tangan asli** di kolom referensi/pembanding untuk mengantisipasi variasi alami tanda tangan manusia (*intra-writer variability*).
- Masukkan **1 tanda tangan yang mau diperiksa** di kolom tanda tangan uji.
- Klik **"Periksa Tanda Tangan"**.

### 3. Cara Membaca Output Sistem
- **Hijau (ASLI):** Rata-rata jarak $\le 0.4825$ (sangat mirip dengan pola pemilik asli).
- **Kuning (BELUM YAKIN):** Rata-rata jarak antara $0.4825$ s.d. $0.5825$ (ada kemiripan visual namun melebihi batas keyakinan model; sarankan tambah pembanding).
- **Merah (PALSU / BERBEDA):** Rata-rata jarak $> 0.5825$ (pola goresan berbeda signifikan).
- **Tabel 8 Ciri Morfologi:** Menampilkan penjelasan pendamping bentuk fisik (luas area, keliling, kerapatan, aspek rasio, kemiringan sudut, dll.).

---

## 📁 Struktur Direktori Proyek

Proyek ini telah dikonsolidasi dan dirapikan:

```text
📁 project deteksi ttd palsu/
 │
 ├── 📄 requirements.txt           # Daftar pustaka Python yang diperlukan
 ├── ⚡ jalankan_semua.bat          # Skrip peluncur otomatis 1-klik
 ├── 🐍 backend_api.py             # Server FastAPI (REST API, validasi file, logging)
 ├── 📓 ttd-pendeteksi.ipynb       # Notebook Jupyter utama riset, pelatihan, & evaluasi
 │
 ├── 📁 demo_model_files__6_/      # MODEL RESMI FINAL
 │    ├── embedding_model.keras    # Bobot model Siamese CNN (SHA256: 48B77FEF...)
 │    ├── config.json              # Konfigurasi resmi (threshold 0.4825, mode binary)
 │    ├── preprocess.py            # Modul binarisasi Otsu & padding 128x256
 │    └── forensik.py              # Ekstraksi 8 ciri morfologi klasik
 │
 ├── 📁 frontend v2/               # APLIKASI WEB RESMI (React + TypeScript + Vite)
 ├── 📁 ttd_uji_sendiri/           # DATASET MANDIRI KELOMPOK (120 citra, 3 pemilik)
 ├── 📁 contoh_ttd/                # Citra sampel untuk demo instan
 ├── 📁 scripts/                   # Skrip evaluasi mandiri & pengujian otomatis
 ├── 📁 docs/ & results/           # Angka resmi model & hasil evaluasi numerik
 ├── 📁 hasil_laporan (2)/         # Grafik kurva loss, ROC, dan visualisasi laporan
 └── 📁 arsip_lama/                # Arsip rapi seluruh versi lama (HTML v1, Streamlit, dll.)
```

---

## 📊 Angka Kunci & Fakta Model (Cheatsheet untuk Menjawab Dosen)

| Pertanyaan Dosen | Fakta / Jawaban yang Benar |
| :--- | :--- |
| **Berapa akurasi model?** | - Dataset D1 (CEDAR): **AUC 0.9368**, Akurasi **84.72%**, EER **15.06%**.<br>- Dataset D2 (Toloka): **AUC 0.8993**, Akurasi **81.47%**, EER **18.64%**.<br>- Dataset Mandiri (120 citra): **AUC 0.8927**, EER **19.23%**. |
| **Kenapa pakai Siamese CNN?** | Karena bersifat **Writer-Independent**. Model mempelajari fungsi jarak kemiripan (*metric learning*), sehingga bisa memverifikasi tanda tangan orang baru tanpa perlu melatih ulang model. |
| **Berapa threshold keputusannya?** | **`0.4825`** (tepatnya `0.482498...` dari hasil optimasi EER pada saat pelatihan). |
| **Kenapa binarisasi (mode binary)?** | Agar kebal terhadap bayangan, variasi lampu ruangan, dan perbedaan kertas pada foto kamera HP. |
| **Kenapa FAR tiruan mandiri tinggi (52.75%)?** | **(Jawab jujur!)** Karena sistem ini adalah *offline signature verification* (citra 2D statis). Sistem tidak memiliki sensor dinamika waktu nyata (seperti tekanan pena, kecepatan goresan, dan akselerasi), sehingga tiruan yang digambar sangat hati-hati berpeluang lolos secara visual. |
| **Apa fungsi 8 ciri morfologi?** | Murni sebagai **penjelasan pendamping (*supporting context*)** visual bagi manusia untuk membandingkan geometri fisik tanda tangan; **tidak memengaruhi** kalkulasi jarak model neural network. |

---

## 📑 Dokumen Teknis Lainnya
- **[REPORT.md](REPORT.md):** Laporan teknis rekayasa, konsolidasi model, hasil evaluasi dataset mandiri, dan catatan ketidaksesuaian.
- **[TESTING.md](TESTING.md):** Matriks pengujian fungsional sistem (20 skenario uji TC01–TC20).
- **[MODEL_CARD.md](MODEL_CARD.md):** Kartu spesifikasi teknis model kecerdasan buatan.

---
*Dibuat untuk Tugas Besar Visual Komputasi Cerdas — Tim SignaCheck*
