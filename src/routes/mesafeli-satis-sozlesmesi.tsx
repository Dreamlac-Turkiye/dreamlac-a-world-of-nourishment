import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/mesafeli-satis-sozlesmesi")({
  head: () => ({
    meta: [
      { title: "Mesafeli Satış Sözleşmesi — Dreamlac" },
      { name: "description", content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." },
      { property: "og:title", content: "Mesafeli Satış Sözleşmesi — Dreamlac" },
      { property: "og:description", content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." },
    ],
  }),
  component: () => <PagePlaceholder title="Mesafeli Satış Sözleşmesi" description="Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." />,
});
