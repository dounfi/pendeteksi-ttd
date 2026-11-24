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
              label="Keunggulan"
              title={`Keunggulan ${BRAND.name}`}
              id="keunggulan-title"
              eyebrowClassName="text-primary-700"
            />
          </Reveal>

          <ul className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
            {features.map(({ icon: Icon, title, body }, i) => (
              <Reveal as="li" key={title} delay={i * 60}>
                <article className="card lift flex h-full gap-4 p-6 sm:gap-5 sm:p-7">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-200">
                    <Icon className="h-6 w-6 text-primary-700" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xl">{title}</h3>
                    <p className="mt-2 text-body">{body}</p>
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
