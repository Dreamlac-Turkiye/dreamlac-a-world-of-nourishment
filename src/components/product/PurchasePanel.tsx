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
    <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
      {priceLabel ? (
        <p className="text-2xl font-semibold text-primary-deep">{priceLabel}</p>
      ) : (
        <p className="text-sm font-medium text-muted-foreground">
          {tr.productDetail.pricePending}
        </p>
      )}


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
            onClick={() => {
              add(product.id, Math.min(quantity, MAX_QUANTITY));
              toast.success(tr.cart.added);
            }}
          >
            <ShoppingBag aria-hidden="true" />
            {tr.products.addToCart}
          </Button>
        </>
      )}
    </div>
  );
}
