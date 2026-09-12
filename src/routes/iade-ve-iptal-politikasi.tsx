import { createFileRoute } from "@tanstack/react-router";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { getLegalDocument } from "@/lib/legal.functions";

export const Route = createFileRoute("/iade-ve-iptal-politikasi")({
  loader: () => getLegalDocument({ data: { slug: "iade-ve-iptal-politikasi" } }),
  head: () => ({
    meta: [
      { title: "İade ve İptal Politikası — Dreamlac" },
      {
        name: "description",
        content: "Dreamlac siparişlerinde iade, iptal ve talep oluşturma süreci.",
      },
      { property: "og:title", content: "İade ve İptal Politikası — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac siparişlerinde iade, iptal ve talep oluşturma süreci.",
      },
    ],
  }),
  component: ReturnsPolicyPage,
});
function ReturnsPolicyPage() {
  return <LegalArticle document={Route.useLoaderData()} fallbackTitle="İade ve İptal Politikası" />;
}
