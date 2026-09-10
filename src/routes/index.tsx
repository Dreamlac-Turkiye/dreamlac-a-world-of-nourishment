import { createFileRoute } from "@tanstack/react-router";
import { ChooserSection } from "@/components/home/ChooserSection";
import { ContentSection } from "@/components/home/ContentSection";
import { Hero } from "@/components/home/Hero";
import { Newsletter } from "@/components/home/Newsletter";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { QualitySection } from "@/components/home/QualitySection";
import { TrustSection } from "@/components/home/TrustSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dreamlac — Her Adımda Özenle Yanınızda" },
      {
        name: "description",
        content:
          "Dreamlac 1, 2 ve 3 ürünlerini keşfedin, ürün bilgilerine kolayca ulaşın ve aileniz için güvenli bir alışveriş deneyimi yaşayın.",
      },
      { property: "og:title", content: "Dreamlac — Her Adımda Özenle Yanınızda" },
      {
        property: "og:description",
        content: "Dreamlac ürün ailesini ve şeffaf ürün bilgilerini keşfedin.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main id="main">
      <Hero />
      <ProductShowcase />
      <TrustSection />
      <ChooserSection />
      <QualitySection />
      <ContentSection />
      <Newsletter />
    </main>
  );
}
