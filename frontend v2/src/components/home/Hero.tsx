import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
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
        <Reveal>
          <span className="inline-flex items-center rounded-full border border-primary-300 bg-background px-4 py-1.5 text-sm font-medium text-heading">
            {BRAND.name} — {BRAND.expansion}
          </span>
        </Reveal>

        <Reveal delay={60}>
          <h1 id="hero-title" className="text-display mx-auto mt-6">
            <span className="block text-heading lg:whitespace-nowrap">Periksa Kemiripan Tanda Tangan</span>
            <span className="block text-primary-700">dengan Kecerdasan Buatan.</span>
          </h1>
        </Reveal>

        <Reveal delay={120}>
          <p className="mx-auto mt-6 max-w-[40rem] text-balance text-body">
            {BRAND.description}
          </p>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="brand" size="pill-lg" className="w-full sm:w-auto">
              <Link to="/periksa">
                Coba {BRAND.name} <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline-brand" size="pill-lg" className="w-full sm:w-auto">
              <Link to="/" hash="cara-pakai">
                Cara Pakai
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-body">Hasilnya berupa petunjuk awal, bukan bukti hukum.</p>
        </Reveal>
      </div>

      <Wave className="relative mt-10 fill-background md:mt-14" />
    </section>
  );
}
