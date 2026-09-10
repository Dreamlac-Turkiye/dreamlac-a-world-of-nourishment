import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim — Dreamlac" },
      { name: "description", content: "İletişim sayfası 5. aşamada tasarlanacaktır." },
      { property: "og:title", content: "İletişim — Dreamlac" },
      { property: "og:description", content: "İletişim sayfası 5. aşamada tasarlanacaktır." },
    ],
  }),
  component: () => (
    <PagePlaceholder title="İletişim" description="İletişim sayfası 5. aşamada tasarlanacaktır." />
  ),
});
