import { BellRing, Info, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MAX_QUANTITY, QuantityStepper } from "@/components/product/QuantityStepper";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import type { Product } from "@/types";

/**
 * Satın alma alanı — stok ve satış durumuna göre üç ayrı durum gösterir:
 * 1) satış açık + stokta → adet seçimi ve sepete ekleme
 * 2) stokta yok → bilgilendirme + haber verme talebi
 * 3) satış hazır değil (fiyat/gramaj yok) → bilgilendirme, sipariş alanı gizli
 */
export function PurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);

  const priceLabel =
    product.price.amount === null
      ? null
      : `${(product.price.amount / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`;

  const salesReady = product.directSaleEnabled && priceLabel !== null;
  const outOfStock = product.stock === "out_of_stock";

  if (!salesReady) {
    return (
      <div className="rounded-[1.75rem] border border-champagne/70 bg-champagne/25 p-5">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-champagne-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-champagne-foreground">
              {tr.productDetail.salesClosedTitle}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-champagne-foreground/90">
              {tr.productDetail.salesClosedText}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
      {priceLabel ? (
        <p className="text-2xl font-semibold text-primary-deep">{priceLabel}</p>
      ) : null}

      {outOfStock ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {tr.productDetail.outOfStockText}
          </p>
          <Button
            variant="outline"
            className="mt-4 w-full rounded-full"
            onClick={() => toast.info(`${product.name} — ${tr.common.soon}`)}
          >
            <BellRing aria-hidden="true" />
            {tr.productDetail.notifyMe}
          </Button>
        </>
      ) : (
        <>
          <div className="mt-4">
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </div>
          <Button
            className="mt-4 w-full rounded-full"
            onClick={() =>
              toast.info(`${product.name} × ${Math.min(quantity, MAX_QUANTITY)} — ${tr.common.soon}`)
            }
          >
            <ShoppingBag aria-hidden="true" />
            {tr.products.addToCart}
          </Button>
        </>
      )}
    </div>
  );
}
