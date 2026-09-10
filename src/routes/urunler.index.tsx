import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/product/ProductCard";
import { tr } from "@/content/tr";
import { getProducts } from "@/services/catalog";

const title = "Dreamlac Ürünleri | Bebek ve Devam Sütleri";
const description =
  "Dreamlac 1, Dreamlac 2 ve Dreamlac 3 ürünlerinin yaş dönemleri, formül özellikleri ve ürün bilgilerini inceleyin.";

export const Route = createFileRoute("/urunler/")({
  loader: () => getProducts(),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductListPage,
});

function ProductListPage() {
  const products = Route.useLoaderData();

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl leading-tight font-semibold text-primary-deep sm:text-4xl">
        {tr.productDetail.listTitle}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {tr.productDetail.listDescription}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
