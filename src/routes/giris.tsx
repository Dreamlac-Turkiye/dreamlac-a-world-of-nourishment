import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/giris")({
  head: () => ({
    meta: [
      { title: "Giriş Yap — Dreamlac" },
      { name: "description", content: "Üyelik ekranları 4. aşamada tasarlanacaktır." },
      { property: "og:title", content: "Giriş Yap — Dreamlac" },
      { property: "og:description", content: "Üyelik ekranları 4. aşamada tasarlanacaktır." },
    ],
  }),
  component: () => (
    <PagePlaceholder title="Giriş Yap" description="Üyelik ekranları 4. aşamada tasarlanacaktır." />
  ),
});
