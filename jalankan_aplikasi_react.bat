@echo off
title SIGNA-AI - Aplikasi Deteksi Pemalsuan Tanda Tangan (React + FastAPI)
echo ======================================================================
echo   SIGNA-AI // SISTEM DETEKSI TANDA TANGAN (SIAMESE CNN + FORENSIK)
echo ======================================================================
echo.
echo 1. Menjalankan Backend FastAPI (port 8000)...
start "Backend FastAPI" cmd /k "python -m uvicorn server:app --host 127.0.0.1 --port 8000"

echo 2. Menjalankan Frontend React Vite (port 3000)...
start "Frontend React" cmd /k "cd frontend && npm run dev"

echo.
echo Tunggu 3 detik, membuka browser...
timeout /t 3 >nul
start http://localhost:3000

echo ======================================================================
echo Aplikasi React sudah aktif dan dapat diakses di:
echo http://localhost:3000
echo ======================================================================
pause
