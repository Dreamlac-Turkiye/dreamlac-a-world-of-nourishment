import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ClipboardList, RefreshCw, X } from "lucide-react";
import { AdminState } from "@/components/admin/AdminState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCommerceOrder,
  searchCommerceOrders,
  updateCommerceOrderWorkflow,
} from "@/lib/admin-commerce.functions";
import { getOperationalHealth } from "@/lib/operations.functions";
import { formatTry } from "@/services/checkout";
import { listAdminOrderRequests, resolveOrderRequest } from "@/lib/order-requests.functions";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { listAdminUsers } from "@/lib/admin-users.functions";

const statusLabels: Record<string, string> = {
  awaiting_payment: "Ödeme bekliyor",
  payment_processing: "Ödeme işleniyor",
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
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
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
        <AdminState kind="loading" message="Siparişler yükleniyor…" />
      ) : orders.isError ? (
        <AdminState
          kind="error"
          message="Sipariş verileri alınamadı."
          onRetry={() => void orders.refetch()}
        />
      ) : orders.data?.items.length === 0 ? (
        <AdminState kind="empty" message="Henüz eşleşen sipariş yok." />
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
                <th className="px-2 py-3 text-right">İşlem</th>
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
                  <td className="px-2 py-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setSelectedOrder(order.orderNumber)}
                    >
                      Aç
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedOrder ? (
        <OrderWorkspace
          orderNumber={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={() => void orders.refetch()}
        />
      ) : null}
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

interface OrderWorkspaceData {
  order: {
    order_number: string;
    status: string;
    customer_email: string;
    customer_phone: string;
    grand_total_minor: number;
    assigned_to: string | null;
    created_at: string;
  };
  shippingAddress: Record<string, unknown>;
  items: Array<{
    id: string;
    product_name: string;
    sku: string;
    quantity: number;
    line_total_minor: number;
  }>;
  history: Array<{
    id: number;
    to_status: string;
    actor_type: string;
    reason: string | null;
    created_at: string;
  }>;
  internalNotes: Array<{
    id: string;
    body: string;
    authorId: string;
    createdAt: string;
  }>;
}

const nextStatuses: Record<string, string[]> = {
  awaiting_payment: ["payment_processing", "cancelled", "failed"],
  payment_processing: ["cancelled", "failed"],
  paid: ["fulfilment_pending"],
  fulfilment_pending: ["fulfilled"],
};

function OrderWorkspace({
  orderNumber,
  onClose,
  onUpdated,
}: {
  orderNumber: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const readOrder = useServerFn(getCommerceOrder);
  const updateWorkflow = useServerFn(updateCommerceOrderWorkflow);
  const readUsers = useServerFn(listAdminUsers);
  const [note, setNote] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [assignee, setAssignee] = useState("");
  const [busy, setBusy] = useState(false);
  const detail = useQuery({
    queryKey: ["admin", "commerce-order", orderNumber],
    queryFn: () => readOrder({ data: { orderNumber } }),
  });
  const staff = useQuery({
    queryKey: ["admin", "staff-for-assignment"],
    queryFn: () => readUsers({ data: { query: "" } }),
  });
  const data = detail.data as OrderWorkspaceData | null | undefined;
  const staffMembers = (staff.data ?? []).filter((user) =>
    user.roles.some((role) => role === "admin" || role === "editor"),
  );

  useEffect(() => {
    if (data) setAssignee(data.order.assigned_to ?? "");
  }, [data]);

  async function save(input: {
    nextStatus?: string;
    assignmentAction?: "keep" | "set" | "clear";
    assignedTo?: string | null;
    note?: string | null;
  }) {
    setBusy(true);
    try {
      await updateWorkflow({
        data: {
          orderNumber,
          nextStatus: (input.nextStatus || null) as
            | "draft"
            | "awaiting_payment"
            | "payment_processing"
            | "paid"
            | "fulfilment_pending"
            | "fulfilled"
            | "cancelled"
            | "refunded"
            | "failed"
            | null,
          assignmentAction: input.assignmentAction ?? "keep",
          assignedTo: input.assignedTo ?? null,
          note: input.note ?? null,
        },
      });
      toast.success("Sipariş çalışma kaydı güncellendi.");
      setNote("");
      setNextStatus("");
      await detail.refetch();
      onUpdated();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.includes("INVALID_ORDER_STATUS_TRANSITION")
          ? "Bu durum geçişine izin verilmiyor."
          : "Sipariş güncellenemedi.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-[1.5rem] border border-primary/20 bg-background p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Sipariş çalışma alanı
          </p>
          <h3 className="mt-1 text-xl font-semibold text-primary-deep">{orderNumber}</h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          onClick={onClose}
          aria-label="Kapat"
        >
          <X size={18} />
        </Button>
      </div>

      {detail.isLoading ? (
        <AdminState kind="loading" message="Sipariş yükleniyor…" />
      ) : detail.isError || !data ? (
        <AdminState
          kind="error"
          message="Sipariş ayrıntısı alınamadı."
          onRetry={() => void detail.refetch()}
        />
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoBox label="Durum" value={statusLabels[data.order.status] ?? data.order.status} />
            <InfoBox label="Müşteri" value={data.order.customer_email} />
            <InfoBox label="Toplam" value={formatTry(data.order.grand_total_minor) ?? "—"} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-border/60 p-4">
              <h4 className="font-semibold text-primary-deep">Ürünler</h4>
              <div className="mt-3 divide-y divide-border/60">
                {data.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-medium">{formatTry(item.line_total_minor) ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 p-4">
              <h4 className="font-semibold text-primary-deep">Sorumlu çalışan</h4>
              <select
                className="mt-3 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                value={assignee}
                onChange={(event) => setAssignee(event.target.value)}
              >
                <option value="">Atanmamış</option>
                {staffMembers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 rounded-full"
                disabled={busy}
                onClick={() =>
                  void save({
                    assignmentAction: assignee ? "set" : "clear",
                    assignedTo: assignee || null,
                  })
                }
              >
                Atamayı kaydet
              </Button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border/60 p-4">
            <h4 className="font-semibold text-primary-deep">Durumu ilerlet</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              <select
                className="h-10 min-w-56 rounded-xl border border-input bg-background px-3 text-sm"
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value)}
              >
                <option value="">Sonraki durumu seçin</option>
                {(nextStatuses[data.order.status] ?? []).map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status] ?? status}
                  </option>
                ))}
              </select>
              <Button
                className="rounded-full"
                disabled={busy || !nextStatus}
                onClick={() => void save({ nextStatus })}
              >
                Durumu güncelle
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-border/60 p-4">
              <h4 className="font-semibold text-primary-deep">İç not ekle</h4>
              <Textarea
                className="mt-3"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={2000}
                placeholder="Bu not yalnızca çalışanlar tarafından görülür."
              />
              <Button
                className="mt-3 rounded-full"
                disabled={busy || note.trim().length < 2}
                onClick={() => void save({ note: note.trim() })}
              >
                Notu kaydet
              </Button>
              <div className="mt-4 space-y-2">
                {data.internalNotes.map((entry) => (
                  <div key={entry.id} className="rounded-xl bg-secondary/60 p-3 text-sm">
                    <p>{entry.body}</p>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString("tr-TR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 p-4">
              <h4 className="font-semibold text-primary-deep">Durum geçmişi</h4>
              <ol className="mt-3 space-y-3">
                {data.history.map((entry) => (
                  <li key={entry.id} className="border-l-2 border-primary/25 pl-3 text-sm">
                    <strong className="text-primary-deep">
                      {statusLabels[entry.to_status] ?? entry.to_status}
                    </strong>
                    <span className="block text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString("tr-TR")} · {entry.actor_type}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <strong className="mt-1 block truncate text-sm text-primary-deep">{value}</strong>
    </div>
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
