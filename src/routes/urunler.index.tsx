import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/urunler/")({
  head: () => ({
    meta: [
      { title: "Ürünler — Dreamlac" },
      { name: "description", content: "Tüm ürünler sayfası 2. aşamada tasarlanacaktır." },
      { property: "og:title", content: "Ürünler — Dreamlac" },
      { property: "og:description", content: "Tüm ürünler sayfası 2. aşamada tasarlanacaktır." },
    ],
  }),
  component: () => <PagePlaceholder title="Ürünler" description="Tüm ürünler sayfası 2. aşamada tasarlanacaktır." />,
});
