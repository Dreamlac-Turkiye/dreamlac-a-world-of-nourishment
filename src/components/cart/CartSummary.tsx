import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { tr } from "@/content/tr";
import { formatTry } from "@/services/checkout";
import type { CartTotals } from "@/types";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-primary-deep">{value}</span>
    </div>
  );
}

/** Sipariş özeti — bilinmeyen tutarlar için uydurma değer gösterilmez. */
export function CartSummary({ totals, children }: { totals: CartTotals; children?: ReactNode }) {
  return (
    <aside className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
      <h2 className="text-base font-semibold text-primary-deep">{tr.cart.summaryTitle}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {totals.itemCount} {tr.cart.itemCount}
      </p>

      <div className="mt-4 border-t border-border/60 pt-3">
        <Row label={tr.cart.subtotal} value={formatTry(totals.subtotal) ?? tr.cart.pendingPrice} />
        <Row
          label={tr.cart.shipping}
          value={formatTry(totals.shipping) ?? tr.cart.pendingShipping}
        />
        <div className="mt-2 border-t border-border/60 pt-3">
          <Row
            label={tr.cart.total}
            value={
              formatTry(totals.total) ?? (
                <span className="text-sm font-normal text-muted-foreground">
                  {tr.cart.pendingPrice}
                </span>
              )
            }
          />
        </div>
      </div>

      {totals.total === null ? (
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-champagne/25 p-3">
          <Info
            size={16}
            className="mt-0.5 shrink-0 text-champagne-foreground"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-champagne-foreground/90">
            {tr.cart.pendingTotal}
          </p>
        </div>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}
    </aside>
  );
}
