/**
 * src/lib/api.ts
 * Jembatan komunikasi ke server backend dengan fallback data tiruan (mock).
 */

export interface ForensicItem {
  ciri: string;
  label: string;
  pembanding: string;
  diperiksa: string;
  tingkat: "mirip" | "agak beda" | "beda";
}

export interface VerifyResult {
  verdict: "asli" | "palsu" | "ragu";
  similarity: number; // 0 sampai 100
  distance: number;
  threshold: number;
  zoneLow: number;
  zoneHigh: number;
  nReference: number;
  confidence?: { z: number; pecah: number; n: number };
  fusion?: { condongPalsu: boolean; skor: number };
  forensics: ForensicItem[];
  previewReference?: string; // data URI
  previewQuery?: string; // data URI
  steps?: { nama: string; gambar: string }[];
  isMock?: boolean;
}

// Konversi File ke Data URI Base64
export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Mock fallback generator
export async function getMockResult(refs: File[], query: File): Promise<VerifyResult> {
  const refUri = refs.length > 0 ? await fileToDataUri(refs[0]) : "";
  const queryUri = await fileToDataUri(query);

  const isQueryPalsu = query.name.toLowerCase().includes("palsu") || query.name.toLowerCase().includes("forgery") || query.name.toLowerCase().includes("beda");
  
  const distance = isQueryPalsu ? 0.5616 : 0.2515;
  const threshold = 0.4811;
  const zoneLow = 0.42;
  const zoneHigh = 0.52;

  let verdict: "asli" | "palsu" | "ragu" = "asli";
  if (distance >= zoneHigh) verdict = "palsu";
  else if (distance >= zoneLow && distance < zoneHigh) verdict = "ragu";
  else verdict = "asli";

  const similarity = Math.max(0, Math.min(100, Math.round((1.0 - (distance / 1.0)) * 100)));

  return {
    verdict,
    similarity,
    distance,
    threshold,
    zoneLow,
    zoneHigh,
    nReference: refs.length,
    confidence: {
      z: isQueryPalsu ? 3.89 : 16.57,
      pecah: 6,
      n: 6,
    },
    fusion: {
      condongPalsu: isQueryPalsu,
      skor: isQueryPalsu ? 1.586 : -2.171,
    },
    forensics: [
      {
        ciri: "rasio_lebar_tinggi",
        label: "Bentuk (lebar dibanding tinggi)",
        pembanding: "2.69",
        diperiksa: isQueryPalsu ? "2.10" : "2.40",
        tingkat: isQueryPalsu ? "agak beda" : "mirip",
      },
      {
        ciri: "kepadatan_tinta",
        label: "Kepadatan tinta",
        pembanding: "15.8%",
        diperiksa: isQueryPalsu ? "26.1%" : "16.5%",
        tingkat: isQueryPalsu ? "beda" : "mirip",
      },
      {
        ciri: "kemiringan",
        label: "Kemiringan umum",
        pembanding: "1 derajat",
        diperiksa: isQueryPalsu ? "-26 derajat" : "-2 derajat",
        tingkat: isQueryPalsu ? "agak beda" : "mirip",
      },
      {
        ciri: "ketebalan_goresan",
        label: "Ketebalan goresan",
        pembanding: "5.74",
        diperiksa: isQueryPalsu ? "25.59" : "5.31",
        tingkat: isQueryPalsu ? "agak beda" : "mirip",
      },
      {
        ciri: "jumlah_bagian",
        label: "Jumlah bagian terpisah (angkat pena)",
        pembanding: "1 bagian",
        diperiksa: "1 bagian",
        tingkat: "mirip",
      },
      {
        ciri: "panjang_goresan",
        label: "Panjang total goresan",
        pembanding: "0.20",
        diperiksa: isQueryPalsu ? "0.89" : "0.22",
        tingkat: isQueryPalsu ? "beda" : "mirip",
      },
      {
        ciri: "posisi_x",
        label: "Letak pusat tinta (kiri-kanan)",
        pembanding: "46%",
        diperiksa: isQueryPalsu ? "40%" : "48%",
        tingkat: isQueryPalsu ? "agak beda" : "mirip",
      },
      {
        ciri: "posisi_y",
        label: "Letak pusat tinta (atas-bawah)",
        pembanding: "15%",
        diperiksa: isQueryPalsu ? "32%" : "17%",
        tingkat: isQueryPalsu ? "beda" : "mirip",
      },
    ],
    previewReference: refUri,
    previewQuery: queryUri,
    steps: [
      { nama: "1. Asli", gambar: queryUri },
      { nama: "2. Cahaya Rata", gambar: queryUri },
      { nama: "3. Tinta Dipisah", gambar: queryUri },
      { nama: "4. Bintik Dibuang & Dipotong", gambar: queryUri },
      { nama: "5. Kanvas Standar", gambar: queryUri },
    ],
    isMock: true,
  };
}

// Fungsi Utama: verify
export async function verify(refs: File[], query: File): Promise<VerifyResult> {
  if (refs.length === 0 || !query) {
    throw new Error("Pilih minimal satu tanda tangan pembanding dan satu tanda tangan yang diperiksa.");
  }

  try {
    const refBase64 = await fileToDataUri(refs[0]);
    const qryBase64 = await fileToDataUri(query);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ref_image: refBase64,
        qry_image: qryBase64,
        preprocess_mode: "binary",
        run_shake_test: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server status ${response.status}`);
    }

    const data = await response.json();
    const threshold = Number(data.threshold) || 0.4811;
    const distance = Number(data.distance) || 0;
    const zoneLow = Number((threshold - 0.05).toFixed(4));
    const zoneHigh = Number((threshold + 0.05).toFixed(4));

    let verdict: "asli" | "palsu" | "ragu" = "asli";
    if (distance >= zoneHigh) {
      verdict = "palsu";
    } else if (distance >= zoneLow && distance < zoneHigh) {
      verdict = "ragu";
    } else {
      verdict = "asli";
    }

    const steps = data.steps?.qry ? [
      { nama: "1. Asli", gambar: data.steps.qry.asli },
      { nama: "2. Cahaya Rata", gambar: data.steps.qry.cahaya_rata },
      { nama: "3. Tinta Dipisah", gambar: data.steps.qry.mask },
      { nama: "4. Bintik Dibuang & Dipotong", gambar: data.steps.qry.potong },
      { nama: "5. Kanvas Standar", gambar: data.steps.qry.final },
    ] : undefined;

    return {
      verdict,
      similarity: Number(data.similarity_pct) || 0,
      distance,
      threshold,
      zoneLow,
      zoneHigh,
      nReference: refs.length,
      confidence: data.shake_test ? {
        z: data.shake_test.z_score,
        pecah: data.shake_test.ragu_z,
        n: 6,
      } : undefined,
      fusion: data.fusion ? {
        condongPalsu: data.fusion.decision === "PALSU",
        skor: data.fusion.score,
      } : undefined,
      forensics: (data.forensic_report || []).map((f: any) => ({
        ciri: f.ciri,
        label: f.label,
        pembanding: f.pembanding,
        diperiksa: f.diperiksa,
        tingkat: f.tingkat,
      })),
      previewReference: refBase64,
      previewQuery: qryBase64,
      steps,
      isMock: false,
    };
  } catch (err) {
    console.warn("Backend tidak merespons, beralih ke data tiruan (mock):", err);
    return getMockResult(refs, query);
  }
}
