import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { mockFaqs } from "@/data/mock/content";

export const Route = createFileRoute("/sikca-sorulan-sorular")({
  head: () => ({
    meta: [
      { title: "Sıkça Sorulan Sorular — Dreamlac" },
      {
        name: "description",
        content: "Dreamlac ürünleri, kullanım ve saklama hakkında sık sorulan sorular.",
      },
      { property: "og:title", content: "Sıkça Sorulan Sorular — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac ürünleri, kullanım ve saklama hakkında sık sorulan sorular.",
      },
    ],
  }),
  component: () => (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        Yardım merkezi
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-primary-deep sm:text-4xl">
        Sıkça Sorulan Sorular
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Ürün seçimi ve kullanımı konusunda sağlık profesyonelinize danışınız.
      </p>
      <Accordion
        type="single"
        collapsible
        className="mt-8 rounded-[1.75rem] border border-border/70 bg-card px-5 shadow-[var(--shadow-soft)]"
      >
        {mockFaqs.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="leading-relaxed text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  ),
});
