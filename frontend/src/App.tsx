import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

gsap.registerPlugin(ScrollTrigger);

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const PeriksaPage = lazy(() => import('./pages/PeriksaPage').then((module) => ({ default: module.PeriksaPage })));
const PerformaPage = lazy(() => import('./pages/PerformaPage').then((module) => ({ default: module.PerformaPage })));
const TentangPage = lazy(() => import('./pages/TentangPage').then((module) => ({ default: module.TentangPage })));

function PageMotion() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let observer: MutationObserver | null = null;
    let tween: gsap.core.Tween | null = null;
    const animatePage = () => {
      const items = root.querySelectorAll<HTMLElement>('[data-desk-enter]');
      if (!items.length) return false;
      if (reducedMotion) {
        gsap.set(items, { clearProps: 'all' });
      } else {
        tween = gsap.fromTo(items, { y: -24, rotation: -1.5, autoAlpha: 0 }, {
          y: 0,
          rotation: 0,
          autoAlpha: 1,
          duration: 0.55,
          stagger: 0.07,
          ease: 'power2.out',
          clearProps: 'transform,opacity,visibility',
        });
      }
      return true;
    };
    if (!animatePage()) {
      observer = new MutationObserver(() => {
        if (animatePage()) observer?.disconnect();
      });
      observer.observe(root, { childList: true, subtree: true });
    }
    return () => {
      observer?.disconnect();
      tween?.kill();
    };
  }, [location.pathname]);

  return (
    <main ref={mainRef} className="flex-1">
      <Suspense fallback={<div className="page-loading" role="status">Membuka halaman...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/periksa" element={<PeriksaPage />} />
          <Route path="/performa" element={<PerformaPage />} />
          <Route path="/tentang" element={<TentangPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="site-shell min-h-screen flex flex-col">
        <Header />
        <PageMotion />
        <Footer />
      </div>
    </BrowserRouter>
  );
}
