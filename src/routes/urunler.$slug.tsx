import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PackShotPlaceholder } from "@/components/product/PackShotPlaceholder";
import { ProductTabs } from "@/components/product/ProductTabs";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { cn } from "@/lib/utils";
import { getProductBySlug, getProducts } from "@/services/catalog";
import type { Product, StockStatus } from "@/types";

const stageBg: Record<Product["stage"], string> = {
  "stage-1": "bg-stage-1",
  "stage-2": "bg-stage-2",
  "stage-3": "bg-stage-3",
};

export const Route = createFileRoute("/urunler/$slug")({
  loader: async ({ params }) => {
    const product = await getProductBySlug(params.slug);
    if (!product) throw notFound();
    const others = (await getProducts()).filter((item) => item.slug !== product.slug);
    return { product, others };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: `${tr.productDetail.notFoundTitle} — Dreamlac` },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.product.name} | Dreamlac`;
    const description = loaderData.product.shortDescription;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductDetailPage,
});

function ProductNotFound() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-semibold text-primary-deep">
        {tr.productDetail.notFoundTitle}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {tr.productDetail.notFoundDescription}
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/urunler">
          <ArrowLeft aria-hidden="true" />
          {tr.productDetail.backToProducts}
        </Link>
      </Button>
    </main>
  );
}

function StockPill({ stock }: { stock: StockStatus }) {
  const map = {
    in_stock: { label: tr.products.stock.inStock, className: "bg-success/12 text-success" },
    out_of_stock: {
      label: tr.products.stock.outOfStock,
      className: "bg-destructive/10 text-destructive",
    },
    pending: { label: tr.products.stock.pending, className: "bg-secondary text-muted-foreground" },
  } as const;
  const item = map[stock];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        item.className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {item.label}
    </span>
  );
}

function ProductDetailPage() {
  const { product, others } = Route.useLoaderData();

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <nav aria-label="Breadcrumb" className="py-6 text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-primary-deep">
              {tr.productDetail.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/urunler" className="hover:text-primary-deep">
              {tr.productDetail.breadcrumbProducts}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-primary-deep">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div
          className={cn(
            "grain relative overflow-hidden rounded-[2.5rem] p-6 sm:p-10",
            stageBg[product.stage],
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-[oklch(1_0_0/0.45)] blur-3xl"
          />
          <div className="relative mx-auto aspect-4/5 w-full max-w-sm">
            <PackShotPlaceholder product={product} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <StockPill stock={product.stock} />
            <span className="text-xs font-medium text-primary">{product.technicalName}</span>
          </div>
          <h1 className="mt-4 text-3xl leading-tight font-semibold text-balance text-primary-deep sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {product.shortDescription}
          </p>
          <p className="mt-4 text-sm text-primary-deep/80">
            <span className="text-muted-foreground">{tr.products.fields.age}: </span>
            {product.ageRange}
          </p>

          <div className="mt-6">
            <PurchasePanel product={product} />
          </div>
        </div>
      </div>

      <section className="mt-14">
        <ProductTabs product={product} />
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold text-primary-deep">{tr.productDetail.relatedTitle}</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {others.map((item) => (
            <li key={item.id}>
              <Link
                to="/urunler/$slug"
                params={{ slug: item.slug }}
                className="lift-hover flex items-center gap-4 rounded-[1.75rem] border border-border/70 bg-card p-4"
              >
                <span className={cn("grid size-20 shrink-0 place-items-center rounded-[1.25rem] p-2", stageBg[item.stage])}>
                  <PackShotPlaceholder product={item} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-primary-deep">{item.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {item.ageRange}
                  </span>
                </span>
                <ArrowRight size={16} className="ml-auto shrink-0 text-primary" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
