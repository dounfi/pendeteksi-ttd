import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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
          "mx-auto max-w-6xl rounded-panel border border-surface-200 bg-background transition-shadow duration-150",
          (scrolled || open) && "shadow-nav",
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
                  className="rounded-full px-4 py-2 text-[15px] font-semibold text-primary-700 transition-colors duration-150 hover:bg-surface-100"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 justify-self-end">
            <Button asChild variant="brand" size="pill" className="hidden sm:inline-flex">
              <Link
                to="/periksa"
                activeProps={{ className: "bg-primary-700 ring-4 ring-primary-200" }}
              >
                Cek Tanda Tangan
              </Link>
            </Button>
            <Button
              variant="outline-brand"
              size="icon"
              className="h-10 w-10 md:hidden"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              aria-controls="menu-mobile"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {open && (
          <div id="menu-mobile" className="px-4 pb-4 md:hidden">
            <ul className="flex flex-col gap-1 border-t border-surface-200 pt-3">
              {links.map((l) => (
                <li key={l.hash}>
                  <Link
                    to="/"
                    hash={l.hash}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 font-semibold text-primary-700 transition-colors duration-150 hover:bg-surface-100"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Button asChild variant="brand" size="pill-lg" className="mt-3 w-full">
              <Link
                to="/periksa"
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-primary-700 ring-4 ring-primary-200" }}
              >
                Cek Tanda Tangan
              </Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
