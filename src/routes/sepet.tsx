import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Info, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { CartLineRow } from "@/components/cart/CartLineRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { useCart } from "@/context/CartContext";
import { useCartItems } from "@/hooks/useCartItems";
import { calculateTotals } from "@/services/checkout";

export const Route = createFileRoute("/sepet")({
  head: () => ({
    meta: [
      { title: "Sepetim | Dreamlac" },
      { name: "description", content: tr.cart.description },
      { property: "og:title", content: "Sepetim | Dreamlac" },
      { property: "og:description", content: tr.cart.description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { setQuantity, remove, clear } = useCart();
  const { items, isLoading } = useCartItems();
  const totals = calculateTotals(items, null);

  return (
    <main id="main" className="bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <h1 className="text-2xl font-semibold text-primary-deep sm:text-3xl">{tr.cart.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {tr.cart.description}
        </p>

        <div className="mt-5 flex items-start gap-2 rounded-2xl bg-champagne/25 p-4">
          <Info
            size={16}
            className="mt-0.5 shrink-0 text-champagne-foreground"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-champagne-foreground/90">
            {tr.cart.previewNotice}
          </p>
        </div>

        {isLoading ? (
          <p className="mt-10 text-sm text-muted-foreground">{tr.states.loading}</p>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-[var(--shadow-soft)]">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary/60 text-primary-deep">
              <ShoppingBag size={22} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-primary-deep">{tr.cart.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {tr.cart.emptyDescription}
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/urunler">{tr.cart.emptyCta}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-[1.75rem] border border-border/70 bg-card px-5 shadow-[var(--shadow-soft)]">
              <ul>
                {items.map((item) => (
                  <CartLineRow
                    key={item.product.id}
                    item={item}
                    onQuantityChange={(quantity) => setQuantity(item.product.id, quantity)}
                    onRemove={() => {
                      remove(item.product.id);
                      toast.success(tr.cart.removed);
                    }}
                  />
                ))}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 py-4">
                <Button asChild variant="ghost" className="rounded-full">
                  <Link to="/urunler">{tr.cart.continueShopping}</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full text-muted-foreground"
                  onClick={() => {
                    clear();
                    toast.success(tr.cart.cleared);
                  }}
                >
                  {tr.cart.clear}
                </Button>
              </div>
            </div>

            <CartSummary totals={totals}>
              <Button asChild className="w-full rounded-full">
                <Link to="/odeme">
                  {tr.cart.checkoutCta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CartSummary>
          </div>
        )}
      </div>
    </main>
  );
}
