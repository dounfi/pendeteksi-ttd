import { useState, useEffect, useRef, useCallback } from "react";

/* ================================================================
   ICONS (STRICTLY NO EMOJI - CLEAN SVG ONLY)
   ================================================================ */
function UploadIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CameraIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function PenIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function HandAirIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function RefreshIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function UndoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

/* ================================================================
   COMPONENT INTERFACES
   ================================================================ */
export type InputTab = "upload" | "camera" | "pad" | "air";

interface SignatureInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySignature: (dataUrl: string) => void;
  title?: string;
  defaultTab?: InputTab;
}

interface Point {
  x: number;
  y: number;
}

type Stroke = Point[];

// Declare window properties for MediaPipe
declare global {
  interface Window {
    Hands?: any;
    Pose?: any;
    Camera?: any;
  }
}

export function SignatureInputModal({
  isOpen,
  onClose,
  onApplySignature,
  title = "Pilih Cara Input Tanda Tangan",
  defaultTab = "upload",
}: SignatureInputModalProps) {
  const [activeTab, setActiveTab] = useState<InputTab>(defaultTab);

  // Sync defaultTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Global ESC key listener to close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Card */}
      <div
        className="w-full max-w-3xl bg-white rounded-[24px] border border-[#D0DCE7] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-['Work_Sans',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#DEE9F3] border-b border-[#D0DCE7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3FA1C1]/50 border-2 border-[#1F8EBC] text-[#1E65AB]">
              <PenIcon className="w-5 h-5 text-[#0C7AB5]" />
            </span>
            <div>
              <h2 className="font-['Work_Sans',sans-serif] font-bold text-lg text-[#010211] leading-tight">
                {title}
              </h2>
              <p className="text-xs text-[#010211]/60 font-medium">
                Pilih metode input yang paling praktis sesuai perangkat Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#010211]/60 hover:text-[#010211] border border-[#D0DCE7] flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="Tutup dialog"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Navigation Tabs */}
        <div className="px-6 pt-3 pb-2 bg-white border-b border-[#D0DCE7] overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {/* 1. Unggah File */}
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-['Work_Sans',sans-serif] font-bold transition-all cursor-pointer ${
                activeTab === "upload"
                  ? "bg-[#0C7AB5]/10 text-[#1E65AB] shadow-xs border-[1.5px] border-[#0C7AB5]"
                  : "text-[#010211]/60 hover:text-[#010211] hover:bg-[#DEE9F3]/60"
              }`}
            >
              <UploadIcon className="w-4 h-4" />
              <span>1. Unggah Berkas</span>
            </button>

            {/* 2. Foto Kamera */}
            <button
              type="button"
              onClick={() => setActiveTab("camera")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-['Work_Sans',sans-serif] font-bold transition-all cursor-pointer ${
                activeTab === "camera"
                  ? "bg-[#0C7AB5]/10 text-[#1E65AB] shadow-xs border-[1.5px] border-[#0C7AB5]"
                  : "text-[#010211]/60 hover:text-[#010211] hover:bg-[#DEE9F3]/60"
              }`}
            >
              <CameraIcon className="w-4 h-4" />
              <span>2. Ambil Foto Kamera</span>
            </button>

            {/* 3. Tulis di Layar/Touchpad */}
            <button
              type="button"
              onClick={() => setActiveTab("pad")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-['Work_Sans',sans-serif] font-bold transition-all cursor-pointer ${
                activeTab === "pad"
                  ? "bg-[#0C7AB5]/10 text-[#1E65AB] shadow-xs border-[1.5px] border-[#0C7AB5]"
                  : "text-[#010211]/60 hover:text-[#010211] hover:bg-[#DEE9F3]/60"
              }`}
            >
              <PenIcon className="w-4 h-4" />
              <span>3. Pad Sentuh / Layar</span>
            </button>

            {/* 4. Tulis Udara (Disabilitas) */}
            <button
              type="button"
              onClick={() => setActiveTab("air")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-['Work_Sans',sans-serif] font-bold transition-all cursor-pointer ${
                activeTab === "air"
                  ? "bg-[#0C7AB5]/10 text-[#1E65AB] shadow-xs border-[1.5px] border-[#0C7AB5]"
                  : "text-[#010211]/60 hover:text-[#010211] hover:bg-[#DEE9F3]/60"
              }`}
            >
              <HandAirIcon className="w-4 h-4 text-[#0C7AB5]" />
              <span>4. Tulis Udara (Aksesibilitas)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#DEE9F3] text-[#1E65AB] font-bold">
                Sensor Jari
              </span>
            </button>
          </div>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "upload" && (
            <TabUpload
              onApply={(url) => {
                onApplySignature(url);
                onClose();
              }}
            />
          )}

          {activeTab === "camera" && (
            <TabCamera
              onApply={(url) => {
                onApplySignature(url);
                onClose();
              }}
            />
          )}

          {activeTab === "pad" && (
            <TabDrawingPad
              onApply={(url) => {
                onApplySignature(url);
                onClose();
              }}
            />
          )}

          {activeTab === "air" && (
            <TabAirWriting
              onApply={(url) => {
                onApplySignature(url);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TAB 1: UNGGAH BERKAS (FILE UPLOAD)
   ================================================================ */
function TabUpload({ onApply }: { onApply: (dataUrl: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Harap pilih berkas gambar (PNG, JPG, JPEG, WEBP)");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-sm text-slate-600 font-medium">
        Unggah berkas foto atau scan tanda tangan dari media penyimpanan komputer atau ponsel.
      </div>

      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`aspect-[16/9] max-h-72 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#2563EB] bg-blue-50/70 scale-[1.01]"
              : "border-slate-300 hover:border-[#2563EB] bg-slate-50/50 hover:bg-white"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB] mb-3 shadow-xs">
            <UploadIcon className="w-7 h-7" />
          </div>
          <p className="font-['Work_Sans',sans-serif] font-bold text-base text-ink mb-1">
            Klik untuk memilih berkas atau seret ke sini
          </p>
          <p className="text-xs text-slate-500 max-w-sm">
            Mendukung PNG, JPG, JPEG, dan WEBP. Disarankan tanda tangan di atas kertas putih bersih.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="aspect-[16/9] max-h-72 w-full bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-center overflow-hidden shadow-xs relative">
            <img
              src={preview}
              alt="Pratinjau tanda tangan"
              className="max-h-full max-w-full object-contain filter contrast-125"
            />
            <span className="absolute bottom-3 left-4 text-[11px] font-semibold bg-slate-900/70 text-white px-2.5 py-1 rounded-md backdrop-blur-xs">
              {fileName}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setFileName("");
              }}
              className="px-4 py-2 text-xs font-['Work_Sans',sans-serif] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Ganti Berkas
            </button>

            <button
              type="button"
              onClick={() => onApply(preview)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0C7AB5] hover:bg-[#1E65AB] text-white font-['Work_Sans',sans-serif] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Gunakan Tanda Tangan Ini</span>
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />
    </div>
  );
}

/* ================================================================
   TAB 2: AMBIL FOTO KAMERA (WEBCAM SNAPSHOT)
   ================================================================ */
function TabCamera({ onApply }: { onApply: (dataUrl: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Start webcam
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Izin kamera ditolak. Harap izinkan akses kamera pada peramban Anda."
          : "Tidak dapat menemukan perangkat kamera yang aktif."
      );
    }
  }, []);

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Snap photo
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 font-medium">
        Posisikan kertas tanda tangan tepat di depan kamera, lalu klik tombol Jepret Foto.
      </div>

      {cameraError ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
          <p className="text-xs font-semibold text-amber-900">{cameraError}</p>
          <button
            type="button"
            onClick={startCamera}
            className="px-4 py-2 text-xs font-['Work_Sans',sans-serif] font-bold bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : !capturedImage ? (
        <div className="space-y-3">
          <div className="relative aspect-[16/9] max-h-80 w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            {/* Viewfinder Target Box Overlay */}
            <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex flex-col items-center justify-between p-3">
              <span className="text-[11px] font-semibold text-white/80 bg-slate-900/60 px-3 py-1 rounded-full backdrop-blur-xs">
                Arahkan Tanda Tangan ke Dalam Kotak
              </span>
              <span className="text-[10px] text-white/60">
                Pastikan cahaya terang dan tidak berbayang
              </span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              disabled={!streamActive}
              onClick={handleSnap}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 text-white font-['Work_Sans',sans-serif] font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <CameraIcon className="w-5 h-5" />
              <span>Jepret Foto</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="aspect-[16/9] max-h-80 w-full bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-center overflow-hidden shadow-xs">
            <img
              src={capturedImage}
              alt="Hasil foto kamera"
              className="max-h-full max-w-full object-contain filter contrast-125"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleRetake}
              className="flex items-center gap-2 px-4 py-2 text-xs font-['Work_Sans',sans-serif] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <RefreshIcon className="w-4 h-4" />
              <span>Ulangi Pemotretan</span>
            </button>

            <button
              type="button"
              onClick={() => onApply(capturedImage)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0C7AB5] hover:bg-[#1E65AB] text-white font-['Work_Sans',sans-serif] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Gunakan Foto Ini</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TAB 3: PAD TANDA TANGAN (TOUCHPAD / TOUCHSCREEN / STYLUS)
   ================================================================ */
function TabDrawingPad({ onApply }: { onApply: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState<number>(3.5);
  const [penColor, setPenColor] = useState<string>("#0F172A");

  // Re-render strokes onto canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Baseline guide line
    ctx.strokeStyle = "#F1F5F9";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(30, canvas.height * 0.72);
    ctx.lineTo(canvas.width - 30, canvas.height * 0.72);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw all completed strokes
    ctx.strokeStyle = penColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const allStrokes = [...strokes, ...(currentStroke.length > 0 ? [currentStroke] : [])];

    allStrokes.forEach((stroke) => {
      if (stroke.length === 0) return;
      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = penColor;
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);

      for (let i = 1; i < stroke.length - 1; i++) {
        const xc = (stroke[i].x + stroke[i + 1].x) / 2;
        const yc = (stroke[i].y + stroke[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, xc, yc);
      }
      // Last point
      const last = stroke[stroke.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    });
  }, [strokes, currentStroke, lineWidth, penColor]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Pointer event handlers (smooth support for mouse, touch, and stylus)
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const point = getCoordinates(e);
    setCurrentStroke([point]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const point = getCoordinates(e);
    setCurrentStroke((prev) => [...prev, point]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke([]);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  // Convert canvas to clean PNG without guide lines
  const handleApply = () => {
    if (strokes.length === 0) {
      alert("Harap buat coretan tanda tangan terlebih dahulu pada pad sentuh.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create export canvas with pure white background & high contrast ink
    const expCanvas = document.createElement("canvas");
    expCanvas.width = canvas.width;
    expCanvas.height = canvas.height;
    const ctx = expCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, expCanvas.width, expCanvas.height);

    ctx.strokeStyle = penColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    strokes.forEach((stroke) => {
      if (stroke.length === 0) return;
      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = penColor;
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length - 1; i++) {
        const xc = (stroke[i].x + stroke[i + 1].x) / 2;
        const yc = (stroke[i].y + stroke[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, xc, yc);
      }
      const last = stroke[stroke.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    });

    const dataUrl = expCanvas.toDataURL("image/png");
    onApply(dataUrl);
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-['Work_Sans',sans-serif] font-bold text-slate-700">Ketebalan:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setLineWidth(2)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lineWidth === 2 ? "bg-white text-[#2563EB] shadow-xs" : "text-slate-600 hover:text-ink"
              }`}
            >
              Tipis
            </button>
            <button
              type="button"
              onClick={() => setLineWidth(3.5)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lineWidth === 3.5 ? "bg-white text-[#2563EB] shadow-xs" : "text-slate-600 hover:text-ink"
              }`}
            >
              Standar
            </button>
            <button
              type="button"
              onClick={() => setLineWidth(5.5)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lineWidth === 5.5 ? "bg-white text-[#2563EB] shadow-xs" : "text-slate-600 hover:text-ink"
              }`}
            >
              Tebal
            </button>
          </div>

          <span className="text-xs font-['Work_Sans',sans-serif] font-bold text-slate-700 ml-2">Warna Tinta:</span>
          <div className="inline-flex gap-1.5 items-center">
            <button
              type="button"
              onClick={() => setPenColor("#0F172A")}
              className={`w-6 h-6 rounded-full bg-slate-900 border-2 transition-all cursor-pointer ${
                penColor === "#0F172A" ? "border-[#2563EB] scale-110 shadow-xs" : "border-white"
              }`}
              title="Tinta Hitam"
            />
            <button
              type="button"
              onClick={() => setPenColor("#1E3A8A")}
              className={`w-6 h-6 rounded-full bg-blue-900 border-2 transition-all cursor-pointer ${
                penColor === "#1E3A8A" ? "border-[#2563EB] scale-110 shadow-xs" : "border-white"
              }`}
              title="Tinta Biru Dokumen"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-['Work_Sans',sans-serif] font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <UndoIcon className="w-3.5 h-3.5" />
            <span>Urungkan</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-['Work_Sans',sans-serif] font-bold text-[#CF5757] hover:text-white disabled:opacity-40 bg-[#CF5757]/10 hover:bg-[#CF5757] rounded-xl transition-all cursor-pointer"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span>Bersihkan</span>
          </button>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="relative aspect-[16/9] max-h-72 w-full rounded-2xl border-2 border-[#D0DCE7] bg-white overflow-hidden shadow-inner cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: "none" }}
          className="w-full h-full block"
        />

        {strokes.length === 0 && !isDrawing && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-[#010211]/40 select-none">
            <span className="font-['Work_Sans',sans-serif] font-bold text-sm text-[#010211]/60">
              Tuliskan tanda tangan langsung di atas area ini
            </span>
            <span className="text-xs text-[#010211]/40 mt-1">
              Dapat menggunakan mouse, touchpad, layar sentuh, atau pena digital
            </span>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-[#010211]/60 font-medium">
          {strokes.length > 0 ? `${strokes.length} goresan terdeteksi` : "Belum ada goresan"}
        </span>
        <button
          type="button"
          onClick={handleApply}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0C7AB5] hover:bg-[#1E65AB] text-white font-['Work_Sans',sans-serif] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <CheckIcon className="w-4 h-4" />
          <span>Gunakan Tanda Tangan Ini</span>
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   TAB 4: TULIS UDARA VIA KAMERA (DISABILITAS / FOG-MIRROR INSPIRED)
   ================================================================ */
function buildSignatureDataUrl(strokesList: Stroke[]): string | null {
  if (strokesList.length === 0) return null;

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  let hasPoints = false;
  strokesList.forEach((stroke) => {
    stroke.forEach((p) => {
      hasPoints = true;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
  });

  if (!hasPoints) return null;

  const pad = 40;
  const boxW = Math.max(120, maxX - minX + pad * 2);
  const boxH = Math.max(80, maxY - minY + pad * 2);

  const outCanvas = document.createElement("canvas");
  outCanvas.width = 640;
  outCanvas.height = 360;
  const ctx = outCanvas.getContext("2d");
  if (!ctx) return null;

  // Crisp white background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

  // Subtle baseline
  ctx.strokeStyle = "#F1F5F9";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(20, outCanvas.height * 0.75);
  ctx.lineTo(outCanvas.width - 20, outCanvas.height * 0.75);
  ctx.stroke();
  ctx.setLineDash([]);

  // Scale and center strokes inside canvas
  const scaleFactor = Math.min((outCanvas.width - 60) / boxW, (outCanvas.height - 60) / boxH, 1.2);
  const offsetX = (outCanvas.width - (maxX - minX) * scaleFactor) / 2 - minX * scaleFactor;
  const offsetY = (outCanvas.height - (maxY - minY) * scaleFactor) / 2 - minY * scaleFactor;

  ctx.strokeStyle = "#0F172A";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  strokesList.forEach((stroke) => {
    if (stroke.length === 0) return;
    if (stroke.length === 1) {
      const pt = stroke[0];
      ctx.beginPath();
      ctx.arc(pt.x * scaleFactor + offsetX, pt.y * scaleFactor + offsetY, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#0F172A";
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(stroke[0].x * scaleFactor + offsetX, stroke[0].y * scaleFactor + offsetY);
    for (let i = 1; i < stroke.length - 1; i++) {
      const p1 = stroke[i];
      const p2 = stroke[i + 1];
      const xc = ((p1.x + p2.x) / 2) * scaleFactor + offsetX;
      const yc = ((p1.y + p2.y) / 2) * scaleFactor + offsetY;
      ctx.quadraticCurveTo(p1.x * scaleFactor + offsetX, p1.y * scaleFactor + offsetY, xc, yc);
    }
    const last = stroke[stroke.length - 1];
    ctx.lineTo(last.x * scaleFactor + offsetX, last.y * scaleFactor + offsetY);
    ctx.stroke();
  });

  return outCanvas.toDataURL("image/png");
}

type TrackerType = "finger" | "wrist" | "elbow";
type AssistMode = "continuous" | "space" | "pinch";

// One Euro Filter implementation
class LowPass {
  prev: number | null = null;
  filter(x: number, a: number) {
    this.prev = this.prev === null ? x : a * x + (1 - a) * this.prev;
    return this.prev;
  }
}

const alphaFor = (cutoff: number, dt: number) => 1 / (1 + 1 / (2 * Math.PI * cutoff) / dt);

class OneEuro {
  private x = new LowPass();
  private dx = new LowPass();
  private last: number | null = null;

  constructor(
    private minCutoff = 0.8,
    private beta = 3.0,
    private dCutoff = 1.0
  ) {}

  reset() {
    this.x = new LowPass();
    this.dx = new LowPass();
    this.last = null;
  }

  filter(v: number, tMs: number) {
    const dt = this.last === null ? 1 / 30 : Math.max((tMs - this.last) / 1000, 1 / 120);
    this.last = tMs;
    const prev = this.x.prev;
    const rawD = prev === null ? 0 : (v - prev) / dt;
    const d = this.dx.filter(rawD, alphaFor(this.dCutoff, dt));
    return this.x.filter(v, alphaFor(this.minCutoff + this.beta * Math.abs(d), dt));
  }
}

// Convert normalized raw video coordinates (0-1) to normalized screen coordinates (0-1)
// accounting for object-cover cropping and selfie mirror flip
function getScreenNormCoords(
  normX: number,
  normY: number,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const cw = canvas.width;
  const ch = canvas.height;
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;

  const containerAspect = cw / ch;
  const videoAspect = vw / vh;

  let renderedW = cw;
  let renderedH = ch;
  let offsetX = 0;
  let offsetY = 0;

  if (videoAspect > containerAspect) {
    renderedH = ch;
    renderedW = ch * videoAspect;
    offsetX = (renderedW - cw) / 2;
  } else {
    renderedW = cw;
    renderedH = cw / videoAspect;
    offsetY = (renderedH - ch) / 2;
  }

  // Mirrored horizontally for selfie webcam
  const mirroredX = 1 - normX;
  const canvasX = mirroredX * renderedW - offsetX;
  const canvasY = normY * renderedH - offsetY;

  return {
    x: Math.max(0, Math.min(1, canvasX / cw)),
    y: Math.max(0, Math.min(1, canvasY / ch)),
  };
}

// Smooth Bézier curve drawing through midpoints
function drawSmooth(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  const l = pts[pts.length - 1];
  ctx.lineTo(l.x, l.y);
  ctx.stroke();
}

// Clean and filter strokes: trim start/end tails, discard close points, validate length
function cleanStroke(pts: Point[]): Point[] | null {
  // 1. Buang 2 titik pertama dan 2 titik terakhir tiap goresan (gerakan menutup/membuka cubitan)
  if (pts.length <= 4) return null;
  const trimmed = pts.slice(2, pts.length - 2);

  // 2. Buang titik yang jaraknya < 0.004 dari titik sebelumnya (koordinat ternormalisasi)
  const filtered: Point[] = [];
  for (let i = 0; i < trimmed.length; i++) {
    const pt = trimmed[i];
    if (filtered.length === 0) {
      filtered.push(pt);
    } else {
      const prev = filtered[filtered.length - 1];
      const dist = Math.hypot(pt.x - prev.x, pt.y - prev.y);
      if (dist >= 0.004) {
        filtered.push(pt);
      }
    }
  }

  // 3. Buang goresan yang kurang dari 6 titik atau total panjangnya < 0.02
  if (filtered.length < 6) return null;

  let totalLen = 0;
  for (let i = 1; i < filtered.length; i++) {
    totalLen += Math.hypot(filtered[i].x - filtered[i - 1].x, filtered[i].y - filtered[i - 1].y);
  }
  if (totalLen < 0.02) return null;

  return filtered;
}

// Build final signature export: scaled uniformly to fit 1200x480 canvas with 10% padding
function buildAirSignatureDataUrl(strokesList: Point[][]): string {
  const outCanvas = document.createElement("canvas");
  outCanvas.width = 1200;
  outCanvas.height = 480;
  const ctx = outCanvas.getContext("2d");
  if (!ctx) return "";

  // Background white
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

  if (strokesList.length === 0) {
    return outCanvas.toDataURL("image/png");
  }

  // Compute bounding box across all strokes (normalized coordinates 0-1)
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  strokesList.forEach((stroke) => {
    stroke.forEach((pt) => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });
  });

  const boxW = Math.max(maxX - minX, 0.001);
  const boxH = Math.max(maxY - minY, 0.001);

  // 10% padding: usable width = 1200 * 0.8 = 960, usable height = 480 * 0.8 = 384
  const availW = outCanvas.width * 0.8;
  const availH = outCanvas.height * 0.8;
  const scale = Math.min(availW / boxW, availH / boxH);

  const scaledW = boxW * scale;
  const scaledH = boxH * scale;

  // Center on canvas
  const offsetX = (outCanvas.width - scaledW) / 2 - minX * scale;
  const offsetY = (outCanvas.height - scaledH) / 2 - minY * scale;

  ctx.strokeStyle = "#010211";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  strokesList.forEach((stroke) => {
    const transformedPts = stroke.map((p) => ({
      x: p.x * scale + offsetX,
      y: p.y * scale + offsetY,
    }));
    drawSmooth(ctx, transformedPts);
  });

  return outCanvas.toDataURL("image/png");
}

function TabAirWriting({ onApply }: { onApply: (dataUrl: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Accessibility State: Tracking Target & Method
  const [trackerType, setTrackerType] = useState<TrackerType>("finger");
  const [assistMode, setAssistMode] = useState<AssistMode>("continuous");

  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [bodyPartDetected, setBodyPartDetected] = useState<boolean>(false);
  const [isPinching, setIsPinching] = useState<boolean>(false);
  const [forceDrawKey, setForceDrawKey] = useState<boolean>(false);

  // Normalized stroke storage (0-1 coordinates)
  const airStrokesRef = useRef<Point[][]>([]);
  const currentAirStrokeRef = useRef<Point[]>([]);
  const isDrawingRef = useRef<boolean>(false);
  const assistModeRef = useRef<AssistMode>("continuous");
  const trackerTypeRef = useRef<TrackerType>("finger");
  const forceDrawKeyRef = useRef<boolean>(false);

  // One Euro filters for X and Y axes
  const euroXRef = useRef<OneEuro>(new OneEuro(0.8, 3.0, 1.0));
  const euroYRef = useRef<OneEuro>(new OneEuro(0.8, 3.0, 1.0));

  // Debounce frame counters (3 consecutive frames)
  const pinchStartCountRef = useRef<number>(0);
  const pinchStopCountRef = useRef<number>(0);
  const continuousDetectCountRef = useRef<number>(0);
  const continuousLostCountRef = useRef<number>(0);

  // React state for re-rendering UI & generating live preview
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);

  // Sync refs for event loop
  useEffect(() => {
    assistModeRef.current = assistMode;
    pinchStartCountRef.current = 0;
    pinchStopCountRef.current = 0;
    continuousDetectCountRef.current = 0;
    continuousLostCountRef.current = 0;
  }, [assistMode]);

  useEffect(() => {
    trackerTypeRef.current = trackerType;
    euroXRef.current.reset();
    euroYRef.current.reset();
  }, [trackerType]);

  useEffect(() => {
    forceDrawKeyRef.current = forceDrawKey;
  }, [forceDrawKey]);

  // Update live preview whenever strokes change using the 1200x480 uniform export logic
  useEffect(() => {
    if (strokes.length > 0) {
      const url = buildAirSignatureDataUrl(strokes);
      setLivePreviewUrl(url);
    } else {
      setLivePreviewUrl(null);
    }
  }, [strokes]);

  // Spacebar hotkey listener for assistive drawing
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setForceDrawKey(true);
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        setForceDrawKey(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Stroke lifecycle handlers
  const startWriting = () => {
    if (isDrawingRef.current) return;
    isDrawingRef.current = true;
    setIsPinching(true);
    euroXRef.current.reset();
    euroYRef.current.reset();
    currentAirStrokeRef.current = [];
  };

  const stopWriting = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    setIsPinching(false);
    euroXRef.current.reset();
    euroYRef.current.reset();

    if (currentAirStrokeRef.current.length > 0) {
      const cleaned = cleanStroke(currentAirStrokeRef.current);
      if (cleaned) {
        airStrokesRef.current.push(cleaned);
        setStrokes([...airStrokesRef.current]);
      }
      currentAirStrokeRef.current = [];
    }
  };

  // Dynamic script loader for MediaPipe Hands and Pose
  const loadMediaPipeScripts = async (target: TrackerType): Promise<boolean> => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.crossOrigin = "anonymous";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Gagal memuat skrip ${src}`));
        document.body.appendChild(script);
      });
    };

    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
      if (target === "elbow") {
        if (!window.Pose) {
          await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js");
        }
        return !!window.Pose;
      } else {
        if (!window.Hands) {
          await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js");
        }
        return !!window.Hands;
      }
    } catch {
      return false;
    }
  };

  // Main lifecycle: Setup webcam with 720p 30fps + tracker (Hands or Pose)
  useEffect(() => {
    let stream: MediaStream | null = null;
    let trackerInstance: any = null;
    let animationFrameId: number;
    let isCancelled = false;
    let isProcessing = false;

    async function initTracker() {
      setIsLoadingModel(true);
      setModelError(null);

      try {
        // 1. Get webcam stream: high quality 1280x720 at 30fps
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
            facingMode: "user",
          },
          audio: false,
        });

        if (isCancelled) return;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // 2. Load relevant MediaPipe model
        const currentTarget = trackerType;
        const loaded = await loadMediaPipeScripts(currentTarget);
        if (isCancelled) return;

        if (currentTarget === "elbow") {
          if (!loaded || !window.Pose) {
            throw new Error("Gagal menginisialisasi pustaka visi MediaPipe Pose.");
          }
          trackerInstance = new window.Pose({
            locateFile: (file: string) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
          });
          trackerInstance.setOptions({
            modelComplexity: 0,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
          trackerInstance.onResults((results: any) => {
            if (isCancelled) return;
            processPoseResults(results);
          });
        } else {
          if (!loaded || !window.Hands) {
            throw new Error("Gagal menginisialisasi pustaka visi MediaPipe Hands.");
          }
          trackerInstance = new window.Hands({
            locateFile: (file: string) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
          });

          // Configured with high precision: confidence 0.6
          trackerInstance.setOptions({
            numHands: 1,
            maxNumHands: 1,
            minHandDetectionConfidence: 0.6,
            minDetectionConfidence: 0.6,
            minHandPresenceConfidence: 0.6,
            minTrackingConfidence: 0.6,
            modelComplexity: 1,
          });

          trackerInstance.onResults((results: any) => {
            if (isCancelled) return;
            processHandResults(results);
          });
        }

        // 3. Process video frames in non-blocking loop
        const processFrame = async () => {
          if (isCancelled) return;
          if (
            videoRef.current &&
            videoRef.current.readyState >= 2 &&
            trackerInstance &&
            !isProcessing
          ) {
            isProcessing = true;
            try {
              await trackerInstance.send({ image: videoRef.current });
            } catch {
              // Frame dropped
            } finally {
              isProcessing = false;
            }
          }
          if (!isCancelled) {
            animationFrameId = requestAnimationFrame(processFrame);
          }
        };

        setIsLoadingModel(false);
        animationFrameId = requestAnimationFrame(processFrame);
      } catch (err: any) {
        if (!isCancelled) {
          setIsLoadingModel(false);
          setModelError(
            err.name === "NotAllowedError"
              ? "Akses kamera ditolak oleh peramban."
              : "Tidak dapat menyalakan pelacak kamera. Silakan periksa izin kamera atau gunakan Pad Sentuh sebagai alternatif."
          );
        }
      }
    }

    initTracker();

    return () => {
      isCancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (trackerInstance && trackerInstance.close) {
        try {
          trackerInstance.close();
        } catch {}
      }
    };
  }, [trackerType]);

  // Redraw camera overlay canvas: saved strokes + in-progress stroke + pointer feedback
  const redrawCanvas = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    pointerPos: { x: number; y: number } | null,
    isWriting: boolean,
    currentTracker: TrackerType
  ) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#0C7AB5";
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 1. Draw saved strokes
    airStrokesRef.current.forEach((stroke) => {
      const screenPts = stroke.map((p) => ({
        x: p.x * canvas.width,
        y: p.y * canvas.height,
      }));
      drawSmooth(ctx, screenPts);
    });

    // 2. Draw active in-progress stroke
    if (currentAirStrokeRef.current.length > 0) {
      const curScreenPts = currentAirStrokeRef.current.map((p) => ({
        x: p.x * canvas.width,
        y: p.y * canvas.height,
      }));
      drawSmooth(ctx, curScreenPts);
    }

    // 3. Render pointer feedback
    if (pointerPos) {
      const px = pointerPos.x * canvas.width;
      const py = pointerPos.y * canvas.height;

      ctx.save();

      // Outer glow aura
      ctx.beginPath();
      ctx.arc(px, py, isWriting ? 20 : 14, 0, Math.PI * 2);
      ctx.strokeStyle = isWriting ? "rgba(22, 163, 74, 0.45)" : "rgba(12, 122, 181, 0.35)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Center point
      ctx.beginPath();
      ctx.arc(px, py, isWriting ? 9 : 7, 0, Math.PI * 2);
      ctx.fillStyle = isWriting ? "#16A34A" : "#0C7AB5";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();

      // Label tag
      ctx.font = "bold 11px 'Work Sans', sans-serif";
      const labelText =
        currentTracker === "elbow"
          ? "💪 Siku"
          : currentTracker === "wrist"
          ? "✊ Kepalan"
          : "👆 Jari";
      const textMetrics = ctx.measureText(labelText);
      const pillW = textMetrics.width + 14;
      const pillH = 20;

      ctx.fillStyle = "rgba(1, 2, 17, 0.85)";
      ctx.beginPath();
      ctx.roundRect(px - pillW / 2, py - 34, pillW, pillH, 6);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(labelText, px - pillW / 2 + 7, py - 20);

      ctx.restore();
    }
  };

  // Process Hand Landmarks (Finger & Wrist Modes)
  const processHandResults = (results: any) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setBodyPartDetected(false);
      continuousLostCountRef.current++;
      continuousDetectCountRef.current = 0;
      pinchStartCountRef.current = 0;
      pinchStopCountRef.current = 0;

      if (continuousLostCountRef.current >= 3 && isDrawingRef.current) {
        stopWriting();
      }

      redrawCanvas(ctx, canvas, null, false, trackerTypeRef.current);
      return;
    }

    setBodyPartDetected(true);
    continuousDetectCountRef.current++;
    continuousLostCountRef.current = 0;

    const landmarks = results.multiHandLandmarks[0];

    // Pen point determination:
    // "Ujung Jari" = landmark 8
    // "Kepalan / Pergelangan" = rata-rata landmark 0, 5, 9, 13, 17 (pusat telapak stabil)
    let targetNorm: { x: number; y: number };

    if (trackerTypeRef.current === "wrist") {
      const palmIndices = [0, 5, 9, 13, 17];
      const avgX =
        palmIndices.reduce((sum, idx) => sum + landmarks[idx].x, 0) / palmIndices.length;
      const avgY =
        palmIndices.reduce((sum, idx) => sum + landmarks[idx].y, 0) / palmIndices.length;
      targetNorm = { x: avgX, y: avgY };
    } else {
      targetNorm = { x: landmarks[8].x, y: landmarks[8].y };
    }

    // Convert to normalized screen coordinates (0-1)
    const screenNorm = getScreenNormCoords(targetNorm.x, targetNorm.y, video, canvas);

    // Apply One Euro filter on normalized coordinates
    const nowMs = performance.now();
    const filteredX = euroXRef.current.filter(screenNorm.x, nowMs);
    const filteredY = euroYRef.current.filter(screenNorm.y, nowMs);
    const filteredPos = { x: filteredX, y: filteredY };

    // Pinch distance calculation independent of camera distance:
    // pinchRatio = dist(landmark 4, landmark 8) / dist(landmark 0, landmark 9)
    const dPinch = Math.hypot(
      landmarks[4].x - landmarks[8].x,
      landmarks[4].y - landmarks[8].y
    );
    const dPalm =
      Math.hypot(landmarks[0].x - landmarks[9].x, landmarks[0].y - landmarks[9].y) || 0.001;
    const pinchRatio = dPinch / dPalm;

    const mode = assistModeRef.current;

    if (mode === "pinch") {
      if (!isDrawingRef.current) {
        if (pinchRatio < 0.28) {
          pinchStartCountRef.current++;
          pinchStopCountRef.current = 0;
          if (pinchStartCountRef.current >= 3) {
            startWriting();
          }
        } else {
          pinchStartCountRef.current = 0;
        }
      } else {
        if (pinchRatio > 0.45) {
          pinchStopCountRef.current++;
          pinchStartCountRef.current = 0;
          if (pinchStopCountRef.current >= 3) {
            stopWriting();
          }
        } else {
          pinchStopCountRef.current = 0;
        }
      }
    } else if (mode === "space") {
      // Spacebar controls writing directly
      if (forceDrawKeyRef.current && !isDrawingRef.current) {
        startWriting();
      } else if (!forceDrawKeyRef.current && isDrawingRef.current) {
        stopWriting();
      }
    } else {
      // Continuous mode with 3-frame debounce
      if (continuousDetectCountRef.current >= 3 && !isDrawingRef.current) {
        startWriting();
      }
    }

    // Record point if writing is active
    if (isDrawingRef.current) {
      currentAirStrokeRef.current.push(filteredPos);
    }

    // Redraw canvas with updated pointer and strokes
    redrawCanvas(ctx, canvas, filteredPos, isDrawingRef.current, trackerTypeRef.current);
  };

  // Process Pose Landmarks (Elbow Mode)
  const processPoseResults = (results: any) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
      setBodyPartDetected(false);
      continuousLostCountRef.current++;
      continuousDetectCountRef.current = 0;
      if (continuousLostCountRef.current >= 3 && isDrawingRef.current) {
        stopWriting();
      }
      redrawCanvas(ctx, canvas, null, false, "elbow");
      return;
    }

    // Left Elbow: 13, Right Elbow: 14
    const leftElbow = results.poseLandmarks[13];
    const rightElbow = results.poseLandmarks[14];
    const leftVis = leftElbow?.visibility ?? 0;
    const rightVis = rightElbow?.visibility ?? 0;

    if (leftVis < 0.25 && rightVis < 0.25) {
      setBodyPartDetected(false);
      continuousLostCountRef.current++;
      continuousDetectCountRef.current = 0;
      if (continuousLostCountRef.current >= 3 && isDrawingRef.current) {
        stopWriting();
      }
      redrawCanvas(ctx, canvas, null, false, "elbow");
      return;
    }

    setBodyPartDetected(true);
    continuousDetectCountRef.current++;
    continuousLostCountRef.current = 0;

    let activeElbow = leftElbow;
    if (rightVis > 0.25 && (leftVis < 0.25 || rightElbow.y < leftElbow.y - 0.05)) {
      activeElbow = rightElbow;
    }

    const screenNorm = getScreenNormCoords(activeElbow.x, activeElbow.y, video, canvas);

    const nowMs = performance.now();
    const filteredX = euroXRef.current.filter(screenNorm.x, nowMs);
    const filteredY = euroYRef.current.filter(screenNorm.y, nowMs);
    const filteredPos = { x: filteredX, y: filteredY };

    if (assistModeRef.current === "space") {
      if (forceDrawKeyRef.current && !isDrawingRef.current) {
        startWriting();
      } else if (!forceDrawKeyRef.current && isDrawingRef.current) {
        stopWriting();
      }
    } else {
      if (continuousDetectCountRef.current >= 3 && !isDrawingRef.current) {
        startWriting();
      }
    }

    if (isDrawingRef.current) {
      currentAirStrokeRef.current.push(filteredPos);
    }

    redrawCanvas(ctx, canvas, filteredPos, isDrawingRef.current, "elbow");
  };

  const handleClearAir = () => {
    airStrokesRef.current = [];
    currentAirStrokeRef.current = [];
    euroXRef.current.reset();
    euroYRef.current.reset();
    isDrawingRef.current = false;
    setIsPinching(false);
    setStrokes([]);
  };

  const handleUndoAir = () => {
    if (airStrokesRef.current.length > 0) {
      airStrokesRef.current.pop();
      currentAirStrokeRef.current = [];
      euroXRef.current.reset();
      euroYRef.current.reset();
      isDrawingRef.current = false;
      setIsPinching(false);
      setStrokes([...airStrokesRef.current]);
    }
  };

  const handleApplyAir = () => {
    if (!livePreviewUrl) {
      alert("Belum ada coretan tanda tangan di udara yang terekam. Silakan buat goresan terlebih dahulu.");
      return;
    }
    onApply(livePreviewUrl);
  };

  return (
    <div className="space-y-4">
      {/* Accessibility Control Header */}
      <div className="flex flex-col gap-3 pb-3 border-b border-[#D0DCE7]">
        {/* Row 1: Tracker Target Selection (Accessibility First) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-['Work_Sans',sans-serif] font-bold text-ink">
              Bagian Pelacak:
            </span>
            <div className="inline-flex rounded-xl bg-[#DEE9F3] p-1 border border-[#D0DCE7]">
              <button
                type="button"
                onClick={() => setTrackerType("finger")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  trackerType === "finger"
                    ? "bg-[#0C7AB5] text-white shadow-xs"
                    : "text-[#1E65AB] hover:text-ink"
                }`}
              >
                👆 Ujung Jari
              </button>
              <button
                type="button"
                onClick={() => setTrackerType("wrist")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  trackerType === "wrist"
                    ? "bg-[#0C7AB5] text-white shadow-xs"
                    : "text-[#1E65AB] hover:text-ink"
                }`}
              >
                ✊ Kepalan / Pergelangan
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrackerType("elbow");
                  if (assistMode === "pinch") setAssistMode("continuous");
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  trackerType === "elbow"
                    ? "bg-[#0C7AB5] text-white shadow-xs"
                    : "text-[#1E65AB] hover:text-ink"
                }`}
              >
                💪 Siku Lengan
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndoAir}
              disabled={strokes.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-['Work_Sans',sans-serif] font-bold text-slate-700 hover:text-slate-900 disabled:opacity-40 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <UndoIcon className="w-3.5 h-3.5" />
              <span>Urungkan</span>
            </button>
            <button
              type="button"
              onClick={handleClearAir}
              disabled={strokes.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-['Work_Sans',sans-serif] font-bold text-[#CF5757] hover:text-white disabled:opacity-40 bg-[#CF5757]/10 hover:bg-[#CF5757] rounded-xl transition-all cursor-pointer"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          </div>
        </div>

        {/* Row 2: Method to Ink/Write */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-['Work_Sans',sans-serif] font-bold text-ink">
            Metode Menulis:
          </span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setAssistMode("continuous")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                assistMode === "continuous"
                  ? "bg-[#0C7AB5] text-white shadow-xs"
                  : "text-slate-600 hover:text-ink"
              }`}
            >
              Tunjuk Bebas
            </button>
            <button
              type="button"
              onClick={() => setAssistMode("space")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                assistMode === "space"
                  ? "bg-[#0C7AB5] text-white shadow-xs"
                  : "text-slate-600 hover:text-ink"
              }`}
            >
              Tahan Tombol / Spasi
            </button>
            {trackerType !== "elbow" && (
              <button
                type="button"
                onClick={() => setAssistMode("pinch")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  assistMode === "pinch"
                    ? "bg-[#0C7AB5] text-white shadow-xs"
                    : "text-slate-600 hover:text-ink"
                }`}
              >
                Cubit Jari (Pinch)
              </button>
            )}
          </div>
        </div>
      </div>

      {modelError ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
          <p className="text-xs font-semibold text-amber-900">{modelError}</p>
          <p className="text-[11px] text-slate-500">
            Anda dapat menggunakan tab Pad Sentuh untuk menulis dengan mouse atau layar sentuh.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Dual Panel Grid: Left Camera + Right Live Paper Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* LEFT: Live Mirrored Camera Viewport (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col space-y-2">
              <div className="relative aspect-[16/10] w-full bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-slate-300">
                {/* Background Mirrored Video */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover scale-x-[-1] opacity-85"
                />

                {/* Foreground Overlay Canvas with Persistent Ink */}
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={500}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />

                {/* Loading Indicator */}
                {isLoadingModel && (
                  <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 z-20">
                    <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <p className="font-['Work_Sans',sans-serif] font-bold text-sm">
                      Menyiapkan sensor pelacak {trackerType === "elbow" ? "siku..." : "tangan..."}
                    </p>
                    <p className="text-xs text-slate-300">Mengoptimalkan sensor akurasi tinggi</p>
                  </div>
                )}

                {/* Status Feedback Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1.5 text-[11px] font-['Work_Sans',sans-serif] font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-xs border ${
                      !bodyPartDetected
                        ? "bg-slate-900/80 text-slate-300 border-slate-700"
                        : isPinching
                        ? "bg-emerald-600/95 text-white border-emerald-400 animate-pulse"
                        : "bg-[#0C7AB5]/95 text-white border-[#1F8EBC]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        !bodyPartDetected
                          ? "bg-slate-400"
                          : isPinching
                          ? "bg-white"
                          : "bg-sky-200"
                      }`}
                    />
                    {!bodyPartDetected
                      ? trackerType === "elbow"
                        ? "Arahkan Siku ke Kamera"
                        : "Arahkan Tangan / Jari ke Kamera"
                      : isPinching
                      ? "Tinta Aktif Menulis di Layar"
                      : "Pena Terangkat (Arahkan Jari)"}
                  </span>
                </div>

                {/* Guide overlay on bottom of camera */}
                <div className="absolute bottom-2.5 inset-x-3 z-10 text-[10.5px] font-medium text-white/90 bg-slate-900/75 backdrop-blur-xs px-2.5 py-1 rounded-lg text-center">
                  {assistMode === "continuous"
                    ? `Gerakkan ${
                        trackerType === "elbow"
                          ? "siku"
                          : trackerType === "wrist"
                          ? "kepalan tangan"
                          : "jari"
                      } bebas di udara • Garis otomatis tersimpan`
                    : assistMode === "space"
                    ? "Tahan SPASI atau tombol di bawah saat bergerak untuk menorehkan tinta"
                    : "Cubit jempol & telunjuk untuk menulis • Renggangkan untuk mengangkat pena"}
                </div>
              </div>

              {/* Accessible Push Button for Space Mode */}
              {assistMode === "space" && (
                <button
                  type="button"
                  onMouseDown={() => setForceDrawKey(true)}
                  onMouseUp={() => setForceDrawKey(false)}
                  onTouchStart={() => setForceDrawKey(true)}
                  onTouchEnd={() => setForceDrawKey(false)}
                  className={`w-full py-2.5 rounded-xl font-['Work_Sans',sans-serif] font-bold text-xs uppercase tracking-wider transition-all select-none cursor-pointer ${
                    forceDrawKey
                      ? "bg-[#16A34A] text-white shadow-inner scale-[0.99]"
                      : "bg-[#0C7AB5]/15 text-[#0C7AB5] hover:bg-[#0C7AB5]/25 border border-[#0C7AB5]/30 shadow-xs"
                  }`}
                >
                  {forceDrawKey
                    ? "✓ Sedang Menorehkan Tinta (Lepas untuk Mengangkat)"
                    : "Tahan Tombol Ini / SPASI untuk Menulis di Udara"}
                </button>
              )}
            </div>

            {/* RIGHT: Real-time Live Document Paper Preview (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3 p-4 bg-[#DEE9F3] rounded-2xl border border-[#D0DCE7]">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#D0DCE7]">
                  <span className="text-xs font-['Work_Sans',sans-serif] font-bold text-ink">
                    Pratinjau Hasil Nyata (Kertas)
                  </span>
                  <span
                    className={`text-[10px] font-['Work_Sans',sans-serif] font-bold px-2 py-0.5 rounded-full ${
                      strokes.length > 0
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {strokes.length > 0
                      ? `${strokes.length} Goresan Tersimpan`
                      : "Menunggu Coretan"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1.5 mb-2.5 font-medium">
                  Coretan di layar kamera tersimpan otomatis dan dapat langsung diperiksa hasilnya di bawah:
                </p>

                {/* White Paper Preview Box */}
                <div className="aspect-[16/10] w-full bg-white rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center p-3 relative overflow-hidden shadow-xs">
                  {livePreviewUrl ? (
                    <img
                      src={livePreviewUrl}
                      alt="Pratinjau tanda tangan udara"
                      className="max-h-full max-w-full object-contain filter contrast-125"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-400 space-y-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xs font-bold">
                        P
                      </div>
                      <p className="text-xs font-semibold text-slate-500">
                        Belum Ada Coretan Tanda Tangan
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Coretan di udara akan tersimpan di layar dan tampil otomatis di sini.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Apply Action */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!livePreviewUrl}
                  onClick={handleApplyAir}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0C7AB5] hover:bg-[#1E65AB] disabled:opacity-40 text-white font-['Work_Sans',sans-serif] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Gunakan Tanda Tangan Ini</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
