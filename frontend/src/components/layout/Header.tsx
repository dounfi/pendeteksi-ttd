import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { label: 'Beranda', to: '/' },
  { label: 'Periksa', to: '/periksa' },
  { label: 'Performa', to: '/performa' },
  { label: 'Tentang', to: '/tentang' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/70 shadow-sm transition-all">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Wordmark Logo */}
        <Link to="/" className="flex items-center gap-2 group text-decoration-none" onClick={() => setMenuOpen(false)}>
          <span className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-base shadow-sm group-hover:scale-105 transition-transform">
            S
          </span>
          <span className="font-extrabold text-xl tracking-tight text-[#0F172A]">
            Signa<span className="text-[#EA580C]">Check</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/50" aria-label="Navigasi utama">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/periksa"
            className="inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-bold bg-[#FFC837] hover:bg-[#FFB703] text-[#0F172A] shadow-sm hover:shadow transition-all active:scale-95"
          >
            Langsung cek
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden w-10 h-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-1.5 text-slate-700 hover:bg-slate-200 transition-colors"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={`w-5 h-0.5 bg-slate-800 rounded transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-5 h-0.5 bg-slate-800 rounded transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-slate-800 rounded transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile navigation panel */}
      {menuOpen && (
        <nav id="mobile-navigation" className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 shadow-lg" aria-label="Navigasi seluler">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                  isActive ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-2">
            <Link
              to="/periksa"
              className="block w-full text-center py-3 rounded-xl font-bold bg-[#FFC837] text-[#0F172A] shadow-sm"
              onClick={() => setMenuOpen(false)}
            >
              Langsung cek
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
