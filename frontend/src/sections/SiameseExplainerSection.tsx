import React from 'react';
import { Network, GitCompare, Cpu, Binary, ArrowRight, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function SiameseExplainerSection() {
  return (
    <section id="cara-kerja" className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-3">
          <Network className="w-3.5 h-3.5 text-indigo-400" />
          <span>NEURAL ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Arsitektur Siamese Convolutional Neural Network
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Model tidak menghafal identitas perorangan, melainkan mengekstraksi representasi laten invarian 64-dimensi dan menghitung jarak Euclidean antargoresan.
        </p>
      </div>

      {/* Vector Architecture Flow Diagram */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-card max-w-5xl mx-auto mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Inputs Column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 relative">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>Input Citra A</span>
                <span className="text-emerald-400 font-bold">Ref</span>
              </div>
              <div className="h-16 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-center text-xs font-mono text-slate-500">
                Tensor [128, 256, 1]
              </div>
              <span className="text-[11px] text-slate-500 block mt-2">Tanda Tangan Referensi</span>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 relative">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>Input Citra B</span>
                <span className="text-cyan-400 font-bold">Query</span>
              </div>
              <div className="h-16 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-center text-xs font-mono text-slate-500">
                Tensor [128, 256, 1]
              </div>
              <span className="text-[11px] text-slate-500 block mt-2">Tanda Tangan yang Diuji</span>
            </div>
          </div>

          {/* Dual CNN Feature Extractors */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="w-full bg-slate-900/90 p-5 rounded-2xl border border-indigo-500/30 relative shadow-glow-indigo text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[11px] font-mono mb-2">
                <Cpu className="w-3.5 h-3.5" />
                <span>SHARED WEIGHTS (W)</span>
              </div>
              <h4 className="text-base font-bold text-white mb-2">Cabang Kembar CNN</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Kedua citra diproses oleh bobot konvolusi yang persis sama:
              </p>
              
              <div className="space-y-1.5 text-[11px] font-mono text-slate-300 text-left bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>Conv2D (32 filter) + ReLU + MaxPool</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Conv2D (64 filter) + BatchNorm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                  <span>Global Average Pooling + Dense 64-D</span>
                </div>
              </div>
            </div>
          </div>

          {/* Latent Space Vectors & Distance */}
          <div className="lg:col-span-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-3">
              <Binary className="w-4 h-4" />
              <span>EUCLIDEAN DISTANCE METRIC</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center mb-4">
              <span className="text-xs font-mono text-slate-400 block mb-1">Formula Jarak Antar Vektor</span>
              <div className="font-mono text-sm sm:text-base font-bold text-white bg-slate-900 py-2 px-3 rounded-lg border border-slate-800 inline-block">
                d(A, B) = || f(A) - f(B) ||₂
              </div>
              <span className="text-[11px] font-mono text-slate-500 block mt-2">
                f(x) ∈ ℝ⁶⁴ (Ruang Vektor Normalisasi L2)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg">
                <span className="text-emerald-400 font-bold block">d &lt; 0.4811</span>
                <span className="text-[11px] text-slate-400">Penulis yang Sama (ASLI)</span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg">
                <span className="text-rose-400 font-bold block">d ≥ 0.4811</span>
                <span className="text-[11px] text-slate-400">Penulis Berbeda (PALSU)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
