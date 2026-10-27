import React from 'react';
import { ScanLine, ChevronDown } from 'lucide-react';

export default function FloatingCobaButton() {
  const scrollToAlat = () => {
    const el = document.getElementById('alat-periksa');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={scrollToAlat}
        className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-cyan-500/40 hover:border-cyan-400 shadow-glow-cyan backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer text-sm font-medium"
        aria-label="Loncat langsung ke meja uji verifikasi tanda tangan"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <ScanLine className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
        <span className="font-semibold tracking-wide text-xs uppercase text-slate-200">Meja Uji Verifikasi</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}
