import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/hesabim")({
  head: () => ({
    meta: [
      { title: "Hesabım — Dreamlac" },
      { name: "description", content: "Müşteri paneli 4. aşamada tasarlanacaktır." },
      { property: "og:title", content: "Hesabım — Dreamlac" },
      { property: "og:description", content: "Müşteri paneli 4. aşamada tasarlanacaktır." },
    ],
  }),
  component: () => (
    <PagePlaceholder title="Hesabım" description="Müşteri paneli 4. aşamada tasarlanacaktır." />
  ),
});
