import React from 'react';

export default function FloatingCobaButton() {
  const scrollToAlat = () => {
    const el = document.getElementById('alat-periksa');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={scrollToAlat}
        className="bg-bata hover:bg-bata-dark text-paper-card font-bricolage font-black text-sm sm:text-base px-6 py-3.5 border-3 border-ink shadow-scrapbook-lg hover:shadow-scrapbook active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 -rotate-2 hover:rotate-0 rounded-full group cursor-pointer"
        aria-label="Loncat langsung ke meja uji tanda tangan"
      >
        <span className="group-hover:scale-125 transition-transform">✍️</span>
        <span>Meja Uji Coba</span>
        <span className="font-mono font-bold">↓</span>
      </button>
    </div>
  );
}
