@echo off
REM ============================================================
REM  ganti_target_far.bat - memilih titik operasi model v2
REM  Pemakaian:  ganti_target_far.bat 0.20
REM              ganti_target_far.bat 0.10
REM              ganti_target_far.bat 0.08
REM              ganti_target_far.bat 0.05
REM  Skrip ini hanya menyalin config_target_far_X.json menjadi
REM  config.json. SETELAH ITU backend harus dijalankan ulang.
REM ============================================================
setlocal
set "T=%~1"
set "DIR=%~dp0demo_model_files_v2"

if "%T%"=="" goto :pakai
if not exist "%DIR%\config_target_far_%T%.json" goto :tidakada

copy /Y "%DIR%\config_target_far_%T%.json" "%DIR%\config.json" >nul
if errorlevel 1 goto :gagal

echo.
echo Config aktif sekarang: target_far %T%
python -c "import json; c=json.load(open(r'%DIR%\config.json',encoding='utf-8')); print('Batas keputusan 1 pembanding :', round(c['threshold'],4)); print('Batas per jumlah pembanding  :', {k: round(v,4) for k,v in c['threshold_per_k'].items()})"
echo.

netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo PERHATIAN: backend di port 8000 sedang berjalan dan MASIH memakai config lama.
    echo Tutup jendela "SignaCheck Backend", lalu jalankan ulang jalankan_semua.bat.
) else (
    echo Backend belum berjalan. Jalankan jalankan_semua.bat untuk memakai config ini.
)
exit /b 0

:pakai
echo Pemakaian: ganti_target_far.bat 0.20 ^| 0.10 ^| 0.08 ^| 0.05
exit /b 1

:tidakada
echo File tidak ditemukan: %DIR%\config_target_far_%T%.json
echo Pilihan yang tersedia: 0.20  0.10  0.08  0.05
exit /b 1

:gagal
echo Gagal menyalin config. Pastikan file config.json tidak sedang dibuka program lain.
exit /b 1
