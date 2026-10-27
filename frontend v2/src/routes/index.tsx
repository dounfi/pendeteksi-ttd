import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { landing as t } from "@/data/landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SignaCheck: Tanda tangan ini asli atau tiruan?" },
      {
        name: "description",
        content:
          "Taruh 1 sampai 5 tanda tangan asli dan satu yang mau dicek. SignaCheck menghitung seberapa dekat dengan Siamese CNN.",
      },
      { property: "og:title", content: "SignaCheck: Asli atau tiruan?" },
      {
        property: "og:description",
        content: "Bandingkan tanda tangan dengan pembanding asli dan lihat indikasinya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* ================================================================
   STATIONERY & DESK PROPS (Pure SVG & Vector Art, No Emojis, No Photos)
   ================================================================ */

function PushPin({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 30"
      className={`w-6 h-8 shrink-0 pointer-events-none drop-shadow-[0_4px_6px_rgba(20,33,61,0.28)] ${className}`}
      aria-hidden="true"
    >
      <path d="M 12 18 L 12 28" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="11" r="9" fill="#DC2626" />
      <ellipse cx="9.5" cy="8" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.75" />
      <circle cx="12" cy="11" r="5" fill="#B91C1C" />
    </svg>
  );
}

function WashiTape({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-4 w-16 bg-white/80 backdrop-blur-xs rounded-xs shadow-xs -rotate-2 border border-white/60 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}

function BinderClip({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 48"
      className={`w-9 h-11 shrink-0 pointer-events-none drop-shadow-md ${className}`}
      aria-hidden="true"
    >
      <rect x="6" y="16" width="28" height="26" rx="5" fill="#14213D" />
      <rect x="8" y="18" width="24" height="6" rx="2" fill="#334155" />
      <path
        d="M 14 16 L 14 6 C 14 2 26 2 26 6 L 26 16"
        fill="none"
        stroke="#94A3B8"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M 14 16 L 14 6 C 14 2 26 2 26 6 L 26 16"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RubberStamp({
  text,
  color = "#1F7A4F",
  className = "",
}: {
  text: string;
  color?: string;
  className?: string;
}) {
  return (
    <div
      data-stamp
      className={`inline-block font-['Fredoka'] font-bold text-xs sm:text-sm uppercase tracking-wider px-3.5 py-1.5 rounded-sm border-2 border-dashed shadow-xs -rotate-3 ${className}`}
      style={{ borderColor: color, color: color }}
    >
      {text}
    </div>
  );
}

function PencilProp({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 32"
      className={`w-40 h-8 shrink-0 pointer-events-none drop-shadow-[0_4px_8px_rgba(20,33,61,0.2)] ${className}`}
      aria-hidden="true"
    >
      <polygon points="0,16 24,6 24,26" fill="#F59E0B" />
      <polygon points="0,16 8,12 8,20" fill="#1E293B" />
      <rect x="24" y="6" width="126" height="20" fill="#FBBF24" />
      <rect x="24" y="6" width="126" height="5" fill="#F59E0B" />
      <rect x="150" y="6" width="10" height="20" fill="#94A3B8" />
      <rect x="160" y="6" width="18" height="20" rx="4" fill="#F472B6" />
    </svg>
  );
}

function StampPadProp({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-28 h-20 rounded-2xl bg-[#14213D] p-1.5 shadow-[0_6px_16px_rgba(20,33,61,0.28)] border-2 border-slate-700 rotate-6 ${className}`}
      aria-hidden="true"
    >
      <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#B93A2E] to-[#881337] p-1.5 flex items-center justify-center border border-red-900 shadow-inner">
        <div className="w-full h-full rounded-lg bg-[#DC2626] shadow-inner opacity-90" />
      </div>
    </div>
  );
}

/* ================================================================
   SCALLOPED CLOUD WAVE DIVIDER (Boutique Figma Touch)
   ================================================================ */
function CloudWaveDivider({
  fillTop = "#FAF7F0",
  fillBottom = "#EFF6FF",
  className = "",
}: {
  fillTop?: string;
  fillBottom?: string;
  className?: string;
}) {
  return (
    <div className={`w-full overflow-hidden leading-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        className="w-full h-7 sm:h-10 block"
        style={{ backgroundColor: fillTop }}
      >
        <path
          d="M0,0 C50,38 90,38 140,0 C190,38 230,38 280,0 C330,38 370,38 420,0 C470,38 510,38 560,0 C610,38 650,38 700,0 C750,38 790,38 840,0 C890,38 930,38 980,0 C1030,38 1070,38 1120,0 C1160,38 1190,38 1200,0 L1200,48 L0,48 Z"
          fill={fillBottom}
        />
      </svg>
    </div>
  );
}

/* ================================================================
   HEADER COMPONENT
   ================================================================ */
function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group text-decoration-none">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1F4FBF] font-display text-xl font-bold text-white shadow-md group-hover:scale-105 transition-transform border-2 border-white">
            S
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-[#14213D]">
            Signa<span className="text-[#EA580C]">Check</span>
          </span>
        </Link>

        {/* Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-full border border-slate-200/80 shadow-xs">
          <a
            href="#beranda"
            className="px-4 py-1.5 rounded-full text-sm font-bold text-slate-700 hover:text-[#14213D] hover:bg-white transition-all"
          >
            Beranda
          </a>
          <a
            href="#masalah"
            className="px-4 py-1.5 rounded-full text-sm font-bold text-slate-700 hover:text-[#14213D] hover:bg-white transition-all"
          >
            Masalah
          </a>
          <a
            href="#parameter"
            className="px-4 py-1.5 rounded-full text-sm font-bold text-slate-700 hover:text-[#14213D] hover:bg-white transition-all"
          >
            Parameter
          </a>
          <a
            href="#cara"
            className="px-4 py-1.5 rounded-full text-sm font-bold text-slate-700 hover:text-[#14213D] hover:bg-white transition-all"
          >
            Cara Kerja
          </a>
          <a
            href="#citra"
            className="px-4 py-1.5 rounded-full text-sm font-bold text-slate-700 hover:text-[#14213D] hover:bg-white transition-all"
          >
            Citra
          </a>
          <a
            href="#kuis"
            className="px-4 py-1.5 rounded-full text-sm font-bold text-slate-700 hover:text-[#14213D] hover:bg-white transition-all"
          >
            Kuis
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/periksa" className="btn-hero-primary text-sm sm:text-base">
            {t.nav.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ================================================================
   HERO SECTION
   - Uses exact hero-desk.svg at public/assets/hero-desk.svg
   - Desktop (>=1024px): 2400/1500 inline-size container, overlay on monitor
   - Mobile (<1024px): 4/3 cover banner, scalloped cream paper card below
   - Motion: image fades in, text rises 16px and fades in (GSAP)
   ================================================================ */
function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const deskImgRef = useRef<HTMLImageElement>(null);
  const textDesktopRef = useRef<HTMLDivElement>(null);
  const textMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    let ctx: { revert: () => void } | undefined;

    (async () => {
      const { gsap } = await import("gsap");
      ctx = gsap.context(() => {
        // Hero image fades in
        gsap.fromTo(
          deskImgRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.65, ease: "power2.out" }
        );

        // Text block rises 16px and fades in
        if (textDesktopRef.current) {
          gsap.fromTo(
            textDesktopRef.current,
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65, delay: 0.2, ease: "power2.out" }
          );
        }
        if (textMobileRef.current) {
          gsap.fromTo(
            textMobileRef.current,
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65, delay: 0.2, ease: "power2.out" }
          );
        }
      }, heroRef);
    })();

    return () => ctx?.revert();
  }, []);

  return (
    <section id="beranda" ref={heroRef} className="relative w-full bg-checker overflow-hidden">
      {/* DESKTOP (>=1024px): 2400/1500 inline-size container */}
      <div
        className="hidden lg:block relative w-full aspect-[2400/1500] bg-checker overflow-hidden"
        style={{ containerType: "inline-size" }}
      >
        <img
          ref={deskImgRef}
          src="/assets/hero-desk.svg"
          alt="Meja kerja pemeriksa tanda tangan"
          className="w-full h-full block"
        />

        {/* Absolutely positioned overlay box on monitor: left 25.6%, top 7%, width 48.75%, height 44% */}
        <div
          ref={textDesktopRef}
          className="absolute z-20 flex flex-col items-center justify-center text-center px-[4%] pb-[4%] pt-[12%]"
          style={{
            left: "25.6%",
            top: "7%",
            width: "48.75%",
            height: "44%",
          }}
        >
          <h1
            className="font-['Bricolage_Grotesque'] font-extrabold text-white text-center leading-[1.1] max-w-[95%] line-clamp-2"
            style={{ fontSize: "clamp(22px, 3.2cqw, 56px)" }}
          >
            <span>{t.hero.titleStart}</span>{" "}
            <span className="marker-swash">{t.hero.titlePill}</span>
          </h1>

          <p
            className="mt-[1.2cqw] text-white/90 font-medium leading-relaxed"
            style={{
              fontSize: "clamp(14px, 1.15cqw, 20px)",
              maxWidth: "36ch",
            }}
          >
            {t.hero.lead}
          </p>

          <div className="mt-[1.5cqw] flex items-center justify-center gap-3">
            <Link to="/periksa" className="btn-hero-primary">
              {t.hero.primary}
            </Link>
            <a href="#cara" className="btn-hero-secondary">
              {t.hero.secondary}
            </a>
          </div>
        </div>
      </div>

      {/* MOBILE & TABLET (<1024px): 4/3 cover banner + overlapping scalloped cream card */}
      <div className="block lg:hidden w-full pb-10">
        <div className="w-full aspect-[4/3] overflow-hidden bg-checker">
          <img
            src="/assets/hero-desk.svg"
            alt="Meja kerja pemeriksa tanda tangan"
            className="w-full h-full object-cover object-center block"
          />
        </div>

        {/* Scalloped cream paper card centered below, overlapping by 40px, rotated -1deg */}
        <div
          ref={textMobileRef}
          className="-mt-10 mx-auto px-4 max-w-lg relative z-20 filter drop-shadow-[0_4px_16px_rgba(20,33,61,0.18)]"
        >
          <div className="scallop-mask bg-[#F3E9D2] p-6 sm:p-8 text-center text-[#14213D] -rotate-1 border-2 border-white">
            <h1 className="font-['Bricolage_Grotesque'] font-extrabold text-2xl sm:text-3xl text-[#14213D] leading-tight">
              <span>{t.hero.titleStart}</span>{" "}
              <span className="marker-swash">{t.hero.titlePill}</span>
            </h1>

            <p className="mt-3 text-slate-700 text-sm sm:text-base leading-relaxed max-w-[36ch] mx-auto font-medium">
              {t.hero.lead}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link to="/periksa" className="btn-hero-primary text-sm sm:text-base">
                {t.hero.primary}
              </Link>
              <a
                href="#cara"
                className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-full border-2 border-[#14213D] text-[#14213D] font-display font-bold text-sm sm:text-base bg-white/80 hover:bg-white transition-all shadow-xs"
              >
                {t.hero.secondary}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Boutique Ticker Marquee Tape (Inspired by @aliyabluu "WARMNESS" ticker!) */}
      <div className="ticker-tape py-2.5 px-4 overflow-hidden relative z-20">
        <div className="flex items-center justify-center gap-6 whitespace-nowrap text-xs sm:text-sm uppercase tracking-wider font-display font-bold">
          <span>★ SIGNACHECK FORENSIK</span>
          <span>•</span>
          <span>VERIFIKASI KEASLIAN TANDA TANGAN</span>
          <span>•</span>
          <span>SIAMESE CONVOLUTIONAL NEURAL NETWORK</span>
          <span>•</span>
          <span>EKSTRAKSI CIRI GORESAN MIKRO</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">HASIL CEPAT & OBJEKTIF ★</span>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   1. MASALAH SECTION (MADING FORENSIK)
   Cork board in a wood frame with a scalloped paper title tab.
   Three pinned index cards of different shapes (arch-topped, squircle, scalloped),
   red push pins, red string between them.
   Yellow sticky note for "Yang dihitung komputer...".
   ================================================================ */
function MasalahSection() {
  const cards = [
    {
      num: "01",
      tag: "ANALISIS MIKRO",
      title: "Goresan ragu-ragu dan gemetar halus",
      desc: "Penjiplak menarik pena lebih lambat karena harus berhati-hati mengikuti contoh. Kecepatan lambat ini meninggalkan getaran mikro tak kasat mata dan ketebalan garis yang seragam tanpa variasi alami.",
      shape: "rounded-t-[80px] rounded-b-3xl",
      rotate: "-rotate-2",
      accent: "Kontur dan ketebalan goresan",
    },
    {
      num: "02",
      tag: "BIOMEKANIKA",
      title: "Bentuk serupa, memori otot berbeda",
      desc: "Tanda tangan asli lahir dari refleks motorik bawah sadar yang mengalir lancar dalam sekejap. Peniru menggambar ulang kurva secara bertahap, menghasilkan distribusi tekanan tinta yang kaku di setiap belokan.",
      shape: "rounded-[36px]",
      rotate: "rotate-1.5",
      accent: "Distribusi gradien tekanan",
    },
    {
      num: "03",
      tag: "KETERBATASAN MANUAL",
      title: "Kelelahan verifikator manusia",
      desc: "Petugas administrasi rata-rata hanya meluangkan 3 detik per berkas di tengah tumpukan dokumen tebal. Tanpa bantuan komputasi, penyimpangan mikro pada loop dan sudut ekor tanda tangan kerap luput.",
      shape: "scallop-mask",
      rotate: "-rotate-1",
      accent: "Verifikasi berbasis Siamese CNN",
    },
  ];

  return (
    <section id="masalah" className="py-20 px-4 sm:px-6 relative z-10 bg-[#FAF7F0]">
      <div className="max-w-6xl mx-auto">
        {/* Wood Framed Honey Cork Board */}
        <div className="wood-frame-cute cork-texture-cute p-6 sm:p-12 relative overflow-hidden">
          {/* Scalloped Paper Title Tab */}
          <div className="mx-auto max-w-3xl filter drop-shadow-[0_8px_20px_rgba(20,33,61,0.12)] mb-10">
            <div className="scallop-mask bg-white px-6 py-8 sm:px-10 sm:py-10 text-center border-3 border-white">
              <h2 className="figma-heading text-3xl sm:text-5xl leading-tight">
                Kenapa mata manusia sering <span className="marker-swash">terkecoh</span> tanda tangan
                tiruan?
              </h2>
              <p className="mt-3 text-slate-600 text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                Peniru ulung bisa menduplikasi bentuk siluet luar secara kasat mata. Namun mereka
                sulit meniru refleks memori otot dan kestabilan mikroskopik tarikan pena.
              </p>
            </div>
          </div>

          {/* Red Connecting String SVG overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none hidden md:block z-10"
            aria-hidden="true"
          >
            <path
              d="M 220 300 Q 560 250 580 290 T 940 300"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.9"
            />
          </svg>

          {/* Three Pinned Index Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-4 relative z-10">
            {cards.map((c, idx) => (
              <div
                key={idx}
                data-fall
                className={`relative bg-white p-7 flex flex-col justify-between figma-card ${c.shape} ${c.rotate}`}
              >
                {/* Red Push Pin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <PushPin />
                </div>

                <div className="space-y-4 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="w-12 h-12 rounded-2xl bg-[#FFE27A] text-[#14213D] font-['JetBrains_Mono'] font-extrabold text-lg flex items-center justify-center border-2 border-white shadow-sm">
                      {c.num}
                    </span>
                    <span className="text-[11px] font-display font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {c.tag}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#14213D] leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{c.desc}</p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="font-display uppercase tracking-wider text-slate-400">
                    Indikator Forensik
                  </span>
                  <span className="text-[#1F4FBF] font-display font-bold">{c.accent}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Yellow Sticky Note for the bottom note */}
          <div className="mt-12 flex justify-center">
            <div
              data-fall
              className="relative max-w-xl bg-gradient-to-br from-[#FFF5A5] to-[#FFE27A] p-6 sm:p-7 rounded-3xl figma-card -rotate-1 text-center"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <WashiTape />
              </div>
              <p className="font-['Caveat_Brush'] text-xl sm:text-2xl text-[#14213D] leading-snug">
                Yang dihitung komputer bukan cuma kemiripan bentuk luar, melainkan konsistensi ritme
                goresan pena.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   2. EMPAT PARAMETER SECTION (WHITEBOARD MAGNET)
   Whiteboard with 24px grid, gloss streak, aluminum frame.
   A big signature in black marker at the center.
   Four circle magnets and marker arrows in different colors pointing at signature parts.
   ================================================================ */
function ParameterSection() {
  const parameters = [
    {
      title: "Kemiringan",
      desc: "Menghitung sudut kemiringan dominan garis dan kestabilan orientasi pena dari awal sampai akhir tanda tangan.",
      tag: "Geometri",
      magnetColor: "#3B82F6",
      arrowColor: "#3B82F6",
      targetText: "Orientasi garis awal",
    },
    {
      title: "Ketebalan goresan",
      desc: "Mendeteksi variasi tekanan tinta pada titik awal tarikan, belokan tajam, dan ujung lepas tanda tangan.",
      tag: "Tekanan",
      magnetColor: "#F59E0B",
      arrowColor: "#F59E0B",
      targetText: "Pola tekanan loop",
    },
    {
      title: "Goresan terputus",
      desc: "Mencatat seberapa sering pena terangkat dari kertas untuk membedakan tarikan alami dari imitasi yang ragu.",
      tag: "Kontinuitas",
      magnetColor: "#EC4899",
      arrowColor: "#EC4899",
      targetText: "Celah pena terangkat",
    },
    {
      title: "Proporsi",
      desc: "Membandingkan rasio tinggi terhadap lebar serta distribusi kerapatan ruang antar karakter tanda tangan.",
      tag: "Dimensi",
      magnetColor: "#10B981",
      arrowColor: "#10B981",
      targetText: "Rasio tinggi x lebar",
    },
  ];

  return (
    <section id="parameter" className="py-20 px-4 sm:px-6 relative z-10 bg-[#FAF7F0]">
      <div className="max-w-6xl mx-auto">
        <div className="whiteboard-surface-cute p-6 sm:p-12 relative overflow-hidden">
          {/* Centered Heading */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <h2 className="figma-heading text-3xl sm:text-5xl leading-tight">
              Empat <span className="marker-swash">parameter</span> yang diperiksa komputer
            </h2>
            <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
              Sistem tidak hanya mencocokkan siluet luar, melainkan membedah struktur goresan
              menjadi ciri numerik objektif.
            </p>
          </div>

          {/* Central Big Signature in Black Marker */}
          <div className="relative my-8 py-8 px-4 bg-slate-50/80 rounded-3xl border-2 border-slate-200/80 max-w-3xl mx-auto flex flex-col items-center justify-center">
            <svg
              viewBox="0 0 600 160"
              className="w-full max-w-lg h-auto stroke-[#14213D] fill-none drop-shadow-sm"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 40 110 C 90 20, 120 140, 160 50 C 180 10, 200 130, 240 70 C 270 30, 310 120, 360 85 C 410 50, 430 115, 480 60 C 520 20, 550 90, 580 40" />
              <path d="M 120 130 L 460 120" strokeWidth="3.5" />
            </svg>
            <span className="mt-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              [Pola Goresan Master]
            </span>
          </div>

          {/* Four Circle Magnets and Parameter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 text-left">
            {parameters.map((p, idx) => (
              <div
                key={idx}
                data-fall
                className="bg-white rounded-3xl p-6 figma-card relative space-y-4 flex flex-col justify-between"
              >
                {/* Circle Magnet & Marker Arrow Prop at top */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white"
                    style={{ backgroundColor: p.magnetColor }}
                  >
                    M{idx + 1}
                  </div>
                  <svg viewBox="0 0 40 16" className="w-8 h-4 shrink-0" aria-hidden="true">
                    <path
                      d="M 2 8 L 32 8 M 24 2 L 34 8 L 24 14"
                      fill="none"
                      stroke={p.arrowColor}
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-xs font-mono font-bold text-slate-500">{p.targetText}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-bold text-xl text-[#14213D]">{p.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{p.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="text-slate-400 uppercase">CIRI FORENSIK</span>
                  <span className="font-display font-bold text-[#1F4FBF]">{p.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   3. TIGA LANGKAH SECTION (STICKY WALL)
   Sticky wall on pastel sky blue.
   Three big stickies in a staircase (blob, squircle, arch shapes),
   huge mono step numbers, tape. The wavy ribbon passes behind them.
   ================================================================ */
function LangkahSection() {
  const steps = [
    {
      num: "01",
      shape: "rounded-[36px]",
      bg: "bg-[#FEF3C7] text-[#78350F]",
      rotate: "-rotate-2",
      title: "Unggah 1 sampai 5 tanda tangan asli",
      desc: "Gunakan foto atau pindaian tanda tangan yang sudah dipastikan sah dari dokumen resmi (seperti KTP atau buku tabungan) sebagai acuan dasar.",
    },
    {
      num: "02",
      shape: "rounded-[48px] rounded-tl-[80px]",
      bg: "bg-[#FCE7F3] text-[#831843]",
      rotate: "rotate-2",
      title: "Masukkan tanda tangan yang ingin diuji",
      desc: "Unggah berkas tanda tangan pada kuitansi, formulir, atau surat perjanjian yang mencurigakan untuk diperiksa keabsahannya.",
    },
    {
      num: "03",
      shape: "rounded-t-[90px] rounded-b-3xl",
      bg: "bg-[#D1FAE5] text-[#065F46]",
      rotate: "-rotate-1.5",
      title: "Dapatkan skor kemiripan dan catatan forensik",
      desc: "Sistem langsung menghitung jarak euclidean, status indikasi, serta visualisasi perbandingan detail setiap segmen goresan.",
    },
  ];

  return (
    <section id="cara" className="py-20 px-4 sm:px-6 relative z-10 bg-[#EFF6FF]">
      <div className="max-w-6xl mx-auto text-center space-y-4">
        {/* Centered Heading */}
        <h2 className="figma-heading text-3xl sm:text-5xl tracking-tight">
          <span className="marker-swash">Tiga langkah</span>, hasil dalam hitungan detik
        </h2>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Tidak butuh konfigurasi rumit. Cukup siapkan foto tanda tangan dan sistem langsung
          menghitung indikasinya.
        </p>

        {/* 3 Staircase Big Stickies (Inspired by @aliyabluu review cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 text-left items-start">
          {steps.map((st, idx) => (
            <div
              key={idx}
              data-fall
              className={`relative ${st.bg} p-8 figma-card ${st.shape} ${st.rotate} space-y-4 ${
                idx === 1 ? "md:translate-y-6" : idx === 2 ? "md:translate-y-12" : ""
              }`}
            >
              {/* Washi Tape at top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <WashiTape />
              </div>

              {/* Huge JetBrains Mono Step Number */}
              <div className="font-['JetBrains_Mono'] font-extrabold text-5xl opacity-80">
                {st.num}
              </div>

              <h3 className="font-display font-bold text-xl text-[#14213D] leading-snug">
                {st.title}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed font-medium">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   4. CITRA SECTION (CLIPBOARD & COMPARE SLIDER)
   Clipboard with a scalloped white sheet and colored binder tabs
   on the right for existing tabs. Compare slider sits on the sheet.
   ================================================================ */
function CitraSection() {
  const [activeStepTab, setActiveStepTab] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);

  const processingSteps = [
    {
      num: "01",
      title: "Grayscale",
      tabColor: "#3B82F6",
      desc: "Menghilangkan warna tinta dan kertas agar komputer fokus pada intensitas guratan.",
      detail: "Konversi RGB ke monokrom 1-channel, mengabaikan warna pena biru atau hitam.",
    },
    {
      num: "02",
      title: "Denoising",
      tabColor: "#F59E0B",
      desc: "Menyaring bintik debu mikro dan artefak sensor kamera tanpa merusak tepi garis.",
      detail: "Filter Gaussian bilateral untuk meratakan noise tekstur kertas.",
    },
    {
      num: "03",
      title: "Otsu Threshold",
      tabColor: "#EF4444",
      desc: "Menentukan batas ambang hitam-putih otomatis berdasarkan histogram citra.",
      detail: "Memisahkan guratan tanda tangan hitam murni dari latar belakang putih bersih.",
    },
    {
      num: "04",
      title: "Bounding Crop",
      tabColor: "#10B981",
      desc: "Mendeteksi kotak pembatas dan memangkas margin kosong di sekeliling tanda tangan.",
      detail: "Membuang ruang kosong agar proporsi tanda tangan memenuhi bidang analisis.",
    },
    {
      num: "05",
      title: "Normalisasi 155x220",
      tabColor: "#8B5CF6",
      desc: "Menyeragamkan resolusi kanvas menjadi dimensi standar input model Siamese CNN.",
      detail: "Resampling bicubic menjaga ketajaman pola garis saat disesuaikan.",
    },
  ];

  return (
    <section id="citra" className="py-20 px-4 sm:px-6 relative z-10 bg-[#FAF7F0]">
      <div className="max-w-6xl mx-auto text-center space-y-4">
        {/* Centered Heading */}
        <h2 className="figma-heading text-3xl sm:text-5xl tracking-tight">
          Gambar <span className="marker-swash">dirapikan</span> sebelum dihitung
        </h2>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Foto kamera ponsel seringkali kotor, berbayang, atau miring. Sistem menstandarkan berkas
          agar perbandingan berjalan adil dan konsisten.
        </p>

        {/* Clipboard Frame */}
        <div className="max-w-4xl mx-auto bg-[#1E293B] rounded-3xl p-4 sm:p-8 pt-10 sm:pt-12 figma-card relative mt-10">
          {/* Metallic Clip at Top Center */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
            <BinderClip />
          </div>

          <div className="relative flex flex-col md:flex-row items-stretch">
            {/* Scalloped White Sheet on Clipboard */}
            <div className="flex-1 filter drop-shadow-[0_8px_24px_rgba(20,33,61,0.15)]">
              <div className="scallop-mask bg-white p-6 sm:p-8 text-left space-y-6 border-2 border-white">
                {/* Active Step Information Box */}
                <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1F4FBF]">
                      Langkah {processingSteps[activeStepTab].num}
                    </span>
                    <h3 className="font-display font-bold text-xl text-[#14213D] mt-0.5">
                      {processingSteps[activeStepTab].title}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">
                      {processingSteps[activeStepTab].desc}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs shrink-0">
                    {processingSteps[activeStepTab].detail}
                  </div>
                </div>

                {/* Before/After Interactive Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Foto Mentah dari Ponsel</span>
                    <span>Hasil Biner Bersih (Otsu & Crop)</span>
                  </div>

                  <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border-2 border-slate-200 select-none shadow-inner">
                    {/* Left Side: Raw Photo Simulation */}
                    <div
                      className="absolute inset-0 bg-[#DCE4EC] flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundImage:
                          "radial-gradient(ellipse at 30% 40%, rgba(200, 215, 230, 0.9) 0%, rgba(140, 155, 175, 0.8) 100%)",
                      }}
                    >
                      <div className="text-center p-4">
                        <svg
                          viewBox="0 0 260 80"
                          fill="none"
                          className="w-56 h-auto stroke-slate-600 mx-auto"
                          strokeWidth="4"
                          strokeLinecap="round"
                        >
                          <path d="M 15 50 Q 40 10 70 45 T 120 30 T 170 55 T 220 20 T 250 40" />
                        </svg>
                        <span className="inline-block mt-2 text-xs font-bold text-slate-700 bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-xs">
                          Tinta berbayang dan noise kertas
                        </span>
                      </div>
                    </div>

                    {/* Right Side: Clean Binary Output */}
                    <div
                      className="absolute inset-y-0 right-0 bg-white flex items-center justify-center overflow-hidden border-l-4 border-[#1F4FBF]"
                      style={{ width: `${100 - sliderPos}%` }}
                    >
                      <div className="text-center p-4 w-full">
                        <svg
                          viewBox="0 0 260 80"
                          fill="none"
                          className="w-56 h-auto stroke-slate-900 mx-auto"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        >
                          <path d="M 15 50 Q 40 10 70 45 T 120 30 T 170 55 T 220 20 T 250 40" />
                        </svg>
                        <span className="inline-block mt-2 text-xs font-bold text-[#1F7A4F] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-xs">
                          Biner murni 155x220 piksel
                        </span>
                      </div>
                    </div>

                    {/* Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#1F4FBF] text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold">
                        &lt;&gt;
                      </div>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1F4FBF]"
                  />
                  <p className="text-xs text-center text-slate-500 font-medium">
                    Geser slider untuk melihat perbandingan citra sebelum dan sesudah diproses.
                  </p>
                </div>
              </div>
            </div>

            {/* Colored Binder Tabs on the Right Side */}
            <div className="flex md:flex-col justify-center gap-2 md:pl-3 mt-4 md:mt-0 overflow-x-auto">
              {processingSteps.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveStepTab(idx)}
                  className={`px-3.5 py-2.5 text-xs font-display font-bold rounded-2xl md:rounded-r-2xl md:rounded-l-none transition-all text-left whitespace-nowrap shadow-sm border border-white/40 ${
                    activeStepTab === idx
                      ? "bg-white text-[#14213D] scale-105 z-10 font-extrabold shadow-md"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                  style={{
                    borderLeft: `4px solid ${step.tabColor}`,
                  }}
                >
                  <span className="opacity-70 mr-1">{step.num}</span> {step.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   5. SIAMESE SECTION (WHITEBOARD DIAGRAM)
   Whiteboard diagram. Two pinned signature papers left and right,
   marker arrows into a drawn circle "D", a physical ruler under it
   as the distance bar with the existing labels.
   ================================================================ */
function SiameseSection() {
  return (
    <section className="py-20 px-4 sm:px-6 relative z-10 bg-[#EFF6FF]">
      <div className="max-w-6xl mx-auto">
        <div className="whiteboard-surface-cute p-6 sm:p-12 relative overflow-hidden">
          {/* Centered Heading */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <h2 className="figma-heading text-3xl sm:text-5xl leading-tight">
              Dua gambar masuk, <span className="marker-swash">satu jarak</span> keluar
            </h2>
            <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
              Siamese Network tidak menghafal siapa pemilik tanda tangan, melainkan mengekstrak
              fitur esensial dan mengukur seberapa jauh perbedaan dua tanda tangan.
            </p>
          </div>

          {/* Whiteboard Comparison Diagram */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 figma-card border-2 border-slate-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Input Branch A (Pinned Paper) */}
              <div
                data-fall
                className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 text-center space-y-3 shadow-sm relative -rotate-1"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <PushPin />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block pt-2">
                  Cabang Input A
                </span>
                <div className="h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 shadow-inner">
                  <svg
                    viewBox="0 0 160 50"
                    fill="none"
                    className="w-full h-auto stroke-[#1F4FBF]"
                    strokeWidth="3.5"
                  >
                    <path d="M 10 35 Q 40 10 70 30 T 120 25 T 150 35" />
                  </svg>
                </div>
                <div className="font-display font-bold text-sm text-[#14213D]">
                  Tanda Tangan Pembanding
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  CNN Backbone &rarr; Vektor 128-D
                </div>
              </div>

              {/* Central Comparator: Circle "D" with Marker Arrows */}
              <div className="text-center space-y-3 relative py-4">
                <div className="w-20 h-20 rounded-full bg-[#1F4FBF] text-white flex items-center justify-center mx-auto shadow-lg font-display font-extrabold text-3xl border-4 border-white">
                  D
                </div>
                <div className="font-display font-bold text-base text-[#14213D]">
                  Jarak Euclidean
                </div>
                <div className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full inline-block border border-slate-200">
                  d = || f(x1) - f(x2) ||
                </div>
              </div>

              {/* Input Branch B (Pinned Paper) */}
              <div
                data-fall
                className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 text-center space-y-3 shadow-sm relative rotate-1"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <PushPin />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block pt-2">
                  Cabang Input B
                </span>
                <div className="h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 shadow-inner">
                  <svg
                    viewBox="0 0 160 50"
                    fill="none"
                    className="w-full h-auto stroke-[#EA580C]"
                    strokeWidth="3.5"
                  >
                    <path d="M 10 30 Q 40 15 70 35 T 120 20 T 150 40" />
                  </svg>
                </div>
                <div className="font-display font-bold text-sm text-[#14213D]">
                  Tanda Tangan Uji
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Bobot Kembar &rarr; Vektor 128-D
                </div>
              </div>
            </div>

            {/* Physical Ruler Prop under it as Distance Bar */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs font-display font-bold">
                <span className="text-[#10B981]">Jarak Dekat (Mirip / Asli)</span>
                <span className="bg-[#FEF3C7] px-3.5 py-1 rounded-full border border-amber-300 text-[#92400E] shadow-2xs font-bold">
                  Ambang Batas ~0.35
                </span>
                <span className="text-[#EF4444]">Jarak Jauh (Menyimpang)</span>
              </div>

              {/* Physical Wooden/Acrylic Ruler with centimeter notches */}
              <div className="relative rounded-xl bg-gradient-to-r from-[#22C55E] via-[#FBBF24] to-[#EF4444] p-1.5 shadow-inner border border-slate-200">
                <div className="h-6 w-full bg-white/20 backdrop-blur-xs flex items-end justify-between px-2 pb-0.5">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-0.5 bg-slate-900/40 ${i % 4 === 0 ? "h-4 bg-slate-900/70" : "h-2"}`}
                    />
                  ))}
                </div>
                {/* Threshold Marker Indicator */}
                <div className="absolute top-0 bottom-0 left-[35%] w-1.5 bg-[#14213D] shadow-md -translate-x-1/2" />
              </div>

              <p className="text-xs text-slate-500 text-center pt-1 font-medium">
                Jika jarak lebih kecil dari ambang batas, tanda tangan diindikasikan cocok dengan
                acuan sah.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   6. HASIL SECTION (TIGA SCALLOPED ANSWER SLIPS & FADER)
   Three scalloped answer slips in different shapes (circle, arch, squircle),
   each with a rubber Stamp. Sensitivity control as a slide fader on a paper ruler strip.
   ================================================================ */
function HasilSection() {
  const [sensitivityVal, setSensitivityVal] = useState(70);

  return (
    <section className="py-20 px-4 sm:px-6 relative z-10 bg-[#FAF7F0]">
      <div className="max-w-6xl mx-auto text-center space-y-4">
        {/* Centered Heading */}
        <h2 className="figma-heading text-3xl sm:text-5xl tracking-tight">
          Hasil pemeriksaan berupa <span className="marker-swash">indikasi objektif</span>
        </h2>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Sistem menyajikan rekomendasi tingkat keyakinan yang transparan untuk membantu verifikator
          manusia mengambil keputusan.
        </p>

        {/* Three Scalloped Answer Slips in Circle, Arch, Squircle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 text-left items-stretch">
          {/* Slip 1: Circle shape */}
          <div
            data-fall
            className="filter drop-shadow-[0_8px_20px_rgba(20,33,61,0.08)] -rotate-1"
          >
            <div className="scallop-mask bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] p-8 text-center flex flex-col justify-between h-full border-3 border-white">
              <div className="space-y-4">
                <RubberStamp text="KEMUNGKINAN ASLI" color="#1F7A4F" />
                <h3 className="font-display font-bold text-xl text-[#14532D]">
                  Jarak Selisih Rendah
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Pola tarikan garis, proporsi, dan tekanan konsisten dengan kumpulan contoh acuan
                  yang sudah diverifikasi.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-emerald-200/80 text-xs font-mono font-bold text-[#1F7A4F]">
                Nilai Jarak: 0.10 sampai 0.28
              </div>
            </div>
          </div>

          {/* Slip 2: Arch shape */}
          <div
            data-fall
            className="filter drop-shadow-[0_8px_20px_rgba(20,33,61,0.08)] rotate-1.5"
          >
            <div className="scallop-mask bg-gradient-to-br from-[#FEFCE8] to-[#FEF08A] p-8 text-center flex flex-col justify-between h-full border-3 border-white">
              <div className="space-y-4">
                <RubberStamp text="PERLU VERIFIKASI" color="#E0A21B" />
                <h3 className="font-display font-bold text-xl text-[#713F12]">
                  Area Batas Toleransi
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                  Terdapat sedikit deviasi yang mungkin disebabkan oleh permukaan meja kasar, jenis
                  pena berbeda, atau kelelahan tangan.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-amber-300 text-xs font-mono font-bold text-[#E0A21B]">
                Nilai Jarak: 0.29 sampai 0.38
              </div>
            </div>
          </div>

          {/* Slip 3: Squircle shape */}
          <div
            data-fall
            className="filter drop-shadow-[0_8px_20px_rgba(20,33,61,0.08)] -rotate-1.5"
          >
            <div className="scallop-mask bg-gradient-to-br from-[#FFF1F2] to-[#FCE7F3] p-8 text-center flex flex-col justify-between h-full border-3 border-white">
              <div className="space-y-4">
                <RubberStamp text="TERINDIKASI BERBEDA" color="#B93A2E" />
                <h3 className="font-display font-bold text-xl text-[#881337]">
                  Penyimpangan Signifikan
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Ditemukan perbedaan mencolok pada sudut kemiringan, ketebalan tarikan, atau
                  kelancaran goresan pena.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-rose-200 text-xs font-mono font-bold text-[#B93A2E]">
                Nilai Jarak: Lebih besar dari 0.39
              </div>
            </div>
          </div>
        </div>

        {/* Sensitivity Control on a Paper Ruler Strip */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 figma-card mt-12 text-left space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-display font-bold text-lg text-[#14213D]">
                Ambang Sensitivitas Pemeriksaan
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Sesuaikan toleransi dengan tingkat risiko dokumen.
              </p>
            </div>
            <span className="bg-[#1F4FBF] text-white font-mono font-bold text-sm px-3.5 py-1 rounded-full shadow-xs">
              {sensitivityVal}%
            </span>
          </div>

          {/* Paper Ruler Strip */}
          <div className="relative py-2">
            <div className="h-6 w-full bg-[#F1F5F9] rounded-lg border border-slate-200 flex items-end justify-between px-3 pb-1 shadow-inner">
              {Array.from({ length: 21 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-0.5 bg-slate-400 ${i % 4 === 0 ? "h-3.5" : "h-1.5"}`}
                />
              ))}
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={sensitivityVal}
              onChange={(e) => setSensitivityVal(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-1">
            <span>Mode Toleran (Presensi Harian)</span>
            <span>Mode Ketat (Perbankan dan Kontrak)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   7. FOTO HP SECTION (GRAPH-PAPER DESK)
   Graph-paper desk (16px grid).
   Printed sheets with tape, phone prop, and the existing bars
   hand-ruled on graph paper. Values kept; tagged "Data contoh".
   ================================================================ */
function FotoHpSection() {
  return (
    <section className="py-20 px-4 sm:px-6 relative z-10 bg-[#FAF7F0]">
      <div className="max-w-6xl mx-auto">
        <div className="graph-paper-cute p-6 sm:p-12 relative overflow-hidden">
          {/* Centered Heading */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <h2 className="figma-heading text-3xl sm:text-5xl leading-tight">
              Foto dari <span className="marker-swash">kamera ponsel</span> sering mengecoh
            </h2>
            <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
              Kemiringan lensa, bayangan jemari, dan pantulan lampu ruangan adalah tantangan utama
              visi komputer saat memeriksa dokumen nyata.
            </p>
          </div>

          {/* Graph Paper Desk Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
            {/* Phone Prop & Printed Document Sheet */}
            <div
              data-fall
              className="bg-white p-6 rounded-3xl figma-card relative min-h-[280px] flex items-center justify-center -rotate-1"
            >
              {/* Tape on Printed Document Sheet */}
              <div className="absolute -top-3 left-8">
                <WashiTape />
              </div>

              {/* Printed Document Sheet */}
              <div className="w-56 h-36 bg-[#F8FAFC] rounded-2xl p-3 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="h-2 w-16 bg-slate-300 rounded mb-2" />
                <svg
                  viewBox="0 0 180 50"
                  fill="none"
                  className="w-full h-auto stroke-slate-900"
                  strokeWidth="3.5"
                >
                  <path d="M 10 30 Q 30 10 60 30 T 110 20 T 160 35" />
                </svg>
                {/* Simulated cast shadow */}
                <div
                  className="absolute inset-0 bg-black/40 pointer-events-none"
                  style={{ clipPath: "polygon(0 0, 75% 0, 100% 100%, 0% 100%)" }}
                />
              </div>

              {/* Stylized Phone Prop */}
              <div className="absolute -bottom-2 right-4 w-28 h-48 bg-[#14213D] rounded-2xl border-4 border-slate-400 shadow-2xl p-2 flex flex-col items-center rotate-6">
                <div className="w-8 h-1 bg-slate-600 rounded-full mb-1.5" />
                <div className="w-full h-full bg-[#1E293B] rounded-xl flex flex-col items-center justify-center p-2 text-center border border-slate-700">
                  <div className="w-8 h-8 rounded-full border border-sky-400/80 mb-2 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-sky-400" />
                  </div>
                  <span className="text-[10px] text-sky-300 font-mono font-bold uppercase tracking-wider">
                    Lensa 1x
                  </span>
                </div>
              </div>
            </div>

            {/* Hand-Ruled Metric Bars on Graph Paper */}
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-[#14213D]">
                  Ketahanan Pipeline terhadap Gangguan
                </h3>
                {/* Data Contoh Tag */}
                <span className="font-['Fredoka'] font-bold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-amber-200 shadow-2xs">
                  Data contoh
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Tahap pra-pemrosesan citra dirancang untuk mengompensasi distorsi umum sebelum data
                masuk ke jaringan saraf tiruan.
              </p>

              <div className="space-y-4 pt-2">
                {/* Metric 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Kompensasi Bayangan Sebagian</span>
                    <span className="text-[#10B981]">Tahan 88%</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div className="h-full bg-[#10B981] rounded-full w-[88%]" />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Toleransi Sudut Kemiringan (&lt;15 derajat)</span>
                    <span className="text-[#10B981]">Tahan 94%</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div className="h-full bg-[#10B981] rounded-full w-[94%]" />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Noise Sensor Pencahayaan Rendah</span>
                    <span className="text-[#F59E0B]">Tahan 82%</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div className="h-full bg-[#F59E0B] rounded-full w-[82%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   8. BATASAN SISTEM SECTION (LABEL-BLUE POSTER BOARD)
   A tilted label-blue poster board holding the section title,
   with three stickies (yellow, pink, mint) and one memo "Catatan jujur".
   ================================================================ */
function BatasanSection() {
  return (
    <section className="py-20 px-4 sm:px-6 relative z-10 bg-[#FAF7F0]">
      <div className="max-w-6xl mx-auto">
        {/* Tilted Label-Blue Poster Board */}
        <div className="bg-[#1F4FBF] rounded-3xl p-6 sm:p-12 text-white figma-card -rotate-1 relative overflow-hidden">
          {/* Memo "Catatan jujur" at Top Right */}
          <div className="absolute top-5 right-6 z-20">
            <span className="font-['Caveat_Brush'] text-sm sm:text-base bg-[#FFE27A] text-[#14213D] px-3.5 py-1 rounded-lg shadow-md rotate-3 inline-block border-2 border-white">
              Catatan jujur
            </span>
          </div>

          {/* Centered Heading on Blue Poster */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <h2 className="figma-heading-white text-3xl sm:text-5xl leading-tight">
              Yang jujur <span className="marker-swash">belum bisa</span> dilakukan sistem ini
            </h2>
            <p className="text-blue-100 text-base sm:text-lg font-medium leading-relaxed">
              Teknologi yang baik selalu jujur terhadap batas kemampuannya. Kami ingin kamu memahami
              peran sistem ini sebagai pendukung keputusan, bukan penentu mutlak.
            </p>
          </div>

          {/* Three Stickies in Yellow, Pink, Mint */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
            {/* Sticky 1: Yellow */}
            <div
              data-fall
              className="bg-[#FEF3C7] text-[#78350F] rounded-3xl p-7 figma-card relative pt-8 -rotate-1.5"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <WashiTape />
              </div>
              <h3 className="font-display font-bold text-xl text-[#14213D]">Bukan Bukti Hukum</h3>
              <p className="text-slate-800 text-sm leading-relaxed font-medium mt-2">
                Hasil yang dikeluarkan adalah indikasi teknis komputasional. Sistem ini tidak
                memiliki kekuatan hukum pro-justitia layaknya laboratorium forensik kepolisian.
              </p>
            </div>

            {/* Sticky 2: Pink */}
            <div
              data-fall
              className="bg-[#FCE7F3] text-[#831843] rounded-3xl p-7 figma-card relative pt-8 rotate-1.5"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <WashiTape />
              </div>
              <h3 className="font-display font-bold text-xl text-[#14213D]">
                Sensitif Pada Sampel Buram
              </h3>
              <p className="text-slate-800 text-sm leading-relaxed font-medium mt-2">
                Jika tanda tangan pembanding terpotong, resolusinya terlalu kecil, atau tinta luntur
                parah, keandalan ekstraksi ciri akan turun drastis.
              </p>
            </div>

            {/* Sticky 3: Mint */}
            <div
              data-fall
              className="bg-[#D1FAE5] text-[#065F46] rounded-3xl p-7 figma-card relative pt-8 -rotate-1"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <WashiTape />
              </div>
              <h3 className="font-display font-bold text-xl text-[#14213D]">
                Variasi Alami Pemilik Asli
              </h3>
              <p className="text-slate-800 text-sm leading-relaxed font-medium mt-2">
                Kondisi fisik pemilik tanda tangan seperti terburu-buru, cedera tangan, atau penuaan
                bisa menciptakan deviasi yang wajar dari sampel acuan lamanya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   9. KUIS SECTION (EXAM ANSWER SHEET)
   Exam answer sheet with holes, lines, bubble circles for options,
   pencil prop, and small score stamp when answered.
   ================================================================ */
function KuisSection() {
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const quiz = {
    question:
      "Manakah ciri yang paling sering membongkar tanda tangan tiruan hasil tracing (menjiplak)?",
    options: [
      "Bentuk luar tanda tangan terlihat sangat berbeda dari aslinya.",
      "Goresan terlihat ragu-ragu dengan ketebalan garis yang monoton karena pena ditarik perlahan.",
      "Ukuran tanda tangan selalu dua kali lebih besar dari dokumen acuan.",
    ],
    correctIndex: 1,
    explanation:
      "Tepat sekali! Peniru yang menjiplak biasanya menarik pena dengan ragu-ragu dan lambat untuk mengikuti alur, sehingga menghilangkan variasi tekanan alami dan refleks memori otot.",
  };

  const optionLetters = ["A", "B", "C"];

  return (
    <section id="kuis" className="py-20 px-4 sm:px-6 relative z-10 bg-[#FAF7F0]">
      <div className="max-w-6xl mx-auto text-center space-y-4">
        {/* Centered Heading */}
        <h2 className="figma-heading text-3xl sm:text-5xl tracking-tight">
          Uji <span className="marker-swash">ketelitianmu</span> sekarang
        </h2>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Pahami ciri pembeda tanda tangan tiruan sebelum mencoba menguji dokumen sungguhan.
        </p>

        {/* Exam Answer Sheet */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 figma-card text-left mt-10 relative overflow-hidden">
          {/* Perforated Binder Holes on Left Margin */}
          <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-around py-8 pointer-events-none">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shadow-inner" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shadow-inner" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shadow-inner" />
          </div>

          <div className="pl-6 space-y-6">
            {/* Exam Header */}
            <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-500 pb-3 border-b-2 border-slate-100">
              <span>LEMBAR UJIAN FORENSIK</span>
              <span className="text-[#1F4FBF]">Analisis Penjiplakan</span>
            </div>

            <h3 className="font-display font-bold text-xl text-[#14213D] leading-snug">
              {quiz.question}
            </h3>

            {/* Options with Pencil Bubble Circles */}
            <div className="space-y-3">
              {quiz.options.map((opt, idx) => {
                const isSelected = selectedOpt === idx;
                const isCorrect = idx === quiz.correctIndex;
                let bgStyle = "bg-[#F8FAFC] hover:bg-slate-100 border-slate-200 text-slate-800";

                if (showAnswer) {
                  if (isCorrect)
                    bgStyle = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold";
                  else if (isSelected)
                    bgStyle = "bg-rose-50 border-rose-300 text-rose-950 line-through";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={showAnswer}
                    onClick={() => {
                      setSelectedOpt(idx);
                      setShowAnswer(true);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all text-sm font-semibold flex items-center gap-3.5 shadow-xs ${bgStyle}`}
                  >
                    {/* Bubble Circle */}
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border-2 ${
                        isSelected || (showAnswer && isCorrect)
                          ? "bg-[#14213D] text-white border-[#14213D]"
                          : "border-slate-400 text-slate-600 bg-white"
                      }`}
                    >
                      {optionLetters[idx]}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation and Small Score Stamp */}
            {showAnswer && (
              <div className="p-5 rounded-2xl bg-[#EFF6FF] border border-blue-200 text-sm text-slate-700 space-y-3 relative">
                {selectedOpt === quiz.correctIndex && (
                  <div className="absolute -top-3 right-4">
                    <RubberStamp text="NILAI 100 / LULUS" color="#1F7A4F" />
                  </div>
                )}
                <p className="font-medium leading-relaxed">{quiz.explanation}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOpt(null);
                    setShowAnswer(false);
                  }}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-[#1F4FBF] text-white text-xs font-display font-bold shadow-sm"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Pencil Prop Resting at Bottom-Right */}
            <div className="flex justify-end pt-2">
              <PencilProp className="rotate-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   10. AJAKAN AKHIR (CTA POSTER)
   A big tilted label-blue poster board with a scalloped border,
   centered title, large button, stamp pad prop.
   ================================================================ */
function AjakanSection() {
  return (
    <section className="py-24 px-4 sm:px-6 relative z-10 bg-[#FAF7F0]">
      <div className="max-w-3xl mx-auto filter drop-shadow-[0_8px_30px_rgba(31,79,191,0.22)]">
        {/* Tilted Label-Blue Poster Board with Scalloped Border */}
        <div className="scallop-mask bg-[#1F4FBF] p-8 sm:p-14 text-white text-center rotate-1 relative border-3 border-white">
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="figma-heading-white text-3xl sm:text-5xl leading-tight">
              Mulai pemeriksaan tanda tangan <span className="marker-swash">sekarang</span>
            </h2>

            <p className="text-blue-100 text-base sm:text-lg leading-relaxed font-medium">
              Bandingkan tanda tangan dengan 1 sampai 5 pembanding sah, lalu telusuri indikasi dan
              laporan forensiknya secara transparan.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/periksa" className="btn-hero-primary text-lg px-8 py-4">
                Mulai pemeriksaan
              </Link>
              {/* Stamp Pad Prop */}
              <StampPadProp className="hidden sm:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   11. FOOTER (Scalloped Cloud Wave & Manila Strip)
   Manila strip with a scalloped top edge, team as small ID cards,
   binder clip prop, and the line "Hasil ini adalah indikasi, bukan bukti hukum."
   ================================================================ */
function Footer() {
  return (
    <footer className="relative bg-[#E7C57F] text-[#14213D] pt-16 pb-12 px-4 sm:px-6 z-10">
      {/* Scalloped Cloud Divider on Top Edge */}
      <CloudWaveDivider
        fillTop="#FAF7F0"
        fillBottom="#E7C57F"
        className="absolute -top-7 sm:-top-10 inset-x-0"
      />

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Binder Clip Prop at Top */}
        <div className="flex justify-center -mt-20 mb-4">
          <BinderClip />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-amber-900/20">
          <div>
            <Link to="/" className="flex items-center gap-2.5 group text-decoration-none">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1F4FBF] font-display text-xl font-bold text-white shadow-sm border-2 border-white">
                S
              </span>
              <span className="font-display text-2xl font-bold text-[#14213D]">
                Signa<span className="text-[#EA580C]">Check</span>
              </span>
            </Link>
            <p className="text-[#14213D]/80 text-sm mt-1 max-w-md font-medium">
              Sistem verifikasi keaslian tanda tangan berbasis visi komputer dan Siamese CNN.
            </p>
          </div>

          {/* Team as Small ID Cards */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/90 rounded-2xl px-4 py-2 border-2 border-white shadow-xs flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F4FBF]" />
              <div className="text-left">
                <span className="block text-[10px] font-mono uppercase text-slate-500">
                  ID PROYEK
                </span>
                <span className="text-xs font-display font-bold text-[#14213D]">
                  Visual Komputer Cerdas
                </span>
              </div>
            </div>
            <div className="bg-white/90 rounded-2xl px-4 py-2 border-2 border-white shadow-xs flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <div className="text-left">
                <span className="block text-[10px] font-mono uppercase text-slate-500">
                  TIM RISET
                </span>
                <span className="text-xs font-display font-bold text-[#14213D]">
                  SignaCheck Research
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dataset & Repo Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D]/70">
              Dataset:
            </span>
            <span className="text-[#1F4FBF] hover:underline cursor-pointer">CEDAR Signature</span>
            <span className="text-slate-400">/</span>
            <span className="text-[#1F4FBF] hover:underline cursor-pointer">BHSig260</span>
            <span className="text-slate-400">/</span>
            <span className="text-[#1F4FBF] hover:underline cursor-pointer">Repositori Proyek</span>
          </div>

          {/* Prominent Legal Disclaimer Line */}
          <div className="font-display font-bold text-sm text-[#14213D] bg-white/70 px-4 py-1.5 rounded-full border border-white shadow-2xs">
            Hasil ini adalah indikasi, bukan bukti hukum.
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-center space-y-1 text-xs text-[#14213D]/70 pt-4 border-t border-amber-900/10 font-medium">
          <p>Proyek mata kuliah Visual Komputer Cerdas dan Pemrosesan Citra.</p>
          <p className="font-mono text-[#14213D]/60 pt-1">
            2026 SignaCheck. Dikerjakan dengan pendekatan akademis dan transparansi sistem.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ================================================================
   MAIN PAGE ASSEMBLY WITH WAVY CONTINUOUS RIBBON
   ONE continuous SVG path, blue tape look (#1F4FBF with a lighter
   dashed center line), swooping left and right behind the sections
   from below the hero to the footer. It draws itself while scrolling
   (GSAP ScrollTrigger scrub on stroke-dashoffset). Static with reduced-motion.
   ================================================================ */
function Index() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ribbonBasePathRef = useRef<SVGPathElement>(null);
  const ribbonDashPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = ribbonBasePathRef.current;
    const dash = ribbonDashPathRef.current;
    const container = containerRef.current;

    if (!base || !dash || !container) return;

    if (reducedMotion) {
      base.style.strokeDashoffset = "0";
      dash.style.strokeDashoffset = "0";
      return;
    }

    let ctx: { revert: () => void } | undefined;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const len = base.getTotalLength();
        gsap.set([base, dash], {
          strokeDasharray: len,
          strokeDashoffset: len,
        });

        gsap.to([base, dash], {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top 60%",
            end: "bottom 95%",
            scrub: 1.2,
          },
        });

        // Drop-in objects on scroll with short stagger
        const fallItems = container.querySelectorAll("[data-fall]");
        if (fallItems.length > 0) {
          gsap.from(fallItems, {
            y: -24,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 70%",
            },
          });
        }

        // Stamps land once
        const stampItems = container.querySelectorAll("[data-stamp]");
        stampItems.forEach((st) => {
          gsap.from(st, {
            scale: 2.2,
            opacity: 0,
            duration: 0.45,
            ease: "back.out(1.8)",
            scrollTrigger: {
              trigger: st,
              start: "top 85%",
            },
          });
        });
      }, container);
    })();

    return () => ctx?.revert();
  }, []);

  return (
    <>
      <Header />
      <main className="overflow-x-clip bg-[#FAF7F0]">
        <Hero />

        {/* Continuous Sections Wrapper with One Wavy Ribbon */}
        <div ref={containerRef} className="relative w-full overflow-hidden">
          {/* Continuous Wavy Ribbon: One continuous SVG path swooping left & right */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            preserveAspectRatio="none"
            viewBox="0 0 1000 8000"
            fill="none"
            aria-hidden="true"
          >
            {/* Blue Tape Base (#1F4FBF) */}
            <path
              ref={ribbonBasePathRef}
              d="M 220 0 C 80 400, 60 850, 240 1200 C 440 1550, 880 1800, 840 2300 C 800 2800, 140 3100, 180 3600 C 220 4100, 890 4400, 830 5000 C 770 5600, 140 5900, 200 6500 C 260 7100, 860 7400, 740 7800 L 500 8000"
              stroke="#1F4FBF"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            {/* Lighter Dashed Center Line */}
            <path
              ref={ribbonDashPathRef}
              d="M 220 0 C 80 400, 60 850, 240 1200 C 440 1550, 880 1800, 840 2300 C 800 2800, 140 3100, 180 3600 C 220 4100, 890 4400, 830 5000 C 770 5600, 140 5900, 200 6500 C 260 7100, 860 7400, 740 7800 L 500 8000"
              stroke="#A7F3D0"
              strokeWidth="4"
              strokeDasharray="16 14"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </svg>

          {/* 11 Desk Sections */}
          <MasalahSection />
          <ParameterSection />
          <LangkahSection />
          <CitraSection />
          <SiameseSection />
          <HasilSection />
          <FotoHpSection />
          <BatasanSection />
          <KuisSection />
          <AjakanSection />
        </div>
      </main>
      <Footer />
    </>
  );
}
