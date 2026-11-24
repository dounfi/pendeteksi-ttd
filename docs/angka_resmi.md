# Angka Resmi SignaCheck

> Dibuat otomatis oleh `scripts/build_numbers.py`  
> Tanggal: 2026-11-16T02:40:12.074660+00:00  
> Sumber: `config.json`

> [!IMPORTANT]
> Dokumen ini adalah **satu-satunya** sumber angka resmi untuk slide dan laporan.
> Jangan menyalin angka secara manual — jalankan ulang skrip ini setiap ada perubahan.

## Identitas Model

| Parameter | Nilai |
|-----------|-------|
| Nama model | gabungan D1+D2 |
| TensorFlow | 2.20.0 |
| Keras | 3.13.2 |
| Preprocess mode | `binary` |
| Threshold (θ) | 0.4824983775615692 |
| Ragu z | 1.7437371015548706 |
| Ragu margin | 0.10673275589942932 |

## Metrik Per Dataset (D1 & D2)

| Metrik | D1 | D2 |
|--------|----|----|
| AUC | 0.9368 | 0.8993 |
| EER | 15.06% | 18.64% |
| Akurasi | 0.8472 | 0.8147 |
| Presisi | 0.8134 | 0.8154 |
| Recall | 0.9011 | 0.8136 |
| F1 | 0.8550 | 0.8145 |
| FRR | 20.67% | 18.42% |
| FAR | 9.89% | 18.64% |
| FAR skilled forgery | 18.00% | – |
| FAR random forgery | 1.78% | 18.64% |

## Perbandingan Skenario Fusi

| Dataset | Skenario | AUC | EER | Akurasi | FAR | FRR |
|---------|----------|-----|-----|---------|-----|-----|
| D1 | model saja | 0.9368 | 15.06% | 0.8472 | 9.89% | 20.67% |
| D1 | ciri klasik saja | 0.8688 | 20.44% | 0.7944 | 36.00% | 5.11% |
| D1 | fusi (model + ciri) | 0.9401 | 14.72% | 0.8583 | 11.22% | 17.11% |
| D2 | model saja | 0.8993 | 18.64% | 0.8147 | 18.64% | 18.42% |
| D2 | ciri klasik saja | 0.7945 | 28.23% | 0.7023 | 10.64% | 48.90% |
| D2 | fusi (model + ciri) | 0.8958 | 18.86% | 0.8191 | 15.13% | 21.05% |

## Banyak Pembanding – D1

| k | AUC | AUC std | EER | EER std |
|---|-----|---------|-----|---------|
| 1 | 0.9381 | 0.0112 | 14.68% | 2.42% |
| 2 | 0.9490 | 0.0090 | 13.36% | 2.22% |
| 3 | 0.9499 | 0.0052 | 13.54% | 0.92% |
| 5 | 0.9552 | 0.0011 | 12.26% | 0.81% |

## Banyak Pembanding – D2

| k | AUC | AUC std | EER | EER std |
|---|-----|---------|-----|---------|
| 1 | 0.8991 | 0.0144 | 18.64% | 2.00% |
| 2 | 0.9220 | 0.0072 | 16.19% | 1.56% |
| 3 | 0.9261 | 0.0166 | 16.45% | 2.27% |
| 5 | 0.9417 | 0.0089 | 12.62% | 1.39% |

## Dataset Sendiri (D3 – ttd_uji_sendiri)

### Keseluruhan

| Metrik | Nilai | Target Validasi |
|--------|-------|-----------------|
| FRR | 9.30% | ~9.3% (±0.3%) |
| FAR tiruan | 52.75% | ~52.8% (±0.3%) |
| FAR orang lain | 3.92% | ~4.2% (±1.5%) |
| AUC | 0.8927 | ~0.892 (±0.01) |
| EER | 19.23% | ~19.2% (±1.5%) |
| Threshold dipakai | 0.4824983775615692 | (dari config.json) |

### Per Pemilik

| Pemilik | FRR | FAR tiruan | FAR orang lain | AUC | EER |
|---------|-----|-----------|----------------|-----|-----|
| 1 | 1.58% | 66.75% | 3.75% | 0.9099 | 17.63% |
| 2 | 21.58% | 43.00% | 6.50% | 0.8314 | 23.98% |
| 3 | 4.74% | 48.50% | 1.50% | 0.9465 | 13.72% |

### Banyak Pembanding – D3

| k | AUC | AUC std | EER | EER std |
|---|-----|---------|-----|---------|
| 1 | 0.9291 | 0.0275 | 14.46% | 4.30% |
| 2 | 0.9401 | 0.0103 | 12.16% | 1.81% |
| 3 | 0.9429 | 0.0117 | 11.44% | 2.45% |
| 5 | 0.9470 | 0.0061 | 10.96% | 1.58% |

