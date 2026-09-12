import { createFileRoute } from "@tanstack/react-router";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { getLegalDocument } from "@/lib/legal.functions";

export const Route = createFileRoute("/uyelik-sozlesmesi")({
  loader: () => getLegalDocument({ data: { slug: "uyelik-sozlesmesi" } }),
  head: () => ({
    meta: [
      { title: "Üyelik Sözleşmesi — Dreamlac" },
      {
        name: "description",
        content: "Dreamlac müşteri hesabı üyelik ve kullanım koşulları.",
      },
      { property: "og:title", content: "Üyelik Sözleşmesi — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac müşteri hesabı üyelik ve kullanım koşulları.",
      },
    ],
  }),
  component: MembershipAgreementPage,
});
function MembershipAgreementPage() {
  return <LegalArticle document={Route.useLoaderData()} fallbackTitle="Üyelik Sözleşmesi" />;
}
