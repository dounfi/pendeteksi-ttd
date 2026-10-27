import React, { useState } from 'react';
import { Sliders, Gauge, RotateCcw, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ThresholdPlaygroundSection() {
  const [sliderVal, setSliderVal] = useState(0.4811);

  // Perhitungan dinamis ilustrasi kurva FAR / FRR
  const frrPercent = Math.max(1, Math.min(65, Math.round(Math.pow((0.8 - sliderVal) / 0.6, 2) * 55)));
  const farPercent = Math.max(1, Math.min(60, Math.round(Math.pow((sliderVal - 0.2) / 0.6, 2) * 50)));

  return (
    <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>DECISION THRESHOLD ANALYSIS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Simulasi Ambang Batas Keputusan (Threshold)
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Menentukan garis pemisah antara tanda tangan asli dan tiruan adalah kompromi matematis antara False Acceptance Rate (FAR) dan False Rejection Rate (FRR).
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-card max-w-4xl mx-auto mb-8">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-slate-800 gap-3">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Parameter Aktif
            </span>
            <div className="text-lg font-bold font-mono text-white flex items-center gap-2">
              Ambang Batas: <span className="text-cyan-400">{sliderVal.toFixed(4)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSliderVal(0.4811)}
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset EER (0.4811)</span>
            </button>
          </div>
        </div>

        {/* Vector SVG Distribution Curve Chart */}
        <div className="relative h-48 bg-slate-950 rounded-xl border border-slate-800 p-3 mb-6 select-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
            {/* Grid Lines */}
            <line x1="20" y1="105" x2="380" y2="105" stroke="#334155" strokeWidth="1.5" />
            <line x1="20" y1="30" x2="380" y2="30" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="20" y1="65" x2="380" y2="65" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

            {/* Genuine Distribution Curve (Emerald) */}
            <path
              d="M 20 105 Q 110 8 190 105"
              fill="rgba(16, 185, 129, 0.18)"
              stroke="#10B981"
              strokeWidth="2.5"
            />

            {/* Forgery Distribution Curve (Rose) */}
            <path
              d="M 170 105 Q 260 8 380 105"
              fill="rgba(244, 63, 94, 0.18)"
              stroke="#F43F5E"
              strokeWidth="2.5"
            />

            {/* Vertical Threshold Line (Cyan with Glow) */}
            {(() => {
              const xPos = 20 + ((sliderVal - 0.2) / 0.6) * 360;
              return (
                <g>
                  <line
                    x1={xPos}
                    y1="5"
                    x2={xPos}
                    y2="105"
                    stroke="#06B6D4"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                  <circle cx={xPos} cy="10" r="4" fill="#06B6D4" />
                </g>
              );
            })()}
          </svg>

          {/* SVG Legend */}
          <div className="absolute top-3 left-4 flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-400 inline-block"></span>
              Distribusi Pasangan Asli
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40 border border-rose-400 inline-block"></span>
              Distribusi Pasangan Palsu
            </span>
          </div>
        </div>

        {/* Range Slider Control */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-mono text-slate-500 mb-2">
            <span>0.20 (Sangat Ketat)</span>
            <span className="text-cyan-400 font-bold">Titik Potong: {sliderVal.toFixed(4)}</span>
            <span>0.80 (Sangat Longgar)</span>
          </div>
          <input
            type="range"
            min={0.20}
            max={0.80}
            step={0.005}
            value={sliderVal}
            onChange={(e) => setSliderVal(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-700"
          />
        </div>

        {/* Dynamic Trade-off Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono text-slate-400">FRR (Penolakan Salah)</span>
              <span className="text-sm font-mono font-bold text-amber-400">{frrPercent}%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Peluang tanda tangan asli keliru ditolak karena ambang batas terlalu ketat.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono text-slate-400">FAR (Penerimaan Salah)</span>
              <span className="text-sm font-mono font-bold text-rose-400">{farPercent}%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Peluang tanda tangan pemalsu lolos terverifikasi karena ambang batas terlalu longgar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
