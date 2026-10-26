import React from 'react';
import sampleImages from '../data/sample_images.json';

export default function HeroSection() {
  const scrollToAlat = () => {
    const el = document.getElementById('alat-periksa');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToEdu = () => {
    const el = document.getElementById('edukasi');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-6 pb-16 md:py-20 px-4 max-w-5xl mx-auto">
      {/* Top Floating Pill Navigation */}
      <div className="flex justify-between items-center mb-10 bg-paper-card border-2 border-ink px-5 py-3 shadow-scrapbook rounded-full max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-bata border border-ink inline-block"></span>
          <span className="font-bricolage font-black text-xl tracking-tight text-ink">
            cektangan<span className="text-bata">.</span>
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5 text-xs font-instrument font-bold">
          <a href="#edukasi" className="text-ink hover:text-bata transition-colors">Ceritanya</a>
          <a href="#cara-kerja" className="text-ink hover:text-bata transition-colors">Cara Kerja</a>
          <a href="#alat-periksa" className="text-ink hover:text-bata transition-colors">Meja Uji</a>
          <a href="#dapur-model" className="text-ink hover:text-bata transition-colors">Buka Dapur</a>
        </div>
      </div>

      {/* Playful Eyebrow Stiker */}
      <div className="flex justify-center mb-4">
        <span className="sticker-label bg-mustard text-ink font-bold -rotate-1 text-xs px-3.5 py-1 shadow-scrapbook-sm">
          ✦ PROYEK VISUAL KOMPUTER • BEBAS JARGON KANTORAN ✦
        </span>
      </div>

      {/* Judul Hangat & Sangat Manusiawi */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="font-bricolage text-4xl sm:text-6xl font-black text-ink tracking-tight leading-[1.1] mb-5">
          Dua goresan pena.<br />
          <span className="text-bata underline decoration-washi-yellow decoration-wavy decoration-4">Bisa beda cerita.</span>
        </h1>
        <p className="font-instrument text-ink-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Pernah mikir gak, gimana caranya komputer tau kalau tanda tangan di secarik kertas itu beneran kamu yang bikin—atau temen kamu yang lagi iseng titip absen?
          Gak pake bahasa robot atau istilah dewa, yuk ngobrol santai sambil kita bedah lekukan tintanya!
        </p>
      </div>

      {/* Tombol Aksi Chunky Playful */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
        <button
          onClick={scrollToAlat}
          className="bg-bata hover:bg-bata-dark text-paper-card font-bricolage font-extrabold text-base sm:text-lg px-8 py-3.5 border-2 border-ink shadow-scrapbook hover:shadow-scrapbook-lg active:translate-x-0.5 active:translate-y-0.5 transition-all -rotate-1 hover:rotate-0 flex items-center gap-2"
        >
          <span>Gatel pengen nyoba langsung!</span>
          <span>✍️</span>
        </button>
        <button
          onClick={scrollToEdu}
          className="bg-paper-card hover:bg-mustard-light text-ink font-bricolage font-bold text-base sm:text-lg px-6 py-3.5 border-2 border-ink shadow-scrapbook hover:shadow-scrapbook-lg active:translate-x-0.5 active:translate-y-0.5 transition-all rotate-1 hover:rotate-0"
        >
          Ceritain dulu dong ↓
        </button>
      </div>

      {/* Visual Showcase Papan Meja Kerja (Scrapbook) */}
      <div className="relative max-w-2xl mx-auto pt-4 pb-4">
        {/* Coretan Tangan Catatan */}
        <p className="font-caveat text-xl sm:text-2xl text-ink-muted absolute -top-4 left-4 -rotate-6 z-30">
          Kelihatan mirip di mata kita, tapi apa kata komputer? ✎
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center relative">
          {/* Kertas Kiri */}
          <div className="relative bg-paper-card p-5 border-2 border-ink shadow-scrapbook -rotate-2 hover:rotate-0 transition-transform">
            <div className="washi-tape washi-tape-yellow"></div>
            <div className="flex items-center justify-between mb-3 border-b-2 border-dashed border-ink/20 pb-2">
              <span className="text-xs font-mono font-bold uppercase text-ink-muted">
                Kertas #01
              </span>
              <span className="text-[11px] font-bold text-daun bg-daun-light px-2 py-0.5 border border-daun/40 rounded-full">
                Asli Tersimpan
              </span>
            </div>
            <div className="bg-paper p-3 border border-ink/20 min-h-[110px] flex items-center justify-center rounded">
              <img
                src={sampleImages["ttd_rajshree_1.png"]}
                alt="Tanda tangan referensi asli"
                className="max-h-20 object-contain"
              />
            </div>
            <span className="font-caveat text-base text-ink-muted block mt-2 text-right">
              "pas bikin rekening bank..."
            </span>
          </div>

          {/* Kertas Kanan */}
          <div className="relative bg-paper-card p-5 border-2 border-ink shadow-scrapbook rotate-2 hover:rotate-0 transition-transform">
            <div className="washi-tape washi-tape-blue"></div>
            <div className="flex items-center justify-between mb-3 border-b-2 border-dashed border-ink/20 pb-2">
              <span className="text-xs font-mono font-bold uppercase text-ink-muted">
                Kertas #02
              </span>
              <span className="text-[11px] font-bold text-kobalt bg-kobalt-light px-2 py-0.5 border border-kobalt/40 rounded-full">
                Tanda Tangan Uji
              </span>
            </div>
            <div className="bg-paper p-3 border border-ink/20 min-h-[110px] flex items-center justify-center rounded">
              <img
                src={sampleImages["ttd_rajshree_2.png"]}
                alt="Tanda tangan yang diuji"
                className="max-h-20 object-contain"
              />
            </div>
            <span className="font-caveat text-base text-ink-muted block mt-2 text-right">
              "pas buru-buru di kasir..."
            </span>
          </div>
        </div>

        {/* Cap Stempel Hasil di Tengah Menumpuk Kertas */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="stamp-box stamp-asli text-xl sm:text-2xl shadow-scrapbook bg-paper-card">
            <span>ASLI (92% MIRIP)</span>
            <span className="text-[9px] font-mono font-bold tracking-normal text-daun-dark mt-0.5">
              Jarak: 0.18 • Lolos batas
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
