import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackCommerceOrder, type TrackedOrder } from "@/lib/order-tracking.functions";
import { formatTry } from "@/services/checkout";

export const Route = createFileRoute("/siparis-takip")({
  head: () => ({
    meta: [
      { title: "Sipariş Takip — Dreamlac" },
      {
        name: "description",
        content: "Dreamlac siparişinizin güncel hazırlık ve kargo durumunu güvenle takip edin.",
      },
      { property: "og:title", content: "Sipariş Takip — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac siparişinizin güncel hazırlık ve kargo durumunu güvenle takip edin.",
      },
    ],
  }),
  component: OrderTrackingPage,
});

const statusLabels: Record<string, string> = {
  pending: "Sipariş alındı",
  confirmed: "Onaylandı",
  processing: "Hazırlanıyor",
  ready_to_ship: "Kargoya hazır",
  shipped: "Kargoya verildi",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
};

function OrderTrackingPage() {
  const trackOrder = useServerFn(trackCommerceOrder);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TrackedOrder | null>();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const order = await trackOrder({
        data: {
          orderNumber: String(form.get("orderNumber") ?? ""),
          email: String(form.get("email") ?? ""),
          phoneLast4: String(form.get("phoneLast4") ?? ""),
        },
      });
      setResult(order);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.includes("RATE_LIMITED")
          ? "Çok fazla deneme yaptınız. Lütfen 15 dakika sonra tekrar deneyin."
          : "Sipariş sorgulanamadı. Lütfen daha sonra tekrar deneyin.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Dreamlac Türkiye
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-primary-deep sm:text-4xl">Sipariş Takip</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Sipariş numaranız, siparişte kullandığınız e-posta ve telefonunuzun son dört hanesiyle
          güncel durumu görüntüleyin.
        </p>

        <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tracking-order">Sipariş numarası</Label>
            <Input
              id="tracking-order"
              name="orderNumber"
              autoComplete="off"
              placeholder="Örn. TR-2026-00012345"
              required
              minLength={5}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracking-email">E-posta</Label>
            <Input
              id="tracking-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracking-phone">Telefonun son 4 hanesi</Label>
            <Input
              id="tracking-phone"
              name="phoneLast4"
              inputMode="numeric"
              autoComplete="off"
              pattern="[0-9]{4}"
              minLength={4}
              maxLength={4}
              placeholder="1234"
              required
            />
          </div>
          <Button type="submit" className="rounded-full sm:col-span-2" disabled={busy}>
            {busy ? "Sorgulanıyor…" : "Siparişimi görüntüle"}
          </Button>
        </form>
      </div>

      {result === null ? (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-border/70 bg-card p-6 text-sm text-muted-foreground"
        >
          Bu bilgilerle eşleşen bir sipariş bulunamadı. Bilgileri kontrol edip yeniden deneyin.
        </div>
      ) : result ? (
        <section
          aria-live="polite"
          className="mt-6 rounded-[2rem] border border-primary/20 bg-primary/5 p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Sipariş numarası</p>
              <h2 className="mt-1 text-xl font-semibold text-primary-deep">{result.orderNumber}</h2>
            </div>
            <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              {statusLabels[result.shipmentStatus ?? result.status] ?? "İşleniyor"}
            </span>
          </div>
          <dl className="mt-6 grid gap-4 border-t border-primary/15 pt-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Sipariş tarihi</dt>
              <dd className="mt-1 text-sm font-medium">
                {new Date(result.createdAt).toLocaleDateString("tr-TR")}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Ürün adedi</dt>
              <dd className="mt-1 text-sm font-medium">{result.itemCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Toplam</dt>
              <dd className="mt-1 text-sm font-medium">{formatTry(result.totalKurus)}</dd>
            </div>
          </dl>
          {result.carrierName && (
            <p className="mt-5 text-sm text-muted-foreground">
              Kargo firması: <strong className="text-foreground">{result.carrierName}</strong>
              {result.trackingNumber ? ` · Takip no: ${result.trackingNumber}` : ""}
            </p>
          )}
        </section>
      ) : null}
    </main>
  );
}
