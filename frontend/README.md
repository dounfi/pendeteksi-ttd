# Cek Tanda Tangan — Offline Signature Verification (Siamese CNN)

Website interaktif satu halaman untuk edukasi dan alat periksa keaslian tanda tangan berbasis **Siamese Convolutional Neural Network (CNN)** dan pengolahan citra komputer klasik.

## Stack Teknologi
- **Frontend:** React 19 + TypeScript + TailwindCSS (v3) + GSAP ScrollTrigger
- **Backend:** FastAPI + Uvicorn + TensorFlow / Keras 3 + OpenCV

## Cara Menjalankan

### 1. Jalankan Backend (FastAPI)
Di folder utama proyek (`ttd proyek deteksi ttd`):
```powershell
python -m uvicorn server:app --host 127.0.0.1 --port 8000
```

### 2. Jalankan Frontend (React + Vite)
Di folder `frontend`:
```powershell
npm install
npm run dev
```

Buka browser pada alamat: **http://localhost:3000**

---
*Proyek Visual Komputer Cerdas — Deteksi Indikasi Pemalsuan Tanda Tangan*
