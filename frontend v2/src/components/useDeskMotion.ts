import { useEffect, type RefObject } from "react";

export function useDeskMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    let ctx: { revert: () => void } | undefined;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-scene]").forEach((scene) => {
          const items = scene.querySelectorAll("[data-drop]");
          gsap.from(items, {
            y: -24, opacity: 0, rotation: "+=2", duration: 0.6, ease: "power2.out", stagger: 0.12,
            scrollTrigger: { trigger: scene, start: "top 80%", once: true },
          });
          const stamps = scene.querySelectorAll("[data-stamp]");
          if (stamps.length)
            gsap.timeline({ scrollTrigger: { trigger: scene, start: "top 70%", once: true } })
              .from(stamps, { scale: 1.6, opacity: 0, duration: 0.3, ease: "power3.in", stagger: 0.15 })
              .to(stamps, { x: 3, duration: 0.05, yoyo: true, repeat: 3 });
        });
        if (!touch)
          gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((n) => {
            const s = Number(n.dataset["speed"]);
            gsap.to(n, { y: -60 * s, ease: "none", scrollTrigger: { trigger: n, start: "top bottom", end: "bottom top", scrub: true } });
          });
      }, el);
    })();
    return () => ctx?.revert();
  }, [root]);
}
