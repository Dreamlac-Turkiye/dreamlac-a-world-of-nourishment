import { createFileRoute } from "@tanstack/react-router";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { getLegalDocument } from "@/services/legal";

export const Route = createFileRoute("/on-bilgilendirme-formu")({
  loader: () => getLegalDocument({ data: { slug: "on-bilgilendirme-formu" } }),
  head: () => ({
    meta: [
      { title: "Ön Bilgilendirme Formu — Dreamlac" },
      {
        name: "description",
        content: "Dreamlac mesafeli satış ön bilgilendirme formu ve sipariş koşulları.",
      },
      { property: "og:title", content: "Ön Bilgilendirme Formu — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac mesafeli satış ön bilgilendirme formu ve sipariş koşulları.",
      },
    ],
  }),
  component: PreInformationPage,
});
function PreInformationPage() {
  return <LegalArticle document={Route.useLoaderData()} fallbackTitle="Ön Bilgilendirme Formu" />;
}
