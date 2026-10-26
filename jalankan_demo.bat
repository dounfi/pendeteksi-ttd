@echo off
title Aplikasi Deteksi Pemalsuan Tanda Tangan
echo =========================================================
echo   Menjalankan Sistem Deteksi Tanda Tangan (Siamese CNN)
echo =========================================================
echo.
echo Membuka aplikasi Streamlit di browser...
echo Browser akan otomatis terbuka di http://localhost:8501
echo Tekan Ctrl+C di terminal ini jika ingin menghentikan aplikasi.
echo.
python -m streamlit run app.py
pause
