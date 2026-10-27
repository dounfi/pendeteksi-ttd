import React from 'react';
import { ShieldAlert, UserX, Crosshair, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function ForgeryTypesSection() {
  return (
    <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-mono mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>TAXONOMY OF FORGERIES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Klasifikasi Tipe Pemalsuan Tanda Tangan
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Dalam bidang verifikasi biometrik offline, ancaman pemalsuan dibagi menjadi dua kategori utama dengan tingkat kesulitan deteksi yang berbeda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
        {/* Card 1: Random / Simple Forgery */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <UserX className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
                Tipe 01
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Pemalsuan Acak (Random Forgery)
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              Pelaku menandatangani dokumen menggunakan gaya atau namanya sendiri tanpa pernah melihat bentuk tanda tangan asli korban.
            </p>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Respon Model Siamese CNN: Sangat Mudah</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Topologi kurva dan rasio aspek berbeda drastis. Jarak embedding umumnya bernilai &gt; 0.70 sehingga langsung ditolak dengan kepastian tinggi.
            </p>
          </div>
        </div>

        {/* Card 2: Skilled Forgery */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Crosshair className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
                Tipe 02
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Pemalsuan Terampil (Skilled Forgery)
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              Pelaku memiliki sampel asli dan berlatih meniru bentuk lekukan, kemiringan, dan proporsinya sedekat mungkin.
            </p>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <AlertOctagon className="w-4 h-4" />
              <span>Respon Model: Analisis Forensik Tambahan</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Meskipun bentuk luarnya mirip, fitur mikroskopis seperti kelambanan goresan (hesitation), tremor garis, dan distribusi ketebalan tinta membongkar tiruan ini.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
