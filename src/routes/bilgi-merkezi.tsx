import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/bilgi-merkezi")({
  head: () => ({
    meta: [
      { title: "Bilgi Merkezi — Dreamlac" },
      { name: "description", content: "İçerik sayfaları 5. aşamada tasarlanacaktır." },
      { property: "og:title", content: "Bilgi Merkezi — Dreamlac" },
      { property: "og:description", content: "İçerik sayfaları 5. aşamada tasarlanacaktır." },
    ],
  }),
  component: () => <PagePlaceholder title="Bilgi Merkezi" description="İçerik sayfaları 5. aşamada tasarlanacaktır." />,
});
