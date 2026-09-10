import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/cerez-politikasi")({
  head: () => ({
    meta: [
      { title: "Çerez Politikası — Dreamlac" },
      {
        name: "description",
        content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır.",
      },
      { property: "og:title", content: "Çerez Politikası — Dreamlac" },
      {
        property: "og:description",
        content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır.",
      },
    ],
  }),
  component: () => (
    <PagePlaceholder
      title="Çerez Politikası"
      description="Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır."
    />
  ),
});
