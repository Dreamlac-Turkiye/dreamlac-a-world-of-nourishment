import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/hakkimizda")({
  head: () => ({
    meta: [
      { title: "Hakkımızda — Dreamlac" },
      { name: "description", content: "Dreamlac hakkında sayfası 5. aşamada tasarlanacaktır." },
      { property: "og:title", content: "Hakkımızda — Dreamlac" },
      { property: "og:description", content: "Dreamlac hakkında sayfası 5. aşamada tasarlanacaktır." },
    ],
  }),
  component: () => <PagePlaceholder title="Hakkımızda" description="Dreamlac hakkında sayfası 5. aşamada tasarlanacaktır." />,
});
