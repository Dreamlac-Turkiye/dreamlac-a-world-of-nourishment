import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/uyelik-sozlesmesi")({
  head: () => ({
    meta: [
      { title: "Üyelik Sözleşmesi — Dreamlac" },
      {
        name: "description",
        content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır.",
      },
      { property: "og:title", content: "Üyelik Sözleşmesi — Dreamlac" },
      {
        property: "og:description",
        content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır.",
      },
    ],
  }),
  component: () => (
    <PagePlaceholder
      title="Üyelik Sözleşmesi"
      description="Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır."
    />
  ),
});
