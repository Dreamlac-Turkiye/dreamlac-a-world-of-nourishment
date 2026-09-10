import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/arama")({
  head: () => ({
    meta: [
      { title: "Arama — Dreamlac" },
      { name: "description", content: "Arama sayfası 5. aşamada tasarlanacaktır." },
      { property: "og:title", content: "Arama — Dreamlac" },
      { property: "og:description", content: "Arama sayfası 5. aşamada tasarlanacaktır." },
    ],
  }),
  component: () => (
    <PagePlaceholder title="Arama" description="Arama sayfası 5. aşamada tasarlanacaktır." />
  ),
});
