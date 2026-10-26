import React from 'react';
import sampleImages from '../data/sample_images.json';

export default function HumanVariationSection() {
  return (
    <section className="py-16 px-4 max-w-4xl mx-auto border-t-2 border-dashed border-ink/20">
      <div className="text-center mb-10">
        <span className="sticker-label bg-daun text-paper-card rotate-1 mb-2 text-xs">
          CERITA 02 // KEBIASAAN ALAMI KITA
        </span>
        <h2 className="font-bricolage text-3xl sm:text-4xl font-extrabold text-ink mb-3">
          Satu orang pun gak pernah tanda tangan 100% sama persis!
        </h2>
        <p className="font-instrument text-ink-muted text-base max-w-lg mx-auto">
          Lagi santai di rumah, buru-buru ngejar kereta, meja kasir goyang, atau pulpen mau habis—semua hal kecil itu bikin goresan tanganmu selalu punya variasi alami.
        </p>
      </div>

      {/* Tiga Kartu Variasi seperti Kartu Kertas Catatan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-10">
        <div className="bg-paper-card p-4 border-2 border-ink shadow-scrapbook relative -rotate-2 hover:rotate-0 transition-transform">
          <div className="flex items-center justify-between mb-2 border-b border-ink/20 pb-1.5">
            <span className="text-[10px] font-mono font-bold text-ink-muted">Contoh #1</span>
            <span className="text-[10px] font-bold text-daun bg-daun-light px-2 py-0.5 rounded-full border border-daun/30">Lagi Santai</span>
          </div>
          <div className="bg-paper p-2 border border-ink/20 h-24 flex items-center justify-center rounded">
            <img
              src={sampleImages["ttd_rajshree_1.png"]}
              alt="Variasi tanda tangan asli santai"
              className="max-h-16 object-contain"
            />
          </div>
          <span className="font-caveat text-base text-ink-muted block mt-2 text-center">
            tarikannya panjang dan lepas ~
          </span>
        </div>

        <div className="bg-paper-card p-4 border-2 border-ink shadow-scrapbook relative rotate-1 hover:rotate-0 transition-transform">
          <div className="flex items-center justify-between mb-2 border-b border-ink/20 pb-1.5">
            <span className="text-[10px] font-mono font-bold text-ink-muted">Contoh #2</span>
            <span className="text-[10px] font-bold text-mustard-dark bg-mustard-light px-2 py-0.5 rounded-full border border-mustard/30">Kasir Toko</span>
          </div>
          <div className="bg-paper p-2 border border-ink/20 h-24 flex items-center justify-center rounded">
            <img
              src={sampleImages["ttd_rajshree_2.png"]}
              alt="Variasi tanda tangan kedua"
              className="max-h-16 object-contain"
            />
          </div>
          <span className="font-caveat text-base text-ink-muted block mt-2 text-center">
            layar licin, ekor agak kepotong dikit
          </span>
        </div>

        <div className="bg-paper-card p-4 border-2 border-ink shadow-scrapbook relative -rotate-1 hover:rotate-0 transition-transform">
          <div className="flex items-center justify-between mb-2 border-b border-ink/20 pb-1.5">
            <span className="text-[10px] font-mono font-bold text-ink-muted">Contoh #3</span>
            <span className="text-[10px] font-bold text-bata bg-bata-light px-2 py-0.5 rounded-full border border-bata/30">Ngejar Dosen</span>
          </div>
          <div className="bg-paper p-2 border border-ink/20 h-24 flex items-center justify-center rounded">
            <img
              src={sampleImages["ttd_miring_1.png"]}
              alt="Variasi tanda tangan ketiga"
              className="max-h-16 object-contain"
            />
          </div>
          <span className="font-caveat text-base text-ink-muted block mt-2 text-center">
            sudutnya naik sekitar 4 derajat!
          </span>
        </div>
      </div>

      {/* Papan Catatan Kuning Binder (Terinspirasi IKEA Infographic Clipboard) */}
      <div className="clipboard-holder p-6 sm:p-8 max-w-2xl mx-auto relative text-center">
        <div className="clipboard-clamp"></div>
        <div className="pt-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted block mb-1">
            ✦ CATATAN PENTING DETEKTIF ✦
          </span>
          <h3 className="font-bricolage text-xl sm:text-2xl font-extrabold text-ink mb-3">
            Makanya, sistem gak boleh nyari "kembaran persis", tapi seberapa dekat.
          </h3>
          <p className="font-instrument text-ink text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Fakta menariknya: kalau ada dua tanda tangan yang pas ditumpuk 100% sama plek sampai ke mikron-mikronnya, polisi forensik justru curiga itu hasil jiplak kertas karbon atau hasil copas digital!
          </p>
        </div>
      </div>
    </section>
  );
}
