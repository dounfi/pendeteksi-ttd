import { ArrowDown, ArrowRight, ClipboardCheck, Cpu, FileSearch, FileUp, type LucideIcon } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { BRAND } from "@/lib/brand";

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: FileUp, title: "Unggah Foto", body: "Unggah foto tanda tangan asli dan tanda tangan yang ingin diperiksa." },
  { icon: Cpu, title: "Foto Dirapikan", body: "Sistem merapikan foto agar goresan terlihat jelas." },
  { icon: FileSearch, title: "Dibandingkan", body: "Bentuk dan pola goresan kedua tanda tangan dibandingkan." },
  { icon: ClipboardCheck, title: "Lihat Hasilnya", body: "Hasil muncul sebagai Asli, Belum Yakin, atau Palsu beserta penjelasannya." },
];

const faqs = [
  {
    q: "Apakah hasilnya bisa dipakai sebagai bukti hukum?",
    a: `Tidak. Hasil ${BRAND.name} hanya petunjuk awal untuk membantu pemeriksaan. Untuk keperluan resmi, tanda tangan tetap perlu diperiksa oleh ahli.`,
  },
  {
    q: "Berapa foto tanda tangan asli yang dibutuhkan?",
    a: "Minimal satu dan maksimal lima foto tanda tangan asli dari orang yang sama.",
  },
  {
    q: "Apa arti status Belum Yakin?",
    a: "Artinya, sistem belum dapat memutuskan dengan yakin. Hal ini terjadi jika tanda tangan berada di antara mirip dan berbeda, atau hasilnya berubah-ubah saat Uji Goyang. Sebaiknya tanda tangan diperiksa lebih lanjut oleh orang yang berwenang.",
  },
];

export function HowTo() {
  return (
    <section id="cara-pakai" aria-labelledby="cara-pakai-title" className="section-y relative overflow-hidden bg-white">
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            number="03"
            label="CARA PAKAI"
            title={`Cara Pakai ${BRAND.name}`}
            id="cara-pakai-title"
          />
        </Reveal>

        <ol className="mt-12 grid gap-10 lg:grid-cols-4 lg:gap-12">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <Reveal as="li" key={title} delay={i * 80} className="relative">
              <article className="card-soft relative flex h-full flex-col items-center gap-4 p-6 text-center rounded-2xl border border-slate-200 bg-surface-50 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-[#1E65AB]/40 group cursor-default">
                <span className="absolute left-4 top-4 grid h-7 min-w-7 place-items-center rounded-full bg-[#1E65AB] px-2 text-xs font-bold text-white transition-colors group-hover:bg-[#0C7AB5]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-4 grid h-20 w-20 place-items-center rounded-2xl bg-[#0C7AB5] shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-[#0A6EA0] group-hover:shadow-md">
                  <Icon className="h-10 w-10 text-white" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-extrabold text-[#010211] transition-colors group-hover:text-[#1E65AB]">{title}</h3>
                <p className="text-sm text-body leading-relaxed">{body}</p>
              </article>

              {i < steps.length - 1 && (
                <>
                  {/* desktop connector */}
                  <span
                    aria-hidden="true"
                    className="absolute left-full top-1/2 hidden w-12 -translate-y-1/2 items-center lg:flex"
                  >
                    <span className="dashed-line h-0.5 flex-1" />
                    <ArrowRight className="-ml-1 h-4 w-4 text-[#0C7AB5]" />
                  </span>
                  {/* mobile connector */}
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-full flex h-10 -translate-x-1/2 flex-col items-center lg:hidden"
                  >
                    <span className="dashed-line-y w-0.5 flex-1" />
                    <ArrowDown className="-mt-1 h-4 w-4 text-[#0C7AB5]" />
                  </span>
                </>
              )}
            </Reveal>
          ))}
        </ol>

        <Reveal delay={200} className="mx-auto mt-16 max-w-3xl md:mt-20">
          <h3 className="text-center text-2xl sm:text-3xl font-extrabold text-[#010211] tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h3>
          <Accordion type="single" collapsible className="mt-6 flex flex-col gap-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`faq-${i}`}
                className="card-soft px-5 sm:px-6 rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:border-[#1E65AB]/40 hover:shadow-xs"
              >
                <AccordionTrigger className="py-5 text-base font-bold text-[#010211] hover:no-underline [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-[#1E65AB] transition-colors hover:text-[#1E65AB]">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-base text-body leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
