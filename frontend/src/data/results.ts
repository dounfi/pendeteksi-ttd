/**
 * src/data/results.ts
 * Data hasil eksperimen model. Nilai yang belum selesai dievaluasi ditandai "TODO".
 * Jangan mengarang angka.
 */

export interface MetricCardItem {
  label: string;
  value: string; // "TODO" jika belum ada angka resmi
  keterangan: string;
}

export const PERFORMANCE_METRICS: MetricCardItem[] = [
  {
    label: "Akurasi Uji (Test Accuracy)",
    value: "TODO",
    keterangan: "Dievaluasi pada pasangan tanda tangan yang belum pernah dilihat model"
  },
  {
    label: "Area Under Curve (AUC)",
    value: "TODO",
    keterangan: "Luas area di bawah kurva karakteristik operasi penerima (ROC)"
  },
  {
    label: "Equal Error Rate (EER)",
    value: "TODO",
    keterangan: "Titik perpotongan antara False Acceptance dan False Rejection"
  },
  {
    label: "False Acceptance Rate (FAR)",
    value: "TODO",
    keterangan: "Persentase tanda tangan tiruan yang lolos deteksi"
  },
  {
    label: "False Rejection Rate (FRR)",
    value: "TODO",
    keterangan: "Persentase tanda tangan pemilik asli yang ditolak keliru"
  }
];

export interface ConfusionMatrixData {
  tp: string; // True Positive
  fp: string; // False Positive
  tn: string; // True Negative
  fn: string; // False Negative
  totalSampel: string;
}

export const CONFUSION_MATRIX: ConfusionMatrixData = {
  tp: "TODO",
  fp: "TODO",
  tn: "TODO",
  fn: "TODO",
  totalSampel: "TODO"
};

export interface RocPoint {
  fpr: number;
  tpr: number;
}

// Jika data titik kurva ROC belum tersedia, array kosong memicu tampilan empty-state
export const ROC_POINTS: RocPoint[] = [];

export interface PreprocessingComparisonRow {
  metode: string;
  akurasi: string;
  eer: string;
  catatan: string;
}

export const PREPROCESSING_COMPARISON: PreprocessingComparisonRow[] = [
  {
    metode: "Citra Mentah (Raw RGB)",
    akurasi: "TODO",
    eer: "TODO",
    catatan: "Rentan terhadap variasi bayangan dan warna kertas"
  },
  {
    metode: "Grayscale Terstandarisasi",
    akurasi: "TODO",
    eer: "TODO",
    catatan: "Mengurangi dimensi warna tanpa menghapus bayangan gradien"
  },
  {
    metode: "Binerisasi Otsu (Dipakai)",
    akurasi: "TODO",
    eer: "TODO",
    catatan: "Memisahkan tinta secara tegas dari serat kertas"
  }
];

export interface RobustnessRow {
  kondisi: string;
  denganOlah: string;
  tanpaOlah: string;
  keterangan: string;
}

export const ROBUSTNESS_BENCHMARK: RobustnessRow[] = [
  {
    kondisi: "Scanner Bersih (Kondisi Acuan)",
    denganOlah: "TODO",
    tanpaOlah: "TODO",
    keterangan: "Kondisi ideal laboratorium"
  },
  {
    kondisi: "Bayangan Tangan dan Kertas",
    denganOlah: "TODO",
    tanpaOlah: "TODO",
    keterangan: "Kondisi umum pengambilan gambar dengan ponsel"
  },
  {
    kondisi: "Pencahayaan Redup",
    denganOlah: "TODO",
    tanpaOlah: "TODO",
    keterangan: "Ruangan dengan intensitas cahaya rendah"
  },
  {
    kondisi: "Kemiringan Sudut Kertas (~15 Derajat)",
    denganOlah: "TODO",
    tanpaOlah: "TODO",
    keterangan: "Distorsi rotasi alami saat pengambilan foto"
  },
  {
    kondisi: "Derau Bintik dan Tekstur Meja",
    denganOlah: "TODO",
    tanpaOlah: "TODO",
    keterangan: "Latar belakang berbintik atau debu pada lensa"
  }
];

export const CATATAN_JUJUR = "Angka performa di halaman ini dihitung murni dari dataset uji terbuka dan belum diujikan pada dokumen legal berkekuatan hukum. Kualitas kamera ponsel, ketebalan tinta pena, dan jenis kertas tetap memengaruhi hasil verifikasi.";
