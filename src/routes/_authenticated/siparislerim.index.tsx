import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { listMyOrders } from "@/lib/orders.functions";
import { formatTry } from "@/services/checkout";

export const Route = createFileRoute("/_authenticated/siparislerim/")({
  head: () => ({
    meta: [
      { title: "Siparişlerim — Dreamlac" },
      { name: "description", content: tr.orders.description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

function formatDate(value: string): string {
  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrdersPage() {
  const fetchOrders = useServerFn(listMyOrders);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => fetchOrders(),
  });

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold text-primary-deep sm:text-4xl">{tr.orders.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tr.orders.description}</p>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">{tr.states.loading}</p>
      ) : isError ? (
        <p className="mt-10 text-sm text-muted-foreground">{tr.orders.error}</p>
      ) : !data || data.length === 0 ? (
        <div className="mt-10 rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-semibold text-primary-deep">{tr.orders.emptyTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{tr.orders.emptyDescription}</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/urunler">{tr.orders.emptyCta}</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {data.map((order) => (
            <li key={order.orderNumber}>
              <Link
                to="/siparislerim/$orderNumber"
                params={{ orderNumber: order.orderNumber }}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary-deep">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary-deep">
                    {order.itemCount} {tr.cart.itemCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatTry(order.totalKurus) ?? tr.cart.pendingPrice}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 rounded-2xl bg-champagne/25 p-4 text-xs leading-relaxed text-champagne-foreground/90">
        {tr.orders.previewNotice}
      </p>
    </main>
  );
}
