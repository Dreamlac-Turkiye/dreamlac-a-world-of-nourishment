import { createFileRoute } from "@tanstack/react-router";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { getLegalDocument } from "@/lib/legal.functions";

const TITLE = "Mesafeli Satış Sözleşmesi — Dreamlac";
const DESCRIPTION =
  "Dreamlac siparişlerinde geçerli mesafeli satış koşulları, teslimat, cayma hakkı ve uyuşmazlık çözümü.";

export const Route = createFileRoute("/mesafeli-satis-sozlesmesi")({
  loader: () => getLegalDocument({ data: { slug: "mesafeli-satis-sozlesmesi" } }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => <LegalArticle document={null} fallbackTitle="Mesafeli Satış Sözleşmesi" />,
  notFoundComponent: () => (
    <LegalArticle document={null} fallbackTitle="Mesafeli Satış Sözleşmesi" />
  ),
  component: () => (
    <LegalArticle document={Route.useLoaderData()} fallbackTitle="Mesafeli Satış Sözleşmesi" />
  ),
});
