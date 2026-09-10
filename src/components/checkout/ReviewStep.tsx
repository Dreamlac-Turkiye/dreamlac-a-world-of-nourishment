import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { tr } from "@/content/tr";
import { formatTry } from "@/services/checkout";
import type { CartItem, CheckoutAddress } from "@/types";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 p-4">
      <h3 className="text-sm font-semibold text-primary-deep">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

export function ReviewStep({
  items,
  address,
  shippingLabel,
  paymentLabel,
  submitting,
  onBack,
  onSubmit,
}: {
  items: CartItem[];
  address: CheckoutAddress;
  shippingLabel: string;
  paymentLabel: string;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
      <h2 className="text-base font-semibold text-primary-deep">{tr.checkout.reviewTitle}</h2>

      <div className="mt-4 grid gap-3">
        <Block title={tr.checkout.reviewAddress}>
          <p className="font-medium text-primary-deep">{address.fullName}</p>
          <p>
            {address.phone} · {address.email}
          </p>
          <p>
            {address.addressLine}, {address.district} / {address.city}
          </p>
          {address.note ? <p className="mt-1">{address.note}</p> : null}
        </Block>
        <Block title={tr.checkout.reviewShipping}>{shippingLabel}</Block>
        <Block title={tr.checkout.reviewPayment}>{paymentLabel}</Block>
        <Block title={tr.checkout.reviewItems}>
          <ul className="grid gap-1.5">
            {items.map((item) => (
              <li key={item.product.id} className="flex justify-between gap-4">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium text-primary-deep">
                  {formatTry(item.lineTotal) ?? tr.cart.pendingPrice}
                </span>
              </li>
            ))}
          </ul>
        </Block>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-champagne/25 p-3">
        <Info size={16} className="mt-0.5 shrink-0 text-champagne-foreground" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-champagne-foreground/90">
          {tr.checkout.previewNotice}
        </p>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <Checkbox
          id="checkout-consent"
          checked={consent}
          onCheckedChange={(next) => {
            setConsent(next === true);
            if (next === true) setError(null);
          }}
        />
        <Label htmlFor="checkout-consent" className="text-xs leading-relaxed text-muted-foreground">
          {tr.checkout.consent}
        </Label>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        <Link to="/mesafeli-satis-sozlesmesi" className="text-primary-deep underline">
          {tr.footer.links.distanceSales}
        </Link>
        <Link to="/on-bilgilendirme-formu" className="text-primary-deep underline">
          {tr.footer.links.preInfo}
        </Link>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap justify-between gap-3">
        <Button variant="outline" className="rounded-full" onClick={onBack} disabled={submitting}>
          {tr.checkout.back}
        </Button>
        <Button
          className="rounded-full"
          disabled={submitting}
          onClick={() => {
            if (!consent) {
              setError(tr.checkout.errors.consentRequired);
              return;
            }
            onSubmit();
          }}
        >
          {submitting ? tr.checkout.submitting : tr.checkout.submit}
        </Button>
      </div>
    </section>
  );
}
