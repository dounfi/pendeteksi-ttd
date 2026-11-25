import { Link } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { ResultChips, ResultPreview } from "@/components/home/ResultPreview";
import { BRAND } from "@/lib/brand";

export function About() {
  return (
    <section id="tentang" aria-labelledby="tentang-title" className="section-y relative bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Header Tentang */}
        <Reveal>
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1E65AB]">
              <span aria-hidden="true" className="h-0.5 w-7 bg-[#1E65AB]" />
              01 / TENTANG
            </p>
            <h2 id="tentang-title" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#010211] tracking-tight">
              Tentang {BRAND.name}
            </h2>
          </div>
        </Reveal>

        {/* Grid 2 Kolom: lg:items-center agar kolom kanan pas berada di tengah vertikal seimbang dengan kolom kiri */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-12 lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Kolom Kiri: Penjelasan */}
          <Reveal delay={60} className="flex h-full">
            <article className="flex h-full flex-col justify-between rounded-3xl bg-[#9ECDE0] p-7 sm:p-9 lg:p-10 shadow-xs transition-all duration-300 hover:shadow-md">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] leading-tight">
                  Memeriksa Tanda Tangan dengan Bantuan Komputer
                </h3>
                <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#0B2545]/90">
                  {BRAND.name} adalah alat bantu untuk memeriksa apakah sebuah tanda tangan mirip
                  dengan tanda tangan aslinya. Anda cukup mengunggah fotonya, lalu sistem akan
                  membandingkan bentuk dan pola goresan keduanya.
                </p>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#0B2545]/85">
                  Sistem ini sudah belajar dari banyak contoh tanda tangan asli dan palsu. Selain
                  menilai kemiripan, {BRAND.name} juga membandingkan ciri bentuknya, misalnya luas dan
                  kerapatan goresan. Jika hasilnya belum cukup jelas, sistem akan menyampaikan bahwa
                  hasilnya Belum Yakin, sehingga Anda tahu kapan perlu pemeriksaan lebih lanjut.
                </p>
              </div>

              {/* Tombol Lihat Cara Pakai: Dibesarkan dan tulisan biru tua */}
              <div className="mt-8 sm:mt-10">
                <Link
                  to="/"
                  hash="cara-pakai"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-slate-50 px-8 py-4 sm:px-9 sm:py-4.5 text-base sm:text-lg font-bold text-[#1E65AB] hover:text-[#0C7AB5] shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer w-fit"
                >
                  Lihat Cara Pakai <ArrowDown className="h-5 w-5 ml-1" />
                </Link>
              </div>
            </article>
          </Reveal>

          {/* Kolom Kanan: Berada tepat di tengah vertikal seimbang (tidak terlalu ke atas dan bawah tidak kosong) */}
          <Reveal delay={120} className="flex flex-col justify-center my-auto">
            {/* Pratinjau Contoh Asli & Diperiksa tanpa pembungkus kotak warna */}
            <ResultPreview />
            {/* 3 Info Cards kreatif dan interaktif */}
            <ResultChips />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
