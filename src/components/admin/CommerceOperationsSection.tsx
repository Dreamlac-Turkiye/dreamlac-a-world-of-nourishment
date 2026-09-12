import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ClipboardList, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchCommerceOrders } from "@/lib/admin-commerce.functions";
import { getOperationalHealth } from "@/lib/operations.functions";
import { formatTry } from "@/services/checkout";
import { listAdminOrderRequests, resolveOrderRequest } from "@/lib/order-requests.functions";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  pending_payment: "Ödeme bekliyor",
  paid: "Ödendi",
  fulfilment_pending: "Hazırlanıyor",
  fulfilled: "Tamamlandı",
  cancelled: "İptal",
  refunded: "İade",
};

export function CommerceOperationsSection() {
  const searchOrders = useServerFn(searchCommerceOrders);
  const readHealth = useServerFn(getOperationalHealth);
  const readRequests = useServerFn(listAdminOrderRequests);
  const updateRequest = useServerFn(resolveOrderRequest);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const orders = useQuery({
    queryKey: ["admin", "commerce-orders", submittedQuery],
    queryFn: () =>
      searchOrders({ data: { market: "TR", query: submittedQuery, limit: 25, offset: 0 } }),
    refetchInterval: 60_000,
  });
  const health = useQuery({
    queryKey: ["admin", "operational-health"],
    queryFn: () => readHealth(),
    refetchInterval: 60_000,
  });
  const requests = useQuery({
    queryKey: ["admin", "order-requests"],
    queryFn: () => readRequests(),
    refetchInterval: 60_000,
  });

  async function setRequestStatus(
    requestId: string,
    status: "reviewing" | "approved" | "rejected" | "completed",
  ) {
    try {
      await updateRequest({ data: { requestId, status, resolutionNote: "" } });
      toast.success("Talep durumu güncellendi.");
      void requests.refetch();
    } catch {
      toast.error("Talep güncellenemedi.");
    }
  }

  const alerts = health.data
    ? health.data.outbox.failed +
      health.data.outbox.dead +
      health.data.payments.failed24h +
      health.data.webhooks.failed
    : 0;

  return (
    <section className="mt-10 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList size={20} className="text-primary" />
            <h2 className="text-xl font-semibold text-primary-deep">Sipariş operasyonları</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Türkiye mağazasındaki son siparişler ve sistem işleme sağlığı.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => {
            void orders.refetch();
            void health.refetch();
          }}
        >
          <RefreshCw size={14} className="mr-2" /> Yenile
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Metric label="Sonuç" value={orders.data?.items.length ?? 0} />
        <Metric label="Kuyrukta" value={health.data?.outbox.pending ?? 0} />
        <Metric label="Eski ödemeler" value={health.data?.payments.pendingOver15m ?? 0} />
        <Metric label="Uyarı" value={alerts} warning={alerts > 0} />
      </div>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query.trim());
        }}
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Sipariş no, e-posta veya telefon ara"
          maxLength={200}
        />
        <Button type="submit" className="rounded-full">
          Ara
        </Button>
      </form>

      {orders.isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Siparişler yükleniyor…</p>
      ) : orders.isError ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle size={16} /> Sipariş verileri alınamadı.
        </p>
      ) : orders.data?.items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Henüz eşleşen sipariş yok.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="px-2 py-3">Sipariş</th>
                <th className="px-2 py-3">Müşteri</th>
                <th className="px-2 py-3">Durum</th>
                <th className="px-2 py-3">Ödeme / Kargo</th>
                <th className="px-2 py-3 text-right">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {orders.data?.items.map((order) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0">
                  <td className="px-2 py-4">
                    <strong className="block text-primary-deep">{order.orderNumber}</strong>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString("tr-TR")}
                    </span>
                  </td>
                  <td className="px-2 py-4">
                    <span className="block">{order.customerEmail}</span>
                    <span className="text-xs text-muted-foreground">{order.customerPhone}</span>
                  </td>
                  <td className="px-2 py-4">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs">
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-2 py-4 text-xs text-muted-foreground">
                    {order.paymentStatus ?? "—"} / {order.shipmentStatus ?? "—"}
                  </td>
                  <td className="px-2 py-4 text-right font-medium">
                    {formatTry(order.grandTotalMinor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-5 text-xs text-muted-foreground">
        Ödeme, kargo ve fatura eylemleri ilgili sağlayıcı anahtarları tanımlandıktan sonra
        etkinleşecektir.
      </p>
      <div className="mt-8 border-t border-border/70 pt-6">
        <h3 className="font-semibold text-primary-deep">İptal ve iade talepleri</h3>
        {requests.data?.length ? (
          <div className="mt-4 space-y-3">
            {requests.data.map((request) => (
              <article key={request.id} className="rounded-2xl bg-secondary/50 p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <strong className="text-sm">
                      {request.orderNumber} ·{" "}
                      {request.requestType === "cancellation" ? "İptal" : "İade"}
                    </strong>
                    <p className="text-xs text-muted-foreground">
                      {request.customerEmail} ·{" "}
                      {new Date(request.createdAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{request.status}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{request.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {request.status === "submitted" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void setRequestStatus(request.id, "reviewing")}
                    >
                      İncele
                    </Button>
                  ) : null}
                  {request.status !== "completed" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => void setRequestStatus(request.id, "approved")}
                      >
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void setRequestStatus(request.id, "rejected")}
                      >
                        Reddet
                      </Button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Açık müşteri talebi bulunmuyor.</p>
        )}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${warning ? "border-destructive/30 bg-destructive/5" : "border-border/70 bg-background"}`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${warning ? "text-destructive" : "text-primary-deep"}`}
      >
        {value}
      </p>
    </div>
  );
}
