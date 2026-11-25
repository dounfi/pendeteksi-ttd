import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { Logo } from "./Logo";

const links = [
  { label: "Beranda", hash: "beranda" },
  { label: "Tentang", hash: "tentang" },
  { label: "Cara Pakai", hash: "cara-pakai" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <nav
        aria-label="Navigasi utama"
        className={cn(
          "mx-auto max-w-6xl rounded-panel border border-slate-200/80 bg-white transition-shadow duration-150 shadow-xs",
          (scrolled || open) && "shadow-md",
        )}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:px-6">
          <Link to="/" hash="beranda" aria-label={`${BRAND.name}, ke Beranda`} className="min-w-0 justify-self-start">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.hash}>
                <Link
                  to="/"
                  hash={l.hash}
                  className="rounded-full px-4 py-2 text-[15px] font-bold text-[#1E65AB] hover:text-[#0C7AB5] transition-colors duration-150 hover:bg-slate-100"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 justify-self-end">
            <Link
              to="/periksa"
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#0C7AB5] hover:bg-[#0A6EA0] px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Cek Tanda Tangan
            </Link>

            <button
              type="button"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 text-[#1E65AB] hover:bg-slate-100 md:hidden cursor-pointer"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              aria-controls="menu-mobile"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div id="menu-mobile" className="px-4 pb-4 md:hidden">
            <ul className="flex flex-col gap-1 border-t border-slate-200 pt-3">
              {links.map((l) => (
                <li key={l.hash}>
                  <Link
                    to="/"
                    hash={l.hash}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 font-bold text-[#1E65AB] transition-colors duration-150 hover:bg-slate-100"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/periksa"
              onClick={() => setOpen(false)}
              className="mt-3 flex w-full items-center justify-center rounded-full bg-[#0C7AB5] hover:bg-[#0A6EA0] py-3 text-sm font-bold text-white shadow-xs transition-all"
            >
              Cek Tanda Tangan
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
