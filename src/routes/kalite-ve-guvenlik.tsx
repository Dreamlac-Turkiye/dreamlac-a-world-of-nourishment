import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/kalite-ve-guvenlik")({
  head: () => ({
    meta: [
      { title: "Kalite ve Güvenlik — Dreamlac" },
      { name: "description", content: "Kalite ve güvenlik sayfası 5. aşamada tasarlanacaktır." },
      { property: "og:title", content: "Kalite ve Güvenlik — Dreamlac" },
      { property: "og:description", content: "Kalite ve güvenlik sayfası 5. aşamada tasarlanacaktır." },
    ],
  }),
  component: () => <PagePlaceholder title="Kalite ve Güvenlik" description="Kalite ve güvenlik sayfası 5. aşamada tasarlanacaktır." />,
});
