# Ringkasan Model v2 (hasil notebook)

- Model: `embedding_model.keras`
- Target FAR: **8%**
- Batas k=1: **0.3774**
- Batas k=1..5: 0.3774, 0.3396, 0.3259, 0.3142, 0.3050
- SHA256: `211EDA03F3570A3A6044F792808504EE6955D7AB6BD3DCD0F111FDB9E7DB55E0`

## AUC / EER pada data uji

| Data uji | AUC | EER |
|---|---|---|
| D1 | 0.9179 | 16.3% |
| D2 | 0.9116 | 16.8% |
| D3 | 0.8765 | 20.7% |

## Confusion matrix (target aktif, positif = ASLI)

| Data uji | Batas | TP | FN | FP | TN | Akurasi | FRR | FAR | Tiruan mahir lolos |
|---|---|---|---|---|---|---|---|---|---|
| D1 | 0.3774 | 466 | 434 | 33 | 867 | 74.1% | 48.2% | 3.7% | 33/675 |
| D2 | 0.3774 | 2865 | 1035 | 321 | 3579 | 82.6% | 26.5% | 8.2% | 269/2925 |
| D3 | 0.3774 | 346 | 224 | 253 | 2147 | 83.9% | 39.3% | 10.5% | 243/1200 |

## Batas per jumlah pembanding

| k | target 0.20 | target 0.10 | target 0.08 | target 0.05 |
|---|---|---|---|---|
| 1 | 0.4763 | 0.3979 | 0.3774 | 0.3433 |
| 2 | 0.4287 | 0.3560 | 0.3396 | 0.3104 |
| 3 | 0.4107 | 0.3403 | 0.3259 | 0.2955 |
| 4 | 0.3964 | 0.3302 | 0.3142 | 0.2874 |
| 5 | 0.3864 | 0.3220 | 0.3050 | 0.2813 |

## Catatan

- Batas dipilih hanya dari validasi; data uji tidak dipakai memilih apa pun.
- FAR dan FRR saling menukar. Target FAR kecil membayar dengan lebih banyak asli ditolak / 'BELUM YAKIN'.
- D3 hanya 3 pemilik, jadi angkanya bersifat indikasi.
