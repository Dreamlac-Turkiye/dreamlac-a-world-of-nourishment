import { BellRing, Info, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MAX_QUANTITY, QuantityStepper } from "@/components/product/QuantityStepper";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

/**
 * Satın alma alanı — stok ve satış durumuna göre üç ayrı durum gösterir:
 * 1) satış açık + stokta → adet seçimi ve sepete ekleme
 * 2) stokta yok → bilgilendirme + haber verme talebi
 * 3) satış hazır değil (fiyat/gramaj yok) → bilgilendirme, sipariş alanı gizli
 */
export function PurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { add } = useCart();

  const priceLabel =
    product.price.amount === null
      ? null
      : `${(product.price.amount / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`;

  const outOfStock = product.stock === "out_of_stock";
  /** Fiyat iletilmediği sürece sipariş akışı önizleme olarak çalışır. */
  const previewMode = !product.directSaleEnabled || priceLabel === null;

  return (
    <div className="border-t border-border/70 pt-6">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
      {priceLabel ? (
        <p className="text-4xl font-medium text-primary-deep tabular-nums">{priceLabel}</p>
      ) : (
        <p className="text-sm font-medium text-muted-foreground">{tr.productDetail.pricePending}</p>
      )}
        {product.weight ? (
          <p className="pb-1 text-sm font-medium text-muted-foreground">{product.weight}</p>
        ) : null}
      </div>

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
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <QuantityStepper value={quantity} onChange={setQuantity} hideNote />
            <Button
              size="lg"
              className="h-12 flex-1 rounded-full shadow-[var(--shadow-lifted)]"
              onClick={() => {
                add(product.id, Math.min(quantity, MAX_QUANTITY));
                toast.success(tr.cart.added);
              }}
            >
              <ShoppingBag aria-hidden="true" />
              {tr.products.addToCart}
            </Button>
          </div>
        </>
      )}

      {previewMode ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-champagne/25 p-3">
          <Info
            size={16}
            className="mt-0.5 shrink-0 text-champagne-foreground"
            aria-hidden="true"
          />
          <p className="text-[0.75rem] leading-relaxed text-champagne-foreground/90">
            {tr.productDetail.previewSaleNote}
          </p>
        </div>
      ) : null}
    </div>
  );
}
