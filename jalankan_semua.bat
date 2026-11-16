@echo off
title SignaCheck Launcher
echo ============================================================
echo   SignaCheck - Sistem Verifikasi Tanda Tangan (Siamese CNN)
echo ============================================================
echo.

set "SCRIPT_DIR=%~dp0"

echo [1/3] Menjalankan Backend FastAPI di port 8000...
start "SignaCheck Backend" cmd /k "cd /d "%SCRIPT_DIR%" && python backend_api.py"

echo [2/3] Menjalankan Frontend React Vite di port 5173...
where bun >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start "SignaCheck Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend v2" && bun run dev --port 5173"
) else (
    start "SignaCheck Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend v2" && npm run dev -- --port 5173"
)

echo [3/3] Menunggu 5 detik agar server siap...
timeout /t 5 /nobreak >nul

echo Membuka browser di http://localhost:5173 ...
start http://localhost:5173

echo.
echo ============================================================
echo Aplikasi SignaCheck sedang berjalan!
echo   - Backend  : http://127.0.0.1:8000
echo   - Frontend : http://localhost:5173
echo.
echo Untuk mematikan aplikasi, cukup tutup kedua jendela CMD di atas.
echo ============================================================
echo.
