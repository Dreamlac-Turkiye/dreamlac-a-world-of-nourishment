import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/gizlilik-politikasi")({
  head: () => ({
    meta: [
      { title: "Gizlilik Politikası — Dreamlac" },
      { name: "description", content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." },
      { property: "og:title", content: "Gizlilik Politikası — Dreamlac" },
      { property: "og:description", content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." },
    ],
  }),
  component: () => <PagePlaceholder title="Gizlilik Politikası" description="Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." />,
});
