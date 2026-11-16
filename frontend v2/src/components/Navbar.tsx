import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="brand" aria-label="SignaCheck Beranda">
          <img
            src="/assets/icons/hugeicons_signature.svg"
            width={48}
            height={48}
            alt="Logo SignaCheck"
          />
          <span className="brand-name">SignaCheck</span>
        </Link>

        {/* Desktop nav menu */}
        <nav className="nav-menu">
          <a href="/#beranda">Beranda</a>
          <a href="/#tentang">Tentang</a>
          <a href="/#cara-pakai">Cara Pakai</a>
        </nav>

        {/* CTA button */}
        <Link to="/periksa" className="btn-nav">
          Cek Tanda Tangan
        </Link>

        {/* Hamburger (mobile only) */}
        <button
          type="button"
          id="hamburger-btn"
          className="hamburger"
          aria-label="Buka menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile dropdown */}
      <nav id="mobile-nav" className={`mobile-nav ${menuOpen ? "open" : ""}`}>
        <a href="/#beranda" onClick={() => setMenuOpen(false)}>
          Beranda
        </a>
        <a href="/#tentang" onClick={() => setMenuOpen(false)}>
          Tentang
        </a>
        <a href="/#cara-pakai" onClick={() => setMenuOpen(false)}>
          Cara Pakai
        </a>
      </nav>
    </header>
  );
}

