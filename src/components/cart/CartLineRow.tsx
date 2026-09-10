import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { PackShotPlaceholder } from "@/components/product/PackShotPlaceholder";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { formatTry } from "@/services/checkout";
import type { CartItem } from "@/types";

/** Sepet satırı — görsel, ürün bilgisi, adet seçici ve satır toplamı. */
export function CartLineRow({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const { product, quantity, lineTotal } = item;
  const unitPrice = formatTry(product.price.amount);
  const total = formatTry(lineTotal);

  return (
    <li className="flex flex-col gap-4 border-b border-border/60 py-5 last:border-b-0 sm:flex-row sm:items-start">
      <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-[1.25rem] bg-secondary/50 p-2">
        <PackShotPlaceholder product={product} />
      </div>

      <div className="min-w-0 flex-1">
        <Link
          to="/urunler/$slug"
          params={{ slug: product.slug }}
          className="text-base font-semibold text-primary-deep hover:underline"
        >
          {product.name}
        </Link>
        <p className="mt-0.5 text-sm text-muted-foreground">{product.technicalName}</p>
        <p className="text-sm text-muted-foreground">{product.ageRange}</p>
        <p className="mt-2 text-sm font-medium text-primary-deep">
          {unitPrice ?? tr.cart.pendingPrice}
        </p>
      </div>

      <div className="flex flex-col items-start gap-3 sm:items-end">
        <QuantityStepper value={quantity} onChange={onQuantityChange} hideNote />
        <p className="text-sm text-muted-foreground">
          <span className="sr-only">{tr.cart.lineTotal}: </span>
          <span className="font-semibold text-primary-deep">{total ?? tr.cart.pendingPrice}</span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-muted-foreground"
          onClick={onRemove}
        >
          <Trash2 size={16} aria-hidden="true" />
          {tr.cart.remove}
        </Button>
      </div>
    </li>
  );
}
