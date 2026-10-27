import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  ScanLine, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Binary, 
  CheckCircle2, 
  Activity,
  FileCheck2
} from 'lucide-react';
import sampleImages from '../data/sample_images.json';

export default function HeroSection() {
  const scrollToAlat = () => {
    const el = document.getElementById('alat-periksa');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToEdu = () => {
    const el = document.getElementById('cara-kerja');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-6 pb-16 md:pt-10 md:pb-24 px-4 max-w-6xl mx-auto">
      {/* Top Floating Glass Navigation */}
      <header className="flex justify-between items-center mb-12 sm:mb-16 glass-panel px-6 py-3.5 rounded-2xl max-w-4xl mx-auto border border-slate-800/80 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center">
              SIGNA<span className="text-cyan-400">.AI</span>
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <a href="#alat-periksa" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <ScanLine className="w-3.5 h-3.5 text-cyan-400" />
            Meja Uji
          </a>
          <a href="#cara-kerja" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Arsitektur
          </a>
          <a href="#pipeline" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <Binary className="w-3.5 h-3.5 text-emerald-400" />
            Preprocessing
          </a>
          <a href="#dapur-model" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            Benchmark
          </a>
        </nav>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ONLINE</span>
        </div>
      </header>

      {/* Eyebrow Vector Badge */}
      <div className="flex justify-center mb-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-medium backdrop-blur-md shadow-glow-cyan">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>DEEP SIAMESE CNN • OFFLINE SIGNATURE VERIFICATION</span>
        </div>
      </div>

      {/* Main Hero Title */}
      <div className="text-center max-w-4xl mx-auto mb-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          Verifikasi & Deteksi Keaslian <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400">
            Tanda Tangan Digital
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Mengombinasikan arsitektur Siamese CNN kembar untuk memetakan DNA lekukan goresan ke ruang vektor 64 dimensi, dilengkapi analisis forensik ketebalan dan fluiditas tinta.
        </p>
      </div>

      {/* Vector CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
        <button
          onClick={scrollToAlat}
          className="group px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow-cyan transition-all duration-200 flex items-center gap-2.5 cursor-pointer active:scale-95"
        >
          <ScanLine className="w-4 h-4 text-cyan-100 group-hover:scale-110 transition-transform" />
          <span>Buka Meja Uji Verifikasi</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={scrollToEdu}
          className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 font-medium text-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Layers className="w-4 h-4 text-slate-400" />
          <span>Pelajari Arsitektur AI</span>
        </button>
      </div>

      {/* Vector Comparison Showcase */}
      <div className="max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-card relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-b from-cyan-500/15 to-transparent blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Simulasi Inferensi Siamese CNN
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700">Dimensi: 128×256</span>
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700">Threshold: 0.4811</span>
          </div>
        </div>

        {/* 2 Signature Cards + Vector Connector */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Reference Card */}
          <div className="md:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 relative vector-reticle">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-mono text-slate-400 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                Sampel Referensi #01
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                Asli Terverifikasi
              </span>
            </div>
            <div className="bg-slate-950/90 rounded-xl p-4 h-32 flex items-center justify-center border border-slate-800/60 overflow-hidden">
              <img
                src={sampleImages["ttd_rajshree_1.png"]}
                alt="Tanda tangan referensi"
                className="max-h-24 object-contain invert brightness-90 filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Embedding Vector</span>
              <span className="text-cyan-400">[0.21, -0.45, ... 64-D]</span>
            </div>
          </div>

          {/* Center Vector Distance Comparator */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan text-cyan-400 text-xs font-mono font-bold">
              VS
            </div>
            <div className="hidden md:block w-px h-8 bg-gradient-to-b from-cyan-500/40 to-transparent mt-1"></div>
          </div>

          {/* Query Card */}
          <div className="md:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 relative vector-reticle">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-mono text-slate-400 flex items-center gap-1.5">
                <ScanLine className="w-3.5 h-3.5 text-indigo-400" />
                Sampel Uji #02
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-medium">
                Diperiksa
              </span>
            </div>
            <div className="bg-slate-950/90 rounded-xl p-4 h-32 flex items-center justify-center border border-slate-800/60 overflow-hidden">
              <img
                src={sampleImages["ttd_rajshree_2.png"]}
                alt="Tanda tangan uji"
                className="max-h-24 object-contain invert brightness-90 filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Embedding Vector</span>
              <span className="text-indigo-400">[0.18, -0.42, ... 64-D]</span>
            </div>
          </div>
        </div>

        {/* Live Vector Comparison Metrics Bar */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Keputusan: <span className="text-emerald-400">ASLI (GENUINE / COCOK)</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Jarak Euclidean: <span className="text-cyan-400 font-bold">0.2515</span> &lt; Batas 0.4811
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-500">Keyakinan Stabilitas</div>
              <div className="text-xs font-mono font-bold text-emerald-400">Z-Score 16.57 (Sangat Yakin)</div>
            </div>
            <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full w-[92%]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
