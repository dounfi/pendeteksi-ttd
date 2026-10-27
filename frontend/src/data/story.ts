export const STORY_CHAPTERS = [
  {
    id: 1,
    title: "Satu Dokumen, Berjuta Pertanyaan",
    subtitle: "Dua goresan pena di atas secarik kertas. Bisakah komputer membedakan mana yang asli dan mana yang tiruan?",
  },
  {
    id: 2,
    title: "Tanda Tangan Asli Pun Tidak Pernah Sama",
    subtitle: "Tangan manusia memiliki variasi alami mikro. Suasana hati, kecepatan, dan alat tulis membuat goresan selalu berbeda secara piksel.",
  },
  {
    id: 3,
    title: "Pemalsu itu rapi. Tapi tidak sama.",
    subtitle: "Peniru terampil berusaha menggambar bentuk luar, namun kehilangan ritme tarikan, tremor garis, dan distribusi tekanan pena asli.",
  },
  {
    id: 4,
    title: "Komputer Tidak Melihat Seperti Kita",
    subtitle: "Citra kamera harus dibersihkan melalui 5 tahap pra-pemrosesan: grayscale, koreksi bayangan, binerisasi Otsu, crop kontur, dan kanvas standar 128x256.",
  },
  {
    id: 5,
    title: "Jaringan Kembar Siamese CNN",
    subtitle: "Dua cabang neural network dengan bobot konvolusi yang identik (Shared Weights) mengubah bentuk tanda tangan menjadi koordinat 64 dimensi.",
  },
  {
    id: 6,
    title: "Ruang Vektor & Ambang Batas Jarak",
    subtitle: "Jarak Euclidean dihitung: jika jarak lebih kecil dari 0.4811, tanda tangan dinyatakan berasal dari orang yang sama.",
  },
  {
    id: 7,
    title: "Dilema Pagar Keputusan (FAR vs FRR)",
    subtitle: "Menyeimbangkan antara risiko menolak pemilik asli (FRR) dan risiko meloloskan pemalsu terampil (FAR).",
  },
  {
    id: 8,
    title: "Saat Foto HP Mengacaukan Segalanya",
    subtitle: "Bayangan tangan dan cahaya remang-remang dapat menurunkan akurasi hingga 50% jika tidak dinormalisasi dengan algoritma pengolahan citra.",
  },
  {
    id: 9,
    title: "Batas Kemampuan Model",
    subtitle: "Kertas bermotif tebal, pulpen glitter bercahaya, dan tinta neon adalah tantangan nyata yang membutuhkan pengawasan forensik manual.",
  },
  {
    id: 10,
    title: "Uji Pemahaman: Kuis Detektif",
    subtitle: "Buktikan pemahaman Anda mengenai prinsip kerja Siamese CNN dan analisis forensik tanda tangan.",
  },
  {
    id: 11,
    title: "Mulai Pemeriksaan Sekarang",
    subtitle: "Gunakan SignaCheck untuk memverifikasi dokumen Anda secara instan di meja uji digital.",
  }
];

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Mengapa tanda tangan dari orang yang sama tidak pernah 100% sama secara piksel?",
    options: [
      "Karena manusia bukan mesin cetak; ada variasi alami otot, kecepatan, dan sudut pena",
      "Karena tinta pulpen selalu berubah warna setiap detik",
      "Karena kamera selalu merusak piksel secara acak"
    ],
    correct: 0,
    explanation: "Variasi intra-personal adalah sifat alami motorik manusia yang dipengaruhi postur, alat tulis, dan kecepatan tarikan."
  },
  {
    id: 2,
    question: "Apa fungsi utama arsitektur Siamese CNN kembar?",
    options: [
      "Menghafal nama dan wajah pemilik tanda tangan",
      "Mengekstraksi fitur lekukan ke ruang vektor 64-D dengan bobot yang identik",
      "Mengubah tanda tangan menjadi teks otomatis"
    ],
    correct: 1,
    explanation: "Siamese Network menggunakan Shared Weights untuk membandingkan kemiripan representasi laten tanpa perlu dilatih ulang untuk setiap orang baru."
  },
  {
    id: 3,
    question: "Apa yang terjadi jika ambang batas keputusan (threshold) disetel terlalu kecil (sangat ketat)?",
    options: [
      "Semua tanda tangan otomatis dianggap palsu dan pemilik asli sering ditolak (FRR naik)",
      "Akurasi model langsung menjadi 100%",
      "Server akan kelebihan beban komputasi"
    ],
    correct: 0,
    explanation: "Threshold yang terlalu ketat meningkatkan False Rejection Rate (FRR), sehingga tanda tangan pemilik sah rentan tertolak."
  },
  {
    id: 4,
    question: "Mengapa tahapan binerisasi Otsu sangat penting sebelum citra masuk ke CNN?",
    options: [
      "Agar gambar menjadi berwarna lebih cerah",
      "Untuk memisahkan piksel tinta dari kertas dan menghapus gradien warna latar",
      "Untuk memperbesar ukuran file citra"
    ],
    correct: 1,
    explanation: "Otsu menghitung threshold optimal yang memisahkan goresan hitam dari serat kertas putih tanpa terpengaruh warna kertas asli."
  },
  {
    id: 5,
    question: "Berapa jumlah sampel tanda tangan pembanding yang disarankan untuk akurasi optimal?",
    options: [
      "Tepat 100 sampel",
      "Cukup 0 sampel (bisa menebak tanpa pembanding)",
      "2 sampai 5 sampel tanda tangan asli"
    ],
    correct: 2,
    explanation: "Dengan 2-5 sampel referensi, sistem dapat menghitung centroid rata-rata variasi alami penanda tangan."
  }
];

export const ROBUSTNESS_RESULTS = [
  { kondisi: "Scanner Bersih (Normal)", mentah: 86.9, olahan: 85.3 },
  { kondisi: "Kena Bayangan Tangan/Kertas", mentah: 50.0, olahan: 85.2 },
  { kondisi: "Kamera HP Agak Buram", mentah: 81.9, olahan: 79.8 },
  { kondisi: "Kertas Miring ~15 Derajat", mentah: 86.8, olahan: 84.7 },
  { kondisi: "Ruangan Redup Remang-Remang", mentah: 49.8, olahan: 85.3 },
  { kondisi: "Bintik Derau / Debu Meja", mentah: 76.3, olahan: 85.1 },
  { kondisi: "Foto Kamera HP Nyata", mentah: 50.0, olahan: 81.7 },
];

export const REFERENCES_LIST = [
  {
    title: "Offline Signature Verification Using Siamese Convolutional Neural Networks",
    authors: "Bromley, J., Guyon, I., LeCun, Y., Säckinger, E., & Shah, R.",
    year: "1993",
    source: "Advances in Neural Information Processing Systems (NeurIPS)"
  },
  {
    title: "BHSig260: A Full Handwritten Signature Dataset in Bengali and Hindi",
    authors: "Pal, S., Alaei, A., Pal, U., & Blumenstein, M.",
    year: "2016",
    source: "International Conference on Frontiers in Handwriting Recognition (ICFHR)"
  },
  {
    title: "CEDAR: Signature Verification Competition",
    authors: "Kalera, K., Srihari, S., & Xu, A.",
    year: "2004",
    source: "IEEE Transactions on Pattern Analysis and Machine Intelligence"
  }
];
