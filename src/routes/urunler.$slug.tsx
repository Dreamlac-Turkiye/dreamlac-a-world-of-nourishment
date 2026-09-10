import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export const Route = createFileRoute("/urunler/$slug")({
  head: () => ({
    meta: [
      { title: "Ürün Detayı — Dreamlac" },
      { name: "description", content: "Ürün detay sayfası 2. aşamada tasarlanacaktır." },
      { property: "og:title", content: "Ürün Detayı — Dreamlac" },
      { property: "og:description", content: "Ürün detay sayfası 2. aşamada tasarlanacaktır." },
    ],
  }),
  component: ProductDetailPlaceholder,
});

function ProductDetailPlaceholder() {
  const { slug } = Route.useParams();
  return (
    <PagePlaceholder
      title={slug.replace("dreamlac-", "Dreamlac ")}
      description="Ürün detay sayfası 2. aşamada tasarlanacaktır."
    />
  );
}
