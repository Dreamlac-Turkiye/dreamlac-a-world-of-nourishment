import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/sikca-sorulan-sorular")({
  head: () => ({
    meta: [
      { title: "Sıkça Sorulan Sorular — Dreamlac" },
      { name: "description", content: "SSS sayfası 5. aşamada tasarlanacaktır." },
      { property: "og:title", content: "Sıkça Sorulan Sorular — Dreamlac" },
      { property: "og:description", content: "SSS sayfası 5. aşamada tasarlanacaktır." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      title="Sıkça Sorulan Sorular"
      description="SSS sayfası 5. aşamada tasarlanacaktır."
    />
  ),
});
