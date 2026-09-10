import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/iade-ve-iptal-politikasi")({
  head: () => ({
    meta: [
      { title: "İade ve İptal Politikası — Dreamlac" },
      { name: "description", content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." },
      { property: "og:title", content: "İade ve İptal Politikası — Dreamlac" },
      { property: "og:description", content: "Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." },
    ],
  }),
  component: () => <PagePlaceholder title="İade ve İptal Politikası" description="Onaylı yasal metin tarafınızdan iletildiğinde yayınlanacaktır." />,
});
