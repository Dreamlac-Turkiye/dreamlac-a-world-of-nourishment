import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/teslimat-politikasi")({
  head: () => ({
    meta: [
      { title: "Teslimat Politikası — Dreamlac" },
      { name: "description", content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." },
      { property: "og:title", content: "Teslimat Politikası — Dreamlac" },
      { property: "og:description", content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." },
    ],
  }),
  component: () => <PagePlaceholder title="Teslimat Politikası" description="Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." />,
});
