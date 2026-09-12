import { createFileRoute } from "@tanstack/react-router";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { getLegalDocument } from "@/lib/legal.functions";

export const Route = createFileRoute("/teslimat-politikasi")({
  loader: () => getLegalDocument({ data: { slug: "teslimat-politikasi" } }),
  head: () => ({
    meta: [
      { title: "Teslimat Politikası — Dreamlac" },
      {
        name: "description",
        content: "Dreamlac sipariş hazırlama ve teslimat süreci hakkında bilgiler.",
      },
      { property: "og:title", content: "Teslimat Politikası — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac sipariş hazırlama ve teslimat süreci hakkında bilgiler.",
      },
    ],
  }),
  component: DeliveryPolicyPage,
});
function DeliveryPolicyPage() {
  return <LegalArticle document={Route.useLoaderData()} fallbackTitle="Teslimat Politikası" />;
}
