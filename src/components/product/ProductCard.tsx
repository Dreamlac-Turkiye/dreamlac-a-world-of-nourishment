import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PackShotPlaceholder } from "@/components/product/PackShotPlaceholder";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { tr } from "@/content/tr";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

export function ProductCardSkeleton() {
  return (
    <div className="rounded-[2rem] border border-border/70 bg-card p-5">
      <Skeleton className="aspect-4/5 w-full rounded-[1.75rem]" />
      <Skeleton className="mt-5 h-5 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-5 h-11 w-full rounded-full" />
      <span className="sr-only">{tr.states.loading}</span>
    </div>
  );
}

function StockBadge({ stock }: { stock: Product["stock"] }) {
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
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-semibold",
        item.className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {item.label}
    </span>
  );
}

const stageRing: Record<Product["stage"], string> = {
  "stage-1": "hover:border-stage-1",
  "stage-2": "hover:border-stage-2",
  "stage-3": "hover:border-stage-3",
};

export function ProductCard({
  product,
  emphasis = false,
  className,
}: {
  product: Product;
  /** Ortadaki kart gibi öne çıkan varyant — kartlar birebir aynı görünmez. */
  emphasis?: boolean;
  className?: string;
}) {
  const [favorite, setFavorite] = useState(false);
  const { add } = useCart();
  const outOfStock = product.stock === "out_of_stock";
  /** Fiyat iletilmediği ve hukuki inceleme tamamlanmadığı için satış kapalı. */
  const canAddToCart = product.directSaleEnabled && !outOfStock;

  return (
    <article
      className={cn(
        "lift-hover group relative flex flex-col rounded-[2rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]",
        stageRing[product.stage],
        emphasis && "surface-milk lg:-mt-6 lg:pb-8 shadow-[var(--shadow-lifted)]",
        className,
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "overflow-hidden rounded-[1.75rem]",
            emphasis ? "aspect-4/5 lg:aspect-3/4" : "aspect-4/5",
          )}
        >
          <div className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04] group-hover:-rotate-1">
            <PackShotPlaceholder product={product} />
          </div>
        </div>
        <button
          type="button"
          aria-pressed={favorite}
          aria-label={`${product.name} — ${tr.products.favorite}`}
          onClick={() => setFavorite((v) => !v)}
          className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-card/85 text-primary-deep shadow-[var(--shadow-soft)] backdrop-blur transition-colors hover:bg-card"
        >
          <Heart
            size={18}
            strokeWidth={1.8}
            className={cn(favorite && "fill-destructive text-destructive")}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="mt-5 flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="min-w-0 text-lg leading-snug font-semibold text-balance text-primary-deep">
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-primary/90">{product.technicalName}</p>
          </div>
          <StockBadge stock={product.stock} />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {product.shortDescription}
        </p>

        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
            <dt className="text-muted-foreground">{tr.products.fields.age}</dt>
            <dd className="min-w-0 text-right font-medium text-primary-deep/90">
              {product.ageRange}
            </dd>
          </div>
          {/* Gramaj ve fiyat bilgisi iletilmediği sürece gösterilmez. */}
          {product.weight ? (
            <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
              <dt className="text-muted-foreground">{tr.products.fields.weight}</dt>
              <dd className="min-w-0 truncate text-right text-primary-deep/80">{product.weight}</dd>
            </div>
          ) : null}
          {product.price.amount !== null ? (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{tr.products.fields.price}</dt>
              <dd className="text-right font-semibold text-primary-deep">
                {`${(product.price.amount / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`}
              </dd>
            </div>
          ) : null}
        </dl>

        <ul className="mt-4 flex flex-wrap gap-2">
          {product.formulaFeatures.map((feature) => (
            <li
              key={feature}
              className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-medium text-primary-deep/80"
            >
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {canAddToCart ? (
            <Button
              className="flex-1 rounded-full"
              onClick={() => {
                add(product.id, 1);
                toast.success(tr.cart.added);
              }}
            >
              <ShoppingBag aria-hidden="true" />
              {tr.products.addToCart}
            </Button>
          ) : null}
          <Button
            asChild
            variant={canAddToCart ? "outline" : "default"}
            className="flex-1 rounded-full"
          >
            <Link to="/urunler/$slug" params={{ slug: product.slug }}>
              {tr.products.detailsCta}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-[0.7rem] leading-relaxed text-muted-foreground">
          {product.warning}
        </p>
      </div>
    </article>
  );
}
