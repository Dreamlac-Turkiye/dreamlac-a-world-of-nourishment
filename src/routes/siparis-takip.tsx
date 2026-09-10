import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/siparis-takip")({
  head: () => ({
    meta: [
      { title: "Sipariş Takip — Dreamlac" },
      { name: "description", content: "Sipariş takip sayfası 3. aşamada tasarlanacaktır." },
      { property: "og:title", content: "Sipariş Takip — Dreamlac" },
      { property: "og:description", content: "Sipariş takip sayfası 3. aşamada tasarlanacaktır." },
    ],
  }),
  component: () => <PagePlaceholder title="Sipariş Takip" description="Sipariş takip sayfası 3. aşamada tasarlanacaktır." />,
});
