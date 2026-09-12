import { createFileRoute } from "@tanstack/react-router";
import { FactorySection } from "@/components/home/FactorySection";
import { StorySection } from "@/components/home/StorySection";
import { TrustSection } from "@/components/home/TrustSection";

export const Route = createFileRoute("/hakkimizda")({
  head: () => ({
    meta: [
      { title: "Hakkımızda — Dreamlac" },
      {
        name: "description",
        content: "Dreamlac ve Kulalac'ın bilim, üretim ve kalite yolculuğunu keşfedin.",
      },
      { property: "og:title", content: "Hakkımızda — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac ve Kulalac'ın bilim, üretim ve kalite yolculuğunu keşfedin.",
      },
    ],
  }),
  component: () => (
    <main id="main">
      <StorySection />
      <FactorySection />
      <TrustSection />
    </main>
  ),
});
