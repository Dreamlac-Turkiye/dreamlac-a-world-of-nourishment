import { createFileRoute } from "@tanstack/react-router";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { getLegalDocument } from "@/lib/legal.functions";

export const Route = createFileRoute("/ticari-elektronik-ileti-onayi")({
  loader: () => getLegalDocument({ data: { slug: "ticari-elektronik-ileti-onayi" } }),
  head: () => ({
    meta: [
      { title: "Ticari Elektronik İleti Onayı — Dreamlac" },
      {
        name: "description",
        content: "Dreamlac ticari elektronik ileti tercihleri ve onayın geri alınması.",
      },
      { property: "og:title", content: "Ticari Elektronik İleti Onayı — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac ticari elektronik ileti tercihleri ve onayın geri alınması.",
      },
    ],
  }),
  component: CommercialConsentPage,
});
function CommercialConsentPage() {
  return (
    <LegalArticle document={Route.useLoaderData()} fallbackTitle="Ticari Elektronik İleti Onayı" />
  );
}
