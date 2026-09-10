import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/kvkk")({
  head: () => ({
    meta: [
      { title: "KVKK Aydınlatma Metni — Dreamlac" },
      {
        name: "description",
        content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır.",
      },
      { property: "og:title", content: "KVKK Aydınlatma Metni — Dreamlac" },
      {
        property: "og:description",
        content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır.",
      },
    ],
  }),
  component: () => (
    <PagePlaceholder
      title="KVKK Aydınlatma Metni"
      description="Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır."
    />
  ),
});
