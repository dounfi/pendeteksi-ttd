import React from 'react';
import { DATASET_METRICS, ROBUSTNESS_DATA, MULTI_REF_DATA, CATATAN_BATAS } from '../data/benchmarkData';

export default function LimitsBenchmarkSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="dapur-model" className="py-20 px-4 max-w-5xl mx-auto border-t-2 border-dashed border-ink/20">
      {/* Header Bagian */}
      <div className="text-center mb-12">
        <span className="sticker-label bg-kobalt text-paper-card -rotate-1 mb-2 text-xs">
          BUKA-BUKAAN DAPUR // TANPA GENGSI 🍳
        </span>
        <h2 className="font-bricolage text-3xl sm:text-5xl font-black text-ink mb-3">
          Isi dapur model: jujur tanpa gengsi!
        </h2>
        <p className="font-instrument text-ink-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Di proyek kuliah ini, kita gak mau jualan kecap nomor satu atau ngaku-ngaku 'AI sempurna 100% tanpa cela'. Komputer ini emang jago, tapi dia juga punya batas kemampuan dan hal-hal yang bikin dia garuk-garuk kepala. Ini dia catatannya apa adanya:
        </p>
      </div>

      {/* 1. Ujian Kelulusan pada Orang Baru */}
      <div className="bg-paper-card border-2 border-ink shadow-scrapbook p-6 sm:p-8 mb-12 relative -rotate-[0.5deg] rounded-lg">
        <div className="washi-tape washi-tape-blue"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div>
            <h3 className="font-bricolage text-2xl font-black text-ink">
              Ujian Kelulusan pada Orang Baru
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted font-instrument">
              *Diuji pada ribuan pasang tanda tangan orang yang belum pernah dilihat model saat latihan.
            </p>
          </div>
          <span className="sticker-label bg-mustard text-ink text-xs font-bold">
            Data Riil Eksperimen
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {DATASET_METRICS.map((row, idx) => (
            <div key={idx} className="bg-paper p-5 border-2 border-ink shadow-scrapbook-sm rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bricolage text-lg font-black text-ink">{row.nama}</span>
                <span className="font-mono text-xs font-bold text-daun bg-daun-light px-2 py-0.5 rounded border border-daun/30">
                  Akurasi: {(row.akurasi * 100).toFixed(1)}%
                </span>
              </div>
              <p className="font-instrument text-xs text-ink-muted mb-4 leading-relaxed">
                {row.deskripsi}
              </p>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-dashed border-ink/20">
                <div className="bg-paper-card p-2 border border-ink/20 rounded">
                  <span className="text-[10px] font-mono text-ink-muted uppercase block">EER</span>
                  <span className="font-mono font-bold text-xs text-ink">{(row.eer * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-paper-card p-2 border border-ink/20 rounded">
                  <span className="text-[10px] font-mono text-ink-muted uppercase block">Palsu Lolos</span>
                  <span className="font-mono font-bold text-xs text-bata">{(row.far * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-paper-card p-2 border border-ink/20 rounded">
                  <span className="text-[10px] font-mono text-ink-muted uppercase block">Asli Ditolak</span>
                  <span className="font-mono font-bold text-xs text-mustard-dark">{(row.frr * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Duel Sengit: Dengan Olah Citra vs Tanpa Olah Citra */}
      <div className="bg-paper-card border-2 border-ink shadow-scrapbook p-6 sm:p-8 mb-12 relative rotate-[0.5deg] rounded-lg">
        <div className="washi-tape washi-tape-red"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <div>
            <h3 className="font-bricolage text-2xl font-black text-ink">
              Duel Sengit: Olah Citra vs Tanpa Olah Citra
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted font-instrument">
              Liat gimana fatalnya nasib model kalau dipaksa nelen foto mentah tanpa dicuci muka dulu!
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono font-bold">
            <span className="flex items-center gap-1.5 text-daun">
              <span className="w-3.5 h-3.5 bg-daun border border-ink rounded-xs"></span> Pake Olah Citra
            </span>
            <span className="flex items-center gap-1.5 text-bata">
              <span className="w-3.5 h-3.5 bg-bata border border-ink rounded-xs"></span> Polosan Mentah
            </span>
          </div>
        </div>

        {/* Visual Bar List */}
        <div className="space-y-4 mb-6">
          {ROBUSTNESS_DATA.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span>{item.kondisi}</span>
                <span>
                  <b className="text-daun">{(item.denganOlah * 100).toFixed(1)}%</b> vs{" "}
                  <b className="text-bata">{(item.tanpaOlah * 100).toFixed(1)}%</b>
                </span>
              </div>
              <div className="h-6 w-full bg-paper border-2 border-ink flex rounded overflow-hidden p-0.5 gap-1">
                {/* Bar dengan olah citra */}
                <div
                  className="bg-daun h-full flex items-center justify-end pr-2 text-[10px] font-mono font-bold text-paper-card rounded-xs"
                  style={{ width: `${item.denganOlah * 100}%` }}
                >
                  {(item.denganOlah * 100).toFixed(0)}%
                </div>
                {/* Bar tanpa olah citra */}
                <div
                  className="bg-bata h-full flex items-center justify-end pr-2 text-[10px] font-mono font-bold text-paper-card rounded-xs"
                  style={{ width: `${item.tanpaOlah * 100}%` }}
                >
                  {(item.tanpaOlah * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-mustard-light border border-ink/30 p-3 rounded text-center">
          <p className="font-instrument text-xs sm:text-sm text-ink font-semibold">
            🎯 Perhatiin baris "Kamera HP Asli": Tanpa cuci muka, akurasinya persis 50.0% (artinya model cuma nebak koin antara asli/palsu). Begitu dipoles, langsung naik ke 81.7%!
          </p>
        </div>
      </div>

      {/* 3. Catatan Kejujuran: Hal-Hal yang Bikin Model Bingung */}
      <div className="clipboard-holder p-6 sm:p-8 mb-12 relative">
        <div className="clipboard-clamp"></div>
        <div className="pt-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted block mb-1 text-center">
            ✦ CATATAN KEJUJURAN DETEKTIF ✦
          </span>
          <h3 className="font-bricolage text-2xl font-black text-ink mb-6 text-center">
            Hal-hal yang masih bikin model garuk-garuk kepala 🤕
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATATAN_BATAS.map((c, i) => (
              <div key={i} className="bg-paper-card p-4 border-2 border-ink shadow-scrapbook-sm rounded">
                <span className="text-xl block mb-1">{c.ikon}</span>
                <h4 className="font-bricolage text-sm font-bold text-ink mb-1">
                  {c.judul}
                </h4>
                <p className="font-instrument text-xs text-ink-muted leading-relaxed">
                  {c.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Hangat & Penutup Santai */}
      <div className="text-center pt-6 border-t-2 border-dashed border-ink/20">
        <p className="font-caveat text-2xl text-ink mb-2">
          "Dibuat dengan rasa penasaran tinggi untuk mata kuliah Visual Komputer cerdas ✌️"
        </p>
        <p className="font-instrument text-xs text-ink-muted mb-6">
          Stack: React + TypeScript + Tailwind + FastAPI + Keras Siamese CNN • Bricolage Grotesque & Instrument Sans
        </p>
        <button
          onClick={scrollToTop}
          className="bg-paper-card hover:bg-mustard-light text-ink font-bricolage font-bold text-xs sm:text-sm px-6 py-2.5 border-2 border-ink shadow-scrapbook-sm rounded-full transition-all"
        >
          Balik ke Atas ↑
        </button>
      </div>
    </section>
  );
}
