export interface ForensicItem {
  ciri: string;
  label: string;
  pembanding: string;
  diperiksa: string;
  tingkat: "mirip" | "agak beda" | "beda";
}

export interface VerifyResult {
  verdict: "asli" | "palsu" | "ragu";
  similarity: number;
  distance: number;
  threshold: number;
  zoneLow: number;
  zoneHigh: number;
  nReference: number;
  confidence?: { z: number; pecah: number; n: number };
  fusion?: { condongPalsu: boolean; skor: number };
  forensics: ForensicItem[];
  previewReference?: string;
  previewQuery?: string;
  steps?: { nama: string; gambar: string }[];
  isMock?: boolean;
}
