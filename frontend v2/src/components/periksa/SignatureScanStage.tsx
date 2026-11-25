import { useEffect, useState } from "react";
import { Check, Search, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export type ScanMode = "off" | "once" | "loop";

interface ScanFrameProps {
  src: string;
  alt: string;
  scanMode?: ScanMode;
  popKey?: number | string;
  bracketTone?: "light" | "brand";
  compact?: boolean;
  className?: string;
  imgClassName?: string;
}

/**
 * Displays a signature sheet with paper-pop entrance, shutter flash,
 * blueprint corner caliper lock-on, and a diagonal glossy sheen sweep.
 */
export function ScanFrame({
  src,
  alt,
  scanMode = "off",
  popKey = 0,
  bracketTone = "brand",
  compact = false,
  className,
  imgClassName,
}: ScanFrameProps) {
  const [animatingOnce, setAnimatingOnce] = useState(scanMode === "once");

  useEffect(() => {
    if (scanMode !== "once") {
      setAnimatingOnce(false);
      return;
    }
    setAnimatingOnce(true);
    const t = window.setTimeout(() => setAnimatingOnce(false), 1250);
    return () => window.clearTimeout(t);
  }, [scanMode, popKey]);

  const showActive = scanMode === "loop" || animatingOnce;
  const cornerColor = bracketTone === "light" ? "border-white/95" : "border-[#0C7AB5]";
  const cornerSize = compact ? "h-2.5 w-2.5" : "h-4 w-4";
  const bw = compact ? "2px" : "2.5px";

  return (
    <div
      key={popKey}
      className={cn(
        "relative overflow-hidden select-none",
        popKey !== 0 && "animate-doc-pop",
        className,
      )}
    >
      <img src={src} alt={alt} className={cn("h-full w-full object-contain", imgClassName)} />

      {/* Brief camera shutter flash */}
      {popKey !== 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-white animate-scan-flash"
        />
      )}

      {/* Fine blueprint grid during capture/scan */}
      {showActive && !compact && (
        <span
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(12,122,181,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(12,122,181,0.08) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
          className="pointer-events-none absolute inset-0"
        />
      )}

      {/* Diagonal glossy paper sheen sweep */}
      {showActive && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#3FA1C1]/25 to-transparent animate-paper-sheen",
          )}
        />
      )}

      {/* Corner caliper lock-on */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          showActive ? "animate-caliper-lock" : "opacity-35",
        )}
      >
        <span
          style={{
            top: compact ? 3 : 8,
            left: compact ? 3 : 8,
            borderLeftWidth: bw,
            borderTopWidth: bw,
          }}
          className={cn("absolute rounded-tl-sm", cornerSize, cornerColor)}
        />
        <span
          style={{
            top: compact ? 3 : 8,
            right: compact ? 3 : 8,
            borderRightWidth: bw,
            borderTopWidth: bw,
          }}
          className={cn("absolute rounded-tr-sm", cornerSize, cornerColor)}
        />
        <span
          style={{
            bottom: compact ? 3 : 8,
            left: compact ? 3 : 8,
            borderBottomWidth: bw,
            borderLeftWidth: bw,
          }}
          className={cn("absolute rounded-bl-sm", cornerSize, cornerColor)}
        />
        <span
          style={{
            bottom: compact ? 3 : 8,
            right: compact ? 3 : 8,
            borderBottomWidth: bw,
            borderRightWidth: bw,
          }}
          className={cn("absolute rounded-br-sm", cornerSize, cornerColor)}
        />
      </div>

      {/* Tiny status stamp on fresh upload (non-compact) */}
      {animatingOnce && !compact && (
        <span className="pointer-events-none absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#0C7AB5] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
          <Check className="h-3 w-3" /> Terbaca
        </span>
      )}
    </div>
  );
}

const PIPELINE_STEPS = [
  { label: "Ratakan Cahaya", detail: "Kurangi bayangan latar" },
  { label: "Pisahkan Tinta", detail: "Binarisasi Otsu & buang bintik" },
  { label: "8 Ciri Morfologi", detail: "Rasio, tebal & kemiringan" },
  { label: "Uji Goyang", detail: "Cek kestabilan keputusan" },
] as const;

interface VerificationScanOverlayProps {
  isOpen: boolean;
  refImageSrc?: string | undefined;
  qryImageSrc?: string | undefined;
  refCount?: number | undefined;
}

/**
 * Dual-sheet forensic inspection desk shown while verifying signatures.
 * Distinct from single-image dark overlays: displays both reference and query
 * signatures connected by an animated vector bridge, orbiting magnifier lens,
 * and a 4-stage live image-processing stepper.
 */
export function VerificationScanOverlay({
  isOpen,
  refImageSrc,
  qryImageSrc,
  refCount = 1,
}: VerificationScanOverlayProps) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStepIdx(0);
      return;
    }
    const id = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 850);
    return () => window.clearInterval(id);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0B2545]/60 px-4 py-6 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Meja analisis forensik tanda tangan"
    >
      {/* Forensic Inspection Desk Card */}
      <div
        style={{
          backgroundImage: "radial-gradient(rgba(12,122,181,0.07) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
        className="w-full max-w-3xl rounded-3xl border-2 border-white bg-[#F4F8FC] p-5 shadow-[0_28px_70px_rgba(11,37,69,0.42)] animate-doc-pop sm:p-7"
      >
        {/* Desk Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D0DCE7] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0C7AB5] text-white shadow-xs">
              <Search className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-[#0B2545] sm:text-base">
                Meja Pemeriksaan {BRAND.name}
              </p>
              <p className="text-xs text-slate-600">
                Menyelaraskan dan membandingkan goresan tanda tangan
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3FA1C1]/40 bg-white px-3 py-1 text-xs font-bold text-[#0C7AB5] shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {PIPELINE_STEPS[stepIdx]?.label}
          </span>
        </div>

        {/* Dual-Sheet Comparison Stage */}
        <div className="relative my-6 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          {/* Left Sheet: Reference */}
          <div className="relative rounded-2xl border border-[#D0DCE7] bg-white p-3 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-md bg-[#E6EDF5] px-2 py-0.5 text-[11px] font-bold text-[#0B2545]">
                Acuan Asli
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {refCount > 1 ? `${refCount} contoh` : "1 contoh"}
              </span>
            </div>
            <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-[#FAFBFD] p-2 sm:h-36">
              {refImageSrc ? (
                <ScanFrame
                  src={refImageSrc}
                  alt="Tanda tangan acuan asli"
                  scanMode="loop"
                  className="h-full w-full"
                  imgClassName="filter contrast-125"
                />
              ) : (
                <span className="text-xs text-slate-400">Tanda tangan acuan</span>
              )}
            </div>
          </div>

          {/* Center Animated Vector Bridge */}
          <div className="flex flex-col items-center justify-center gap-1 py-1 sm:px-1">
            <svg
              viewBox="0 0 80 28"
              className="h-7 w-16 rotate-90 sm:w-20 sm:rotate-0"
              aria-hidden="true"
            >
              <line
                x1="4"
                y1="14"
                x2="76"
                y2="14"
                stroke="#0C7AB5"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-vector-flow"
              />
              <circle cx="8" cy="14" r="4" fill="#0C7AB5" />
              <circle cx="72" cy="14" r="4" fill="#1F8EBC" />
            </svg>
            <span className="hidden rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[#1E65AB] shadow-2xs ring-1 ring-[#D0DCE7] sm:inline-block">
              Cocokkan
            </span>
          </div>

          {/* Right Sheet: Query + Orbiting Magnifier Lens */}
          <div className="relative rounded-2xl border-2 border-[#0C7AB5]/60 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-md bg-[#0C7AB5] px-2 py-0.5 text-[11px] font-bold text-white">
                Yang Diperiksa
              </span>
              <span className="text-[11px] font-semibold text-[#0C7AB5]">Sedang diamati</span>
            </div>
            <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-[#FAFBFD] p-2 sm:h-36">
              {qryImageSrc ? (
                <ScanFrame
                  src={qryImageSrc}
                  alt="Tanda tangan yang diperiksa"
                  scanMode="loop"
                  className="h-full w-full"
                  imgClassName="filter contrast-125"
                />
              ) : (
                <span className="text-xs text-slate-400">Memproses citra...</span>
              )}

              {/* Orbiting Forensics Magnifier Loupe */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <div className="animate-magnifier-orbit relative flex h-14 w-14 items-center justify-center rounded-full border-[2.5px] border-[#0C7AB5] bg-[#3FA1C1]/12 shadow-[0_6px_18px_rgba(12,122,181,0.28)] backdrop-blur-[0.5px]">
                  <span className="h-full w-[1px] bg-[#0C7AB5]/30" />
                  <span className="absolute h-[1px] w-full bg-[#0C7AB5]/30" />
                  <span className="h-2 w-2 rounded-full bg-[#0C7AB5]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Stage Live Image Processing Pipeline Bar */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PIPELINE_STEPS.map((st, idx) => {
            const done = idx < stepIdx;
            const active = idx === stepIdx;
            return (
              <div
                key={st.label}
                className={cn(
                  "rounded-xl border px-3 py-2 transition-all duration-300",
                  active
                    ? "border-[#0C7AB5] bg-white shadow-xs"
                    : done
                      ? "border-[#2E9E5B]/40 bg-[#9ADDB3]/20"
                      : "border-[#D0DCE7] bg-white/55 opacity-70",
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                      active
                        ? "bg-[#0C7AB5] text-white"
                        : done
                          ? "bg-[#2E9E5B] text-white"
                          : "bg-[#D0DCE7] text-[#0B2545]",
                    )}
                  >
                    {done ? "✓" : idx + 1}
                  </span>
                  <span className="truncate text-xs font-bold text-[#0B2545]">{st.label}</span>
                </div>
                <p className="mt-0.5 truncate text-[10px] text-slate-600">{st.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
