import React from 'react';
import { 
  Binary, 
  Image as ImageIcon, 
  Sun, 
  Contrast, 
  Crop, 
  Maximize2,
  ArrowRight
} from 'lucide-react';

const TAHAPAN = [
  {
    nomor: "01",
    judul: "Grayscale Input",
    penjelasan: "Konversi gambar RGB ke skala abu-abu 8-bit untuk mengeliminasi variasi warna tinta dan kertas.",
    badge: "1-Kanal",
    Icon: ImageIcon,
    accent: "text-blue-400"
  },
  {
    nomor: "02",
    judul: "Koreksi Iluminasi",
    penjelasan: "Normalisasi pencahayaan lokal untuk meratakan gradien bayangan tangan dan pencahayaan latar.",
    badge: "Detrending",
    Icon: Sun,
    accent: "text-amber-400"
  },
  {
    nomor: "03",
    judul: "Binerisasi Otsu",
    penjelasan: "Segmentasi adaptif otomatis untuk memisahkan piksel goresan tinta dari serat kertas secara biner (0 dan 1).",
    badge: "Dual Threshold",
    Icon: Contrast,
    accent: "text-cyan-400"
  },
  {
    nomor: "04",
    judul: "Crop Kontur Goresan",
    penjelasan: "Pendeteksian bounding box kontur terluar dan pembersihan noise bintik debu scan mikroskopis.",
    badge: "Morphology",
    Icon: Crop,
    accent: "text-emerald-400"
  },
  {
    nomor: "05",
    judul: "Standardisasi 128×256",
    penjelasan: "Normalisasi dimensi ke matriks tetap 128×256 piksel dengan mempertahankan aspek rasio asli (zero-padding).",
    badge: "Input Tensor",
    Icon: Maximize2,
    accent: "text-indigo-400"
  }
];

export default function PreprocessingStepsSection() {
  return (
    <section id="pipeline" className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-3">
          <Binary className="w-3.5 h-3.5 text-emerald-400" />
          <span>COMPUTER VISION PIPELINE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Tahapan Prapemrosesan Citra
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Sebelum dievaluasi oleh neural network, citra tanda tangan mentah diproses melalui 5 tahap transformasi citra digital untuk menjamin invarian terhadap pencahayaan dan resolusi.
        </p>
      </div>

      {/* 5-Stage Vector Flow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {TAHAPAN.map((t, idx) => {
          const Icon = t.Icon;
          return (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${t.accent}`} />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-cyan-400 transition-colors">
                    {t.nomor}
                  </span>
                </div>

                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 mb-2">
                  {t.badge}
                </span>

                <h3 className="text-sm font-bold text-white mb-2">{t.judul}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {t.penjelasan}
                </p>
              </div>

              {idx < TAHAPAN.length - 1 && (
                <div className="hidden lg:flex items-center justify-end text-slate-600 pt-2 border-t border-slate-800/60">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
