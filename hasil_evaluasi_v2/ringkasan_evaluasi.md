AUC / EER (sama untuk semua target)

| Data uji | AUC lama | AUC v2 | EER lama | EER v2 |
|---|---|---|---|---|
| D1 CEDAR | 0.922 | 0.919 | 16.5% | 17.4% |
| D2 BHSig260 (Bengali + Hindi) | 0.825 | 0.926 | 25.3% | 14.9% |
| D3 foto sendiri (3 pemilik) | 0.893 | 0.892 | 19.2% | 19.1% |

Confusion matrix D1 CEDAR (positif = ASLI)

| Model / target | Batas | Asli diterima (TP) | Asli ditolak (FN) | Palsu diterima (FP) | Palsu ditolak (TN) | Akurasi | Akurasi seimbang | Presisi ASLI | Recall ASLI | Spesifisitas | F1 ASLI |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Lama | 0.4825 | 720 | 180 | 112 | 788 | 83.8% | 83.8% | 86.5% | 80.0% | 87.6% | 83.1% |
| v2 0.20 | 0.4302 | 632 | 268 | 63 | 837 | 81.6% | 81.6% | 90.9% | 70.2% | 93.0% | 79.2% |
| v2 0.10 | 0.3570 | 510 | 390 | 31 | 869 | 76.6% | 76.6% | 94.3% | 56.7% | 96.6% | 70.8% |
| v2 0.08 | 0.3369 | 474 | 426 | 23 | 877 | 75.1% | 75.1% | 95.4% | 52.7% | 97.4% | 67.9% |
| v2 0.05 | 0.3095 | 414 | 486 | 8 | 892 | 72.6% | 72.6% | 98.1% | 46.0% | 99.1% | 62.6% |

Confusion matrix D2 BHSig260 (Bengali + Hindi) (positif = ASLI)

| Model / target | Batas | Asli diterima (TP) | Asli ditolak (FN) | Palsu diterima (FP) | Palsu ditolak (TN) | Akurasi | Akurasi seimbang | Presisi ASLI | Recall ASLI | Spesifisitas | F1 ASLI |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Lama | 0.4825 | 3775 | 125 | 2826 | 1074 | 62.2% | 62.2% | 57.2% | 96.8% | 27.5% | 71.9% |
| v2 0.20 | 0.4302 | 3385 | 515 | 665 | 3235 | 84.9% | 84.9% | 83.6% | 86.8% | 82.9% | 85.2% |
| v2 0.10 | 0.3570 | 2998 | 902 | 306 | 3594 | 84.5% | 84.5% | 90.7% | 76.9% | 92.2% | 83.2% |
| v2 0.08 | 0.3369 | 2834 | 1066 | 241 | 3659 | 83.2% | 83.2% | 92.2% | 72.7% | 93.8% | 81.3% |
| v2 0.05 | 0.3095 | 2579 | 1321 | 153 | 3747 | 81.1% | 81.1% | 94.4% | 66.1% | 96.1% | 77.8% |

Confusion matrix D3 foto sendiri (3 pemilik) (positif = ASLI)

| Model / target | Batas | Asli diterima (TP) | Asli ditolak (FN) | Palsu diterima (FP) | Palsu ditolak (TN) | Akurasi | Akurasi seimbang | Presisi ASLI | Recall ASLI | Spesifisitas | F1 ASLI |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Lama | 0.4825 | 517 | 53 | 683 | 1717 | 75.2% | 81.1% | 43.1% | 90.7% | 71.5% | 58.4% |
| v2 0.20 | 0.4302 | 454 | 116 | 422 | 1978 | 81.9% | 81.0% | 51.8% | 79.6% | 82.4% | 62.8% |
| v2 0.10 | 0.3570 | 370 | 200 | 221 | 2179 | 85.8% | 77.9% | 62.6% | 64.9% | 90.8% | 63.7% |
| v2 0.08 | 0.3369 | 341 | 229 | 177 | 2223 | 86.3% | 76.2% | 65.8% | 59.8% | 92.6% | 62.7% |
| v2 0.05 | 0.3095 | 295 | 275 | 142 | 2258 | 86.0% | 72.9% | 67.5% | 51.8% | 94.1% | 58.6% |
