import React from 'react';

export default function ForgeryTypesSection() {
  return (
    <section id="edukasi" className="py-16 px-4 max-w-4xl mx-auto border-t-2 border-dashed border-ink/20">
      <div className="text-center mb-10">
        <span className="sticker-label bg-mustard text-ink -rotate-1 mb-2 text-xs">
          CERITA 01 // DI BALIK KERTAS
        </span>
        <h2 className="font-bricolage text-3xl sm:text-4xl font-extrabold text-ink mb-3">
          Kenapa tanda tangan bisa dipalsukan?
        </h2>
        <p className="font-instrument text-ink-muted text-base max-w-lg mx-auto">
          Tangan manusia itu unik, tapi niat usil orang juga banyak ragamnya. Di dunia nyata, biasanya ada dua kasta pemalsu yang sering kita temuin:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Kartu 1: Tiruan Asal-Asalan */}
        <div className="bg-paper-card p-6 border-2 border-ink shadow-scrapbook relative -rotate-1 hover:rotate-0 transition-transform">
          <div className="washi-tape washi-tape-yellow"></div>
          
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-full bg-kobalt text-paper-card font-bricolage font-bold flex items-center justify-center text-sm border-2 border-ink shadow-scrapbook-sm">
              01
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-ink-muted block">Kasta Santai</span>
              <h3 className="font-bricolage text-lg font-bold text-ink">
                Tiruan Asal-Asalan
              </h3>
            </div>
          </div>

          <p className="font-instrument text-ink text-sm leading-relaxed mb-4">
            Temen kamu nemu presensi kuliahmu kosong, terus dia gores ngasal pake gayanya sendiri tanpa pernah tau gimana bentuk tanda tangan aslimu.
          </p>

          <div className="bg-daun-light border-2 border-dashed border-daun/50 p-3 rounded-sm text-left">
            <span className="font-instrument font-bold text-daun text-xs block mb-0.5">
              Tingkat kesulitan komputer:
            </span>
            <span className="font-instrument text-xs text-daun-dark leading-relaxed">
              Gampang banget! Sekali lirik bentuk dasarnya aja udah beda alam semesta. Komputer langsung nolak dalam sepersekian detik.
            </span>
          </div>
        </div>

        {/* Kartu 2: Tiruan Niat Banget */}
        <div className="bg-paper-card p-6 border-2 border-ink shadow-scrapbook relative rotate-1 hover:rotate-0 transition-transform">
          <div className="washi-tape washi-tape-red"></div>

          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-full bg-bata text-paper-card font-bricolage font-bold flex items-center justify-center text-sm border-2 border-ink shadow-scrapbook-sm">
              02
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-ink-muted block">Kasta Niat</span>
              <h3 className="font-bricolage text-lg font-bold text-ink">
                Tiruan Terampil (Niat Banget!)
              </h3>
            </div>
          </div>

          <p className="font-instrument text-ink text-sm leading-relaxed mb-4">
            Pelaku naruh tanda tanganmu di bawah lampu meja, terus latihan berkali-kali di kertas buram buat niru lengkungan dan ekor garisnya semirip mungkin.
          </p>

          <div className="bg-bata-light border-2 border-dashed border-bata/50 p-3 rounded-sm text-left">
            <span className="font-instrument font-bold text-bata text-xs block mb-0.5">
              Tingkat kesulitan komputer:
            </span>
            <span className="font-instrument text-xs text-bata-dark leading-relaxed">
              Nah ini lawan seimbang! Mata manusia sering terkecoh. Komputer harus ngecek tekanan garis mikro, kerapatan piksel, dan rasio lekukan.
            </span>
          </div>
        </div>
      </div>

      {/* Satu kalimat penutup */}
      <div className="text-center max-w-md mx-auto bg-mustard-light border-2 border-ink p-3.5 shadow-scrapbook-sm -rotate-0.5">
        <p className="font-bricolage text-ink font-bold text-sm sm:text-base">
          Yang nomor dua ini nih yang bikin detektif forensik pusing! 🕵️‍♂️
        </p>
      </div>
    </section>
  );
}
