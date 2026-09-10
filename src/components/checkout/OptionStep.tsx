import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { tr } from "@/content/tr";
import { cn } from "@/lib/utils";
import { formatTry } from "@/services/checkout";

export interface StepOption {
  id: string;
  title: string;
  description: string;
  fee?: number | null;
  disabled?: boolean;
}

/** Kargo ve ödeme adımları için ortak seçenek listesi. */
export function OptionStep({
  title,
  note,
  options,
  value,
  onChange,
  error,
  onBack,
  onNext,
}: {
  title: string;
  note: string;
  options: StepOption[];
  value: string | null;
  onChange: (id: string) => void;
  error?: string | null;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
      <h2 className="text-base font-semibold text-primary-deep">{title}</h2>

      <RadioGroup
        className="mt-4 gap-3"
        value={value ?? ""}
        onValueChange={onChange}
        aria-label={title}
      >
        {options.map((option) => (
          <Label
            key={option.id}
            htmlFor={`option-${option.id}`}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 p-4 transition-colors",
              value === option.id && "border-primary bg-primary/5",
              option.disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <RadioGroupItem
              id={`option-${option.id}`}
              value={option.id}
              disabled={option.disabled}
              className="mt-0.5"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-primary-deep">{option.title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {option.description}
              </span>
              {option.fee !== undefined ? (
                <span className="mt-1.5 block text-xs font-medium text-primary-deep">
                  {formatTry(option.fee ?? null) ?? tr.cart.pendingShipping}
                </span>
              ) : null}
              {option.disabled ? (
                <span className="mt-1.5 block text-xs font-medium text-champagne-foreground">
                  {tr.checkout.paymentUnavailable}
                </span>
              ) : null}
            </span>
          </Label>
        ))}
      </RadioGroup>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-secondary/50 p-3">
        <Info size={16} className="mt-0.5 shrink-0 text-primary-deep" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap justify-between gap-3">
        <Button variant="outline" className="rounded-full" onClick={onBack}>
          {tr.checkout.back}
        </Button>
        <Button className="rounded-full" onClick={onNext}>
          {tr.checkout.next}
        </Button>
      </div>
    </section>
  );
}
