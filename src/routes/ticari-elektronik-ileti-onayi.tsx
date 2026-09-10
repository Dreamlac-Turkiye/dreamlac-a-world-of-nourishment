import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/ticari-elektronik-ileti-onayi")({
  head: () => ({
    meta: [
      { title: "Ticari Elektronik İleti Onayı — Dreamlac" },
      { name: "description", content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." },
      { property: "og:title", content: "Ticari Elektronik İleti Onayı — Dreamlac" },
      { property: "og:description", content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." },
    ],
  }),
  component: () => <PagePlaceholder title="Ticari Elektronik İleti Onayı" description="Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." />,
});
