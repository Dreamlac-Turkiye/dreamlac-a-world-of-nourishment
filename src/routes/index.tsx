import { createFileRoute } from "@tanstack/react-router";
import { ChooserSection } from "@/components/home/ChooserSection";
import { ContentSection } from "@/components/home/ContentSection";
import { FactorySection } from "@/components/home/FactorySection";
import { Hero } from "@/components/home/Hero";
import { IngredientsSection } from "@/components/home/IngredientsSection";
import { JourneySection } from "@/components/home/JourneySection";
import { Newsletter } from "@/components/home/Newsletter";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { QualitySection } from "@/components/home/QualitySection";
import { StorySection } from "@/components/home/StorySection";
import { TrustSection } from "@/components/home/TrustSection";

const title = "Dreamlac | Bebek ve Devam Sütleri";
const description =
  "Dreamlac 1, Dreamlac 2 ve Dreamlac 3 ürünlerini inceleyin. Kulalac’ın Türkiye’deki üretim yaklaşımı, kalite süreçleri ve ürün bilgileri hakkında bilgi edinin.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main id="main">
      <Hero />
      <ProductShowcase />
      <IngredientsSection />
      <ChooserSection />
      <StorySection />
      <QualitySection />
      <JourneySection />
      <FactorySection />
      <TrustSection />
      <ContentSection />
      <Newsletter />
    </main>
  );
}
