export interface GlossaryItem {
  no: string;
  istilah: string;
  kategori: string;
  deskripsi: string;
}

export const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    no: "01",
    istilah: "Siamese CNN",
    kategori: "Arsitektur Model",
    deskripsi: "Jaringan saraf tiruan kembar dengan dua cabang identik yang memproses dua citra sekaligus untuk mengukur derajat kemiripan."
  },
  {
    no: "02",
    istilah: "Bobot Terbagi (Shared Weights)",
    kategori: "Parameter",
    deskripsi: "Kedua cabang Siamese CNN menggunakan matriks bobot yang persis sama, sehingga perlakuan ekstraksi fitur pada tanda tangan pembanding dan yang diperiksa tetap setara."
  },
  {
    no: "03",
    istilah: "Jarak Euclidean",
    kategori: "Metrik Metrik",
    deskripsi: "Jarak geometris antara dua vektor representasi pada ruang laten 64 dimensi. Jarak mendekati nol menandakan kemiripan yang semakin tinggi."
  },
  {
    no: "04",
    istilah: "Ambang Batas (Threshold)",
    kategori: "Keputusan",
    deskripsi: "Batas pemisah jarak keputusan: jika jarak berada di bawah ambang batas maka tanda tangan dinyatakan asli, jika di atas maka terindikasi palsu."
  },
  {
    no: "05",
    istilah: "Zona Belum Pasti",
    kategori: "Kalibrasi",
    deskripsi: "Rentang jarak di sekitar ambang batas tempat model tidak memiliki kepastian tinggi dan membutuhkan verifikasi manual oleh petugas."
  },
  {
    no: "06",
    istilah: "Binerisasi Otsu",
    kategori: "Pemrosesan Citra",
    deskripsi: "Algoritma otomatis pemisah intensitas hitam-putih yang memisahkan goresan tinta dari tekstur dan pencahayaan kertas."
  },
  {
    no: "07",
    istilah: "False Acceptance Rate (FAR)",
    kategori: "Evaluasi Forensik",
    deskripsi: "Peluang sistem meloloskan tanda tangan tiruan atau palsu sebagai tanda tangan asli."
  },
  {
    no: "08",
    istilah: "False Rejection Rate (FRR)",
    kategori: "Evaluasi Forensik",
    deskripsi: "Peluang sistem menolak tanda tangan pemilik sah karena variasi alami goresannya."
  },
  {
    no: "09",
    istilah: "Equal Error Rate (EER)",
    kategori: "Evaluasi Model",
    deskripsi: "Titik temu operasional saat nilai FAR dan FRR seimbang; semakin rendah nilai EER, semakin baik performa pembeda model."
  },
  {
    no: "10",
    istilah: "Centroid Multi-Referensi",
    kategori: "Metodologi",
    deskripsi: "Titik pusat dari beberapa vektor tanda tangan pembanding asli (1 hingga 5 sampel) untuk menangkap rentang variasi wajar penanda tangan."
  }
];
