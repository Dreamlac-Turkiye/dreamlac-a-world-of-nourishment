import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/on-bilgilendirme-formu")({
  head: () => ({
    meta: [
      { title: "Ön Bilgilendirme Formu — Dreamlac" },
      {
        name: "description",
        content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır.",
      },
      { property: "og:title", content: "Ön Bilgilendirme Formu — Dreamlac" },
      {
        property: "og:description",
        content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır.",
      },
    ],
  }),
  component: () => (
    <PagePlaceholder
      title="Ön Bilgilendirme Formu"
      description="Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır."
    />
  ),
});
