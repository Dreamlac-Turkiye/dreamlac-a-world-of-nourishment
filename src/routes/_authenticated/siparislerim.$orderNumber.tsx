import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { tr } from "@/content/tr";
import { getMyCommerceOrder } from "@/lib/customer-commerce.functions";
import { formatTry } from "@/services/checkout";
import { createOrderRequest, listOrderRequests } from "@/lib/order-requests.functions";

export const Route = createFileRoute("/_authenticated/siparislerim/$orderNumber")({
  head: () => ({
    meta: [
      { title: "Sipariş Detayı — Dreamlac" },
      { name: "description", content: tr.orders.detailDescription },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderNumber } = Route.useParams();
  const fetchOrder = useServerFn(getMyCommerceOrder);
  const { data, isLoading } = useQuery({
    queryKey: ["orders", orderNumber],
    queryFn: () => fetchOrder({ data: { orderNumber } }),
  });
  const fetchRequests = useServerFn(listOrderRequests);
  const submitRequest = useServerFn(createOrderRequest);
  const requests = useQuery({
    queryKey: ["order-requests", orderNumber],
    queryFn: () => fetchRequests({ data: { orderNumber } }),
  });
  const [reason, setReason] = useState("");
  const [requestType, setRequestType] = useState<"cancellation" | "return">("cancellation");
  const [requestBusy, setRequestBusy] = useState(false);

  async function onRequestSubmit(event: React.FormEvent) {
    event.preventDefault();
    setRequestBusy(true);
    try {
      await submitRequest({ data: { orderNumber, requestType, reason } });
      setReason("");
      toast.success("Talebiniz alındı.");
      void requests.refetch();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.includes("OPEN_REQUEST_EXISTS")
          ? "Bu sipariş için açık bir talep zaten var."
          : "Talep oluşturulamadı. Sipariş durumu uygun olmayabilir.",
      );
    } finally {
      setRequestBusy(false);
    }
  }

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <Link
        to="/siparislerim"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-deep"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {tr.orders.backToList}
      </Link>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">{tr.states.loading}</p>
      ) : !data ? (
        <div className="mt-8 rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-[var(--shadow-soft)]">
          <h1 className="text-lg font-semibold text-primary-deep">{tr.orders.notFoundTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{tr.orders.notFoundDescription}</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/siparislerim">{tr.orders.backToList}</Link>
          </Button>
        </div>
      ) : (
        <>
          <h1 className="mt-6 text-2xl font-semibold text-primary-deep sm:text-3xl">
            {data.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(data.createdAt).toLocaleString("tr-TR")}
          </p>

          <section className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-base font-semibold text-primary-deep">{tr.orders.itemsTitle}</h2>
            <ul className="mt-4 space-y-3">
              {(data.items ?? []).map((item) => (
                <li
                  key={`${item.productId}-${item.productSlug}`}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <Link
                      to="/urunler/$slug"
                      params={{ slug: item.productSlug }}
                      className="text-sm font-medium text-primary-deep hover:underline"
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tr.orders.quantity}: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatTry(item.lineTotalKurus) ?? tr.cart.pendingPrice}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-4 rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-base font-semibold text-primary-deep">{tr.orders.summaryTitle}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{tr.cart.subtotal}</dt>
                <dd className="text-primary-deep">
                  {formatTry(data.subtotalKurus ?? null) ?? tr.cart.pendingPrice}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{tr.cart.shipping}</dt>
                <dd className="text-primary-deep">
                  {formatTry(data.shippingKurus ?? null) ?? tr.cart.pendingShipping}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border/50 pt-2">
                <dt className="text-muted-foreground">{tr.cart.total}</dt>
                <dd className="font-semibold text-primary-deep">
                  {formatTry(data.totalKurus) ?? tr.cart.pendingPrice}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-4 rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-base font-semibold text-primary-deep">İptal ve iade talepleri</h2>
            {requests.data?.map((request) => (
              <div key={request.id} className="mt-3 rounded-xl bg-secondary/60 p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <strong>
                    {request.requestType === "cancellation" ? "İptal talebi" : "İade talebi"}
                  </strong>
                  <span className="text-xs text-muted-foreground">{request.status}</span>
                </div>
                <p className="mt-2 text-muted-foreground">{request.reason}</p>
                {request.resolutionNote ? (
                  <p className="mt-2 text-xs">Yanıt: {request.resolutionNote}</p>
                ) : null}
              </div>
            ))}
            <form onSubmit={onRequestSubmit} className="mt-5 space-y-3">
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={requestType === "cancellation"}
                    onChange={() => setRequestType("cancellation")}
                  />{" "}
                  İptal
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={requestType === "return"}
                    onChange={() => setRequestType("return")}
                  />{" "}
                  İade
                </label>
              </div>
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                minLength={5}
                maxLength={1000}
                required
                placeholder="Talebinizin nedenini yazın"
              />
              <Button disabled={requestBusy} className="rounded-full">
                {requestBusy ? "Gönderiliyor…" : "Talep oluştur"}
              </Button>
            </form>
          </section>

          <section className="mt-4 rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-base font-semibold text-primary-deep">{tr.orders.deliveryTitle}</h2>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p className="text-primary-deep">{data.fullName ?? "—"}</p>
              <p>{data.phone}</p>
              <p>{data.email}</p>
              <p>
                {data.addressLine ?? "—"}, {data.district ?? "—"} / {data.city ?? "—"}
              </p>
              {data.note ? <p>{data.note}</p> : null}
              <p className="pt-2">
                {tr.orders.shippingOption}: {data.shippingOptionTitle}
              </p>
              <p>
                {tr.orders.paymentMethod}: {data.paymentMethodTitle}
              </p>
            </div>
          </section>

          <p className="mt-8 rounded-2xl bg-champagne/25 p-4 text-xs leading-relaxed text-champagne-foreground/90">
            {tr.orders.previewNotice}
          </p>
        </>
      )}
    </main>
  );
}
