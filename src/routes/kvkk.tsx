import { createFileRoute } from "@tanstack/react-router";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { getLegalDocument } from "@/lib/legal.functions";

const TITLE = "KVKK Aydınlatma Metni — Dreamlac";
const DESCRIPTION =
  "Kişisel verilerinizin Kulalac tarafından hangi amaçlarla işlendiğine ve haklarınıza dair aydınlatma metni.";

export const Route = createFileRoute("/kvkk")({
  loader: () => getLegalDocument({ data: { slug: "kvkk" } }),
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
  errorComponent: () => <LegalArticle document={null} fallbackTitle="KVKK Aydınlatma Metni" />,
  notFoundComponent: () => <LegalArticle document={null} fallbackTitle="KVKK Aydınlatma Metni" />,
  component: () => (
    <LegalArticle document={Route.useLoaderData()} fallbackTitle="KVKK Aydınlatma Metni" />
  ),
});
