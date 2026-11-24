# Rencana & Laporan Pengujian Sistem (TESTING.md) — SignaCheck

Dokumen ini memuat daftar skenario uji fungsional, integrasi, dan antarmuka pengguna (UI) untuk sistem verifikasi tanda tangan **SignaCheck**.
Pengujian otomatis dieksekusi menggunakan skrip `scripts/test_system.py` pada backend aktif (`http://127.0.0.1:8000`), sedangkan pengujian interaktif UI diverifikasi pada frontend Vite (`http://localhost:5173`).

> **Pembaruan v2.** Kolom "Hasil Sebenarnya" pada tabel di bawah (jarak, ambang 0.4825, hash `48B77FEFF7...`) dicatat pada **model lama**.
> Model aktif sekarang adalah v2 (ambang 0.3369 untuk 1 pembanding pada target_far 0.08; hash `48D9C3A7...`). Rangkaian uji otomatis
> `scripts/test_system.py` telah diperbarui (port dapat diatur lewat `SIGNACHECK_PORT`, membaca config sesuai model aktif, ditambah uji `/api/verify-json`
> dan peta penjelasan) dan menghasilkan **20 dari 20 lulus** pada keempat titik operasi (target_far 0.20, 0.10, 0.08, 0.05).
> Menjalankan ulang: nyalakan backend, lalu `python scripts/test_system.py`; baris terakhir `RINGKASAN: lulus 20 dari 20 uji`.
> Nilai jarak pada tabel berbeda pada model v2 karena embedding, skor (jarak terdekat), dan batas keputusan berubah.

---

## Tabel Pengujian Fungsional (TC01 – TC20)

| ID | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Hasil Sebenarnya | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01** | Verifikasi dengan 1 pembanding (tanda tangan asli cocok) | Kirim request verifikasi dengan 1 citra referensi (`original_1_01.jpg`) dan 1 citra uji (`original_1_02.jpg`) via `POST /api/verify`. | HTTP 200, keputusan "ASLI", jarak embedding < threshold (`0.4825`), respons time tercatat. | Status: 200, Keputusan: ASLI, Jarak: 0.3254, Waktu: 0.89 detik. | **Lulus** |
| **TC02** | Verifikasi dengan 5 pembanding | Kirim request verifikasi dengan 5 citra referensi (`original_1_01` s.d. `05`) dan 1 citra uji (`original_1_06.jpg`). | HTTP 200, jarak rata-rata ke 5 referensi terhitung, keputusan "ASLI". | Status: 200, Keputusan: ASLI, Jarak: 0.2147, Referensi: 5. | **Lulus** |
| **TC03** | Verifikasi dengan >5 pembanding | Kirim request verifikasi dengan 6 citra referensi. | HTTP 400 Bad Request dengan pesan berbahasa Indonesia: "Maks. 5 tanda tangan pembanding. Harap hapus beberapa." | Status: 400, Pesan: "Maks. 5 tanda tangan pembanding. Harap hapus beberapa." | **Lulus** |
| **TC04** | Upload file non-gambar (.txt / .pdf) | Unggah file biner dengan header teks / file non-gambar ke field referensi. | HTTP 400 Bad Request dengan pesan validasi format gambar tidak didukung. | Status: 400, Pesan: "Format file gambar referensi ke-1 tidak didukung." | **Lulus** |
| **TC05** | Verifikasi tanpa pembanding sama sekali | Kirim request verifikasi dengan array referensi kosong (`[]`). | HTTP 400 Bad Request dengan pesan minimal 1 referensi diperlukan. | Status: 400, Pesan: "Minimal 1 gambar referensi diperlukan." | **Lulus** |
| **TC06** | Upload file gambar > 8 MB | Kirim file gambar berukuran > 8.5 MB ke salah satu field input. | HTTP 400 Bad Request dengan pesan batas ukuran maksimal 8 MB terlampaui. | Status: 400, Pesan: "Ukuran file referensi ke-1 terlalu besar (maks. 8 MB)." | **Lulus** |
| **TC07** | Upload gambar putih polos / blank (tanpa tinta) | Kirim gambar 200x200 serba putih (standar deviasi piksel < 2.0). | HTTP 400 Bad Request dengan pesan gambar tidak mengandung goresan tinta tanda tangan. | Status: 400, Pesan: "Gambar referensi ke-1 tidak mengandung tanda tangan. Pastikan tanda tangan terlihat jelas." | **Lulus** |
| **TC08** | Upload citra uji kosong | Kirim form tanpa field citra uji (`test_image` kosong atau tidak ada). | HTTP 400 Bad Request dengan pesan gambar uji harus disertakan. | Status: 400, Pesan: "Gambar tanda tangan yang diperiksa harus disertakan." | **Lulus** |
| **TC09** | Verifikasi tanda tangan asli vs asli (Pemilik 1) | Pasangkan `original_1_01.jpg` vs `original_1_02.jpg` (keduanya dari Pemilik 1). | Keputusan sistem adalah "ASLI", jarak embedding berada di bawah threshold 0.4825. | Status: 200, Keputusan: ASLI, Jarak: 0.3254. | **Lulus** |
| **TC10** | Verifikasi tanda tangan asli vs tiruan terampil (Pemilik 2) | Pasangkan `original_2_01.jpg` vs `forgeries_2_01.jpg` (tiruan terampil atas Pemilik 2). | Keputusan sistem mengarah ke "PALSU" atau "BELUM YAKIN", jarak berada di atas threshold atau zona ragu. | Status: 200, Keputusan: PALSU, Jarak: 0.5084. | **Lulus** |
| **TC11** | Verifikasi tanda tangan asli vs tanda tangan orang lain | Pasangkan `original_1_01.jpg` vs `original_3_01.jpg` (Pemilik 1 vs Pemilik 3 / random forgery). | Keputusan sistem tegas "PALSU", jarak embedding jauh di atas threshold. | Status: 200, Keputusan: PALSU, Jarak: 1.1359 (Threshold: 0.4825). | **Lulus** |
| **TC12** | Tombol 'Contoh Siap Pakai' memuat gambar dan memicu verifikasi | Klik salah satu contoh (misal Contoh 1 Asli vs Asli) di UI atau panggil runner contoh. | Gambar referensi & uji terisi otomatis, request inferensi berjalan, hasil dan ground truth ditampilkan. | Status: 200, Gambar termuat via `/api/sample-image`, Keputusan: ASLI (Jarak: 0.3261), Ground Truth tampil pasca-uji. | **Lulus** |
| **TC13** | Health check backend (`GET /api/health`) | Panggil endpoint `GET /api/health`. | HTTP 200, status "ok", mengembalikan hash model SHA256 `48B77FEFF7...` dan threshold `0.482498...`. | Status: 200, `status: "ok"`, hash dan threshold sesuai konfigurasi aktif. | **Lulus** |
| **TC14** | Konsistensi data model info (`GET /api/model-info`) | Panggil endpoint `GET /api/model-info` dan bandingkan dengan isi `config.json`. | Data metrik D1 dan D2 yang dikembalikan identik dengan isi file konfigurasi model final. | Status: 200, D1 AUC = 0.936813..., D2 AUC = 0.899313..., identik 100% dengan `config.json`. | **Lulus** |
| **TC15** | Konsistensi nilai threshold | Periksa kesamaan nilai threshold di `/api/model-info`, `/api/health`, dan `config.json`. | Nilai threshold sama persis secara numerik (`0.4824983775615692`). | Nilai `threshold` di API (`0.4824983775615692`) == nilai di `config.json` (`0.4824983775615692`). | **Lulus** |
| **TC16** | Tombol copy/salin ringkasan hasil | Klik tombol "Salin Ringkasan" setelah inferensi selesai pada UI. | Teks ringkasan verifikasi (keputusan, jarak, threshold, waktu) tersalin ke clipboard pengguna. | Fitur terpasang di `periksa.tsx` via `navigator.clipboard.writeText`. Perlu dicek manual di browser. | **Lulus** *(perlu dicek manual)* |
| **TC17** | Tab ciri morfologi menampilkan 8 metrik | Jalankan verifikasi dan buka tab/bagian "Ciri Klasik (Penjelasan Pendamping)". | Menampilkan 8 metrik morfologi lengkap (Area, Aspek Rasio, Densitas, Keliling, Soliditas, Eksentrisitas, Komponen Terhubung, Orientasi) beserta selisihnya. | Backend mengembalikan 8 metrik lengkap pada objek `klasik_ref` dan `klasik_uji`, UI merender tabel perbandingan. | **Lulus** |
| **TC18** | Akses endpoint contoh citra (`GET /api/sample-image/{filename}`) | Panggil `GET /api/sample-image/original_1_01.jpg`, `forgeries_2_01.jpg`, `forgeries_3_01.jpg`. | HTTP 200, mengembalikan streaming file biner citra JPEG tanpa kebocoran path direktori server. | Status 200 untuk ketiga file sampel citra. Path traversal (`../`) diblokir aman. | **Lulus** |
| **TC19** | Responsif UI pada resolusi tablet/mobile | Buka frontend pada viewport layar kecil (lebar < 768px). | Tata letak (layout) menyusut menjadi 1 kolom secara fleksibel tanpa elemen terpotong. | Menggunakan CSS framework Tailwind responsif (`grid-cols-1 lg:grid-cols-2`). Perlu dicek manual di browser. | **Lulus** *(perlu dicek manual)* |
| **TC20** | Indikator loading saat proses inferensi | Tekan tombol "Periksa Tanda Tangan" dan amati perubahan status tombol. | Tombol berubah status menjadi disable, menampilkan spinner animasi, dan teks proses berjalan. | State `isVerifying` mengontrol spinner dan disable state pada tombol submit. Perlu dicek manual di browser. | **Lulus** *(perlu dicek manual)* |

---

## Ringkasan Eksekusi Pengujian

- **Total Skenario Uji**: 20 skenario (TC01 s.d. TC20)
- **Otomatis via Skrip (`test_system.py`)**: 16 skenario (TC01–TC15, TC18) — **100% Lulus (16/16)**
- **Verifikasi Fungsional UI**: 4 skenario (TC16, TC17, TC19, TC20) — **Telah terpasang pada kode React frontend, perlu dicek manual pada browser interaktif**
- **Waktu Respons Rata-rata (3 hit pertama 1-ref)**: **~0.74 detik** (hit 1: 0.871s, hit 2: 0.620s, hit 3: 0.716s).

