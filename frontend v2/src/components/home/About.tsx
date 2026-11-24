import { Link } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ResultChips, ResultPreview } from "@/components/home/ResultPreview";
import { BRAND } from "@/lib/brand";

export function About() {
  return (
    <section id="tentang" aria-labelledby="tentang-title" className="section-y relative">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading number="01" label="Tentang" title={`Tentang ${BRAND.name}`} id="tentang-title" />
        </Reveal>

        <div className="mt-8 flex flex-col lg:mt-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-10">
          {/* Preview of what a result looks like */}
          <Reveal className="lg:col-span-7 lg:col-start-6 lg:row-start-1">
            <div className="relative overflow-hidden rounded-card bg-primary-200 p-4 sm:p-6">
              <ResultPreview />
            </div>
          </Reveal>

          <Reveal
            delay={80}
            className="relative z-10 mx-3 mt-8 lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:mx-0 lg:mt-0"
          >
            <article className="rounded-card bg-tentang-card p-6 sm:p-8 lg:p-10">
              <h3 className="text-2xl sm:text-3xl">Memeriksa Tanda Tangan dengan Bantuan Komputer</h3>
              <p className="mt-5 text-heading/90">
                {BRAND.name} adalah alat bantu untuk memeriksa apakah sebuah tanda tangan mirip
                dengan tanda tangan aslinya. Anda cukup mengunggah fotonya, lalu sistem akan
                membandingkan bentuk dan pola goresan keduanya.
              </p>
              <p className="mt-4 text-heading/90">
                Sistem ini sudah belajar dari banyak contoh tanda tangan asli dan palsu. Selain
                menilai kemiripan, {BRAND.name} juga membandingkan ciri bentuknya, misalnya luas dan
                kerapatan goresan. Jika hasilnya belum cukup jelas, sistem akan menyampaikan bahwa
                hasilnya Belum Yakin, sehingga Anda tahu kapan perlu pemeriksaan lebih lanjut.
              </p>
              <Button asChild variant="outline-brand" size="pill-lg" className="mt-7">
                <Link to="/" hash="cara-pakai">
                  Lihat Cara Pakai <ArrowDown />
                </Link>
              </Button>
            </article>
          </Reveal>
        </div>

        <Reveal delay={120} className="mt-10">
          <ResultChips />
        </Reveal>
      </div>
    </section>
  );
}
