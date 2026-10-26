import React, { useState } from 'react';

export default function MultiReferenceSection() {
  const [selectedCount, setSelectedCount] = useState<1 | 3 | 5>(3);

  const scrollToAlat = () => {
    const el = document.getElementById('alat-periksa');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 px-4 max-w-5xl mx-auto border-t-2 border-dashed border-ink/20">
      <div className="text-center mb-10">
        <span className="sticker-label bg-daun text-paper-card -rotate-1 mb-2 text-xs">
          TRIK RAHASIA // MAKIN BANYAK MAKIN SAKTI
        </span>
        <h2 className="font-bricolage text-3xl sm:text-5xl font-black text-ink mb-3">
          Kenapa bawa 3 sampai 5 contoh asli bikin komputer makin pinter?
        </h2>
        <p className="font-instrument text-ink-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Satu tanda tangan cuma ngerekam suasana hati pas menit itu doang. Tapi kalau kamu setor 3 atau 5 contoh asli, komputer jadi paham rentang goresan alamimu! Coba klik tombol di bawah:
        </p>
      </div>

      {/* Simulator 1 vs 3 vs 5 Pembanding */}
      <div className="bg-paper-card border-2 border-ink shadow-scrapbook p-6 sm:p-8 max-w-3xl mx-auto mb-10 relative">
        <div className="washi-tape washi-tape-green"></div>

        {/* Pemilih Tab Jumlah Pembanding */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-8">
          {([1, 3, 5] as const).map((count) => (
            <button
              key={count}
              onClick={() => setSelectedCount(count)}
              className={`font-bricolage font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 border-2 border-ink shadow-scrapbook-sm transition-all rounded-full ${
                selectedCount === count
                  ? 'bg-ink text-paper-card -translate-y-0.5 shadow-scrapbook'
                  : 'bg-paper text-ink hover:bg-mustard-light'
              }`}
            >
              {count === 5 ? `⭐ ${count} Contoh (Terbaik)` : `${count} Contoh`}
            </button>
          ))}
        </div>

        {/* Visualisasi Kartu Pembanding */}
        <div className="bg-paper p-6 border-2 border-ink/30 rounded mb-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
            {Array.from({ length: selectedCount }).map((_, i) => (
              <div
                key={i}
                className="w-16 h-20 bg-paper-card border-2 border-ink shadow-scrapbook-sm flex flex-col items-center justify-between p-1.5 -rotate-1 hover:rotate-0 transition-transform"
              >
                <span className="text-[9px] font-mono font-bold text-ink-muted">Asli #{i + 1}</span>
                <span className="font-caveat text-sm text-ink">ttd kamu</span>
                <span className="w-2.5 h-2.5 rounded-full bg-daun border border-ink"></span>
              </div>
            ))}
            
            <div className="flex items-center text-bata font-bricolage font-black text-xl px-2">
              VS
            </div>

            <div className="w-16 h-20 bg-mustard-light border-2 border-ink shadow-scrapbook-sm flex flex-col items-center justify-between p-1.5 rotate-2 hover:rotate-0 transition-transform">
              <span className="text-[9px] font-mono font-bold text-bata uppercase">Uji</span>
              <span className="font-caveat text-sm text-ink">diperiksa</span>
              <span className="w-2.5 h-2.5 rounded-full bg-bata border border-ink"></span>
            </div>
          </div>

          <div className="bg-paper-card p-4 border border-ink/20 rounded max-w-lg mx-auto">
            <p className="font-instrument text-sm sm:text-base text-ink font-semibold">
              {selectedCount === 1 && "⚠️ 1 Contoh: Rawan panik! Kalau pas bikin contoh kamu lagi buru-buru, besoknya pas tanda tangan santai malah dituduh orang lain."}
              {selectedCount === 3 && "✨ 3 Contoh: Mantap! Komputer ngambil jarak rata-rata terbaik sehingga variasi goresan wajar langsung bisa dimaklumi."}
              {selectedCount === 5 && "🚀 5 Contoh: Level Detektif Master! Tingkat kesalahan (EER) terjun bebas ke 11.9%. Model punya gambaran utuh variasi tanganmu!"}
            </p>
          </div>
        </div>
      </div>

      {/* Tombol Ajak Coba Langsung ke Meja Uji */}
      <div className="text-center">
        <button
          onClick={scrollToAlat}
          className="bg-bata hover:bg-bata-dark text-paper-card font-bricolage font-extrabold text-base sm:text-lg px-8 py-3.5 border-2 border-ink shadow-scrapbook hover:shadow-scrapbook-lg active:translate-x-0.5 active:translate-y-0.5 transition-all -rotate-1 inline-flex items-center gap-2"
        >
          <span>Udah paham teorinya? Yuk coba di Meja Uji!</span>
          <span>✍️</span>
        </button>
      </div>
    </section>
  );
}
