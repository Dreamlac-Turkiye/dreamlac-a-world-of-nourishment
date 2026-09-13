import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Scale } from "lucide-react";
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
      <h1 className="text-2xl font-semibold text-primary-deep">{tr.productDetail.notFoundTitle}</h1>
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
    <main id="main" className="overflow-hidden pb-20">
      <section className="relative bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <nav aria-label="Breadcrumb" className="py-5 text-[0.7rem] font-semibold text-muted-foreground uppercase">
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

      <div className="grid min-h-[calc(100svh-9rem)] gap-10 pb-10 lg:grid-cols-12 lg:items-center lg:gap-20 lg:pb-16">
        <div
          className={cn(
            "grain relative lg:col-span-7",
            stageBg[product.stage],
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[12%] bottom-3 h-12 rounded-full bg-primary-deep/15 blur-2xl"
          />
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-card/70 bg-card/45 shadow-[var(--shadow-deep)] sm:aspect-[6/5] lg:aspect-[5/6] lg:max-h-[690px]">
            <div className="absolute top-5 left-5 z-10 flex flex-col items-start gap-2 sm:top-8 sm:left-8">
              <span className="surface-glass rounded-full px-4 py-2 text-[0.65rem] font-bold text-primary-deep uppercase shadow-[var(--shadow-soft)]">
                {product.technicalName}
              </span>
              <span className="rounded-full bg-primary-deep px-4 py-2 text-[0.65rem] font-bold text-primary-foreground uppercase shadow-[var(--shadow-soft)]">
                {product.ageRange}
              </span>
            </div>
            <div className="hero-product-enter relative mx-auto h-full w-[76%] p-8 sm:w-[68%] sm:p-12 lg:w-[78%] lg:p-16">
              <PackShotPlaceholder product={product} className="animate-float-product" priority />
            </div>
            <div className="absolute right-5 bottom-5 hidden items-center gap-3 rounded-lg border border-card/80 bg-card/85 px-4 py-3 shadow-[var(--shadow-lifted)] backdrop-blur-md sm:flex">
              <Scale size={18} className="text-champagne-foreground" aria-hidden="true" />
              <span className="text-xs font-semibold text-primary-deep">{product.weight}</span>
            </div>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5 lg:py-10">
          <div className="flex flex-wrap items-center gap-3">
            <StockPill stock={product.stock} />
            <span className="text-xs font-semibold text-champagne-foreground">Dreamlac</span>
          </div>
          <h1 className="mt-5 text-4xl leading-[1.08] font-medium text-primary-deep sm:text-6xl lg:text-7xl">
            {product.name}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            {product.shortDescription}
          </p>

          <ul className="mt-8 grid grid-cols-2 gap-3">
            {product.formulaFeatures.slice(0, 2).map((item) => (
              <li key={item} className="flex min-h-24 flex-col justify-between rounded-lg border border-border/70 bg-card p-4 shadow-[var(--shadow-soft)]">
                <Check size={18} className="text-primary" aria-hidden="true" />
                <span className="mt-4 text-xs font-semibold text-primary-deep">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <PurchasePanel product={product} />
          </div>
        </div>
      </div>
      </div>
      </section>

      <section className="border-y border-border/60 bg-card/55 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ProductTabs product={product} />
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="max-w-lg text-2xl font-medium text-primary-deep sm:text-3xl">{tr.productDetail.relatedTitle}</h2>
          <span className="hidden text-xs font-semibold text-muted-foreground uppercase sm:block">Dreamlac 1 · 2 · 3</span>
        </div>
        <ul className="mt-7 grid gap-4 sm:grid-cols-2">
          {others.map((item) => (
            <li key={item.id}>
              <Link
                to="/urunler/$slug"
                params={{ slug: item.slug }}
                className="lift-hover flex items-center gap-4 rounded-lg border border-border/70 bg-card p-4"
              >
                <span
                  className={cn(
                    "grid size-20 shrink-0 place-items-center rounded-[1.25rem] p-2",
                    stageBg[item.stage],
                  )}
                >
                  <PackShotPlaceholder product={item} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-primary-deep">{item.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {item.ageRange}
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="ml-auto shrink-0 text-primary"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
