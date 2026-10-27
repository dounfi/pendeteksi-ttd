export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Mengapa tanda tangan dari orang yang sama tidak pernah identik secara piksel?",
    options: [
      "Karena variasi alami motorik tangan, kecepatan tarikan, dan sudut pena",
      "Karena pigmen tinta pulpen berubah warna setiap saat",
      "Karena sensor kamera selalu memodifikasi piksel acak"
    ],
    correct: 0,
    explanation: "Variasi intra-personal adalah karakteristik alami motorik manusia saat menandatangani dokumen."
  },
  {
    id: 2,
    question: "Apa fungsi utama arsitektur Siamese CNN dalam verifikasi tanda tangan?",
    options: [
      "Merekam nama dan biodata pemilik tanda tangan",
      "Mengekstraksi representasi laten ke ruang vektor dengan bobot konvolusi terbagi",
      "Mengubah goresan tanda tangan menjadi teks digital"
    ],
    correct: 1,
    explanation: "Arsitektur Siamese menggunakan bobot terbagi (shared weights) untuk memetakan dua tanda tangan ke ruang vektor sehingga jaraknya dapat diukur langsung."
  },
  {
    id: 3,
    question: "Apa konsekuensi jika ambang batas keputusan disetel terlalu ketat?",
    options: [
      "Tanda tangan pemilik asli rentan ditolak keliru (FRR meningkat)",
      "Akurasi model otomatis mencapai nilai sempurna",
      "Proses komputasi membutuhkan waktu berkali-kali lipat"
    ],
    correct: 0,
    explanation: "Ambang batas yang terlalu ketat menolak variasi alami pemilik sah, sehingga meningkatkan False Rejection Rate (FRR)."
  },
  {
    id: 4,
    question: "Mengapa tahap binerisasi Otsu dilakukan sebelum ekstraksi fitur CNN?",
    options: [
      "Untuk menambahkan efek artistik pada gambar tanda tangan",
      "Untuk memisahkan goresan tinta dari serat kertas dan meratakan pencahayaan",
      "Untuk melipatgandakan resolusi berkas citra"
    ],
    correct: 1,
    explanation: "Metode Otsu menghitung ambang intensitas optimal untuk memisahkan goresan pena dari latar belakang kertas."
  },
  {
    id: 5,
    question: "Berapa jumlah sampel tanda tangan pembanding yang disarankan untuk perbandingan stabil?",
    options: [
      "Cukup satu tanda tangan tanpa pembanding",
      "Minimal 20 sampel tanda tangan",
      "Satu sampai lima tanda tangan asli"
    ],
    correct: 2,
    explanation: "Satu hingga lima tanda tangan pembanding memungkinkan sistem menghitung representasi rata-rata yang lebih stabil terhadap variasi goresan."
  }
];
