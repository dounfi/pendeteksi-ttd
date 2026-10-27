import React, { useState } from 'react';
import { Layers, ShieldCheck, Target, ArrowRight } from 'lucide-react';

export default function MultiReferenceSection() {
  const [selectedCount, setSelectedCount] = useState<1 | 3 | 5>(3);

  const scrollToAlat = () => {
    const el = document.getElementById('alat-periksa');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const confidenceScores = {
    1: { acc: "87.4%", eer: "12.6%", desc: "1 sampel hanya merekam satu kondisi saat tanda tangan dibuat." },
    3: { acc: "93.8%", eer: "6.2%", desc: "3 sampel memungkinkan penghitungan jarak centroid rata-rata variasi goresan." },
    5: { acc: "96.5%", eer: "3.5%", desc: "5 sampel menghasilkan ruang toleransi multi-referensi paling optimal dan stabil." },
  };

  return (
    <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-mono mb-3">
          <Layers className="w-3.5 h-3.5 text-violet-400" />
          <span>MULTI-INSTANCE LEARNING</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Keunggulan Multi-Referensi Asli
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Menggunakan lebih dari 1 sampel tanda tangan referensi memungkinkan sistem memetakan rentang dispersi intra-personal alami penanda tangan.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-card max-w-4xl mx-auto mb-8">
        {/* Count Selection Buttons */}
        <div className="flex justify-center gap-3 mb-8">
          {([1, 3, 5] as const).map((count) => (
            <button
              key={count}
              onClick={() => setSelectedCount(count)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                selectedCount === count
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-glow-cyan'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{count} Sampel Referensi</span>
            </button>
          ))}
        </div>

        {/* Dynamic Vector Representation */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            {Array.from({ length: selectedCount }).map((_, i) => (
              <div
                key={i}
                className="w-20 h-24 bg-slate-900 rounded-xl border border-slate-700/80 flex flex-col items-center justify-between p-2 shadow-sm"
              >
                <span className="text-[10px] font-mono text-slate-400">Ref #{i + 1}</span>
                <span className="text-xs font-mono text-cyan-400">[64-D]</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
            ))}

            <div className="text-cyan-400 font-mono font-bold px-2 text-sm">
              ➔ Centroid Mean
            </div>

            <div className="w-28 h-24 bg-cyan-950/40 rounded-xl border border-cyan-500/50 flex flex-col items-center justify-between p-2 shadow-glow-cyan">
              <span className="text-[10px] font-mono text-cyan-300 font-bold">Vektor Stabil</span>
              <span className="text-xs font-mono text-white font-bold">μ(Ref 1..{selectedCount})</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center pt-4 border-t border-slate-800/80">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                Estimasi Akurasi Sistem
              </span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {confidenceScores[selectedCount].acc}
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                Tingkat EER (Equal Error Rate)
              </span>
              <span className="text-xl font-mono font-bold text-cyan-400">
                {confidenceScores[selectedCount].eer}
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          {confidenceScores[selectedCount].desc}
        </p>
      </div>
    </section>
  );
}
