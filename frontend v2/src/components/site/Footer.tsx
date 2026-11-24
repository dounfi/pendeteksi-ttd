import { Logo } from "./Logo";
import { Wave } from "./Wave";
import { BRAND } from "@/lib/brand";

const team = ["Nur'Afia Avanza", "Zaskia Alyssa Putri", "Adzkia Nifa Adha"];

export function Footer() {
  return (
    <footer className="relative">
      <Wave className="fill-primary-700" />
      <div className="bg-primary-700 text-on-brand">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-8 md:pt-12">
          <div className="grid gap-10 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-12">
            <div className="grid h-24 w-44 place-items-center rounded-card bg-background">
              <Logo />
            </div>

            <div className="max-w-md">
              <p className="font-semibold leading-snug">
                {BRAND.name}, {BRAND.expansion}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-on-brand/90">
                Hasil {BRAND.name} hanya petunjuk awal untuk membantu pemeriksaan. Keputusan akhir
                tentang asli atau tidaknya sebuah tanda tangan tetap memerlukan pertimbangan lebih
                lanjut.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-on-brand">Tim Pengembang</h2>
              <ul className="mt-3 space-y-1.5 text-[15px] text-on-brand/90">
                {team.map((n) => (
                  <li key={n} className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary-200" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-on-brand/25 pt-6 text-sm text-on-brand/90 md:text-right">
            © 2026 {BRAND.name}. Dikembangkan sebagai proyek pengenalan gambar dengan komputer.
          </div>
        </div>
      </div>
    </footer>
  );
}
