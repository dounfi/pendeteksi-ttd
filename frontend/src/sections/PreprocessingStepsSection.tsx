import React from 'react';

const TAHAPAN = [
  {
    nomor: "01",
    judul: "Foto Masuk (Grayscale)",
    penjelasan: "Foto diubah jadi hitam-putih dulu. Komputer gak peduli kertasmu warna pink atau biru, yang penting kontrasnya.",
    badge: "Input Awal",
    icon: "📷"
  },
  {
    nomor: "02",
    judul: "Hapus Bayangan Gelap",
    penjelasan: "Pencahayaan diratain. Bayangan jempol atau sudut kamar yang remang-remang langsung disapu bersih!",
    badge: "Koreksi Cahaya",
    icon: "💡"
  },
  {
    nomor: "03",
    judul: "Pisahin Tinta (Otsu)",
    penjelasan: "Goresan tinta dipisah tegas dari serat kertas. Gak ada abu-abu: cuma hitam (tinta) dan putih (kertas).",
    badge: "Otsu Binarization",
    icon: "✒️"
  },
  {
    nomor: "04",
    judul: "Sapu Debu & Potong Pas",
    penjelasan: "Bintik debu scan dibuang, lalu area tanda tangan dipotong pas di tepiannya biar fokus ke goresan.",
    badge: "Clean & Crop",
    icon: "✂️"
  },
  {
    nomor: "05",
    judul: "Kanvas Baku 128×256",
    penjelasan: "Tanda tangan ditaruh pas di tengah kanvas standar 128×256 piksel tanpa merusak proporsi aslinya.",
    badge: "Standarisasi",
    icon: "📐"
  }
];

export default function PreprocessingStepsSection() {
  return (
    <section id="cara-kerja" className="py-16 px-4 max-w-5xl mx-auto border-t-2 border-dashed border-ink/20">
      <div className="text-center mb-12">
        <span className="sticker-label bg-kobalt text-paper-card -rotate-1 mb-2 text-xs">
          CARA KERJA 01 // SALON TANDA TANGAN
        </span>
        <h2 className="font-bricolage text-3xl sm:text-5xl font-black text-ink mb-3">
          Cuci muka dulu! Biar komputer gak salah fokus.
        </h2>
        <p className="font-instrument text-ink-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Foto dari kamera HP itu jujur sering 'kacau': ada bayangan jempol, kertas menguning, sampe debu meja. Kalau langsung dimasukin ke model, dia bakal pusing bedain mana bayangan mana tanda tangan! Makanya kita mandiin dulu lewat 5 langkah kilat:
        </p>
      </div>

      {/* Alur 5 Tahap Menu Berbaris (Gaya Kartu Menu / Resep Komik) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {TAHAPAN.map((t, idx) => (
          <div
            key={idx}
            className={`bg-paper-card p-4 border-2 border-ink shadow-scrapbook flex flex-col justify-between relative ${
              idx % 2 === 0 ? '-rotate-1' : 'rotate-1'
            } hover:rotate-0 hover:-translate-y-1 transition-all`}
          >
            <div>
              {/* Header Kartu */}
              <div className="flex items-center justify-between mb-3 border-b-2 border-dashed border-ink/15 pb-2">
                <span className="w-8 h-8 rounded-full bg-ink text-paper-card font-bricolage font-extrabold text-xs flex items-center justify-center border border-ink shadow-scrapbook-sm">
                  {t.nomor}
                </span>
                <span className="text-xl">{t.icon}</span>
              </div>
              
              <span className="text-[10px] font-mono font-bold uppercase text-bata bg-bata-light px-1.5 py-0.5 rounded border border-bata/30 inline-block mb-1.5">
                {t.badge}
              </span>
              
              <h3 className="font-bricolage text-base font-bold text-ink mb-2 leading-snug">
                {t.judul}
              </h3>
              
              <p className="font-instrument text-xs text-ink-muted leading-relaxed">
                {t.penjelasan}
              </p>
            </div>

            <div className="mt-4 pt-2 border-t border-dashed border-ink/15 text-right">
              <span className="font-caveat text-sm text-ink-muted">tahap #{idx + 1}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Box Catatan Penting dengan Washi Tape */}
      <div className="bg-mustard-light border-2 border-ink p-5 rounded-sm max-w-2xl mx-auto shadow-scrapbook relative">
        <div className="washi-tape washi-tape-yellow"></div>
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">💡</span>
          <div>
            <h4 className="font-bricolage text-base font-bold text-ink mb-1">
              Kenapa tahap ini penyelamat hidup?
            </h4>
            <p className="font-instrument text-sm text-ink leading-relaxed">
              Di pengujian kami, foto kamera HP yang <b>tanpa olah citra</b> akurasinya anjlok ke <b>50.0%</b> (alias nebak koin doang!). Tapi begitu dicuci muka lewat alur ini, akurasinya langsung melonjak jadi <b>81.7%</b>. Terbukti banget pengolahan citra itu pahlawan di balik layar!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
