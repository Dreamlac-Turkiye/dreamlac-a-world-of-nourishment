import { createFileRoute } from "@tanstack/react-router";
import { QualitySection } from "@/components/home/QualitySection";
import { JourneySection } from "@/components/home/JourneySection";

export const Route = createFileRoute("/kalite-ve-guvenlik")({
  head: () => ({
    meta: [
      { title: "Kalite ve Güvenlik — Dreamlac" },
      {
        name: "description",
        content: "Dreamlac'ın hammadde, üretim, kalite kontrol ve izlenebilirlik yaklaşımı.",
      },
      { property: "og:title", content: "Kalite ve Güvenlik — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac'ın hammadde, üretim, kalite kontrol ve izlenebilirlik yaklaşımı.",
      },
    ],
  }),
  component: () => (
    <main id="main">
      <QualitySection />
      <JourneySection />
    </main>
  ),
});
