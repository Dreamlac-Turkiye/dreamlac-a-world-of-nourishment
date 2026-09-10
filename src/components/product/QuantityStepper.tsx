import { Minus, Plus } from "lucide-react";
import { tr } from "@/content/tr";

export const MAX_QUANTITY = 10;

/** Adet seçici — erişilebilir, klavye ile kullanılabilir. */
export function QuantityStepper({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  const clamp = (n: number) => Math.min(MAX_QUANTITY, Math.max(1, n));

  return (
    <div className="flex flex-col gap-1.5">
      <span id="quantity-label" className="text-xs font-medium text-muted-foreground">
        {tr.productDetail.quantity}
      </span>
      <div className="inline-flex w-fit items-center gap-1 rounded-full border border-border/70 bg-card p-1">
        <button
          type="button"
          aria-label={tr.productDetail.decrease}
          disabled={disabled || value <= 1}
          onClick={() => onChange(clamp(value - 1))}
          className="grid size-9 place-items-center rounded-full text-primary-deep transition-colors hover:bg-secondary disabled:opacity-40"
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          aria-labelledby="quantity-label"
          min={1}
          max={MAX_QUANTITY}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            const parsed = Number.parseInt(event.target.value, 10);
            onChange(Number.isNaN(parsed) ? 1 : clamp(parsed));
          }}
          className="w-12 border-0 bg-transparent text-center text-sm font-semibold text-primary-deep tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={tr.productDetail.increase}
          disabled={disabled || value >= MAX_QUANTITY}
          onClick={() => onChange(clamp(value + 1))}
          className="grid size-9 place-items-center rounded-full text-primary-deep transition-colors hover:bg-secondary disabled:opacity-40"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{tr.productDetail.maxQuantityNote}</p>
    </div>
  );
}
