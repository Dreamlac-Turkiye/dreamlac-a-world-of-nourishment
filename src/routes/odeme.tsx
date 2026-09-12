import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { AddressStep } from "@/components/checkout/AddressStep";
import { OptionStep } from "@/components/checkout/OptionStep";
import { ReviewStep } from "@/components/checkout/ReviewStep";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { useCart } from "@/context/CartContext";
import { useCartItems } from "@/hooks/useCartItems";
import { calculateTotals, getPaymentMethods, getShippingOptions } from "@/services/checkout";
import {
  createCommerceCheckout,
  type CommerceCheckoutResult,
} from "@/lib/commerce-checkout.functions";
import type { CheckoutAddress, CheckoutDraft } from "@/types";

const DRAFT_KEY = "dreamlac.checkout.v1";
const IDEMPOTENCY_KEY = "dreamlac.checkout.idempotency.v1";

export const Route = createFileRoute("/odeme")({
  head: () => ({
    meta: [
      { title: "Ödeme | Dreamlac" },
      { name: "description", content: tr.checkout.description },
      { property: "og:title", content: "Ödeme | Dreamlac" },
      { property: "og:description", content: tr.checkout.description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const emptyDraft: CheckoutDraft = {
  step: 0,
  address: null,
  shippingOptionId: null,
  paymentMethodId: null,
};

function readDraft(): CheckoutDraft {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyDraft;
    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    return {
      step: typeof parsed.step === "number" ? Math.min(3, Math.max(0, parsed.step)) : 0,
      address: parsed.address ?? null,
      shippingOptionId: parsed.shippingOptionId ?? null,
      paymentMethodId: parsed.paymentMethodId ?? null,
    };
  } catch {
    return emptyDraft;
  }
}

function getCheckoutIdempotencyKey(): string {
  try {
    const existing = window.sessionStorage.getItem(IDEMPOTENCY_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(IDEMPOTENCY_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

function CheckoutPage() {
  const { items, isLoading } = useCartItems();
  const { clear } = useCart();
  const shippingOptions = getShippingOptions();
  const paymentMethods = getPaymentMethods();

  const [draft, setDraft] = useState<CheckoutDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<CommerceCheckoutResult | null>(null);

  useEffect(() => {
    setDraft(readDraft());
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* depolama kullanılamıyorsa sessiz geç */
    }
  }, [draft]);

  const selectedShipping = shippingOptions.find((o) => o.id === draft.shippingOptionId) ?? null;
  const selectedPayment = paymentMethods.find((o) => o.id === draft.paymentMethodId) ?? null;
  const totals = calculateTotals(items, selectedShipping?.fee ?? null);

  if (order) {
    return (
      <main id="main" className="bg-background">
        <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary-deep">
            <CheckCircle2 size={24} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-primary-deep">
            {tr.checkout.successTitle}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {tr.checkout.successDescription}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {tr.checkout.orderNumber}:{" "}
            <span className="font-semibold text-primary-deep">{order.orderNumber}</span>
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {tr.checkout.guestNotice}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full">
              <Link to="/siparislerim">{tr.checkout.ordersCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/siparis-takip">{tr.checkout.trackCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/">{tr.checkout.homeCta}</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <h1 className="text-2xl font-semibold text-primary-deep sm:text-3xl">
          {tr.checkout.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {tr.checkout.description}
        </p>

        <div className="mt-5 flex items-start gap-2 rounded-2xl bg-champagne/25 p-4">
          <Info
            size={16}
            className="mt-0.5 shrink-0 text-champagne-foreground"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-champagne-foreground/90">
            {tr.checkout.previewNotice}
          </p>
        </div>

        {isLoading ? (
          <p className="mt-10 text-sm text-muted-foreground">{tr.states.loading}</p>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-[var(--shadow-soft)]">
            <h2 className="text-lg font-semibold text-primary-deep">{tr.checkout.emptyTitle}</h2>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/urunler">{tr.checkout.emptyCta}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <StepIndicator current={draft.step} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div>
                {draft.step === 0 ? (
                  <AddressStep
                    defaultValues={draft.address}
                    onSubmit={(address) => setDraft((d) => ({ ...d, address, step: 1 }))}
                  />
                ) : null}

                {draft.step === 1 ? (
                  <OptionStep
                    title={tr.checkout.shippingTitle}
                    note={tr.checkout.shippingNote}
                    options={shippingOptions.map((o) => ({ ...o, fee: o.fee }))}
                    value={draft.shippingOptionId}
                    onChange={(id) => {
                      setError(null);
                      setDraft((d) => ({ ...d, shippingOptionId: id }));
                    }}
                    error={error}
                    onBack={() => setDraft((d) => ({ ...d, step: 0 }))}
                    onNext={() => {
                      if (!draft.shippingOptionId) {
                        setError(tr.checkout.errors.shippingRequired);
                        return;
                      }
                      setError(null);
                      setDraft((d) => ({ ...d, step: 2 }));
                    }}
                  />
                ) : null}

                {draft.step === 2 ? (
                  <OptionStep
                    title={tr.checkout.paymentTitle}
                    note={tr.checkout.paymentNote}
                    options={paymentMethods.map((o) => ({
                      id: o.id,
                      title: o.title,
                      description: o.description,
                      disabled: !o.available,
                    }))}
                    value={draft.paymentMethodId}
                    onChange={(id) => {
                      setError(null);
                      setDraft((d) => ({ ...d, paymentMethodId: id }));
                    }}
                    error={error}
                    onBack={() => setDraft((d) => ({ ...d, step: 1 }))}
                    onNext={() => {
                      if (!draft.paymentMethodId) {
                        setError(tr.checkout.errors.paymentRequired);
                        return;
                      }
                      setError(null);
                      setDraft((d) => ({ ...d, step: 3 }));
                    }}
                  />
                ) : null}

                {draft.step === 3 && draft.address && selectedShipping && selectedPayment ? (
                  <ReviewStep
                    items={items}
                    address={draft.address as CheckoutAddress}
                    shippingLabel={selectedShipping.title}
                    paymentLabel={selectedPayment.title}
                    submitting={submitting}
                    onBack={() => setDraft((d) => ({ ...d, step: 2 }))}
                    onSubmit={async () => {
                      if (!draft.address || !selectedShipping || !selectedPayment) return;
                      setSubmitting(true);
                      try {
                        const result = await createCommerceCheckout({
                          data: {
                            market: "TR",
                            idempotencyKey: getCheckoutIdempotencyKey(),
                            customer: {
                              email: draft.address.email,
                              phone: draft.address.phone,
                            },
                            billingAddress: {
                              fullName: draft.address.fullName,
                              phone: draft.address.phone,
                              country: "TR",
                              city: draft.address.city,
                              district: draft.address.district,
                              line1: draft.address.addressLine,
                            },
                            shippingAddress: {
                              fullName: draft.address.fullName,
                              phone: draft.address.phone,
                              country: "TR",
                              city: draft.address.city,
                              district: draft.address.district,
                              line1: draft.address.addressLine,
                            },
                            items: items.map((item) => ({
                              variantId: item.product.id,
                              quantity: item.quantity,
                            })),
                            customerNote: draft.address.note || undefined,
                          },
                        });

                        clear();
                        window.sessionStorage.removeItem(DRAFT_KEY);
                        window.sessionStorage.removeItem(IDEMPOTENCY_KEY);
                        setOrder(result);
                      } catch {
                        setError(tr.checkout.saveError);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  />
                ) : null}
              </div>

              <CartSummary totals={totals} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
