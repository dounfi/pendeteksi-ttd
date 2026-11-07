import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { SignatureInputModal, type InputTab } from "../components/SignatureInputModal";

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
  mean_dist: number;
  std_dist: number;
  is_confident: boolean;
  status: string;
}

interface VerifyResponse {
  decision: "ASLI" | "PALSU";
  is_genuine: boolean;
  distance: number;
  threshold: number;
  similarity_pct?: number;
  similarity_percentage?: number;
  shake_test?: ShakeData;
  shake_info?: ShakeData;
  forensic_report?: ForensicItem[];
  steps?: {
    ref?: { asli?: string; final?: string; hasil?: string };
    qry?: { asli?: string; final?: string; hasil?: string };
  };
  ref_processed_img?: string;
  qry_processed_img?: string;
}

function PeriksaPage() {
  const [refImage, setRefImage] = useState<string | null>(null);
  const [qryImage, setQryImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active tab per card
  const [refTab, setRefTab] = useState<InputTab>("upload");
  const [qryTab, setQryTab] = useState<InputTab>("upload");

  // Modal State for Camera, Pad, Udara
  const [modalTarget, setModalTarget] = useState<"ref" | "qry" | null>(null);
  const [modalTab, setModalTab] = useState<InputTab>("upload");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // File Input Refs & Section Scroll Ref
  const refFileInputRef = useRef<HTMLInputElement>(null);
  const qryFileInputRef = useRef<HTMLInputElement>(null);
  const hasilRef = useRef<HTMLHeadingElement>(null);

  // Handle file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "ref" | "qry") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Harap unggah berkas gambar (PNG, JPG, atau JPEG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      if (target === "ref") {
        setRefImage(b64);
        setRefTab("upload");
      } else {
        setQryImage(b64);
        setQryTab("upload");
      }
      setResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, target: "ref" | "qry") => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Harap unggah berkas gambar (PNG, JPG, atau JPEG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      if (target === "ref") {
        setRefImage(b64);
        setRefTab("upload");
      } else {
        setQryImage(b64);
        setQryTab("upload");
      }
      setResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Open Modal for Camera, Pad, Udara
  const openModal = (target: "ref" | "qry", tab: InputTab) => {
    setModalTarget(target);
    setModalTab(tab);
    setIsModalOpen(true);
  };

  // Run Backend Verification
  const handleVerify = async () => {
    if (!refImage || !qryImage) {
      setErrorMsg("Harap siapkan kedua tanda tangan (acuan dan yang diperiksa).");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref_image: refImage,
          qry_image: qryImage,
          preprocess_mode: "binary",
          perturbation: null,
          run_shake_test: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memproses gambar pada server backend.");
      }

      const data: VerifyResponse = await res.json();
      setResult(data);

      setTimeout(() => {
        hasilRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setErrorMsg(err?.message || "Koneksi ke backend (http://127.0.0.1:8000) gagal. Pastikan backend aktif.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample from backend /api/samples
  const handleLoadSample = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/samples");
      if (res.ok) {
        const samples = await res.json();
        if (samples && samples.length > 0) {
          setRefImage(samples[0].ref_preview);
          setQryImage(samples[0].qry_preview);
          setResult(null);
          setErrorMsg(null);
          return;
        }
      }
    } catch {
      // Fallback
    }
    const defaultSample = "/assets/img/sample-signature.png";
    setRefImage(defaultSample);
    setQryImage(defaultSample);
    setResult(null);
    setErrorMsg(null);
  };

  // Reset all
  const handleReset = () => {
    setRefImage(null);
    setQryImage(null);
    setRefTab("upload");
    setQryTab("upload");
    setResult(null);
    setErrorMsg(null);
  };

  // Result Mapping
  const shakeData = result?.shake_test || result?.shake_info;
  const isConfident = shakeData?.is_confident ?? true;
  const displayStatus: "ASLI" | "RAGU-RAGU" | "PALSU" = !isConfident
    ? "RAGU-RAGU"
    : result?.decision === "ASLI"
      ? "ASLI"
      : "PALSU";

  const percentNumber = result
    ? Math.round(
        result.similarity_pct ??
          result.similarity_percentage ??
          Math.max(0, Math.min(100, (1 - result.distance / (result.threshold * 2)) * 100))
      )
    : 0;

  const percentColor =
    displayStatus === "ASLI"
      ? "text-[#088152]"
      : displayStatus === "RAGU-RAGU"
        ? "text-[#8A6A00]"
        : "text-[#A12F2F]";

  const statusExplanation =
    displayStatus === "ASLI"
      ? "Pola tanda tangan sangat mirip dengan pembanding."
      : displayStatus === "RAGU-RAGU"
        ? "Hasil berada di area meragukan. Disarankan pemeriksaan lebih lanjut."
        : "Pola tanda tangan berbeda dari pembanding.";

  const markerPosition = result
    ? Math.max(2, Math.min(98, (result.distance / (2 * result.threshold)) * 100))
    : 13;

  const refProcessedImg =
    result?.steps?.ref?.final ||
    result?.steps?.ref?.hasil ||
    result?.ref_processed_img ||
    refImage ||
    "/assets/img/sample-signature.png";

  const qryProcessedImg =
    result?.steps?.qry?.final ||
    result?.steps?.qry?.hasil ||
    result?.qry_processed_img ||
    qryImage ||
    "/assets/img/sample-signature.png";

  return (
    <div className="min-h-screen bg-white text-[#010211] font-['Work_Sans',sans-serif] antialiased overflow-x-hidden selection:bg-[#0C7AB5] selection:text-white">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={refFileInputRef}
        onChange={(e) => handleFileUpload(e, "ref")}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={qryFileInputRef}
        onChange={(e) => handleFileUpload(e, "qry")}
        accept="image/*"
        className="hidden"
      />

      {/* Signature Input Modal (Kamera, Pad Layar, Udara) */}
      <SignatureInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalTab}
        title={modalTarget === "ref" ? "Tanda Tangan Acuan" : "Tanda Tangan yang Diperiksa"}
        onApplySignature={(dataUrl) => {
          if (modalTarget === "ref") {
            setRefImage(dataUrl);
            setRefTab(modalTab);
          } else {
            setQryImage(dataUrl);
            setQryTab(modalTab);
          }
          setResult(null);
          setIsModalOpen(false);
        }}
      />

      {/* ================================================================
           1. NAVBAR (SAMA DENGAN LANDING PAGE)
           ================================================================ */}
      <Navbar />

      {/* ================================================================
           2. KONTEN UTAMA HALAMAN PERIKSA (DUA KOLOM DI DESKTOP)
           ================================================================ */}
      <main className="w-full max-w-[1440px] mx-auto pt-[140px] px-4 sm:px-8 lg:px-[70px] pb-24">
        {/* Error notification if any */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start justify-center gap-[65px]">
          {/* ────────────────────────────────────────────────────────────
               KOLOM KIRI (LEBAR 666px DI DESKTOP)
               ──────────────────────────────────────────────────────────── */}
          <section className="w-full lg:w-[666px] flex flex-col shrink-0">
            {/* 1. Judul Utama */}
            <h1 className="text-[#010211] text-3xl sm:text-4xl font-bold leading-tight">
              Tanda tangan ini asli atau tidak?
            </h1>

            {/* 2. Paragraf Deskripsi */}
            <p className="text-[#010211] text-base sm:text-lg font-normal leading-relaxed mt-3 max-w-[650px]">
              Unggah tanda tangan yang pasti asli sebagai pembanding, lalu satu tanda tangan yang
              ingin diperiksa. Model akan menilai seberapa mirip keduanya.
            </p>

            {/* 3. Dua Kartu Input Sejajar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[26px] mt-6">
              {/* KARTU INPUT KIRI: Tanda Tangan Pembanding */}
              <div className="bg-[#DEE9F3] rounded-2xl p-4 flex flex-col justify-between">
                {/* Baris Atas: Badge & Link Ganti */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F8EBC]/20 text-[#1E65AB]">
                    DOKUMEN ACUAN SAH
                  </span>
                  {refImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setRefImage(null);
                        setResult(null);
                        setRefTab("upload");
                      }}
                      className="text-sm font-bold text-[#0C7AB5] hover:underline cursor-pointer"
                    >
                      Ganti Tanda Tangan
                    </button>
                  )}
                </div>

                {/* Judul Kartu */}
                <h2 className="text-[#010211] text-lg font-bold mt-2.5">
                  Tanda Tangan Pembanding
                </h2>

                {/* Grid 2x2 Tombol Tab (Tinggi 36px, Radius 12px) */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {/* Tab 1: Unggah */}
                  <button
                    type="button"
                    onClick={() => {
                      setRefTab("upload");
                      refFileInputRef.current?.click();
                    }}
                    className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      refTab === "upload"
                        ? "bg-[#0C7AB5] text-white shadow-xs"
                        : "bg-white/60 text-[#1E65AB] hover:bg-white"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-[18px] h-[18px]"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>1. Unggah</span>
                  </button>

                  {/* Tab 2: Kamera */}
                  <button
                    type="button"
                    onClick={() => {
                      setRefTab("camera");
                      openModal("ref", "camera");
                    }}
                    className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      refTab === "camera"
                        ? "bg-[#0C7AB5] text-white shadow-xs"
                        : "bg-white/60 text-[#1E65AB] hover:bg-white"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-[18px] h-[18px]"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>2. Kamera</span>
                  </button>

                  {/* Tab 3: Pad Layar */}
                  <button
                    type="button"
                    onClick={() => {
                      setRefTab("pad");
                      openModal("ref", "pad");
                    }}
                    className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      refTab === "pad"
                        ? "bg-[#0C7AB5] text-white shadow-xs"
                        : "bg-white/60 text-[#1E65AB] hover:bg-white"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-[18px] h-[18px]"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>3. Pad Layar</span>
                  </button>

                  {/* Tab 4: Udara */}
                  <button
                    type="button"
                    onClick={() => {
                      setRefTab("air");
                      openModal("ref", "air");
                    }}
                    className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      refTab === "air"
                        ? "bg-[#0C7AB5] text-white shadow-xs"
                        : "bg-white/60 text-[#1E65AB] hover:bg-white"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-[18px] h-[18px]"
                    >
                      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
                      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.9-2.3L2.3 15.9a1.5 1.5 0 0 1 .3-2.3l.5-.4a2 2 0 0 1 2.5.2L7 15" />
                    </svg>
                    <span>4. Udara</span>
                  </button>
                </div>

                {/* Drop Area Input (Tinggi 240px, Border Putus-Putus 2px #1F8EBC/50) */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, "ref")}
                  onClick={() => {
                    if (!refImage) refFileInputRef.current?.click();
                  }}
                  className="h-[240px] mt-3 bg-[#D0DCE7] border-2 border-dashed border-[#1F8EBC]/50 rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-[#D0DCE7]/80 transition-colors overflow-hidden"
                >
                  {refImage ? (
                    <div className="relative w-full h-full bg-white rounded-lg p-2 flex items-center justify-center">
                      <img
                        src={refImage}
                        alt="Tanda Tangan Pembanding"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <>
                      <img
                        src="/assets/icons/basil_file-upload-outline.png"
                        alt="Ikon Unggah"
                        className="w-28 h-28 sm:w-36 sm:h-36 opacity-25 object-contain pointer-events-none"
                      />
                      <span className="text-sm text-[#010211]/70 font-normal mt-1">
                        Klik atau seret gambar ke sini
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* KARTU INPUT KANAN: Tanda Tangan yang Diperiksa */}
              <div className="bg-[#DEE9F3] rounded-2xl p-4 flex flex-col justify-between">
                {/* Baris Atas: Badge & Link Ganti */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F8EBC]/20 text-[#1E65AB]">
                    DOKUMEN PERTANYAAN
                  </span>
                  {qryImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setQryImage(null);
                        setResult(null);
                        setQryTab("upload");
                      }}
                      className="text-sm font-bold text-[#0C7AB5] hover:underline cursor-pointer"
                    >
                      Ganti Tanda Tangan
                    </button>
                  )}
                </div>

                {/* Judul Kartu */}
                <h2 className="text-[#010211] text-lg font-bold mt-2.5">
                  Tanda Tangan yang Diperiksa
                </h2>

                {/* Grid 2x2 Tombol Tab (Tinggi 36px, Radius 12px) */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {/* Tab 1: Unggah */}
                  <button
                    type="button"
                    onClick={() => {
                      setQryTab("upload");
                      qryFileInputRef.current?.click();
                    }}
                    className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      qryTab === "upload"
                        ? "bg-[#0C7AB5] text-white shadow-xs"
                        : "bg-white/60 text-[#1E65AB] hover:bg-white"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-[18px] h-[18px]"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>1. Unggah</span>
                  </button>

                  {/* Tab 2: Kamera */}
                  <button
                    type="button"
                    onClick={() => {
                      setQryTab("camera");
                      openModal("qry", "camera");
                    }}
                    className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      qryTab === "camera"
                        ? "bg-[#0C7AB5] text-white shadow-xs"
                        : "bg-white/60 text-[#1E65AB] hover:bg-white"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-[18px] h-[18px]"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>2. Kamera</span>
                  </button>

                  {/* Tab 3: Pad Layar */}
                  <button
                    type="button"
                    onClick={() => {
                      setQryTab("pad");
                      openModal("qry", "pad");
                    }}
                    className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      qryTab === "pad"
                        ? "bg-[#0C7AB5] text-white shadow-xs"
                        : "bg-white/60 text-[#1E65AB] hover:bg-white"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-[18px] h-[18px]"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>3. Pad Layar</span>
                  </button>

                  {/* Tab 4: Udara */}
                  <button
                    type="button"
                    onClick={() => {
                      setQryTab("air");
                      openModal("qry", "air");
                    }}
                    className={`h-9 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      qryTab === "air"
                        ? "bg-[#0C7AB5] text-white shadow-xs"
                        : "bg-white/60 text-[#1E65AB] hover:bg-white"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-[18px] h-[18px]"
                    >
                      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
                      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.9-2.3L2.3 15.9a1.5 1.5 0 0 1 .3-2.3l.5-.4a2 2 0 0 1 2.5.2L7 15" />
                    </svg>
                    <span>4. Udara</span>
                  </button>
                </div>

                {/* Drop Area Input (Tinggi 240px, Border Putus-Putus 2px #1F8EBC/50) */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, "qry")}
                  onClick={() => {
                    if (!qryImage) qryFileInputRef.current?.click();
                  }}
                  className="h-[240px] mt-3 bg-[#D0DCE7] border-2 border-dashed border-[#1F8EBC]/50 rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-[#D0DCE7]/80 transition-colors overflow-hidden"
                >
                  {qryImage ? (
                    <div className="relative w-full h-full bg-white rounded-lg p-2 flex items-center justify-center">
                      <img
                        src={qryImage}
                        alt="Tanda Tangan yang Diperiksa"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <>
                      <img
                        src="/assets/icons/basil_file-upload-outline.png"
                        alt="Ikon Unggah"
                        className="w-28 h-28 sm:w-36 sm:h-36 opacity-25 object-contain pointer-events-none"
                      />
                      <span className="text-sm text-[#010211]/70 font-normal mt-1">
                        Klik atau seret gambar ke sini
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Link Pakai Tanda Tangan Contoh */}
            <div className="flex justify-center mt-3">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-sm font-bold text-[#0C7AB5] hover:underline cursor-pointer"
              >
                Pakai tanda tangan contoh
              </button>
            </div>

            {/* 4. Tombol "PERIKSA TANDA TANGAN" (Lebar 280px, Rata Tengah) */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={handleVerify}
                disabled={!refImage || !qryImage || isLoading}
                className={`w-[280px] py-3.5 bg-gradient-to-r from-[#0C7AB5] to-[#5BB4C9] rounded-2xl flex items-center justify-center text-[#D0DCE7] text-lg font-bold tracking-wider uppercase shadow-xs transition-opacity ${
                  !refImage || !qryImage || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-90 cursor-pointer"
                }`}
              >
                {isLoading ? "Memeriksa…" : "PERIKSA TANDA TANGAN"}
              </button>
            </div>

            {/* 5. Judul "Hasil Pemeriksaan" */}
            <h2
              ref={hasilRef}
              className="text-[#010211] text-3xl sm:text-4xl font-bold mt-12 mb-4 scroll-mt-28"
            >
              Hasil Pemeriksaan
            </h2>

            {/* 6. Kartu Hasil (Lebar Penuh Kolom, Latar #DEE9F3, Radius 16px) */}
            {!result ? (
              <div className="w-full bg-[#DEE9F3] rounded-2xl p-8 min-h-[160px] flex items-center justify-center text-center">
                <p className="text-[#010211]/50 text-base sm:text-lg font-normal">
                  Belum ada hasil. Unggah dua tanda tangan, lalu tekan PERIKSA TANDA TANGAN.
                </p>
              </div>
            ) : (
              <div className="w-full bg-[#DEE9F3] rounded-2xl p-4 sm:p-5 flex flex-col">
                {/* Baris Atas: Stempel, Angka %, Keterangan */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  {/* Stempel */}
                  {displayStatus === "ASLI" ? (
                    <img
                      src="/assets/img/stamp-asli.png"
                      alt="Stempel Kemungkinan Asli"
                      className="w-[165px] h-[83px] object-contain shrink-0"
                    />
                  ) : displayStatus === "RAGU-RAGU" ? (
                    <div className="w-[165px] h-[83px] border-4 border-double border-[#8A6A00] text-[#8A6A00] bg-[#CFAF58]/15 -rotate-8 rounded-lg flex items-center justify-center font-bold text-xl tracking-wider select-none shrink-0 shadow-xs">
                      RAGU-RAGU
                    </div>
                  ) : (
                    <div className="w-[165px] h-[83px] border-4 border-double border-[#CF5757] text-[#CF5757] bg-[#CF5757]/15 -rotate-8 rounded-lg flex items-center justify-center font-bold text-base leading-tight text-center tracking-wider select-none shrink-0 px-2 shadow-xs">
                      KEMUNGKINAN PALSU
                    </div>
                  )}

                  {/* Angka Persen */}
                  <span className={`text-4xl font-bold shrink-0 ${percentColor}`}>
                    {percentNumber}%
                  </span>

                  {/* Keterangan */}
                  <p className="text-[#010211] text-lg sm:text-xl font-normal leading-snug max-w-[320px]">
                    {statusExplanation}
                  </p>
                </div>

                {/* Baris Bawah: Bar Indikator 3 Warna + Penanda Marker */}
                <div className="mt-6 w-full">
                  <div className="relative w-full">
                    {/* Bar 3 Segmen Warna: Hijau 41%, Kuning 18%, Merah 41% */}
                    <div className="w-full h-4 rounded-sm flex overflow-hidden">
                      <div className="w-[41%] h-full bg-[#58CF71]"></div>
                      <div className="w-[18%] h-full bg-[#CFAF58]"></div>
                      <div className="w-[41%] h-full bg-[#CF5757]"></div>
                    </div>

                    {/* Batang Penanda (Marker): 6x28px, Menonjol di Atas & Bawah */}
                    <div
                      className="absolute top-[-6px] w-[6px] h-7 bg-[#3B3B43] rounded-md pointer-events-none -translate-x-1/2"
                      style={{ left: `${markerPosition}%` }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Teks Label di Bawah Bar */}
                  <div className="relative flex justify-between items-start mt-1.5 pt-0.5">
                    <span className="text-[10px] text-[#010211] font-normal">Mirip</span>
                    <span
                      className="absolute -translate-x-1/2 text-[10px] text-[#010211] font-bold whitespace-nowrap"
                      style={{ left: `${markerPosition}%` }}
                    >
                      Jarak {result.distance.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#010211] font-normal">Palsu</span>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Dua Paragraf Abu-abu Disclaimer & Uji Model */}
            <div className="mt-7 space-y-2 text-[#010211]/50 text-base sm:text-lg font-normal leading-relaxed">
              <p>
                Disclaimer: Hasil model bukan sebagai bukti hukum ... Qorem ipsum dolor sit amet,
                consectetur adipiscing elit.
              </p>
              <p>Hasil uji model: akurasi ..., AUC & ROC ..., dll</p>
            </div>
          </section>

          {/* ────────────────────────────────────────────────────────────
               KOLOM KANAN (LEBAR 606px DI DESKTOP)
               ──────────────────────────────────────────────────────────── */}
          <section className="w-full lg:w-[606px] flex flex-col shrink-0">
            {/* 1. Judul "Penjelasan Lebih Lanjut" */}
            <h2 className="text-[#010211] text-3xl sm:text-4xl font-bold leading-tight">
              Penjelasan Lebih Lanjut
            </h2>

            {/* 2. Panel Kanan (Latar #DEE9F3, Radius 16px) */}
            {!result ? (
              <div className="w-full bg-[#DEE9F3] rounded-2xl p-8 mt-4 sm:mt-6 min-h-[380px] flex items-center justify-center text-center">
                <p className="text-[#010211]/50 text-base sm:text-lg font-normal">
                  Belum ada hasil. Unggah dua tanda tangan, lalu tekan PERIKSA TANDA TANGAN.
                </p>
              </div>
            ) : (
              <div className="w-full bg-[#DEE9F3] rounded-2xl p-4 sm:p-5 mt-4 sm:mt-6 flex flex-col">
                {/* Subjudul Gambar Setelah Diolah */}
                <h3 className="text-[#010211] text-lg font-bold">Gambar Setelah Diolah</h3>

                {/* Dua Gambar 250x167 Sejajar */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-[35px] mt-3">
                  {/* Gambar Tanda Tangan Asli */}
                  <div className="flex flex-col items-center">
                    <img
                      src={refProcessedImg}
                      alt="Tanda tangan asli"
                      className="w-[250px] h-[167px] object-cover rounded-sm shadow-xs bg-white"
                    />
                    <span className="text-[#010211] text-base sm:text-lg font-normal mt-2.5">
                      Tanda tangan asli
                    </span>
                  </div>

                  {/* Gambar Tanda Tangan yang Diperiksa */}
                  <div className="flex flex-col items-center">
                    <img
                      src={qryProcessedImg}
                      alt="Tanda tangan yang diperiksa"
                      className="w-[250px] h-[167px] object-cover rounded-sm shadow-xs bg-white"
                    />
                    <span className="text-[#010211] text-base sm:text-lg font-normal mt-2.5">
                      Tanda tangan yang diperiksa
                    </span>
                  </div>
                </div>

                {/* Garis Pemisah (1px, Warna #1F8EBC 50%) */}
                <hr className="border-t border-[#1F8EBC]/50 my-6" />

                {/* Subjudul Laporan Forensik Mini & Uji Goyang */}
                <h3 className="text-[#010211] text-lg font-bold">Laporan Forensik Mini</h3>
                <p className="text-[#010211] text-base sm:text-lg font-normal mt-0.5">Uji goyang</p>

                {/* Daftar Pil */}
                <div className="space-y-2.5 mt-4">
                  {/* Forensic report items */}
                  {result.forensic_report && result.forensic_report.length > 0
                    ? result.forensic_report.map((item, idx) => {
                        const isSafe = item.is_safe ?? item.tingkat === "mirip";
                        const bg = isSafe ? "bg-[#58CF71]/50" : "bg-[#CF5757]/50";
                        const detailText =
                          item.explain ||
                          item.kalimat ||
                          (item.tingkat ? `Status: ${item.tingkat}` : null);

                        return (
                          <div
                            key={idx}
                            className={`w-full min-h-[50px] h-auto ${bg} rounded-2xl px-[18px] py-2.5 flex flex-col justify-center`}
                          >
                            <span className="text-[#010211] text-base sm:text-lg font-bold leading-snug">
                              {item.label}
                            </span>
                            {detailText && (
                              <span className="text-[#010211]/80 text-xs sm:text-sm font-normal mt-0.5 leading-normal">
                                {detailText}
                              </span>
                            )}
                          </div>
                        );
                      })
                    : [
                        "bg-[#58CF71]/50",
                        "bg-[#CF5757]/50",
                        "bg-[#CFAF58]/50",
                        "bg-[#58CF71]/50",
                        "bg-[#CF5757]/50",
                        "bg-[#CFAF58]/50",
                        "bg-[#58CF71]/50",
                        "bg-[#CF5757]/50",
                      ].map((bg, idx) => (
                        <div
                          key={idx}
                          className={`w-full min-h-[50px] h-auto ${bg} rounded-2xl px-[18px] py-2.5 flex items-center`}
                        >
                          <span className="text-[#010211] text-base sm:text-lg font-normal truncate">
                            Qorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </span>
                        </div>
                      ))}

                  {/* Shake Test Pill at the end */}
                  {shakeData && (
                    <div
                      className={`w-full min-h-[50px] h-auto ${
                        shakeData.is_confident ? "bg-[#58CF71]/50" : "bg-[#CFAF58]/50"
                      } rounded-2xl px-[18px] py-2.5 flex flex-col justify-center`}
                    >
                      <span className="text-[#010211] text-base sm:text-lg font-bold leading-snug">
                        Uji Goyang: {shakeData.status}
                      </span>
                      <span className="text-[#010211]/80 text-xs sm:text-sm font-normal mt-0.5 leading-normal">
                        Ketahanan terhadap variasi mikro citra (Z-Score:{" "}
                        {shakeData.z_score.toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Tombol "Periksa Pasangan Lain" */}
                <div className="mt-[35px]">
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
          </section>
        </div>
      </main>
    </div>
  );
}
