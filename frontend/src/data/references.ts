/**
 * src/data/references.ts
 * Data tim pengembang, repositori, dataset, dan referensi ilmiah.
 * Nilai yang belum final ditandai "TODO".
 */

export interface TeamMember {
  initials: string;
  nama: string;
  nim: string;
  peran: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    initials: "TODO",
    nama: "TODO",
    nim: "TODO",
    peran: "Arsitektur Model & Pelatihan CNN"
  },
  {
    initials: "TODO",
    nama: "TODO",
    nim: "TODO",
    peran: "Pemrosesan Citra & Pipeline Forensik"
  },
  {
    initials: "TODO",
    nama: "TODO",
    nim: "TODO",
    peran: "Pengembangan Antarmuka Meja Uji"
  }
];

export interface DatasetItem {
  id: string;
  nama: string;
  deskripsi: string;
  url: string;
}

export const DATASETS: DatasetItem[] = [
  {
    id: "DS-01",
    nama: "Handwritten Signature Datasets",
    deskripsi: "Kumpulan data tanda tangan offline untuk tolok ukur verifikasi biometrik.",
    url: "TODO"
  },
  {
    id: "DS-02",
    nama: "Signature Verification CEDAR & BHSig",
    deskripsi: "Dataset aksara Bengali dan Hindi serta korpus standar CEDAR untuk evaluasi pemalsuan terampil.",
    url: "TODO"
  }
];

export const GITHUB_REPOSITORY = "TODO";

export interface AcademicReference {
  no: string;
  judul: string;
  penulis: string;
  tahun: string;
  publikasi: string;
}

export const ACADEMIC_REFERENCES: AcademicReference[] = [
  {
    no: "01",
    judul: "Signature Verification Using A Siamese Time-Delay Neural Network",
    penulis: "Bromley, J., Guyon, I., LeCun, Y., Säckinger, E., & Shah, R.",
    tahun: "1993",
    publikasi: "Advances in Neural Information Processing Systems (NeurIPS)"
  },
  {
    no: "02",
    judul: "Offline Handwritten Signature Verification Using Convolutional Neural Networks",
    penulis: "Hafemann, L. G., Sabourin, R., & Oliveira, L. S.",
    tahun: "2017",
    publikasi: "IEEE Transactions on Pattern Analysis and Machine Intelligence"
  },
  {
    no: "03",
    judul: "A Survey on Offline Signature Verification: Past, Present and Future",
    penulis: "Diaz, M., Ferrer, M. A., Impedovo, D., Pirlo, G., & Plamondon, R.",
    tahun: "2019",
    publikasi: "Pattern Recognition, Vol. 88"
  }
];

export const PRIVACY_NOTE = "TODO: Kebijakan penyimpanan dan privasi berkas citra sedang dalam tinjauan komite etik riset kampus.";
