import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Features } from "@/components/home/Features";
import { HowTo } from "@/components/home/HowTo";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND.name} — ${BRAND.expansion}` },
      {
        name: "description",
        content: BRAND.description,
      },
      { property: "og:title", content: `${BRAND.name} — ${BRAND.expansion}` },
      {
        property: "og:description",
        content: BRAND.description,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Features />
        <HowTo />
      </main>
      <Footer />
    </>
  );
}
