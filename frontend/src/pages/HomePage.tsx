import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QUIZ_QUESTIONS } from '../data/quiz';

export function HomePage() {
  // Sensitivity slider state for section 7
  const [sensitivityVal, setSensitivityVal] = useState(70);

  // Quiz state for section 10
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Before/after image slider for section 5
  const [activeStepTab, setActiveStepTab] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);

  const currentQuiz = QUIZ_QUESTIONS[quizIdx] || QUIZ_QUESTIONS[0];

  const handleSelectQuizOpt = (idx: number) => {
    setSelectedOpt(idx);
    setShowAnswer(true);
  };

  const handleNextQuiz = () => {
    setSelectedOpt(null);
    setShowAnswer(false);
    setQuizIdx((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  const processingSteps = [
    {
      num: '01',
      title: 'Grayscale',
      desc: 'Menghilangkan warna tinta dan kertas agar komputer fokus pada intensitas guratan.',
      detail: 'Konversi RGB ke monokrom 1-channel, mengabaikan warna pena biru atau hitam.',
    },
    {
      num: '02',
      title: 'Denoising',
      desc: 'Menyaring bintik debu mikro dan artefak sensor kamera tanpa merusak tepi garis.',
      detail: 'Filter Gaussian/bilateral untuk meratakan noise tekstur kertas.',
    },
    {
      num: '03',
      title: 'Otsu Threshold',
      desc: 'Menentukan batas ambang hitam-putih otomatis berdasarkan histogram citra.',
      detail: 'Memisahkan guratan tanda tangan hitam murni dari latar belakang putih bersih.',
    },
    {
      num: '04',
      title: 'Bounding Crop',
      desc: 'Mendeteksi kotak pembatas dan memangkas margin kosong di sekeliling tanda tangan.',
      detail: 'Membuang ruang kosong agar proporsi tanda tangan memenuhi bidang analisis.',
    },
    {
      num: '05',
      title: 'Normalisasi 155x220',
      desc: 'Menyeragamkan resolusi kanvas menjadi dimensi standar input model Siamese CNN.',
      detail: 'Resampling bicubic menjaga ketajaman pola garis saat disesuaikan.',
    },
  ];

  return (
    <div className="min-h-screen text-[#14213D] font-sans antialiased selection:bg-[#FFE566] selection:text-[#14213D]">
      {/* ================================================================
          1. HERO SECTION: DESK FLATLAY WITH MONITOR
          Light pastel blue checkered desk mat background,
          desktop monitor in center with rounded yellow 'tiruan?' badge,
          surrounding sticky notes, keyboard, paper notes, mouse, and coffee mug.
          ================================================================ */}
      <section
        className="relative min-h-[92vh] flex flex-col justify-center items-center px-4 py-12 md:py-16 overflow-hidden"
        style={{
          backgroundColor: '#DCEBF6',
          backgroundImage: `
            linear-gradient(45deg, rgba(255, 255, 255, 0.55) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(255, 255, 255, 0.55) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.55) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.55) 75%)
          `,
          backgroundSize: '48px 48px',
          backgroundPosition: '0 0, 0 24px, 24px -24px, -24px 0px',
        }}
      >
        {/* Floating desk props: Yellow Star Doodle Top Left */}
        <div className="absolute top-10 left-6 sm:left-14 w-8 h-8 pointer-events-none select-none opacity-80" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="#F59E0B" className="w-full h-full drop-shadow-sm">
            <path d="M12 2l2.8 6.6 7.2.6-5.4 4.8 1.6 7-6.2-3.6-6.2 3.6 1.6-7L2 9.2l7.2-.6L12 2z" />
          </svg>
        </div>

        {/* Floating desk props: Little Daisy Flower Top Right */}
        <div className="absolute top-12 right-8 sm:right-20 w-8 h-8 pointer-events-none select-none opacity-80" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle cx="12" cy="7" r="4" fill="#FFFFFF" />
            <circle cx="12" cy="17" r="4" fill="#FFFFFF" />
            <circle cx="7" cy="12" r="4" fill="#FFFFFF" />
            <circle cx="17" cy="12" r="4" fill="#FFFFFF" />
            <circle cx="12" cy="12" r="3.5" fill="#F59E0B" />
          </svg>
        </div>

        {/* Top-Left Yellow Sticky Note */}
        <div
          className="hidden lg:block absolute top-16 left-10 xl:left-24 bg-[#FFE875] text-[#714C00] p-4 pt-5 rounded-xl shadow-lg border border-[#F2D754] w-48 text-center text-sm font-bold z-10 transition-transform hover:scale-105"
          style={{ transform: 'rotate(-4deg)' }}
        >
          {/* Tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-white/70 backdrop-blur-xs rounded-xs shadow-xs" />
          <p className="font-semibold leading-snug">Bawa 1 sampai 5 pembanding</p>
        </div>

        {/* Top-Right Pink Sticky Note */}
        <div
          className="hidden lg:block absolute top-16 right-10 xl:right-24 bg-[#FFBCCD] text-[#881337] p-4 pt-5 rounded-xl shadow-lg border border-[#FFA5BD] w-44 text-center z-10 transition-transform hover:scale-105"
          style={{ transform: 'rotate(4deg)' }}
        >
          {/* Tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-white/70 backdrop-blur-xs rounded-xs shadow-xs" />
          <div className="w-12 h-12 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 stroke-[#881337]" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 20 L16 28 L32 12" />
              <path d="M6 34 L34 34" strokeWidth="3" />
            </svg>
          </div>
        </div>

        {/* Bottom-Left Green Sticky Note */}
        <div
          className="hidden lg:block absolute bottom-28 left-8 xl:left-20 bg-[#C8F2C2] text-[#14532D] p-4 pt-5 rounded-xl shadow-lg border border-[#AEE9A4] w-48 text-center text-sm font-bold z-10 transition-transform hover:scale-105"
          style={{ transform: 'rotate(-2deg)' }}
        >
          {/* Tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-white/70 backdrop-blur-xs rounded-xs shadow-xs" />
          <p className="font-semibold leading-snug">Ini indikasi, bukan vonis</p>
        </div>

        {/* Centerpiece: Computer Monitor Scene */}
        <div className="relative w-full max-w-3xl z-20 mx-auto">
          {/* Monitor Outer Chassis */}
          <div className="bg-white rounded-[36px] p-3 sm:p-4 shadow-2xl border-4 border-slate-100/90 relative">
            {/* Monitor Screen Frame */}
            <div className="relative rounded-[28px] overflow-hidden bg-[#2062E0] text-white p-6 sm:p-10 md:p-12 text-center shadow-inner min-h-[360px] sm:min-h-[400px] flex flex-col justify-center items-center">
              {/* Window Controls Top Bar */}
              <div className="absolute top-4 left-5 flex items-center gap-1.5 opacity-90">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>

              {/* Background Wave Curve Graphic */}
              <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 600 300" fill="none" className="w-[120%] h-auto stroke-white" strokeWidth="3">
                  <path d="M 20 180 Q 150 40 280 180 T 560 140" />
                  <path d="M 40 220 Q 200 90 350 200 T 580 160" strokeDasharray="6 6" />
                </svg>
              </div>

              {/* Headline */}
              <div className="relative z-10 space-y-3 max-w-xl mx-auto">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Tanda tangan ini asli atau
                  <span className="block mt-2">
                    <span className="inline-block bg-[#FFC837] text-[#0F172A] px-5 py-1 sm:py-1.5 rounded-2xl shadow-md border-2 border-[#E5A812] transform -rotate-1">
                      tiruan?
                    </span>
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-blue-100 text-sm sm:text-base md:text-lg font-medium leading-relaxed pt-2 max-w-md mx-auto">
                  Taruh tanda tangan asli, taruh yang mau dicek. Komputer yang ngitung seberapa dekat.
                </p>

                {/* Buttons inside screen */}
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/periksa"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm sm:text-base font-bold bg-[#FFC837] hover:bg-[#FFB703] text-[#0F172A] shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    Cek tanda tangan
                  </Link>
                  <a
                    href="#langkah"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm sm:text-base font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-2 border-white/60 shadow-md transition-all active:scale-95"
                  >
                    Lihat caranya
                  </a>
                </div>
              </div>
            </div>

            {/* Camera dot at bottom bezel */}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mx-auto mt-2" />
          </div>

          {/* Monitor Stand Neck */}
          <div className="w-20 sm:w-24 h-10 bg-gradient-to-b from-slate-200 to-slate-300 mx-auto -mt-1 shadow-inner" />
          {/* Monitor Stand Base */}
          <div className="w-40 sm:w-52 h-4 bg-slate-300/90 mx-auto rounded-full shadow-lg" />
        </div>

        {/* Bottom Desk Arrangement: Keyboard, Notepad, Mouse, Coffee Cup */}
        <div className="w-full max-w-5xl mx-auto mt-6 flex flex-wrap items-center justify-center md:justify-between gap-6 z-20 px-2">
          {/* Angled Compact Keyboard (Left) */}
          <div
            className="hidden sm:block w-56 md:w-64 bg-white/95 p-3 rounded-2xl shadow-xl border border-slate-200/80 transform -rotate-6 transition-transform hover:rotate-0"
            style={{ transform: 'rotate(-5deg)' }}
          >
            <div className="grid grid-cols-10 gap-1 opacity-80">
              <span className="h-4 rounded bg-[#EF4444]" />
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="h-4 rounded bg-slate-200" />
              ))}
              <span className="h-4 rounded bg-slate-300" />
            </div>
            <div className="grid grid-cols-10 gap-1 mt-1 opacity-80">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="h-4 rounded bg-slate-200" />
              ))}
              <span className="h-4 rounded bg-[#FFC837]" />
            </div>
            <div className="grid grid-cols-6 gap-1 mt-1 opacity-80">
              <span className="h-4 rounded bg-slate-300" />
              <span className="h-4 col-span-4 rounded bg-slate-200" />
              <span className="h-4 rounded bg-slate-300" />
            </div>
          </div>

          {/* Open Notepad Sheet (Center Bottom) */}
          <div
            className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full relative transform rotate-1 transition-transform hover:rotate-0"
            style={{ transform: 'rotate(1deg)' }}
          >
            {/* Spiral binding dots at top */}
            <div className="flex justify-between items-center px-2 pb-3 border-b border-dashed border-slate-200">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Catatan Pemeriksaan
              </span>
            </div>

            {/* Signature Graph and Magnifier */}
            <div className="relative py-3">
              <svg viewBox="0 0 240 60" fill="none" className="w-full h-12 stroke-[#1E293B]" strokeWidth="2.5" strokeLinecap="round">
                <path d="M 10 40 Q 35 10 50 35 T 90 25 T 130 45 T 170 20 T 230 35" />
              </svg>

              {/* ASLI Stamp */}
              <div className="absolute top-2 left-2 border-2 border-[#16A34A] text-[#16A34A] font-extrabold text-xs px-2.5 py-0.5 rounded-md transform -rotate-6">
                ASLI
              </div>

              {/* Magnifier Graphic */}
              <div className="absolute top-0 right-8 w-16 h-16 pointer-events-none">
                <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-md">
                  <circle cx="34" cy="34" r="22" stroke="#EAB308" strokeWidth="5" fill="#FFFFFF" fillOpacity="0.4" />
                  <path d="M 50 50 L 72 72" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>

              {/* Pointer tags */}
              <div className="flex justify-between items-center pt-2 text-[11px] font-bold text-slate-600">
                <span className="bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  Pembanding
                </span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                  Yang dicek
                </span>
              </div>
            </div>

            {/* Pencil at bottom */}
            <div className="mt-2 flex items-center justify-end">
              <div className="h-2 w-28 bg-[#F59E0B] rounded-l-full relative flex items-center">
                <div className="w-3 h-2 bg-[#F43F5E] rounded-l-full" />
                <div className="w-2 h-2 bg-slate-300" />
                <div className="ml-auto w-3 h-0 border-t-4 border-b-4 border-l-6 border-t-transparent border-b-transparent border-l-[#F59E0B]" />
              </div>
            </div>
          </div>

          {/* Mouse & Coffee Mug (Right) */}
          <div className="hidden sm:flex items-center gap-5">
            {/* Ergonomic White Mouse */}
            <div className="w-14 h-24 bg-white rounded-[24px] shadow-lg border border-slate-200 p-1.5 flex flex-col items-center relative">
              {/* Wheel */}
              <div className="w-1.5 h-4 bg-[#2563EB] rounded-full mx-auto mt-2" />
              {/* Cable curving to monitor */}
              <svg viewBox="0 0 40 80" fill="none" className="absolute -top-16 left-6 w-8 h-16 stroke-slate-400" strokeWidth="2">
                <path d="M 0 80 C 10 50, -10 20, 20 0" />
              </svg>
            </div>

            {/* Ceramic Coffee Mug */}
            <div className="w-16 h-16 rounded-full bg-white shadow-xl border-4 border-slate-100 p-1 flex items-center justify-center relative">
              <div className="w-full h-full rounded-full bg-[#451A03] flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border border-amber-600/40" />
              </div>
              {/* Handle */}
              <div className="absolute -right-3 top-4 w-4 h-7 rounded-r-full border-3 border-slate-100 bg-white" />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          2. MASALAH SECTION: REALITA TANDA TANGAN
          Warm pastel yellow background, 3 white rounded cards with
          realistic descriptions of why manual signatures get forged easily.
          ================================================================ */}
      <section className="py-20 px-4 sm:px-6 bg-[#FFF9E6] border-t border-b border-amber-200/50">
        <div className="max-w-[1280px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FFE566] text-[#714C00] font-bold text-xs uppercase tracking-wider shadow-xs">
            Realita Tanda Tangan
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Kenapa tanda tangan manual masih sering kecolongan?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Mata manusia mudah tertipu oleh bentuk luar yang sekilas mirip. Padahal ada detail mikro yang sulit ditiru secara alami.
          </p>

          {/* 3 White Rounded Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-7 shadow-lg border border-amber-100/70 hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-xs">
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M8 13h4" />
                    <path d="M8 17h8" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#0F172A]">Goresan ragu-ragu</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Peniru biasanya menarik garis lebih lambat karena berhati-hati, meninggalkan getaran halus dan ketebalan tinta yang tidak wajar.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>FAKTOR 01</span>
                <span className="text-amber-600">Tekanan Pena</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-7 shadow-lg border border-amber-100/70 hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center shadow-xs">
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#0F172A]">Bentuk mirip, dinamika beda</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Tanda tangan asli lahir dari refleks bawah sadar memori otot, bukan hasil menggambar ulang pola visual secara perlahan.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>FAKTOR 02</span>
                <span className="text-indigo-600">Memori Otot</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-7 shadow-lg border border-amber-100/70 hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shadow-xs">
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#0F172A]">Kelelahan verifikator</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Dalam tumpukan berkas tebal, petugas administrasi rata-rata hanya meluangkan 3 detik per dokumen sehingga penyimpangan kecil luput.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>FAKTOR 03</span>
                <span className="text-rose-600">Beban Kognitif</span>
              </div>
            </div>
          </div>

          {/* Bottom highlight pill */}
          <div className="pt-10">
            <div className="inline-block bg-[#FFE566] text-[#714C00] font-bold text-sm sm:text-base px-6 py-3 rounded-full shadow-sm">
              Yang dicari bukan cuma kemiripan bentuk luar, melainkan konsistensi karakter goresan.
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          3. EMPAT HAL YANG DIUKUR SECTION
          Soft ivory/cream background, 4 colorful cards like NalarRuang's 4 personas!
          Kemiringan, Ketebalan goresan, Goresan terputus, Proporsi.
          ================================================================ */}
      <section className="py-20 px-4 sm:px-6 bg-[#FAF7F0]">
        <div className="max-w-[1280px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#E0E7FF] text-[#3730A3] font-bold text-xs uppercase tracking-wider shadow-xs">
            Parameter Analisis
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Empat parameter yang diperiksa komputer
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Sistem tidak hanya mencocokkan siluet garis, melainkan membedah struktur goresan menjadi beberapa nilai numerik objektif.
          </p>

          {/* 4 Persona-Style Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 text-left">
            {/* Card 1: Kemiringan (Soft Blue) */}
            <div className="bg-[#EFF6FF] border-2 border-[#BFDBFE] rounded-3xl p-6 shadow-md hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#2563EB] flex items-center justify-center shadow-xs">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="19" x2="19" y2="5" />
                    <circle cx="19" cy="5" r="2" />
                    <path d="M5 19h8" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#1E3A8A]">Kemiringan</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Menghitung sudut kemiringan dominan garis dan kestabilan orientasi pena dari awal sampai akhir tanda tangan.
                </p>
              </div>
              <div className="pt-3 border-t border-[#BFDBFE]/80 flex items-center justify-between text-xs font-bold text-[#1D4ED8]">
                <span>GEOMETRI</span>
                <span>Konsisten</span>
              </div>
            </div>

            {/* Card 2: Ketebalan (Soft Orange) */}
            <div className="bg-[#FFF7ED] border-2 border-[#FED7AA] rounded-3xl p-6 shadow-md hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#EA580C] flex items-center justify-center shadow-xs">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#9A3412]">Ketebalan goresan</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Mendeteksi variasi tekanan tinta pada titik awal tarikan, belokan tajam, dan ujung lepas tanda tangan.
                </p>
              </div>
              <div className="pt-3 border-t border-[#FED7AA]/80 flex items-center justify-between text-xs font-bold text-[#C2410C]">
                <span>TEKANAN</span>
                <span>Refleksif</span>
              </div>
            </div>

            {/* Card 3: Goresan Terputus (Soft Pink) */}
            <div className="bg-[#FFF1F2] border-2 border-[#FECDD3] rounded-3xl p-6 shadow-md hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#E11D48] flex items-center justify-center shadow-xs">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M4 12h4" />
                    <path d="M12 12h4" />
                    <path d="M20 12h0" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#9F1239]">Goresan terputus</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Mencatat seberapa sering pena terangkat dari kertas untuk membedakan tarikan alami dari imitasi yang ragu.
                </p>
              </div>
              <div className="pt-3 border-t border-[#FECDD3]/80 flex items-center justify-between text-xs font-bold text-[#BE123C]">
                <span>KONTINUITAS</span>
                <span>Kelancaran</span>
              </div>
            </div>

            {/* Card 4: Proporsi (Soft Green) */}
            <div className="bg-[#F0FDF4] border-2 border-[#BBF7D0] rounded-3xl p-6 shadow-md hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#16A34A] flex items-center justify-center shadow-xs">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#166534]">Proporsi</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Membandingkan rasio tinggi terhadap lebar serta distribusi kerapatan ruang antar karakter tanda tangan.
                </p>
              </div>
              <div className="pt-3 border-t border-[#BBF7D0]/80 flex items-center justify-between text-xs font-bold text-[#15803D]">
                <span>DIMENSI</span>
                <span>Rasio Luas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          4. TIGA LANGKAH SECTION
          Vibrant grass green background (#2EB872), exactly like NalarRuang's
          "Tiga langkah, lima menit"! White text, 3 horizontal ivory cards
          with cute star/flower numbered badges (01, 02, 03).
          ================================================================ */}
      <section id="langkah" className="py-20 px-4 sm:px-6 bg-[#2EB872] text-white">
        <div className="max-w-[1280px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FFE566] text-[#714C00] font-bold text-xs uppercase tracking-wider shadow-xs">
            Alur Pemeriksaan
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Tiga langkah, hasil dalam hitungan detik
          </h2>
          <p className="text-emerald-50 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Tidak butuh konfigurasi rumit. Kamu cukup menyiapkan foto tanda tangan dan sistem langsung menghitung indikasinya.
          </p>

          {/* 3 Step Cards */}
          <div className="space-y-4 max-w-3xl mx-auto pt-10 text-left">
            {/* Step 01 */}
            <div className="bg-[#FFFDF7] text-[#0F172A] rounded-2xl p-6 sm:p-7 shadow-lg border border-emerald-100/50 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#FFC837] text-[#0F172A] flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                01
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xl text-[#0F172A]">Unggah 1 sampai 5 tanda tangan asli</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Gunakan foto atau pindaian tanda tangan yang sudah dipastikan sah dari dokumen resmi (seperti KTP atau buku tabungan) sebagai acuan.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-[#FFFDF7] text-[#0F172A] rounded-2xl p-6 sm:p-7 shadow-lg border border-emerald-100/50 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#FF8A8A] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                02
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xl text-[#0F172A]">Masukkan tanda tangan yang ingin diuji</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Unggah berkas tanda tangan pada kuitansi, formulir, atau surat perjanjian yang mencurigakan untuk diperiksa keabsahannya.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-[#FFFDF7] text-[#0F172A] rounded-2xl p-6 sm:p-7 shadow-lg border border-emerald-100/50 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#34D399] text-[#064E3B] flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                03
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xl text-[#0F172A]">Dapatkan skor kemiripan dan catatan forensik</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Sistem langsung menghitung jarak euclidean, status indikasi, serta visualisasi perbandingan detail setiap segmen goresan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          5. PENGOLAHAN CITRA SECTION
          Soft warm peach/manila background (#FFF4E6),
          interactive step tabs (01 to 05) with before/after comparison slider.
          ================================================================ */}
      <section className="py-20 px-4 sm:px-6 bg-[#FFF4E6] border-t border-b border-amber-200/50">
        <div className="max-w-[1280px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FED7AA] text-[#9A3412] font-bold text-xs uppercase tracking-wider shadow-xs">
            Pra-pemrosesan Citra
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Gambar dirapikan sebelum dihitung
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Foto kamera ponsel seringkali kotor, berbayang, atau miring. Sistem menstandarkan berkas agar perbandingan berjalan adil dan konsisten.
          </p>

          {/* Interactive Card */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-100 text-left mt-10 space-y-8">
            {/* Step Pills Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {processingSteps.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveStepTab(idx)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    activeStepTab === idx
                      ? 'bg-[#2563EB] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="opacity-70 mr-1.5">{step.num}</span>
                  {step.title}
                </button>
              ))}
            </div>

            {/* Active Step Information */}
            <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                  Langkah {processingSteps[activeStepTab].num}
                </span>
                <h3 className="font-bold text-lg text-[#0F172A] mt-0.5">
                  {processingSteps[activeStepTab].title}
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  {processingSteps[activeStepTab].desc}
                </p>
              </div>
              <div className="text-xs font-medium text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-200 shrink-0">
                {processingSteps[activeStepTab].detail}
              </div>
            </div>

            {/* Before / After Interactive Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Foto Mentah dari Ponsel</span>
                <span>Hasil Biner Bersih (Otsu & Crop)</span>
              </div>

              <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border-2 border-slate-200 select-none">
                {/* Left Side: Raw Image Simulation */}
                <div
                  className="absolute inset-0 bg-[#E2E8F0] flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundImage: 'radial-gradient(ellipse at 30% 40%, rgba(203, 213, 225, 0.9) 0%, rgba(148, 163, 184, 0.8) 100%)',
                  }}
                >
                  <div className="text-center p-4">
                    <svg viewBox="0 0 260 80" fill="none" className="w-56 h-auto stroke-[#334155]/70 mx-auto" strokeWidth="4" strokeLinecap="round">
                      <path d="M 15 50 Q 40 10 70 45 T 120 30 T 170 55 T 220 20 T 250 40" />
                    </svg>
                    <span className="inline-block mt-2 text-xs font-bold text-slate-600 bg-white/70 px-3 py-1 rounded-full">
                      Tinta berbayang & noise sensor
                    </span>
                  </div>
                </div>

                {/* Right Side: Clean Binary Simulation (clipped by slider) */}
                <div
                  className="absolute inset-y-0 right-0 bg-white flex items-center justify-center overflow-hidden border-l-2 border-[#2563EB]"
                  style={{ width: `${100 - sliderPos}%` }}
                >
                  <div className="text-center p-4 w-full">
                    <svg viewBox="0 0 260 80" fill="none" className="w-56 h-auto stroke-[#0F172A] mx-auto" strokeWidth="3" strokeLinecap="round">
                      <path d="M 15 50 Q 40 10 70 45 T 120 30 T 170 55 T 220 20 T 250 40" />
                    </svg>
                    <span className="inline-block mt-2 text-xs font-bold text-[#16A34A] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      Biner murni 155x220 piksel
                    </span>
                  </div>
                </div>

                {/* Slider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-lg border-2 border-white">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 stroke-current" strokeWidth="3" strokeLinecap="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
              />
              <p className="text-xs text-center text-slate-500">
                Geser slider untuk melihat perbandingan citra sebelum dan sesudah diproses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          6. SIAMESE CNN SECTION
          Soft clean sky blue background (#EEF4FF),
          Two twin cards feeding into Euclidean distance comparator.
          ================================================================ */}
      <section className="py-20 px-4 sm:px-6 bg-[#EEF4FF]">
        <div className="max-w-[1280px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] font-bold text-xs uppercase tracking-wider shadow-xs">
            Jaringan Saraf Tiruan
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Dua gambar masuk, satu jarak keluar
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Siamese Network tidak menghafal siapa pemilik tanda tangan, melainkan mengekstrak fitur esensial dan mengukur seberapa jauh perbedaan dua tanda tangan.
          </p>

          {/* Architectural Diagram Card */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-100 text-left mt-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Branch A */}
              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 text-center space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cabang Input A
                </span>
                <div className="h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2">
                  <svg viewBox="0 0 160 50" fill="none" className="w-full h-auto stroke-[#2563EB]" strokeWidth="2.5">
                    <path d="M 10 35 Q 40 10 70 30 T 120 25 T 150 35" />
                  </svg>
                </div>
                <div className="text-xs font-bold text-[#0F172A]">
                  Tanda Tangan Pembanding
                </div>
                <div className="text-[11px] text-slate-500">
                  CNN Backbone &rarr; Vektor 128-D
                </div>
              </div>

              {/* Central Comparator */}
              <div className="bg-[#EFF6FF] rounded-2xl p-5 border-2 border-[#BFDBFE] text-center space-y-3">
                <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                  Pengukur Selisih
                </span>
                <div className="w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-md">
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 stroke-current" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="font-extrabold text-sm text-[#1E3A8A]">
                  Jarak Euclidean
                </div>
                <div className="text-xs text-slate-600">
                  d = || f(x1) - f(x2) ||
                </div>
              </div>

              {/* Branch B */}
              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 text-center space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cabang Input B
                </span>
                <div className="h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2">
                  <svg viewBox="0 0 160 50" fill="none" className="w-full h-auto stroke-[#EA580C]" strokeWidth="2.5">
                    <path d="M 10 30 Q 40 15 70 35 T 120 20 T 150 40" />
                  </svg>
                </div>
                <div className="text-xs font-bold text-[#0F172A]">
                  Tanda Tangan Uji
                </div>
                <div className="text-[11px] text-slate-500">
                  Bobot Kembar &rarr; Vektor 128-D
                </div>
              </div>
            </div>

            {/* Distance Ruler Bar */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#16A34A]">Jarak Dekat (Mirip / Asli)</span>
                <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Ambang Batas ~0.35
                </span>
                <span className="text-[#DC2626]">Jarak Jauh (Menyimpang)</span>
              </div>
              <div className="h-4 rounded-full bg-gradient-to-r from-[#22C55E] via-[#FBBF24] to-[#EF4444] shadow-inner relative">
                <div className="absolute top-0 bottom-0 left-[35%] w-1 bg-white shadow" />
              </div>
              <p className="text-xs text-slate-500 text-center pt-1">
                Jika jarak lebih kecil dari ambang batas, tanda tangan diindikasikan cocok dengan acuan sah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          7. HASIL SECTION
          Soft sand/cream background (#FAF7F0),
          3 clear verdict cards (Kemungkinan Asli, Perlu Verifikasi, Terindikasi Palsu)
          and a sensitivity slider.
          ================================================================ */}
      <section className="py-20 px-4 sm:px-6 bg-[#FAF7F0]">
        <div className="max-w-[1280px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold text-xs uppercase tracking-wider shadow-xs">
            Interpretasi Hasil
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Hasil pemeriksaan berupa indikasi objektif
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Sistem menyajikan rekomendasi tingkat keyakinan yang transparan untuk membantu verifikator manusia mengambil keputusan.
          </p>

          {/* 3 Verdict Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
            {/* Card 1: Kemungkinan Asli */}
            <div className="bg-[#F0FDF4] border-2 border-[#86EFAC] rounded-3xl p-7 shadow-lg space-y-4 hover:-translate-y-1 transition-all">
              <span className="inline-block bg-[#22C55E] text-white text-xs font-bold px-3 py-1 rounded-full">
                Kemungkinan Asli
              </span>
              <h3 className="font-bold text-xl text-[#14532D]">Jarak Selisih Rendah</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                Pola tarikan garis, proporsi, dan tekanan konsisten dengan kumpulan contoh acuan yang sudah diverifikasi.
              </p>
              <div className="pt-2 text-xs font-bold text-[#16A34A]">
                Nilai Jarak: 0.10 sampai 0.28
              </div>
            </div>

            {/* Card 2: Perlu Verifikasi Lanjut */}
            <div className="bg-[#FEFCE8] border-2 border-[#FDE047] rounded-3xl p-7 shadow-lg space-y-4 hover:-translate-y-1 transition-all">
              <span className="inline-block bg-[#EAB308] text-[#713F12] text-xs font-bold px-3 py-1 rounded-full">
                Perlu Verifikasi Lanjut
              </span>
              <h3 className="font-bold text-xl text-[#713F12]">Area Batas Toleransi</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                Terdapat sedikit deviasi yang mungkin disebabkan oleh permukaan meja kasar, jenis pena berbeda, atau kelelahan tangan.
              </p>
              <div className="pt-2 text-xs font-bold text-[#A16207]">
                Nilai Jarak: 0.29 sampai 0.38
              </div>
            </div>

            {/* Card 3: Terindikasi Berbeda */}
            <div className="bg-[#FFF1F2] border-2 border-[#FDA4AF] rounded-3xl p-7 shadow-lg space-y-4 hover:-translate-y-1 transition-all">
              <span className="inline-block bg-[#EF4444] text-white text-xs font-bold px-3 py-1 rounded-full">
                Terindikasi Berbeda
              </span>
              <h3 className="font-bold text-xl text-[#881337]">Penyimpangan Signifikan</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                Ditemukan perbedaan mencolok pada sudut kemiringan, ketebalan tarikan, atau kelancaran goresan pena.
              </p>
              <div className="pt-2 text-xs font-bold text-[#BE123C]">
                Nilai Jarak: Lebih besar dari 0.39
              </div>
            </div>
          </div>

          {/* Sensitivity Slider Card */}
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 mt-10 text-left space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-base text-[#0F172A]">Ambang Sensitivitas Pemeriksaan</h4>
                <p className="text-xs text-slate-500">Sesuaikan toleransi dengan tingkat risiko dokumen.</p>
              </div>
              <span className="bg-[#EFF6FF] text-[#2563EB] font-bold text-sm px-3 py-1 rounded-full border border-blue-200">
                {sensitivityVal}%
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="95"
              value={sensitivityVal}
              onChange={(e) => setSensitivityVal(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />

            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>Mode Toleran (Presensi Harian)</span>
              <span>Mode Ketat (Perbankan & Kontrak)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          8. FOTO HP SECTION
          Deep modern navy (#111F36), smartphone top-down illustration,
          shadow challenges and robustness metric bars.
          ================================================================ */}
      <section className="py-20 px-4 sm:px-6 bg-[#111F36] text-white">
        <div className="max-w-[1280px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-bold text-xs uppercase tracking-wider">
            Tantangan Realistis
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Foto dari kamera ponsel sering mengecoh
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Kemiringan lensa, bayangan jemari, dan pantulan lampu ruangan adalah tantangan utama visi komputer saat memeriksa dokumen nyata.
          </p>

          {/* Phone vs Paper Demo Card */}
          <div className="max-w-4xl mx-auto bg-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700/80 text-left mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Phone Illustration with Shadow */}
            <div className="bg-[#0F172A] rounded-2xl p-6 border border-slate-700 relative overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
              {/* Paper on desk */}
              <div className="w-56 h-36 bg-white/90 rounded-xl p-3 shadow-md relative">
                <div className="h-2 w-16 bg-slate-300 rounded mb-2" />
                <svg viewBox="0 0 180 50" fill="none" className="w-full h-auto stroke-[#1E293B]" strokeWidth="3">
                  <path d="M 10 30 Q 30 10 60 30 T 110 20 T 160 35" />
                </svg>
                {/* Diagonal Shadow Cast by Phone */}
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-transparent pointer-events-none rounded-xl"
                  style={{ clipPath: 'polygon(0 0, 70% 0, 100% 100%, 0% 100%)' }}
                />
              </div>

              {/* Phone overlay */}
              <div className="absolute bottom-3 right-6 w-24 h-40 bg-slate-800 rounded-2xl border-2 border-slate-500 shadow-2xl p-1.5 flex flex-col items-center">
                <div className="w-6 h-1 bg-slate-600 rounded-full mb-1" />
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                  <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider">
                    Kamera 1x
                  </span>
                </div>
              </div>
            </div>

            {/* Robustness Metrics */}
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-white">
                Ketahanan Pipeline terhadap Gangguan
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Tahap pra-pemrosesan citra kami dirancang untuk mengompensasi distorsi umum sebelum data masuk ke jaringan saraf tiruan.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Kompensasi Bayangan Sebagian</span>
                    <span className="text-emerald-400">Tahan 88%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[88%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Toleransi Sudut Kemiringan (&lt;15 derajat)</span>
                    <span className="text-emerald-400">Tahan 94%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[94%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Noise Sensor Pencahayaan Rendah</span>
                    <span className="text-amber-400">Tahan 82%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full w-[82%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          9. BATASAN SISTEM SECTION
          Soft warm butter/manila background (#FFF9EB),
          taped pastel sticky notes with honest technical boundaries.
          ================================================================ */}
      <section className="py-20 px-4 sm:px-6 bg-[#FFF9EB] border-t border-b border-amber-200/50">
        <div className="max-w-[1280px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FED7AA] text-[#9A3412] font-bold text-xs uppercase tracking-wider shadow-xs">
            Transparansi Metodologi
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Yang jujur belum bisa dilakukan sistem ini
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Teknologi yang baik selalu jujur terhadap batas kemampuannya. Kami ingin kamu memahami peran sistem ini sebagai pendukung, bukan penentu mutlak.
          </p>

          {/* 3 Taped Sticky Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
            {/* Sticky 1: Yellow */}
            <div
              className="bg-[#FEF3C7] text-[#78350F] rounded-3xl p-7 shadow-lg border border-amber-200 relative pt-8 hover:scale-102 transition-transform"
              style={{ transform: 'rotate(-1deg)' }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/70 backdrop-blur-xs rounded-xs shadow-xs" />
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">
                Bukan Pengganti Saksi Ahli
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                Hasil yang dikeluarkan adalah indikasi teknis komputasional. Sistem ini tidak memiliki legalitas hukum pro-justitia layaknya laboratorium forensik kepolisian.
              </p>
            </div>

            {/* Sticky 2: Pink */}
            <div
              className="bg-[#FFE4E6] text-[#9F1239] rounded-3xl p-7 shadow-lg border border-rose-200 relative pt-8 hover:scale-102 transition-transform"
              style={{ transform: 'rotate(1.5deg)' }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/70 backdrop-blur-xs rounded-xs shadow-xs" />
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">
                Sensitif Pada Sampel Buram
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                Jika tanda tangan pembanding terpotong, resolusinya terlalu kecil, atau tinta luntur parah, keandalan ekstraksi ciri akan turun drastis.
              </p>
            </div>

            {/* Sticky 3: Cyan */}
            <div
              className="bg-[#E0F2FE] text-[#075985] rounded-3xl p-7 shadow-lg border border-sky-200 relative pt-8 hover:scale-102 transition-transform"
              style={{ transform: 'rotate(-0.5deg)' }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/70 backdrop-blur-xs rounded-xs shadow-xs" />
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">
                Variasi Alami Pemilik Asli
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                Kondisi fisik pemilik tanda tangan seperti terburu-buru, cedera tangan, atau penuaan bisa menciptakan deviasi yang wajar dari sampel acuan lamanya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          10. KUIS SECTION
          Soft sky blue background (#EBF5FE),
          interactive quiz card with clickable answer strips.
          ================================================================ */}
      <section className="py-20 px-4 sm:px-6 bg-[#EBF5FE]">
        <div className="max-w-[1280px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] font-bold text-xs uppercase tracking-wider shadow-xs">
            Uji Pemahaman
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Uji ketelitianmu sekarang
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Pahami ciri pembeda tanda tangan tiruan sebelum mencoba menguji dokumen sungguhan.
          </p>

          {/* Interactive Quiz Box */}
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-100 text-left mt-10 space-y-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
              <span>PERTANYAAN {quizIdx + 1} DARI {QUIZ_QUESTIONS.length}</span>
              <span className="text-[#2563EB]">{currentQuiz.topic}</span>
            </div>

            <h3 className="font-bold text-lg sm:text-xl text-[#0F172A] leading-snug">
              {currentQuiz.question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuiz.options.map((opt, idx) => {
                const isSelected = selectedOpt === idx;
                const isCorrect = idx === currentQuiz.correctIndex;
                let btnStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700';

                if (showAnswer) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={showAnswer}
                    onClick={() => handleSelectQuizOpt(idx)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all text-sm font-medium flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {showAnswer && isCorrect && (
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        OK
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation */}
            {showAnswer && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-sm text-slate-700 space-y-3">
                <p className="font-medium leading-relaxed">
                  {currentQuiz.explanation}
                </p>
                <button
                  type="button"
                  onClick={handleNextQuiz}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm"
                >
                  Pertanyaan Selanjutnya &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================
          11. AJAKAN AKHIR (CALL TO ACTION)
          Cheerful royal blue background (#2062E0) with soft grid,
          white bold headline, subtext, and big golden yellow pill button.
          ================================================================ */}
      <section className="py-24 px-4 sm:px-6 bg-[#2062E0] text-white text-center relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              repeating-linear-gradient(rgba(255, 255, 255, 0.4) 0px 1px, transparent 1px 32px),
              repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0px 1px, transparent 1px 32px)
            `,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs">
            Siap Menguji?
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Mulai pemeriksaan tanda tangan sekarang
          </h2>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
            Bandingkan tanda tangan dengan 1 sampai 5 pembanding sah, lalu telusuri indikasi dan laporan forensiknya secara transparan.
          </p>
          <div className="pt-4">
            <Link
              to="/periksa"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base sm:text-lg font-bold bg-[#FFC837] hover:bg-[#FFB703] text-[#0F172A] shadow-2xl hover:shadow-yellow-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Mulai pemeriksaan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
