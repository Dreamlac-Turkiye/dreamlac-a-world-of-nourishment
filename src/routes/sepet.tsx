import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/sepet")({
  head: () => ({
    meta: [
      { title: "Sepet — Dreamlac" },
      { name: "description", content: "Sepet ve ödeme akışı 3. aşamada tasarlanacaktır." },
      { property: "og:title", content: "Sepet — Dreamlac" },
      { property: "og:description", content: "Sepet ve ödeme akışı 3. aşamada tasarlanacaktır." },
    ],
  }),
  component: () => <PagePlaceholder title="Sepet" description="Sepet ve ödeme akışı 3. aşamada tasarlanacaktır." />,
});
