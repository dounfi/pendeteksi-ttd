import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Wave } from "@/components/site/Wave";
import { Reveal } from "@/components/site/Reveal";
import { BRAND } from "@/lib/brand";

export function Hero() {
  return (
    <section
      id="beranda"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-primary-200 pt-32 sm:pt-36"
    >
      <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-8">
        {/* SIDIKTA latar putih bersih */}
        <Reveal>
          <span className="inline-flex items-center rounded-full border border-primary-300/80 bg-white px-5 py-2 text-sm font-semibold text-[#0B2545] shadow-xs cursor-default">
            {BRAND.name} — {BRAND.expansion}
          </span>
        </Reveal>

        {/* Periksa Kemiripan Tanda Tangan BOLD HITAM, dengan Kecerdasan Buatan. BOLD BIRU GELAP */}
        <Reveal delay={80}>
          <h1 id="hero-title" className="text-display mx-auto mt-6">
            <span className="block font-extrabold text-[#010211] lg:whitespace-nowrap">
              Periksa Kemiripan Tanda Tangan
            </span>
            <span className="block font-extrabold text-[#1E65AB] lg:whitespace-nowrap mt-1">
              dengan Kecerdasan Buatan.
            </span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-[42rem] text-balance text-base sm:text-lg text-body leading-relaxed">
            {BRAND.description}
          </p>
        </Reveal>

        {/* Tombol CTA: Coba SIDIKTA & Cara Pakai (tulisan biru) */}
        <Reveal delay={240}>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/periksa"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0C7AB5] hover:bg-[#0A6EA0] px-8 py-4 text-base sm:text-lg font-bold text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              Coba {BRAND.name} <ArrowRight className="h-5 w-5 ml-1" />
            </Link>
            <Link
              to="/"
              hash="cara-pakai"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-50 px-8 py-4 text-base sm:text-lg font-bold text-[#1E65AB] hover:text-[#0C7AB5] border border-slate-200 shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              Cara Pakai
            </Link>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-body/90">
            Hasilnya berupa petunjuk awal, bukan bukti hukum.
          </p>
        </Reveal>
      </div>

      <Wave className="relative mt-10 fill-white md:mt-14" />
    </section>
  );
}
