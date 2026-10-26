/**
 * src/data/benchmarkData.ts
 * Data evaluasi model nyata dari hasil eksperimen notebook Google Colab / Kaggle.
 */

export interface DatasetMetric {
  nama: string;
  deskripsi: string;
  auc: number;
  eer: number;
  akurasi: number;
  far: number;
  frr: number;
}

export const DATASET_METRICS: DatasetMetric[] = [
  {
    nama: "Dataset Utama (BHSig-B)",
    deskripsi: "Scan tanda tangan aksara Bengali dengan lekukan rumit. Diuji pada orang-orang baru yang belum pernah dilihat model.",
    auc: 0.932,
    eer: 0.153,
    akurasi: 0.853,
    far: 0.108,
    frr: 0.187,
  },
  {
    nama: "Dataset Sekunder (BHSig-H)",
    deskripsi: "Scan tanda tangan aksara Hindi dengan garis atap shirorekha. Lebih menantang karena lekukan peniru cukup lihai.",
    auc: 0.900,
    eer: 0.182,
    akurasi: 0.816,
    far: 0.149,
    frr: 0.219,
  },
];

export interface RobustnessItem {
  kondisi: string;
  denganOlah: number; // Akurasi 0..1
  tanpaOlah: number;  // Akurasi 0..1
}

export const ROBUSTNESS_DATA: RobustnessItem[] = [
  { kondisi: "Scanner Bersih (Normal)", denganOlah: 0.853, tanpaOlah: 0.869 },
  { kondisi: "Kena Bayangan Tangan/Kertas", denganOlah: 0.852, tanpaOlah: 0.500 },
  { kondisi: "Kamera HP Agak Buram", denganOlah: 0.798, tanpaOlah: 0.819 },
  { kondisi: "Kertas Miring ~15 Derajat", denganOlah: 0.847, tanpaOlah: 0.868 },
  { kondisi: "Ruangan Redup Remang-Remang", denganOlah: 0.853, tanpaOlah: 0.498 },
  { kondisi: "Bintik Derau / Debu Meja", denganOlah: 0.851, tanpaOlah: 0.763 },
  { kondisi: "Foto Kamera HP Lengkap", denganOlah: 0.817, tanpaOlah: 0.500 },
];

export interface MultiRefItem {
  k: number;
  d1Eer: number; // Persentase %
  d2Eer: number; // Persentase %
}

export const MULTI_REF_DATA: MultiRefItem[] = [
  { k: 1, d1Eer: 14.8, d2Eer: 19.2 },
  { k: 2, d1Eer: 12.5, d2Eer: 16.0 },
  { k: 3, d1Eer: 12.7, d2Eer: 15.7 },
  { k: 5, d1Eer: 11.9, d2Eer: 12.6 },
];

export interface CatatanBatasItem {
  ikon: string;
  judul: string;
  deskripsi: string;
}

export const CATATAN_BATAS: CatatanBatasItem[] = [
  {
    ikon: "📝",
    judul: "Kertas Putih Standar",
    deskripsi: "Model dilatih dominan di atas kertas putih bersih. Kalau kamu pake kertas buram koran atau bermotif batik tebal, algoritma bisa agak bingung bedain serat kertas."
  },
  {
    ikon: "✨",
    judul: "Pulpen Glitter / Tinta Neon",
    deskripsi: "Kilau cahaya lampu dari tinta glitter bisa bikin pantulan putih di kamera yang bikin sebagian goresan pena putus-putus di mata komputer."
  },
  {
    ikon: "📱",
    judul: "Simulasi vs Kamera HP Asli",
    deskripsi: "Pengujian gangguan foto HP dibuat dengan gabungan simulasi matematis & sampel nyata. Kualitas lensa kamera dan kestabilan tangan tetap memengaruhi hasil."
  },
  {
    ikon: "⚖️",
    judul: "Bukan Vonis Hukum Pengadilan",
    deskripsi: "Proyek ini adalah alat bantu deteksi berbasis visual komputer cerdas. Untuk kasus hukum perdata atau pidana, tetap wajib melibatkan ahli grafologi forensik resmi!"
  }
];
