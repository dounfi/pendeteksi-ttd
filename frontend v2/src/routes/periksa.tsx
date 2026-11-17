import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { SignatureInputModal, type InputTab } from "../components/SignatureInputModal";
import { useModelInfo } from "../hooks/useModelInfo";

export const Route = createFileRoute("/periksa")({
  head: () => ({
    meta: [
      { title: "Periksa Tanda Tangan – SignaCheck" },
      {
        name: "description",
        content:
          "Unggah tanda tangan pembanding dan tanda tangan yang ingin diperiksa menggunakan model Siamese CNN.",
      },
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
  };

  /* ----------------------------------------------------------
     RESULT DERIVATIONS
  ---------------------------------------------------------- */
  const threshold = result?.threshold ?? modelInfo?.threshold ?? 0.3369181156158447;
  const raguZ = result?.ragu_z ?? modelInfo?.ragu_z;
  // Zona ragu dalam SATUAN JARAK (ragu_margin), bukan z-score (ragu_z).
  const raguMargin = result?.ragu_margin ?? modelInfo?.ragu_margin ?? null;
  const shakeData = result?.shake_test || result?.shake_info;

  // Lebar pita bar indikator (skala bar = 0 .. 2*threshold, batas tepat di tengah)
  const bandRagu = raguMargin != null ? Math.min(100, Math.max(0, (2 * raguMargin / (2 * threshold)) * 100)) : 18;
  const bandSisi = (100 - bandRagu) / 2;

  // Three-status logic
  // Sumber tunggal status = backend (r.status). Fallback lokal hanya untuk respons lama.
  const deriveStatus = (
    r: VerifyResponse | null,
    thr: number,
    shake: ShakeData | undefined
  ): DisplayStatus => {
    if (!r) return "BELUM YAKIN";
    if (r.status) return r.status;
    if (shake && !shake.is_confident) return "BELUM YAKIN";
    return r.distance <= thr ? "ASLI" : "PALSU";
  };

  const displayStatus = deriveStatus(result, threshold, shakeData);

  const percentNumber = result
    ? Math.round(
        result.similarity_pct ??
          result.similarity_percentage ??
          Math.max(0, Math.min(100, (1 - result.distance / (threshold * 2)) * 100))
      )
    : 0;

  const percentColor =
    displayStatus === "ASLI"
      ? "text-[#088152]"
      : displayStatus === "BELUM YAKIN"
        ? "text-[#8A6A00]"
        : "text-[#A12F2F]";

  const statusExplanation =
    displayStatus === "ASLI"
      ? "Pola tanda tangan sangat mirip dengan pembanding."
      : displayStatus === "BELUM YAKIN"
        ? "Hasil berada di area meragukan. Disarankan pemeriksaan lebih lanjut."
        : "Pola tanda tangan berbeda dari pembanding.";

  const markerPosition = result
    ? Math.max(2, Math.min(98, (result.distance / (2 * threshold)) * 100))
    : 13;

  const refProcessedImg =
    result?.steps?.ref?.final ||
    result?.steps?.ref?.hasil ||
    result?.ref_processed_img ||
    refImages[0] ||
    "";

  const qryProcessedImg =
    result?.steps?.qry?.final ||
    result?.steps?.qry?.hasil ||
    result?.qry_processed_img ||
    qryImage ||
    "";

  const showOneRefWarning =
    result !== null &&
    (displayStatus === "BELUM YAKIN" || displayStatus === "PALSU") &&
    refImages.length === 1;

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-white text-[#010211] font-['Work_Sans',sans-serif] antialiased overflow-x-hidden selection:bg-[#0C7AB5] selection:text-white">
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

      <main className="w-full max-w-[1440px] mx-auto pt-[140px] px-4 sm:px-8 lg:px-[70px] pb-24">
        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start justify-center gap-[65px]">
          {/* ══════════════════════════════════════════
               KOLOM KIRI
          ══════════════════════════════════════════ */}
          <section className="w-full lg:w-[666px] flex flex-col shrink-0">
            {/* Judul */}
            <h1 className="text-[#010211] text-3xl sm:text-4xl font-bold leading-tight">
              Tanda tangan ini asli atau tidak?
            </h1>
            <p className="text-[#010211] text-base sm:text-lg font-normal leading-relaxed mt-3 max-w-[650px]">
              Unggah tanda tangan yang pasti asli sebagai pembanding (1–5 sampel), lalu satu
              tanda tangan yang ingin diperiksa. Model akan menilai rata-rata jarak ke k
              pembanding.
            </p>

            {/* Input Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[26px] mt-6">
              {/* KARTU INPUT KIRI: Pembanding */}
              <div className="bg-[#DEE9F3] rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F8EBC]/20 text-[#1E65AB]">
                    DOKUMEN ACUAN SAH
                  </span>
                  {refImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setRefImages([]); setResult(null); setRefTab("upload"); }}
                      className="text-sm font-bold text-[#0C7AB5] hover:underline cursor-pointer"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>
                <h2 className="text-[#010211] text-lg font-bold mt-2.5">
                  Tanda Tangan Pembanding
                </h2>
                <p className="text-xs text-[#010211]/60 mt-0.5">1–5 sampel asli</p>

                {/* Tab Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => { setRefTab("upload"); refFileInputRef.current?.click(); }}
                    className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${refTab === "upload" ? "bg-[#0C7AB5] text-white shadow-xs" : "bg-white/60 text-[#1E65AB] hover:bg-white"}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>1. Unggah</span>
                  </button>
                  <button type="button" onClick={() => { setRefTab("camera"); openModal("ref", "camera"); }} className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${refTab === "camera" ? "bg-[#0C7AB5] text-white shadow-xs" : "bg-white/60 text-[#1E65AB] hover:bg-white"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                    <span>2. Kamera</span>
                  </button>
                  <button type="button" onClick={() => { setRefTab("pad"); openModal("ref", "pad"); }} className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${refTab === "pad" ? "bg-[#0C7AB5] text-white shadow-xs" : "bg-white/60 text-[#1E65AB] hover:bg-white"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    <span>3. Pad Layar</span>
                  </button>
                  <button type="button" onClick={() => { setRefTab("air"); openModal("ref", "air"); }} className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${refTab === "air" ? "bg-[#0C7AB5] text-white shadow-xs" : "bg-white/60 text-[#1E65AB] hover:bg-white"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.9-2.3L2.3 15.9a1.5 1.5 0 0 1 .3-2.3l.5-.4a2 2 0 0 1 2.5.2L7 15" /></svg>
                    <span>4. Udara</span>
                  </button>
                </div>

                {/* Drop/Preview area */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, "ref")}
                  onClick={() => { if (refImages.length === 0) refFileInputRef.current?.click(); }}
                  className="h-[240px] mt-3 bg-[#D0DCE7] border-2 border-dashed border-[#1F8EBC]/50 rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-[#D0DCE7]/80 transition-colors overflow-hidden"
                >
                  {refImages.length > 0 ? (
                    <div className="w-full h-full flex flex-col gap-1 overflow-y-auto">
                      {refImages.map((img, idx) => (
                        <div key={idx} className="relative flex-shrink-0 h-16 bg-white rounded-lg flex items-center px-2 gap-2">
                          <img src={img} alt={`Pembanding ${idx + 1}`} className="h-12 w-16 object-contain" />
                          <span className="text-xs font-semibold text-[#010211]/60 flex-1 text-left">Pembanding {idx + 1}</span>
                          <button
                            type="button"
                            onClick={(ev) => { ev.stopPropagation(); removeRef(idx); }}
                            className="text-xs text-red-500 hover:text-red-700 font-bold px-1"
                          >✕</button>
                        </div>
                      ))}
                      {refImages.length < 5 && (
                        <button
                          type="button"
                          onClick={(ev) => { ev.stopPropagation(); refFileInputRef.current?.click(); }}
                          className="mt-1 text-xs font-bold text-[#0C7AB5] underline"
                        >
                          + Tambah pembanding ({refImages.length}/5)
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <img src="/assets/icons/basil_file-upload-outline.png" alt="Ikon Unggah" className="w-28 h-28 sm:w-36 sm:h-36 opacity-25 object-contain pointer-events-none" />
                      <span className="text-sm text-[#010211]/70 font-normal mt-1">Klik atau seret gambar ke sini</span>
                    </>
                  )}
                </div>
              </div>

              {/* KARTU INPUT KANAN: Yang Diperiksa */}
              <div className="bg-[#DEE9F3] rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F8EBC]/20 text-[#1E65AB]">
                    DOKUMEN PERTANYAAN
                  </span>
                  {qryImage && (
                    <button type="button" onClick={() => { setQryImage(null); setResult(null); setQryTab("upload"); }} className="text-sm font-bold text-[#0C7AB5] hover:underline cursor-pointer">
                      Ganti Tanda Tangan
                    </button>
                  )}
                </div>
                <h2 className="text-[#010211] text-lg font-bold mt-2.5">Tanda Tangan yang Diperiksa</h2>
                <p className="text-xs text-[#010211]/60 mt-0.5">1 tanda tangan</p>

                {/* Tab Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button type="button" onClick={() => { setQryTab("upload"); qryFileInputRef.current?.click(); }} className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${qryTab === "upload" ? "bg-[#0C7AB5] text-white shadow-xs" : "bg-white/60 text-[#1E65AB] hover:bg-white"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    <span>1. Unggah</span>
                  </button>
                  <button type="button" onClick={() => { setQryTab("camera"); openModal("qry", "camera"); }} className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${qryTab === "camera" ? "bg-[#0C7AB5] text-white shadow-xs" : "bg-white/60 text-[#1E65AB] hover:bg-white"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                    <span>2. Kamera</span>
                  </button>
                  <button type="button" onClick={() => { setQryTab("pad"); openModal("qry", "pad"); }} className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${qryTab === "pad" ? "bg-[#0C7AB5] text-white shadow-xs" : "bg-white/60 text-[#1E65AB] hover:bg-white"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    <span>3. Pad Layar</span>
                  </button>
                  <button type="button" onClick={() => { setQryTab("air"); openModal("qry", "air"); }} className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${qryTab === "air" ? "bg-[#0C7AB5] text-white shadow-xs" : "bg-white/60 text-[#1E65AB] hover:bg-white"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.9-2.3L2.3 15.9a1.5 1.5 0 0 1 .3-2.3l.5-.4a2 2 0 0 1 2.5.2L7 15" /></svg>
                    <span>4. Udara</span>
                  </button>
                </div>

                {/* Drop/Preview area */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, "qry")}
                  onClick={() => { if (!qryImage) qryFileInputRef.current?.click(); }}
                  className="h-[240px] mt-3 bg-[#D0DCE7] border-2 border-dashed border-[#1F8EBC]/50 rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-[#D0DCE7]/80 transition-colors overflow-hidden"
                >
                  {qryImage ? (
                    <div className="relative w-full h-full bg-white rounded-lg p-2 flex items-center justify-center">
                      <img src={qryImage} alt="Tanda Tangan yang Diperiksa" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <>
                      <img src="/assets/icons/basil_file-upload-outline.png" alt="Ikon Unggah" className="w-28 h-28 sm:w-36 sm:h-36 opacity-25 object-contain pointer-events-none" />
                      <span className="text-sm text-[#010211]/70 font-normal mt-1">Klik atau seret gambar ke sini</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Contoh Siap Pakai */}
            <div className="mt-4">
              <p className="text-center text-sm font-semibold text-[#010211]/60 mb-2">— atau coba contoh siap pakai —</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SAMPLE_PAIRS.map((pair) => (
                  <button
                    key={pair.id}
                    type="button"
                    onClick={() => handleLoadSamplePair(pair)}
                    disabled={sampleLoading}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${activeSampleId === pair.id ? "bg-[#0C7AB5] text-white border-[#0C7AB5]" : "bg-white text-[#1E65AB] border-[#1E65AB]/40 hover:border-[#0C7AB5]"}`}
                  >
                    {pair.label}
                  </button>
                ))}
              </div>

              {/* Sample Result Panel */}
              {activeSampleId && (
                <SampleResultPanel
                  pair={SAMPLE_PAIRS.find((p) => p.id === activeSampleId)!}
                  result={sampleResult}
                  loading={sampleLoading}
                  error={sampleError}
                  showGT={showSampleGT}
                  onRevealGT={() => setShowSampleGT(true)}
                  threshold={threshold}
                />
              )}
            </div>

            {/* Tombol Periksa */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={handleVerify}
                disabled={refImages.length === 0 || !qryImage || isLoading}
                className={`w-[280px] py-3.5 bg-gradient-to-r from-[#0C7AB5] to-[#5BB4C9] rounded-2xl flex items-center justify-center text-[#D0DCE7] text-lg font-bold tracking-wider uppercase shadow-xs transition-opacity ${refImages.length === 0 || !qryImage || isLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"}`}
              >
                {isLoading ? "Memeriksa…" : "PERIKSA TANDA TANGAN"}
              </button>
            </div>

            {/* Judul Hasil */}
            <h2
              ref={hasilRef}
              className="text-[#010211] text-3xl sm:text-4xl font-bold mt-12 mb-4 scroll-mt-28"
            >
              Hasil Pemeriksaan
            </h2>

            {/* Hasil Card */}
            {!result ? (
              <div className="w-full bg-[#DEE9F3] rounded-2xl p-8 min-h-[160px] flex items-center justify-center text-center">
                <p className="text-[#010211]/50 text-base sm:text-lg font-normal">
                  Belum ada hasil. Unggah dua tanda tangan, lalu tekan PERIKSA TANDA TANGAN.
                </p>
              </div>
            ) : (
              <div className="w-full bg-[#DEE9F3] rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
                {/* Status Utama */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  {/* Stempel Status */}
                  {displayStatus === "ASLI" ? (
                    <img src="/assets/img/stamp-asli.png" alt="Stempel Kemungkinan Asli" className="w-[165px] h-[83px] object-contain shrink-0" />
                  ) : displayStatus === "BELUM YAKIN" ? (
                    <div className="w-[165px] h-[83px] border-4 border-double border-[#8A6A00] text-[#8A6A00] bg-[#CFAF58]/15 -rotate-8 rounded-lg flex items-center justify-center font-bold text-xl tracking-wider select-none shrink-0 shadow-xs">
                      BELUM YAKIN
                    </div>
                  ) : (
                    <div className="w-[165px] h-[83px] border-4 border-double border-[#CF5757] text-[#CF5757] bg-[#CF5757]/15 -rotate-8 rounded-lg flex items-center justify-center font-bold text-base leading-tight text-center tracking-wider select-none shrink-0 px-2 shadow-xs">
                      KEMUNGKINAN PALSU
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    {/* Teks Status */}
                    <span className={`text-2xl font-bold ${percentColor}`}>
                      {displayStatus === "ASLI" ? "ASLI" : displayStatus === "BELUM YAKIN" ? "BELUM YAKIN" : "PALSU"}
                    </span>
                    <p className="text-[#010211] text-base font-normal leading-snug max-w-[320px]">
                      {statusExplanation}
                    </p>
                    {/* Skor Kemiripan */}
                    <p className="text-sm text-[#010211]/70">
                      <span className="font-bold">Indeks kedekatan: </span>
                      <span className={`font-bold ${percentColor}`}>{percentNumber}%</span>
                      {" "}
                      <span className="text-xs text-[#010211]/50">(50% = tepat di batas keputusan; bukan peluang statistik)</span>
                    </p>
                    {result.status_reasons && result.status_reasons.length > 0 && (
                      <ul className="text-xs text-[#8A6A00] font-medium list-disc pl-4">
                        {result.status_reasons.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                    {(result.fusion?.decision ?? result.fusion_decision) && (
                      <p className="text-xs text-[#010211]/60 font-medium">
                        Pembanding tambahan (model + ciri klasik):{" "}
                        <span className="font-bold">{result.fusion?.decision ?? result.fusion_decision}</span>
                        {result.fusion && result.fusion.agrees_with_model === false && (
                          <span className="text-[#8A6A00]"> · berbeda dari keputusan model, tinjau lebih hati-hati</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bar Indikator */}
                <div className="w-full">
                  <div className="relative w-full">
                    <div className="w-full h-4 rounded-sm flex overflow-hidden">
                      <div className="h-full bg-[#58CF71]" style={{ width: `${bandSisi}%` }} />
                      <div className="h-full bg-[#CFAF58]" style={{ width: `${bandRagu}%` }} />
                      <div className="h-full bg-[#CF5757]" style={{ width: `${bandSisi}%` }} />
                    </div>
                    <div className="absolute top-[-6px] w-[6px] h-7 bg-[#3B3B43] rounded-md pointer-events-none -translate-x-1/2" style={{ left: `${markerPosition}%` }} aria-hidden="true" />
                  </div>
                  <div className="relative flex justify-between items-start mt-1.5 pt-0.5">
                    <span className="text-[10px] text-[#010211] font-normal">Mirip</span>
                    <span className="absolute -translate-x-1/2 text-[10px] text-[#010211] font-bold whitespace-nowrap" style={{ left: `${markerPosition}%` }}>
                      Jarak {result.distance.toFixed(4)}
                    </span>
                    <span className="text-[10px] text-[#010211] font-normal">Berbeda</span>
                  </div>
                  <p className="text-[10px] text-[#010211]/50 mt-1">
                    Batas keputusan: {threshold.toFixed(4)}
                    {raguMargin != null ? ` · zona ragu: ±${raguMargin.toFixed(4)} (satuan jarak)` : ""}
                    {raguZ ? ` · ambang keyakinan Uji Goyang: z ≥ ${raguZ.toFixed(2)}` : ""}
                  </p>
                </div>

                {/* Peringatan kualitas / validasi input */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-800">
                    <p className="font-bold mb-1">Perhatikan kualitas input:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                {/* Anjuran tambah pembanding */}
                {showOneRefWarning && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-800 font-medium">
                    Tambahkan 3–5 tanda tangan asli sebagai pembanding agar hasil lebih akurat.
                  </div>
                )}

                {/* Tombol Reset */}
                <div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-[288px] py-3.5 border-[3px] border-[#1E65AB] text-[#1E65AB] text-lg font-bold rounded-2xl bg-transparent hover:bg-[#1E65AB]/10 transition-colors inline-flex justify-center items-center cursor-pointer shadow-xs"
                  >
                    Periksa Pasangan Lain
                  </button>
                </div>
              </div>
            )}

            {/* Kotak Keterbatasan */}
            <KeterbatasanBox />

            {/* Disclaimer */}
            <div className="mt-4 text-[#010211]/50 text-sm font-normal leading-relaxed">
              <p>
                Disclaimer: Hasil adalah <strong>indikasi kecurigaan, bukan bukti hukum</strong>. Keputusan akhir mengenai keaslian tanda tangan tetap memerlukan pertimbangan ahli dan konteks penggunaan.
              </p>
            </div>
          </section>

          {/* ══════════════════════════════════════════
               KOLOM KANAN
          ══════════════════════════════════════════ */}
          <section className="w-full lg:w-[606px] flex flex-col shrink-0">
            <h2 className="text-[#010211] text-3xl sm:text-4xl font-bold leading-tight">
              Penjelasan Lebih Lanjut
            </h2>

            {/* Panel Hasil Kanan */}
            {!result ? (
              <div className="w-full bg-[#DEE9F3] rounded-2xl p-8 mt-4 sm:mt-6 min-h-[380px] flex items-center justify-center text-center">
                <p className="text-[#010211]/50 text-base sm:text-lg font-normal">
                  Belum ada hasil. Unggah dua tanda tangan, lalu tekan PERIKSA TANDA TANGAN.
                </p>
              </div>
            ) : (
              <div className="w-full bg-[#DEE9F3] rounded-2xl p-4 sm:p-5 mt-4 sm:mt-6 flex flex-col">
                {/* Gambar Olahan */}
                <h3 className="text-[#010211] text-lg font-bold">Gambar Setelah Diolah</h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-[35px] mt-3">
                  <div className="flex flex-col items-center">
                    <img src={refProcessedImg} alt="Tanda tangan pembanding (diolah)" className="w-[250px] h-[167px] object-cover rounded-sm shadow-xs bg-white" />
                    <span className="text-[#010211] text-base font-normal mt-2.5">Pembanding (diolah)</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src={qryProcessedImg} alt="Tanda tangan yang diperiksa (diolah)" className="w-[250px] h-[167px] object-cover rounded-sm shadow-xs bg-white" />
                    <span className="text-[#010211] text-base font-normal mt-2.5">Yang diperiksa (diolah)</span>
                  </div>
                </div>

                <hr className="border-t border-[#1F8EBC]/50 my-6" />

                {/* Peta penjelasan model (oklusi pada embedding) */}
                {result.explain_map && (
                  <>
                    <h3 className="text-[#010211] text-lg font-bold">Bagian yang Paling Membedakan (menurut model)</h3>
                    <p className="text-xs text-[#010211]/50 mt-0.5 mb-3">
                      Area merah = bila ditutup, jarak ke pembanding turun. Artinya area itu paling mendorong model menilai
                      "berbeda". Ini perkiraan berbasis oklusi pada embedding model, bukan bukti pasti.
                    </p>
                    <div className="flex justify-center">
                      <img src={result.explain_map} alt="Peta bagian yang membedakan" className="w-full max-w-[420px] rounded-sm shadow-xs bg-white" />
                    </div>
                    <hr className="border-t border-[#1F8EBC]/50 my-6" />
                  </>
                )}

                {/* Penjelasan Pendamping (Forensik) */}
                <h3 className="text-[#010211] text-lg font-bold">
                  Penjelasan Pendamping (ciri morfologi)
                </h3>
                <p className="text-xs text-[#010211]/50 mt-0.5 mb-1">
                  Delapan ciri klasik ini penjelas pendamping, bukan alasan langsung keputusan model.
                  {result.forensic_summary && result.forensic_summary.n_pembanding > 1
                    ? ` Dibandingkan dengan nilai tengah dari ${result.forensic_summary.n_pembanding} pembanding.`
                    : ""}
                </p>
                {result.forensic_summary && (
                  <p className="text-xs font-semibold text-[#010211]/70 mb-3">
                    {result.forensic_summary.mirip} dari {result.forensic_summary.total} ciri mirip
                    {" · "}{result.forensic_summary.agak_beda} agak beda
                    {" · "}{result.forensic_summary.beda} beda.
                    {" "}<span className="font-normal text-[#010211]/50">
                      Pasangan asli pun lazim memiliki 1–3 ciri yang tampak berbeda.
                    </span>
                  </p>
                )}

                <div className="space-y-2.5">
                  {result.forensic_report && result.forensic_report.length > 0
                    ? result.forensic_report.map((item, idx) => {
                        const isSafe = item.is_safe ?? item.tingkat === "mirip";
                        const bg = isSafe ? "bg-[#58CF71]/50" : "bg-[#CF5757]/50";
                        const detailText =
                          item.explain ||
                          item.kalimat ||
                          (item.tingkat ? `Status: ${item.tingkat}` : null);
                        return (
                          <div key={idx} className={`w-full min-h-[50px] h-auto ${bg} rounded-2xl px-[18px] py-2.5 flex flex-col justify-center`}>
                            <span className="text-[#010211] text-base font-bold leading-snug">{item.label}</span>
                            {detailText && (
                              <span className="text-[#010211]/80 text-xs font-normal mt-0.5 leading-normal">{detailText}</span>
                            )}
                          </div>
                        );
                      })
                    : Array.from({ length: 8 }, (_, idx) => (
                        <div key={idx} className={`w-full min-h-[50px] h-auto ${["bg-[#58CF71]/50", "bg-[#CF5757]/50", "bg-[#CFAF58]/50"][idx % 3]} rounded-2xl px-[18px] py-2.5 flex items-center`}>
                          <span className="text-[#010211]/40 text-sm font-normal">— Ciri {idx + 1}: menunggu hasil —</span>
                        </div>
                      ))}

                  {/* Uji Goyang / Keyakinan */}
                  {shakeData && (
                    <div className={`w-full min-h-[50px] h-auto ${shakeData.is_confident ? "bg-[#58CF71]/50" : "bg-[#CFAF58]/50"} rounded-2xl px-[18px] py-2.5 flex flex-col justify-center`}>
                      <span className="text-[#010211] text-base font-bold leading-snug">
                        Uji Goyang (keyakinan): {shakeData.status}
                      </span>
                      <span className="text-[#010211]/80 text-xs font-normal mt-0.5 leading-normal">
                        Ketahanan terhadap variasi mikro citra · Z-Score (searah keputusan): {shakeData.z_score.toFixed(2)}
                        {" · "}Rata-rata jarak varian ke k pembanding: {shakeData.mean_dist.toFixed(4)}
                        {shakeData.flip_rate !== undefined && shakeData.n_variants
                          ? ` · Varian yang membalik keputusan: ${Math.round(shakeData.flip_rate * shakeData.n_variants)} dari ${shakeData.n_variants}`
                          : ""}
                        {shakeData.catatan ? ` · ${shakeData.catatan}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel Info Model */}
            <ModelInfoPanel modelInfo={modelInfo} loading={modelLoading} />
          </section>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   KOMPONEN: SAMPLE RESULT PANEL
   ============================================================ */
interface SampleResultPanelProps {
  pair: SamplePair;
  result: VerifyResponse | null;
  loading: boolean;
  error: string | null;
  showGT: boolean;
  onRevealGT: () => void;
  threshold: number;
}

function SampleResultPanel({ pair, result, loading, error, showGT, onRevealGT, threshold }: SampleResultPanelProps) {
  const shakeData = result?.shake_test || result?.shake_info;
  const deriveStatus = (): DisplayStatus => {
    if (!result) return "BELUM YAKIN";
    if (result.status) return result.status;
    if (shakeData && !shakeData.is_confident) return "BELUM YAKIN";
    return result.distance <= threshold ? "ASLI" : "PALSU";
  };
  const status = deriveStatus();
  const statusColor = status === "ASLI" ? "text-green-700" : status === "BELUM YAKIN" ? "text-yellow-700" : "text-red-700";

  return (
    <div className="mt-3 p-4 bg-[#DEE9F3] rounded-2xl border border-[#1F8EBC]/30">
      <p className="text-sm font-bold text-[#010211] mb-2">{pair.label}</p>
      {loading && <p className="text-sm text-[#010211]/50">Menjalankan model…</p>}
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      {result && !loading && (
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-semibold">Hasil model: </span>
            <span className={`font-bold ${statusColor}`}>{status}</span>
            {" · "}
            <span className="text-[#010211]/60 text-xs">Jarak: {result.distance.toFixed(4)} · Threshold: {threshold.toFixed(4)}</span>
          </p>
          {!showGT ? (
            <button
              type="button"
              onClick={onRevealGT}
              className="text-xs font-bold text-[#0C7AB5] underline cursor-pointer"
            >
              Tampilkan kebenaran sebenarnya
            </button>
          ) : (
            <div className="text-sm">
              <span className="font-semibold">Sebenarnya: </span>
              <span className={`font-bold ${pair.ground_truth === "asli" ? "text-green-700" : "text-red-700"}`}>
                {pair.ground_truth === "asli" ? "ASLI" : "TIRUAN"}
              </span>
              {pair.model_note && (
                <p className="text-xs text-amber-700 mt-1 font-medium italic">{pair.model_note}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   KOMPONEN: MODEL INFO PANEL
   ============================================================ */
import type { ModelInfo } from "../hooks/useModelInfo";

function ModelInfoPanel({ modelInfo, loading }: { modelInfo: ModelInfo | null; loading: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-6 rounded-2xl border border-[#1F8EBC]/40 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 font-bold text-sm text-[#1E65AB] hover:bg-[#DEE9F3]/60 transition-colors cursor-pointer"
      >
        <span>Info Model</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div className="px-5 pb-4 pt-1 text-sm text-[#010211]/80 space-y-1.5">
          {loading && <p className="text-[#010211]/40 italic">Memuat info model…</p>}
          {!loading && !modelInfo && <p className="text-amber-700">Tidak dapat memuat info model. Pastikan backend aktif.</p>}
          {modelInfo && (
            <>
              <InfoRow label="Nama model" value={modelInfo.nama_model} />
              <InfoRow label="Mode pengolahan citra" value={modelInfo.preprocess_mode} />
              <InfoRow label="Batas keputusan (threshold)" value={modelInfo.threshold?.toFixed(10) ?? "—"} />
              {modelInfo.ragu_z && <InfoRow label="Ambang keyakinan Uji Goyang (z-score)" value={modelInfo.ragu_z.toFixed(4)} />}
              {modelInfo.ragu_margin != null && <InfoRow label="Lebar zona ragu (satuan jarak)" value={`±${modelInfo.ragu_margin.toFixed(4)}`} />}
              <InfoRow label="Dataset latih" value="CEDAR (55) + BHSig260 Bengali (100) + Hindi (160) orang" />
              {modelInfo.status_akhir?.D3 && (
                <InfoRow
                  label="Tiruan lolos berstatus ASLI (foto sendiri, 1 pembanding)"
                  value={`${((modelInfo.status_akhir.D3.FAR_status_ASLI ?? 0) * 100).toFixed(1)}%`}
                />
              )}
              {modelInfo.status_akhir?.D3 && (
                <InfoRow
                  label="Asli yang langsung berstatus ASLI (foto sendiri, 1 pembanding)"
                  value={`${((modelInfo.status_akhir.D3.asli_dikenali_ASLI ?? 0) * 100).toFixed(1)}%`}
                />
              )}
              {modelInfo.model_hash && (
                <InfoRow label="Hash model (6 karakter)" value={modelInfo.model_hash.substring(0, 6).toUpperCase()} />
              )}
              {(() => {
                const bp = modelInfo.banyak_pembanding?.["D1"];
                const k1 = bp?.["1"];
                const k5 = bp?.["5"];
                if (!k1 || !k5) return null;
                return (
                  <InfoRow
                    label="Banyak pembanding (EER D1)"
                    value={`k=1: ${(k1.eer * 100).toFixed(1)}% → k=5: ${(k5.eer * 100).toFixed(1)}%`}
                  />
                );
              })()}
              {modelInfo.metrics?.per_dataset?.D1 && (
                <>
                  <InfoRow label="AUC D1 (CEDAR)" value={modelInfo.metrics.per_dataset.D1.auc?.toFixed(4) ?? "—"} />
                  <InfoRow label="EER D1" value={modelInfo.metrics.per_dataset.D1.eer?.toFixed(4) ?? "—"} />
                  <InfoRow label="Akurasi D1" value={modelInfo.metrics.per_dataset.D1.accuracy?.toFixed(4) ?? "—"} />
                  <InfoRow label="FAR D1" value={modelInfo.metrics.per_dataset.D1.FAR?.toFixed(4) ?? "—"} />
                  <InfoRow label="FRR D1" value={modelInfo.metrics.per_dataset.D1.FRR?.toFixed(4) ?? "—"} />
                  <InfoRow label="FAR tiruan mahir D1" value={modelInfo.metrics.per_dataset.D1.FAR_skilled_forgery?.toFixed(4) ?? "—"} />
                </>
              )}
              {modelInfo.metrics?.per_dataset?.D2 && (
                <>
                  <InfoRow label="AUC D2 (BHSig260)" value={modelInfo.metrics.per_dataset.D2.auc?.toFixed(4) ?? "—"} />
                  <InfoRow label="EER D2" value={modelInfo.metrics.per_dataset.D2.eer?.toFixed(4) ?? "—"} />
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-[#010211]/60 font-medium shrink-0">{label}</span>
      <span className="font-semibold text-right break-all">{value}</span>
    </div>
  );
}

/* ============================================================
   KOMPONEN: KETERBATASAN
   ============================================================ */
function KeterbatasanBox() {
  return (
    <div className="mt-6 p-4 rounded-2xl border-2 border-amber-300 bg-amber-50">
      <h3 className="font-bold text-sm text-amber-900 mb-2">Keterbatasan</h3>
      <ul className="list-disc list-inside space-y-1.5 text-xs text-amber-800">
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
