# pendeteksi-ttd

Sistem Verifikasi & Deteksi Keaslian Tanda Tangan berbasis Siamese CNN (Offline Signature Verification).

## Deskripsi
Aplikasi verifikasi tanda tangan digital yang membandingkan tanda tangan referensi dan tanda tangan uji menggunakan Siamese Convolutional Neural Network (CNN) serta analisis forensik citra.

## Fitur Utama
- Verifikasi kemiripan tanda tangan (Genuine vs Forgery) dengan Siamese CNN
- Ekstraksi fitur visual (ketebalan goresan, fluiditas, rasio aspek, kerapatan piksel)
- Evaluasi visual interaktif dengan antarmuka React + Tailwind CSS
- API Backend untuk inferensi model

## Struktur Folder
- `server.py` / `app.py`: Backend server
- `frontend/`: Dashboard antarmuka web (React + Vite + Tailwind)
- `demo_model_files (5)/`: Model Siamese CNN (`embedding_model.keras`) & utilitas forensik
- `Siamese_CNN_Deteksi_TTD.ipynb`: Eksperimen & training model
- `contoh_ttd/`: Sampel gambar tanda tangan
- `hasil_laporan (2)/`: Laporan metrik performa & visualisasi kurva evaluasi
