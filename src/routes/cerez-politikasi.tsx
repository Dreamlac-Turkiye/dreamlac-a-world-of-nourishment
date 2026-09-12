import { createFileRoute } from "@tanstack/react-router";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { getLegalDocument } from "@/lib/legal.functions";

const TITLE = "Çerez Politikası — Dreamlac";
const DESCRIPTION =
  "Dreamlac web sitesinde kullanılan çerezler, kullanım amaçları ve tercihlerinizi yönetme yolları.";

export const Route = createFileRoute("/cerez-politikasi")({
  loader: () => getLegalDocument({ data: { slug: "cerez-politikasi" } }),
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
  errorComponent: () => <LegalArticle document={null} fallbackTitle="Çerez Politikası" />,
  notFoundComponent: () => <LegalArticle document={null} fallbackTitle="Çerez Politikası" />,
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  return <LegalArticle document={Route.useLoaderData()} fallbackTitle="Çerez Politikası" />;
}
