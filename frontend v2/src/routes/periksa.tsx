import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { Loader2, ScanSearch, Upload, Camera, PenTool, Wind, X, Plus, FileUp } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { SignatureInputModal, type InputTab } from "../components/SignatureInputModal";
import { useModelInfo } from "../hooks/useModelInfo";
import { ResultCard, type CheckState } from "@/components/periksa/ResultCard";
import { ExplanationPanel } from "@/components/periksa/ExplanationPanel";
import { ModelInfo } from "@/components/periksa/ModelInfo";
import { parseVerifyResponse, parseModelInfo, type VerifyResult } from "@/lib/verify";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/periksa")({
  head: () => ({
    meta: [
      { title: `Periksa Tanda Tangan — ${BRAND.name}` },
      {
        name: "description",
        content:
          "Unggah 1 sampai 5 foto tanda tangan asli sebagai contoh dan satu tanda tangan yang ingin diperiksa. Hasilnya berupa petunjuk awal.",
      },
      { property: "og:title", content: `Periksa Tanda Tangan — ${BRAND.name}` },
      {
        property: "og:description",
        content: "Bandingkan tanda tangan dan lihat hasilnya: Asli, Belum Yakin, atau Palsu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PeriksaPage,
});

/* ============================================================
   TYPES
   ============================================================ */
interface ForensicItem {
  ciri?: string;
  name?: string;
  label: string;
  tingkat?: "mirip" | "agak beda" | "beda";
  is_safe?: boolean;
  kalimat?: string;
  explain?: string;
  selisih?: number;
  diff_pct?: number;
}

interface ShakeData {
  z_score: number;
  ragu_z: number;
  ragu_margin?: number | null;
  mean_dist: number;
  std_dist: number;
  n_variants?: number;
  flip_rate?: number;
  is_confident: boolean;
  status: string;
  catatan?: string;
}

type DisplayStatus = "ASLI" | "BELUM YAKIN" | "PALSU";

interface FusionData {
  decision: "ASLI" | "PALSU";
  score: number;
  threshold: number;
  agrees_with_model?: boolean;
}

interface VerifyResponse {
  decision: "ASLI" | "PALSU";
  status?: DisplayStatus;
  status_reasons?: string[];
  is_genuine: boolean;
  distance: number;
  distances_per_ref?: number[];
  n_refs_used?: number;
  threshold: number;
  ragu_z?: number;
  ragu_margin?: number | null;
  similarity_pct?: number;
  similarity_percentage?: number;
  shake_test?: ShakeData;
  shake_info?: ShakeData;
  forensic_report?: ForensicItem[];
  forensic_summary?: {
    mirip: number;
    agak_beda: number;
    beda: number;
    total: number;
    n_pembanding: number;
  } | null;
  fusion?: FusionData | null;
  fusion_decision?: string | null;
  ref_consistency?: { mean_pair_dist: number; max_pair_dist: number; inconsistent: boolean } | null;
  explain_map?: string;
  warnings?: string[];
  steps?: {
    ref?: { asli?: string; final?: string; hasil?: string };
    qry?: { asli?: string; final?: string; hasil?: string };
  };
  ref_processed_img?: string;
  qry_processed_img?: string;
}

interface SamplePair {
  id: string;
  label: string;
  owner: string;
  ref_file: string;
  qry_file: string;
  ground_truth: "asli" | "tiruan";
  model_note?: string; // "catatan: ini nyata, model bisa keliru"
}

/* ============================================================
   SAMPLE PAIRS (3 pasangan dari ttd_uji_sendiri via backend)
   ============================================================ */
const SAMPLE_PAIRS: SamplePair[] = [
  {
    id: "s1",
    label: "Contoh 1 – Asli vs. Asli",
    owner: "1",
    ref_file: "original_1_01.jpg",
    qry_file: "original_1_02.jpg",
    ground_truth: "asli",
  },
  {
    id: "s2",
    label: "Contoh 2 – Asli vs. Tiruan",
    owner: "2",
    ref_file: "original_2_01.jpg",
    qry_file: "forgeries_2_01.jpg",
    ground_truth: "tiruan",
  },
  {
    id: "s3",
    label: "Contoh 3 – Asli vs. Tiruan (model mungkin keliru)",
    owner: "3",
    ref_file: "original_3_01.jpg",
    qry_file: "forgeries_3_01.jpg",
    ground_truth: "tiruan",
    model_note: "catatan: ini nyata, model bisa keliru.",
  },
];

/* ============================================================
   HELPER: fetch image from backend sample endpoint as data-url
   ============================================================ */
async function fetchSampleImage(filename: string): Promise<string> {
  const res = await fetch(`http://127.0.0.1:8000/api/sample-image/${filename}`);
  if (!res.ok) throw new Error("Gagal mengambil gambar contoh.");
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
function PeriksaPage() {
  const { modelInfo, loading: modelLoading } = useModelInfo();

  // ---- Image state (supports multi-ref: array of base64) ----
  const [refImages, setRefImages] = useState<string[]>([]);
  const [qryImage, setQryImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ---- Sample UI ----
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [sampleResult, setSampleResult] = useState<VerifyResponse | null>(null);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [showSampleGT, setShowSampleGT] = useState(false);

  // ---- Active tab per card ----
  const [refTab, setRefTab] = useState<InputTab>("upload");
  const [qryTab, setQryTab] = useState<InputTab>("upload");

  // ---- Modal ----
  const [modalTarget, setModalTarget] = useState<"ref" | "qry" | null>(null);
  const [modalTab, setModalTab] = useState<InputTab>("upload");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ---- Refs ----
  const refFileInputRef = useRef<HTMLInputElement>(null);
  const qryFileInputRef = useRef<HTMLInputElement>(null);
  const hasilRef = useRef<HTMLHeadingElement>(null);

  /* ----------------------------------------------------------
     FILE VALIDATION & LOAD
  ---------------------------------------------------------- */
  function validateFile(file: File): string | null {
    if (!file.type.startsWith("image/")) {
      return "Format file tidak didukung. Harap unggah file gambar (JPG, PNG, WEBP).";
    }
    if (file.size === 0) {
      return "File tampak kosong. Harap pilih file yang valid.";
    }
    if (file.size > 8 * 1024 * 1024) {
      return "Ukuran file terlalu besar (maks. 8 MB). Kompres gambar terlebih dahulu.";
    }
    return null;
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "ref" | "qry"
  ) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    if (target === "ref") {
      await addRefFiles(files);
      setRefTab("upload");
    } else {
      const file = files[0];
      if (!file) return;
      const err = validateFile(file);
      if (err) { setErrorMsg(err); return; }
      setQryImage(await readFileAsDataUrl(file));
      setQryTab("upload");
      setResult(null);
      setErrorMsg(null);
    }
  };

  // Tambah beberapa pembanding sekaligus (maks. 5 total); file tidak valid dilewati dengan pesan.
  const addRefFiles = async (files: File[]) => {
    const slot = 5 - refImages.length;
    if (slot <= 0) {
      setErrorMsg("Maks. 5 tanda tangan pembanding. Harap hapus beberapa.");
      return;
    }
    const diterima: string[] = [];
    let pesan: string | null = null;
    for (const f of files.slice(0, slot)) {
      const err = validateFile(f);
      if (err) { pesan = err; continue; }
      diterima.push(await readFileAsDataUrl(f));
    }
    if (files.length > slot) {
      pesan = `Hanya ${slot} file pertama yang dipakai (maks. 5 pembanding).`;
    }
    if (diterima.length > 0) setRefImages((prev) => [...prev, ...diterima].slice(0, 5));
    setResult(null);
    setErrorMsg(pesan);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, target: "ref" | "qry") => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length === 0) return;
    if (target === "ref") {
      await addRefFiles(files);
      return;
    }
    const file = files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setErrorMsg(err); return; }
    setQryImage(await readFileAsDataUrl(file));
    setResult(null);
    setErrorMsg(null);
  };

  const removeRef = (idx: number) => {
    setRefImages((prev) => prev.filter((_, i) => i !== idx));
    setResult(null);
  };

  /* ----------------------------------------------------------
     MODAL
  ---------------------------------------------------------- */
  const openModal = (target: "ref" | "qry", tab: InputTab) => {
    setModalTarget(target);
    setModalTab(tab);
    setIsModalOpen(true);
  };

  /* ----------------------------------------------------------
     VERIFY
  ---------------------------------------------------------- */
  const handleVerify = async () => {
    if (refImages.length === 0 || !qryImage) {
      setErrorMsg("Harap siapkan tanda tangan pembanding dan tanda tangan yang diperiksa.");
      return;
    }
    if (refImages.length > 5) {
      setErrorMsg("Maks. 5 tanda tangan pembanding. Harap hapus beberapa.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const body: Record<string, unknown> = {
        qry_image: qryImage,
        run_shake_test: true,
      };
      if (refImages.length === 1) {
        body.ref_image = refImages[0];
      } else {
        body.ref_images = refImages;
      }

      const res = await fetch("http://127.0.0.1:8000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let serverMsg = "Gagal memproses gambar pada server backend.";
        try {
          const errData = await res.json();
          if (errData?.detail) serverMsg = errData.detail;
        } catch {}
        throw new Error(serverMsg);
      }

      const data: VerifyResponse = await res.json();
      setResult(data);

      setTimeout(() => {
        hasilRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      const msg = (err instanceof Error) ? err.message : String(err);
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("connect")) {
        setErrorMsg("Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8000.");
      } else {
        setErrorMsg(msg);
      }
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  /* ----------------------------------------------------------
     SAMPLE PAIRS
  ---------------------------------------------------------- */
  const handleLoadSamplePair = async (pair: SamplePair) => {
    setSampleLoading(true);
    setSampleError(null);
    setSampleResult(null);
    setShowSampleGT(false);
    setActiveSampleId(pair.id);

    try {
      const [refB64, qryB64] = await Promise.all([
        fetchSampleImage(pair.ref_file),
        fetchSampleImage(pair.qry_file),
      ]);

      // Run verify
      const res = await fetch("http://127.0.0.1:8000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref_image: refB64,
          qry_image: qryB64,
          run_shake_test: true,
        }),
      });

      if (!res.ok) throw new Error("Server error saat memproses contoh.");
      const data: VerifyResponse = await res.json();
      setSampleResult(data);
      setShowSampleGT(false);
    } catch (err: unknown) {
      const msg = (err instanceof Error) ? err.message : String(err);
      if (msg.includes("fetch") || msg.includes("network")) {
        setSampleError("Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8000.");
      } else {
        setSampleError(msg);
      }
    } finally {
      setSampleLoading(false);
    }
  };

  /* ----------------------------------------------------------
     RESET
  ---------------------------------------------------------- */
  const handleReset = () => {
    setRefImages([]);
    setQryImage(null);
    setRefTab("upload");
    setQryTab("upload");
    setResult(null);
    setErrorMsg(null);
    setActiveSampleId(null);
    setSampleResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ----------------------------------------------------------
     RESULT DERIVATIONS & INTEGRATION (LANGKAH 5)
  ---------------------------------------------------------- */
  const view = useMemo(() => (result ? parseVerifyResponse(result) : null), [result]);
  const sampleView = useMemo(() => (sampleResult ? parseVerifyResponse(sampleResult) : null), [sampleResult]);

  const refProcessedImg =
    view?.processed?.reference ||
    result?.steps?.ref?.final ||
    result?.steps?.ref?.hasil ||
    result?.ref_processed_img ||
    refImages[0] ||
    "";

  const qryProcessedImg =
    view?.processed?.query ||
    result?.steps?.qry?.final ||
    result?.steps?.qry?.hasil ||
    result?.qry_processed_img ||
    qryImage ||
    "";

  const showOneRefWarning =
    result !== null &&
    (view?.status === "Belum Yakin" || view?.status === "Palsu") &&
    refImages.length === 1;

  const mainResultWithFallbacks: VerifyResult | null = useMemo(() => {
    if (!view) return null;
    return {
      ...view,
      processed: {
        reference: refProcessedImg,
        query: qryProcessedImg,
      },
    };
  }, [view, refProcessedImg, qryProcessedImg]);

  const mainCheckState: CheckState = useMemo(() => {
    if (isLoading) return { kind: "loading" };
    if (errorMsg) return { kind: "error", message: errorMsg };
    if (mainResultWithFallbacks) return { kind: "success", result: mainResultWithFallbacks };
    return { kind: "idle" };
  }, [isLoading, errorMsg, mainResultWithFallbacks]);

  const sampleCheckState: CheckState = useMemo(() => {
    if (sampleLoading) return { kind: "loading" };
    if (sampleError) return { kind: "error", message: sampleError };
    if (sampleView) return { kind: "success", result: sampleView };
    return { kind: "idle" };
  }, [sampleLoading, sampleError, sampleView]);

  const activeCheckState: CheckState = useMemo(() => {
    if (isLoading) return { kind: "loading" };
    if (errorMsg) return { kind: "error", message: errorMsg };
    if (mainResultWithFallbacks) return { kind: "success", result: mainResultWithFallbacks };
    if (sampleLoading) return { kind: "loading" };
    if (sampleError) return { kind: "error", message: sampleError };
    if (sampleView) return { kind: "success", result: sampleView };
    return { kind: "idle" };
  }, [isLoading, errorMsg, mainResultWithFallbacks, sampleLoading, sampleError, sampleView]);

  const modelInfoRows = useMemo(() => {
    return modelInfo ? parseModelInfo(modelInfo) : [];
  }, [modelInfo]);

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */
  return (
    <div className="flex min-h-screen flex-col bg-background text-heading font-sans antialiased">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={refFileInputRef}
        onChange={(e) => handleFileUpload(e, "ref")}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={qryFileInputRef}
        onChange={(e) => handleFileUpload(e, "qry")}
        accept="image/*"
        className="hidden"
      />

      {/* Signature Input Modal */}
      <SignatureInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalTab}
        title={modalTarget === "ref" ? "Tanda Tangan Acuan" : "Tanda Tangan yang Diperiksa"}
        onApplySignature={(dataUrl) => {
          if (modalTarget === "ref") {
            if (refImages.length >= 5) {
              setErrorMsg("Maks. 5 tanda tangan pembanding. Harap hapus beberapa.");
            } else {
              setRefImages((prev) => [...prev, dataUrl]);
              setRefTab(modalTab);
            }
          } else {
            setQryImage(dataUrl);
            setQryTab(modalTab);
          }
          setResult(null);
          setIsModalOpen(false);
        }}
      />

      <Navbar />

      <main className="relative flex-1 overflow-clip bg-background pb-16 pt-28 sm:pt-32">
        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-auto max-w-6xl px-5 sm:px-8 mb-6">
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          </div>
        )}

        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10">
          {/* ══════════════════════════════════════════
               KOLOM KIRI
          ══════════════════════════════════════════ */}
          <div className="flex min-w-0 flex-col gap-6">
            <header>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#010211] tracking-tight">
                Tanda tangan ini <br />
                asli atau tidak?
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600 text-sm sm:text-base leading-relaxed">
                Unggah 1 sampai 5 foto tanda tangan asli sebagai contoh, lalu satu foto tanda
                tangan yang ingin diperiksa. Sistem akan menilai seberapa mirip keduanya.
              </p>
            </header>

            {/* Input Boxes (Sesuai Referensi & Lengkap Fungsionalitas) */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* KARTU INPUT KIRI: Tanda Tangan Asli */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-[#010211]">
                    Tanda Tangan Asli
                  </h2>
                  <div className="flex items-center gap-2">
                    {refImages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { setRefImages([]); setResult(null); }}
                        className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Hapus Semua
                      </button>
                    )}
                    <span className="text-xs text-slate-500 font-medium">
                      {refImages.length} dari 5 foto
                    </span>
                  </div>
                </div>

                {/* Drop/Preview Box */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, "ref")}
                  onClick={() => { if (refImages.length === 0) refFileInputRef.current?.click(); }}
                  className={`group rounded-2xl border-2 border-dashed border-[#3FA3C3]/60 bg-[#F4F9FD]/60 hover:border-[#1E65AB] hover:bg-[#F0F7FC] transition-all p-6 flex flex-col items-center justify-center text-center min-h-[220px] ${refImages.length === 0 ? "cursor-pointer" : ""}`}
                >
                  {refImages.length > 0 ? (
                    <div className="w-full flex flex-col gap-2.5 overflow-y-auto max-h-[240px] pr-0.5">
                      {refImages.map((img, idx) => (
                        <div key={idx} className="relative flex-shrink-0 h-14 bg-white border border-slate-200/90 rounded-xl flex items-center px-3 gap-3 shadow-xs">
                          <img src={img} alt={`Asli ${idx + 1}`} className="h-10 w-14 object-contain rounded bg-white border border-slate-200" />
                          <span className="text-xs font-semibold text-[#010211] flex-1 text-left">Foto Asli {idx + 1}</span>
                          <button
                            type="button"
                            onClick={(ev) => { ev.stopPropagation(); removeRef(idx); }}
                            className="p-1 rounded-md text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            aria-label={`Hapus pembanding ${idx + 1}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {refImages.length < 5 && (
                        <button
                          type="button"
                          onClick={(ev) => { ev.stopPropagation(); refFileInputRef.current?.click(); }}
                          className="mt-1 text-xs font-semibold text-[#1E65AB] hover:underline flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[#1E65AB]/40 hover:bg-[#D6ECFA]/30 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah foto ({refImages.length}/5)
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="h-16 w-16 rounded-2xl bg-[#D6ECFA]/70 text-[#0C7AB5] flex items-center justify-center mb-3 transition-transform group-hover:scale-105">
                        <FileUp className="h-8 w-8" aria-hidden="true" />
                      </div>
                      <span className="text-sm font-semibold text-[#0B2545]">
                        Klik di sini atau tarik foto ke kotak ini
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        Format PNG atau JPG, 1 sampai 5 foto
                      </span>
                    </>
                  )}
                </div>

                {/* Akses Fungsionalitas: Kamera, Pad Layar, Udara */}
                <div className="mt-2.5 flex items-center justify-between px-1 text-xs flex-wrap gap-2">
                  <span className="text-slate-500 font-medium">Metode lain:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openModal("ref", "camera")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#1E65AB] hover:text-[#1E65AB] text-slate-700 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#0C7AB5]" /> Kamera
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal("ref", "pad")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#1E65AB] hover:text-[#1E65AB] text-slate-700 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <PenTool className="w-3.5 h-3.5 text-[#0C7AB5]" /> Pad Layar
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal("ref", "air")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#1E65AB] hover:text-[#1E65AB] text-slate-700 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Wind className="w-3.5 h-3.5 text-[#0C7AB5]" /> Udara
                    </button>
                  </div>
                </div>
              </div>

              {/* KARTU INPUT KANAN: Tanda Tangan yang Diperiksa */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-[#010211]">
                    Tanda Tangan yang Diperiksa
                  </h2>
                  {qryImage && (
                    <button
                      type="button"
                      onClick={() => { setQryImage(null); setResult(null); }}
                      className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Ganti Foto
                    </button>
                  )}
                </div>

                {/* Drop/Preview Box */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, "qry")}
                  onClick={() => { if (!qryImage) qryFileInputRef.current?.click(); }}
                  className={`group rounded-2xl border-2 border-dashed border-[#3FA3C3]/60 bg-[#F4F9FD]/60 hover:border-[#1E65AB] hover:bg-[#F0F7FC] transition-all p-6 flex flex-col items-center justify-center text-center min-h-[220px] ${!qryImage ? "cursor-pointer" : ""}`}
                >
                  {qryImage ? (
                    <div className="relative w-full h-[180px] bg-white rounded-xl p-2.5 flex items-center justify-center border border-slate-200 shadow-xs">
                      <img src={qryImage} alt="Tanda Tangan yang Diperiksa" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <>
                      <div className="h-16 w-16 rounded-2xl bg-[#D6ECFA]/70 text-[#0C7AB5] flex items-center justify-center mb-3 transition-transform group-hover:scale-105">
                        <FileUp className="h-8 w-8" aria-hidden="true" />
                      </div>
                      <span className="text-sm font-semibold text-[#0B2545]">
                        Klik di sini atau tarik foto ke kotak ini
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        Format PNG atau JPG, 1 foto
                      </span>
                    </>
                  )}
                </div>

                {/* Akses Fungsionalitas: Kamera, Pad Layar, Udara */}
                <div className="mt-2.5 flex items-center justify-between px-1 text-xs flex-wrap gap-2">
                  <span className="text-slate-500 font-medium">Metode lain:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openModal("qry", "camera")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#1E65AB] hover:text-[#1E65AB] text-slate-700 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#0C7AB5]" /> Kamera
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal("qry", "pad")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#1E65AB] hover:text-[#1E65AB] text-slate-700 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <PenTool className="w-3.5 h-3.5 text-[#0C7AB5]" /> Pad Layar
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal("qry", "air")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#1E65AB] hover:text-[#1E65AB] text-slate-700 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Wind className="w-3.5 h-3.5 text-[#0C7AB5]" /> Udara
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Periksa Tanda Tangan (Persis Gambar 4) */}
            <div className="flex justify-center my-4">
              <button
                type="button"
                onClick={handleVerify}
                disabled={refImages.length === 0 || !qryImage || isLoading}
                className={`inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-3.5 text-base font-bold shadow-soft transition-all ${
                  refImages.length === 0 || !qryImage
                    ? "bg-[#96BEDB] text-white cursor-not-allowed"
                    : "bg-[#1E65AB] hover:bg-[#0C7AB5] text-white cursor-pointer hover:shadow-md"
                }`}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Memeriksa...
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-5 w-5" /> Periksa Tanda Tangan
                  </>
                )}
              </button>
            </div>

            {/* Contoh Siap Pakai */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 sm:p-5 shadow-xs">
              <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                — atau coba contoh siap pakai —
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SAMPLE_PAIRS.map((pair) => (
                  <button
                    key={pair.id}
                    type="button"
                    onClick={() => handleLoadSamplePair(pair)}
                    disabled={sampleLoading}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                      activeSampleId === pair.id
                        ? "bg-[#1E65AB] text-white border-[#1E65AB] shadow-soft"
                        : "bg-white text-slate-700 border-slate-300 hover:border-[#1E65AB] hover:text-[#1E65AB] hover:bg-[#F4F9FD]"
                    }`}
                  >
                    {pair.label}
                  </button>
                ))}
              </div>

              {/* Sample Result Info */}
              {activeSampleId && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#010211]">
                      {SAMPLE_PAIRS.find((p) => p.id === activeSampleId)?.label}
                    </span>
                    {!showSampleGT ? (
                      <button
                        type="button"
                        onClick={() => setShowSampleGT(true)}
                        className="text-xs font-semibold text-[#1E65AB] hover:underline cursor-pointer"
                      >
                        Lihat fakta sebenarnya
                      </button>
                    ) : (
                      <span className="text-xs font-semibold">
                        Fakta sebenarnya:{" "}
                        <span className={SAMPLE_PAIRS.find((p) => p.id === activeSampleId)?.ground_truth === "asli" ? "text-status-asli-ink font-bold" : "text-status-palsu-ink font-bold"}>
                          {SAMPLE_PAIRS.find((p) => p.id === activeSampleId)?.ground_truth === "asli" ? "ASLI" : "TIRUAN"}
                        </span>
                      </span>
                    )}
                  </div>
                  {showSampleGT && SAMPLE_PAIRS.find((p) => p.id === activeSampleId)?.model_note && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2 font-medium">
                      {SAMPLE_PAIRS.find((p) => p.id === activeSampleId)?.model_note}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Judul & Tampilan Hasil (Persis Gambar 4) */}
            <section aria-labelledby="hasil-title" className="mt-4 flex flex-col gap-4">
              <h2
                id="hasil-title"
                ref={hasilRef}
                className="text-2xl sm:text-3xl font-extrabold text-[#010211] tracking-tight scroll-mt-28"
              >
                Hasil Pemeriksaan
              </h2>

              <ResultCard
                state={activeCheckState}
                onRetry={() => {
                  if (result) handleVerify();
                  else if (activeSampleId) {
                    const p = SAMPLE_PAIRS.find((pair) => pair.id === activeSampleId);
                    if (p) handleLoadSamplePair(p);
                  }
                }}
              />

              {/* Anjuran tambah pembanding */}
              {showOneRefWarning && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-800 font-medium">
                  Tambahkan 3–5 tanda tangan asli sebagai pembanding agar hasil lebih akurat.
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-500">
                Hasil ini hanya petunjuk awal, bukan bukti hukum.
              </p>

              {/* Disclaimer */}
              <div className="text-xs text-slate-500 leading-relaxed">
                <p>
                  Disclaimer: Hasil adalah <strong>indikasi kecurigaan, bukan bukti hukum</strong>. Keputusan akhir mengenai keaslian tanda tangan tetap memerlukan pertimbangan ahli dan konteks penggunaan.
                </p>
              </div>
            </section>
          </div>

          {/* ══════════════════════════════════════════
               KOLOM KANAN (Langkah 5)
          ══════════════════════════════════════════ */}
          <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <ExplanationPanel
              state={activeCheckState}
              onReset={handleReset}
              onRetry={() => {
                if (result) handleVerify();
                else if (activeSampleId) {
                  const p = SAMPLE_PAIRS.find((pair) => pair.id === activeSampleId);
                  if (p) handleLoadSamplePair(p);
                }
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ============================================================
   KOMPONEN: KETERBATASAN
   ============================================================ */
function KeterbatasanBox() {
  return (
    <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70">
      <h3 className="font-semibold text-sm text-amber-900 mb-2">Keterbatasan</h3>
      <ul className="list-disc list-inside space-y-1 text-xs text-amber-800">
        <li>Dilatih dari tanda tangan hasil scan; foto berbayangan atau buram menurunkan akurasi.</li>
        <li>Batas keputusan sengaja ketat untuk menekan tanda tangan palsu yang lolos; akibatnya banyak tanda tangan asli berstatus "Belum yakin". Tambahkan pembanding (hingga 5) atau minta tinjauan manusia.</li>
        <li>Uji dataset mandiri hanya 3 orang; angka tiruan lolos pada data foto sendiri hanya indikasi, bukan jaminan.</li>
        <li>Hasil adalah indikasi kecurigaan, bukan bukti hukum.</li>
      </ul>
    </div>
  );
}

/* Suppress unused import warning for useEffect */
void useEffect;
