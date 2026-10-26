import React from 'react';

export default function SiameseExplainerSection() {
  return (
    <section className="py-16 px-4 max-w-5xl mx-auto border-t-2 border-dashed border-ink/20">
      <div className="text-center mb-12">
        <span className="sticker-label bg-bata text-paper-card -rotate-1 mb-2 text-xs">
          CARA KERJA 02 // DETEKTIF KEMBAR
        </span>
        <h2 className="font-bricolage text-3xl sm:text-5xl font-black text-ink mb-3">
          Detektif kembar yang gak pernah ngafalin orang.
        </h2>
        <p className="font-instrument text-ink-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Gimana caranya komputer bisa ngenalin tanda tanganmu kalau dia belum pernah ngeliat kamu sama sekali saat latihan? Rahasianya: dia bukan ngafalin nama orang, tapi ngukur <b>DNA goresan</b> jadi 64 angka!
        </p>
      </div>

      {/* Visual Skematik Scrapbook: Dua Kertas -> Satu Mesin -> Peta 2 Titik */}
      <div className="bg-paper-card border-2 border-ink shadow-scrapbook p-6 sm:p-8 max-w-4xl mx-auto relative mb-8">
        <div className="washi-tape washi-tape-blue"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Sisi Kiri: 2 Kertas Masuk */}
          <div className="space-y-4">
            <div className="bg-paper p-3 border-2 border-ink shadow-scrapbook-sm -rotate-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-mono font-bold text-ink-muted uppercase">
                  Kertas A (Referensi)
                </span>
                <span className="text-xs">📜</span>
              </div>
              <div className="h-14 bg-paper-card border border-ink/20 flex items-center justify-center font-caveat text-xl text-ink">
                ~ ttd asli kamu ~
              </div>
            </div>

            <div className="bg-paper p-3 border-2 border-ink shadow-scrapbook-sm rotate-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-mono font-bold text-ink-muted uppercase">
                  Kertas B (Yang Diuji)
                </span>
                <span className="text-xs">🔍</span>
              </div>
              <div className="h-14 bg-paper-card border border-ink/20 flex items-center justify-center font-caveat text-xl text-ink">
                ~ ttd yang dicurigai ~
              </div>
            </div>
          </div>

          {/* Sisi Tengah: Mesin Siamese CNN */}
          <div className="text-center bg-mustard-light p-6 border-2 border-ink shadow-scrapbook-sm relative">
            <span className="font-mono text-xs font-bold text-ink-muted tracking-wider block mb-1 uppercase">
              JARINGAN KEMBAR IDENTIK
            </span>
            <div className="font-bricolage text-2xl font-black text-ink mb-2">
              Siamese CNN
            </div>
            <p className="font-instrument text-xs text-ink leading-relaxed mb-3">
              Keduanya diperiksa pake 'mata' dan aturan yang persis sama. Seluruh lekukan diubah jadi <b>64 deret angka</b> koordinat.
            </p>
            <div className="font-mono text-[10px] text-ink bg-paper px-2.5 py-1.5 border border-ink/30 rounded inline-block shadow-inner">
              [ 0.14, -0.72, 0.58, ... , 0.31 ]
            </div>
            <span className="font-caveat text-sm text-ink-muted block mt-2">
              *sidik jari digital tanda tangan
            </span>
          </div>

          {/* Sisi Kanan: Peta Titik & Jarak Garis */}
          <div className="bg-paper p-5 border-2 border-ink shadow-scrapbook-sm text-center">
            <span className="text-[11px] font-mono font-bold text-ink-muted block mb-2 uppercase">
              Peta Jarak Koordinat
            </span>
            <div className="h-28 bg-paper-card border-2 border-dashed border-ink/40 relative rounded flex items-center justify-center overflow-hidden">
              {/* Titik A */}
              <div className="absolute left-8 top-10 flex flex-col items-center">
                <span className="w-4 h-4 rounded-full bg-daun border-2 border-ink inline-block"></span>
                <span className="font-mono text-[10px] text-ink font-bold mt-0.5">Titik A</span>
              </div>

              {/* Garis Jarak */}
              <div className="border-b-2 border-dashed border-bata w-24 absolute top-[48px] left-12"></div>
              <span className="font-caveat text-sm text-bata font-bold absolute top-5 left-16 bg-paper px-1.5 border border-ink/20 rounded shadow-xs">
                jarak d
              </span>

              {/* Titik B */}
              <div className="absolute right-8 top-12 flex flex-col items-center">
                <span className="w-4 h-4 rounded-full bg-kobalt border-2 border-ink inline-block"></span>
                <span className="font-mono text-[10px] text-ink font-bold mt-0.5">Titik B</span>
              </div>
            </div>
            <div className="mt-3 bg-daun-light border border-daun/40 px-2 py-1 rounded">
              <span className="font-instrument text-xs text-daun-dark font-bold block">
                Titik deket (&lt; 0.48) = Asli!
              </span>
              <span className="font-instrument text-[11px] text-bata-dark font-medium block">
                Titik jauh (&ge; 0.48) = Palsu!
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <span className="font-caveat text-xl text-ink-muted">
          "Bukan sulap bukan sihir, cuma ngitung jarak di atas peta angka 64 dimensi!" 📐
        </span>
      </div>
    </section>
  );
}
