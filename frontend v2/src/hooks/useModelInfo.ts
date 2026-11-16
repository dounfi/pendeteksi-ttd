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

export interface ModelInfo {
  nama_model: string;
  preprocess_mode: string;
  threshold: number;
  ragu_z?: number;
  banyak_pembanding?: number;
  model_hash?: string;
  metrics?: {
    per_dataset?: {
      D1?: DatasetMetrics;
      D2?: DatasetMetrics;
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
