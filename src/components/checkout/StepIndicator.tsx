import { Check } from "lucide-react";
import { tr } from "@/content/tr";
import { cn } from "@/lib/utils";

export const CHECKOUT_STEPS = [
  tr.checkout.steps.address,
  tr.checkout.steps.shipping,
  tr.checkout.steps.payment,
  tr.checkout.steps.review,
] as const;

/** Adım göstergesi — mevcut adım aria ile duyurulur. */
export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-3" aria-label={tr.checkout.title}>
      {CHECKOUT_STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                active && "border-primary bg-primary text-primary-foreground",
                done && "border-primary/40 bg-primary/10 text-primary-deep",
                !active && !done && "border-border/70 bg-card text-muted-foreground",
              )}
            >
              <span className="grid size-5 place-items-center rounded-full bg-[oklch(1_0_0/0.2)] text-[0.7rem] tabular-nums">
                {done ? <Check size={12} aria-hidden="true" /> : index + 1}
              </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
