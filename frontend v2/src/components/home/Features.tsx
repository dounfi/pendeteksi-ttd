import { Brain, Camera, Files, TriangleAlert, type LucideIcon } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Wave } from "@/components/site/Wave";
import { BRAND } from "@/lib/brand";

const features: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Brain,
    title: "Foto Dirapikan Lebih Dulu",
    body: "Sebelum dibandingkan, foto tanda tangan dirapikan terlebih dahulu: bayangan dikurangi, goresan dibuat lebih jelas, dan posisinya diluruskan. Jadi, foto yang kurang bagus tetap bisa diperiksa.",
  },
  {
    icon: TriangleAlert,
    title: "Jujur Saat Belum Yakin",
    body: "Sistem mengubah foto sedikit demi sedikit, lalu melihat apakah hasilnya tetap sama. Pengecekan ini disebut Uji Goyang. Jika hasilnya berubah-ubah, statusnya menjadi Belum Yakin.",
  },
  {
    icon: Camera,
    title: "Bisa Memakai 1 sampai 5 Contoh Asli",
    body: "Anda dapat mengunggah satu sampai lima tanda tangan asli sebagai contoh. Dengan begitu, perbedaan kecil yang wajar setiap kali seseorang menandatangani ikut diperhitungkan.",
  },
  {
    icon: Files,
    title: "Penjelasan yang Mudah Dibaca",
    body: "Hasil pemeriksaan dilengkapi perbandingan ciri bentuk tanda tangan, sehingga Anda dapat melihat alasan di balik hasilnya.",
  },
];

export function Features() {
  return (
    <section id="keunggulan" aria-labelledby="keunggulan-title" className="relative">
      <Wave className="fill-surface-100" />
      <div className="relative overflow-hidden bg-surface-100">
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-16">
          <Reveal>
            <SectionHeading
              number="02"
              label="KEUNGGULAN"
              title={`Keunggulan ${BRAND.name}`}
              id="keunggulan-title"
            />
          </Reveal>

          <ul className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
            {features.map(({ icon: Icon, title, body }, i) => (
              <Reveal as="li" key={title} delay={i * 80}>
                <article className="card flex h-full gap-4 p-6 sm:gap-5 sm:p-7 rounded-2xl border border-surface-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-[#1E65AB]/40 group cursor-default">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-200/80 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary-300">
                    <Icon className="h-6 w-6 text-[#1E65AB] transition-colors group-hover:text-[#0C7AB5]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold text-[#010211] transition-colors group-hover:text-[#1E65AB]">{title}</h3>
                    <p className="mt-2 text-body leading-relaxed">{body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
      <Wave flip className="fill-surface-100" />
    </section>
  );
}
