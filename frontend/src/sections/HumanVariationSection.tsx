import React from 'react';
import { Fingerprint, Clock, Activity, Feather } from 'lucide-react';
import sampleImages from '../data/sample_images.json';

export default function HumanVariationSection() {
  return (
    <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-3">
          <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
          <span>INTRA-PERSONAL VARIABILITY</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Variasi Alami Tanda Tangan Manusia
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Tanda tangan dari individu yang sama tidak pernah 100% identik secara piksel. Kondisi fisik, jenis alat tulis, dan kecepatan tarikan pena menciptakan spektrum variasi alami.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto mb-8">
        {/* Sample 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-emerald-400" />
                Kondisi Ideal
              </span>
              <span className="text-emerald-400 font-semibold">Variasi A</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 h-28 flex items-center justify-center mb-3">
              <img
                src={sampleImages["ttd_rajshree_1.png"]}
                alt="Variasi asli 1"
                className="max-h-20 object-contain invert brightness-90 filter"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Tarikan pena santai di atas meja stabil; lengkungan dan fluiditas goresan optimal.
          </p>
        </div>

        {/* Sample 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Permukaan Licin
              </span>
              <span className="text-cyan-400 font-semibold">Variasi B</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 h-28 flex items-center justify-center mb-3">
              <img
                src={sampleImages["ttd_rajshree_2.png"]}
                alt="Variasi asli 2"
                className="max-h-20 object-contain invert brightness-90 filter"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Ditandatangani di atas tablet stylus; ekor goresan sedikit terkompresi namun proporsi esensial tetap terjaga.
          </p>
        </div>

        {/* Sample 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Kecepatan Tinggi
              </span>
              <span className="text-indigo-400 font-semibold">Variasi C</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 h-28 flex items-center justify-center mb-3">
              <img
                src={sampleImages["ttd_rajshree_1.png"]}
                alt="Variasi asli 3"
                className="max-h-20 object-contain invert brightness-90 filter"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Tarikan cepat saat tergesa-gesa; ketebalan goresan menipis namun pola topologis Siamese CNN tetap mengidentifikasinya sebagai asli.
          </p>
        </div>
      </div>
    </section>
  );
}
