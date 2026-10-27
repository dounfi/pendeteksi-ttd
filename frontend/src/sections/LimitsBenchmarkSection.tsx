import React from 'react';
import { 
  BarChart3, 
  Database, 
  ShieldAlert, 
  FileText, 
  Sparkles, 
  Smartphone, 
  Scale, 
  ArrowUp,
  Cpu,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { DATASET_METRICS, ROBUSTNESS_DATA, CATATAN_BATAS } from '../data/benchmarkData';

export default function LimitsBenchmarkSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBatasIcon = (index: number) => {
    switch (index) {
      case 0: return <FileText className="w-5 h-5 text-cyan-400" />;
      case 1: return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 2: return <Smartphone className="w-5 h-5 text-indigo-400" />;
      default: return <Scale className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <section id="dapur-model" className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono mb-3">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>EMPIRICAL BENCHMARK & METRICS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Evaluasi Model & Batas Kemampuan
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Transparansi metrik performa model Siamese CNN pada dataset publik terbuka (BHSig-Bengali & BHSig-Hindi) serta analisis ketahanan terhadap variasi fisik.
        </p>
      </div>

      {/* 1. Evaluasi pada Penulis Baru (Unseen Signers) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-card mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Pengujian Penulis Baru (Writer-Independent Evaluation)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Diuji pada ribuan pasangan tanda tangan dari subjek yang tidak pernah dilihat saat fase pelatihan.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            Data Riil Eksperimen
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DATASET_METRICS.map((row, idx) => (
            <div key={idx} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-white text-base">{row.nama}</span>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Akurasi: {(row.akurasi * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                {row.deskripsi}
              </p>

              <div className="grid grid-cols-3 gap-2.5 text-center pt-3 border-t border-slate-800">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">EER</span>
                  <span className="font-mono font-bold text-xs text-white">{(row.eer * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">FAR (Palsu Lolos)</span>
                  <span className="font-mono font-bold text-xs text-rose-400">{(row.far * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">FRR (Asli Ditolak)</span>
                  <span className="font-mono font-bold text-xs text-amber-400">{(row.frr * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Uji Ketahanan: Dengan Preprocessing vs Tanpa Preprocessing */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-card mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Dampak Prapemrosesan Citra terhadap Ketahanan Sistem
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Perbandingan akurasi model ketika menerima citra dengan preprocessing versus citra mentah tanpa normalisasi.
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm"></span> Dengan Preprocessing
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 bg-rose-400 rounded-sm"></span> Citra Mentah
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {ROBUSTNESS_DATA.map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-300 font-medium">{item.kondisi}</span>
                <span className="text-slate-400">
                  <b className="text-emerald-400">{(item.denganOlah * 100).toFixed(1)}%</b> vs{" "}
                  <b className="text-rose-400">{(item.tanpaOlah * 100).toFixed(1)}%</b>
                </span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full flex overflow-hidden p-0.5 gap-1 border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.denganOlah * 100}%` }}
                ></div>
                <div
                  className="bg-rose-500/70 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.tanpaOlah * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-cyan-950/40 border border-cyan-500/30 p-3.5 rounded-xl text-center">
          <p className="text-xs text-cyan-200">
            Koreksi iluminasi dan binerisasi Otsu mencegah degradasi akurasi drastis saat memproses foto dari kamera ponsel dalam kondisi remang-remang.
          </p>
        </div>
      </div>

      {/* 3. Catatan Batasan Operasional */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-card mb-12">
        <div className="text-center mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-1">
            CATATAN OPERASIONAL & BATASAN MODEL
          </span>
          <h3 className="text-xl font-bold text-white">
            Kondisi yang Membutuhkan Perhatian Khusus
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATATAN_BATAS.map((c, i) => (
            <div key={i} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                {getBatasIcon(i)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {c.judul}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {c.deskripsi}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back to Top */}
      <div className="text-center pt-4">
        <button
          onClick={scrollToTop}
          className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono inline-flex items-center gap-2 cursor-pointer transition-all"
        >
          <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kembali ke Atas</span>
        </button>
      </div>
    </section>
  );
}
