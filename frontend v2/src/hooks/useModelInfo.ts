import { useState, useEffect } from "react";

export interface DatasetMetrics {
  accuracy?: number;
  auc?: number;
  eer?: number;
  FAR?: number;
  FRR?: number;
  FAR_skilled_forgery?: number;
  FAR_random_forgery?: number;
}

export interface StatusAkhir {
  FAR_keputusan_model?: number;
  FAR_status_ASLI?: number;
  FAR_status_ASLI_mahir?: number | null;
  asli_dikenali_ASLI?: number;
}

export interface ModelInfo {
  nama_model: string;
  preprocess_mode: string;
  threshold: number;
  ragu_z?: number;
  ragu_margin?: number | null;
  banyak_pembanding?: Record<string, Record<string, { auc: number; auc_std: number; eer: number; eer_std: number }>>;
  model_hash?: string;
  status_akhir?: {
    D1?: StatusAkhir;
    D2?: StatusAkhir;
    D3?: StatusAkhir;
  };
  metrics?: {
    per_dataset?: {
      D1?: DatasetMetrics;
      D2?: DatasetMetrics;
      D3?: DatasetMetrics;
    };
  };
}

interface UseModelInfoResult {
  modelInfo: ModelInfo | null;
  loading: boolean;
  error: string | null;
}

export function useModelInfo(): UseModelInfoResult {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchModelInfo() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/model-info");
        if (!res.ok) throw new Error("Respons server tidak valid.");
        const data: ModelInfo = await res.json();
        if (!cancelled) {
          setModelInfo(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8000.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchModelInfo();
    return () => { cancelled = true; };
  }, []);

  return { modelInfo, loading, error };
}
