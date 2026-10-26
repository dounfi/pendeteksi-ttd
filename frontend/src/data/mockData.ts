/**
 * src/data/mockData.ts
 * Data contoh siap pakai dan utilitas berkas untuk pengujian.
 */

import sampleImages from './sample_images.json';

export interface PresetPair {
  id: string;
  labelTombol: string;      // "Contoh 1", "Contoh 2", "Contoh 3" (tidak membocorkan hasil di tombol)
  deskripsi: string;
  refImage: string;          // Data URI Base64
  queryImage: string;        // Data URI Base64
  refName: string;
  queryName: string;
}

export const PRESET_PAIRS: PresetPair[] = [
  {
    id: "pasangan-1",
    labelTombol: "Pasangan Contoh 1",
    deskripsi: "Dua goresan tanda tangan dengan bentuk horizontal mengalir",
    refImage: sampleImages["ttd_rajshree_1.png"],
    queryImage: sampleImages["ttd_rajshree_2.png"],
    refName: "ttd_pembanding_1.png",
    queryName: "ttd_diperiksa_1.png",
  },
  {
    id: "pasangan-2",
    labelTombol: "Pasangan Contoh 2",
    deskripsi: "Dua goresan tanda tangan dengan karakter sudut miring",
    refImage: sampleImages["ttd_miring_1.png"],
    queryImage: sampleImages["ttd_miring_2.png"],
    refName: "ttd_pembanding_2.png",
    queryName: "ttd_diperiksa_2.png",
  },
  {
    id: "pasangan-3",
    labelTombol: "Pasangan Contoh 3",
    deskripsi: "Dua tanda tangan dengan ketebalan dan kepadatan garis berbeda",
    refImage: sampleImages["palsu_pair3_ref.png"],
    queryImage: sampleImages["palsu_pair3_forgery.png"],
    refName: "ttd_pembanding_3.png",
    queryName: "ttd_diperiksa_3_palsu.png",
  },
];

// Helper: konversi Data URI Base64 ke objek File
export function dataUriToFile(dataUri: string, filename: string): File {
  const arr = dataUri.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
