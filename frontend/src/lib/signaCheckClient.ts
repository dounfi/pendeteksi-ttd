export type Decision = 'asli' | 'palsu' | 'belum_yakin';

export interface ProcessedImage {
  label: string;
  image: string;
}

export interface ForensicFeature {
  name: string;
  explanation: string;
  pembanding?: string;
  diperiksa?: string;
  finding?: string;
}

export interface VerificationResponse {
  score: number;
  decision: Decision;
  confidence: number | string;
  threshold: number;
  uncertainLow: number;
  uncertainHigh: number;
  processedImages: ProcessedImage[];
  forensicFeatures: ForensicFeature[];
  shakeTest: number | string | null;
  consistency: number | string | null;
  isMock: boolean;
}

const mockResponse: VerificationResponse = {
  score: 0.87,
  decision: 'asli',
  confidence: 'TODO',
  threshold: 0.7,
  uncertainLow: 0.65,
  uncertainHigh: 0.75,
  processedImages: [],
  forensicFeatures: [
    { name: 'Kemiringan', explanation: 'Arah umum tanda tangan pembanding dan yang diperiksa.', finding: 'TODO' },
    { name: 'Ketebalan goresan', explanation: 'Perbedaan ketebalan garis yang terlihat pada citra.', finding: 'TODO' },
    { name: 'Goresan terputus', explanation: 'Bagian garis yang mungkin terputus karena kualitas foto atau cara menulis.', finding: 'TODO' },
    { name: 'Proporsi', explanation: 'Perbandingan lebar dan tinggi bentuk tanda tangan.', finding: 'TODO' },
  ],
  shakeTest: null,
  consistency: null,
  isMock: true,
};

export async function verifySignature(references: File[], query: File): Promise<VerificationResponse> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return { ...mockResponse, processedImages: [] };
  }

  const body = new FormData();
  references.forEach((file) => body.append('references[]', file));
  body.append('query', query);

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/verify`, { method: 'POST', body });
  } catch {
    throw new Error('Server belum terhubung. Jalankan server lokal, lalu coba lagi.');
  }

  if (!response.ok) {
    if (response.status >= 500 || response.status === 404) {
      throw new Error('Server belum terhubung. Jalankan server lokal, lalu coba lagi.');
    }
    throw new Error('Gambar tidak terbaca. Foto ulang dengan cahaya lebih terang dan tanpa bayangan.');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Gambar tidak terbaca. Foto ulang dengan cahaya lebih terang dan tanpa bayangan.');
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error('Gambar tidak terbaca. Foto ulang dengan cahaya lebih terang dan tanpa bayangan.');
  }

  const result = payload as Partial<VerificationResponse>;
  if (
    typeof result.score !== 'number'
    || !['asli', 'palsu', 'belum_yakin'].includes(String(result.decision))
    || typeof result.threshold !== 'number'
  ) {
    throw new Error('Gambar tidak terbaca. Foto ulang dengan cahaya lebih terang dan tanpa bayangan.');
  }

  return {
    score: result.score,
    decision: result.decision as Decision,
    confidence: result.confidence ?? 'TODO',
    threshold: result.threshold,
    uncertainLow: result.uncertainLow ?? result.threshold,
    uncertainHigh: result.uncertainHigh ?? result.threshold,
    processedImages: Array.isArray(result.processedImages) ? result.processedImages : [],
    forensicFeatures: Array.isArray(result.forensicFeatures) ? result.forensicFeatures : [],
    shakeTest: result.shakeTest ?? null,
    consistency: result.consistency ?? null,
    isMock: false,
  };
}
