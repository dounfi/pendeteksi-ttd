import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import HeroSection from './sections/HeroSection';
import ForgeryTypesSection from './sections/ForgeryTypesSection';
import HumanVariationSection from './sections/HumanVariationSection';
import PreprocessingStepsSection from './sections/PreprocessingStepsSection';
import SiameseExplainerSection from './sections/SiameseExplainerSection';
import ThresholdPlaygroundSection from './sections/ThresholdPlaygroundSection';
import MultiReferenceSection from './sections/MultiReferenceSection';
import InspectionToolSection from './sections/InspectionToolSection';
import LimitsBenchmarkSection from './sections/LimitsBenchmarkSection';
import FloatingCobaButton from './sections/FloatingCobaButton';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    // Hormati prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Animasi muncul perlahan pada bagian edukasi
    const sections = document.querySelectorAll('section');
    sections.forEach((sec) => {
      gsap.fromTo(
        sec,
        { opacity: 0.88, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink font-instrument">
      {/* Tombol Melayang di Pojok */}
      <FloatingCobaButton />

      <main>
        {/* BAGIAN A: LANDING EDUKASI (Scrollytelling) */}
        <HeroSection />
        <ForgeryTypesSection />
        <HumanVariationSection />
        <PreprocessingStepsSection />
        <SiameseExplainerSection />
        <ThresholdPlaygroundSection />
        <MultiReferenceSection />

        {/* BAGIAN B: ALAT PERIKSA TANDA TANGAN */}
        <InspectionToolSection />

        {/* BAGIAN C: PERFORMA DAN BATAS MODEL (JUJUR) */}
        <LimitsBenchmarkSection />
      </main>
    </div>
  );
}
