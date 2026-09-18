import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { tr } from "@/content/tr";
import { cn } from "@/lib/utils";
import { getProducts } from "@/services/catalog";
import type { Product } from "@/types";

const stageTone: Record<Product["stage"], string> = {
  "stage-1": "bg-stage-1",
  "stage-2": "bg-stage-2",
  "stage-3": "bg-stage-3",
};

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
    <main id="main" className="pb-20">
      <section className="bg-hero-aura grain relative isolate overflow-hidden border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:pt-20 lg:pb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.16em] text-primary-deep uppercase shadow-[var(--shadow-soft)] backdrop-blur-xl">
            <Sparkles size={14} strokeWidth={1.7} aria-hidden="true" className="text-primary" />
            {tr.products.sectionEyebrow}
          </span>

          <h1 className="mt-5 max-w-2xl text-[clamp(2.2rem,5.5vw,3.75rem)] leading-[0.98] font-semibold tracking-[-0.03em] text-primary-deep">
            {tr.productDetail.listTitle}
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {tr.productDetail.listDescription}
          </p>

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {tr.hero.trustItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-full border border-primary-deep/10 bg-card/70 px-3.5 py-1.5 text-xs font-medium text-primary-deep/80 backdrop-blur"
              >
                <Check size={12} strokeWidth={2.3} className="text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <nav aria-label="Ürün aşamasına git" className="mt-9 flex flex-wrap gap-3">
            {products.map((product) => (
              <a
                key={product.id}
                href={`#${product.slug}`}
                className="lift-hover flex items-center gap-3 rounded-full border border-border/70 bg-card/85 py-2 pr-5 pl-2.5 shadow-[var(--shadow-soft)]"
              >
                <span
                  aria-hidden="true"
                  className={cn("droplet size-8 shrink-0", stageTone[product.stage])}
                />
                <span className="min-w-0 text-left">
                  <span className="block text-sm font-semibold text-primary-deep">
                    {product.name}
                  </span>
                  <span className="block text-[0.7rem] text-muted-foreground">
                    {product.ageRange}
                  </span>
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} id={product.slug} className="scroll-mt-24">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
