import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  PackageCheck,
  ShoppingCart,
  UserRoundPlus,
} from "lucide-react";
import { getDashboardSummary } from "@/lib/operations.functions";
import { formatTry } from "@/services/checkout";

const statusLabels: Record<string, string> = {
  awaiting_payment: "Ödeme bekliyor",
  payment_processing: "Ödeme işleniyor",
  paid: "Ödendi",
  fulfilment_pending: "Hazırlanıyor",
  fulfilled: "Tamamlandı",
  cancelled: "İptal",
  refunded: "İade",
  failed: "Başarısız",
};

export function AdminOverviewSection() {
  const readSummary = useServerFn(getDashboardSummary);
  const summary = useQuery({
    queryKey: ["admin", "dashboard-summary", "TR"],
    queryFn: () => readSummary({ data: { market: "TR" } }),
    refetchInterval: 60_000,
  });

  if (summary.isLoading) {
    return (
      <section id="genel-bakis" className="mt-8 rounded-[1.75rem] border bg-card p-6">
        <p className="text-sm text-muted-foreground">Operasyon özeti hazırlanıyor…</p>
      </section>
    );
  }

  if (summary.isError || !summary.data) {
    return (
      <section
        id="genel-bakis"
        className="mt-8 rounded-[1.75rem] border border-destructive/25 bg-card p-6"
      >
        <p className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle size={16} /> Operasyon özeti alınamadı.
        </p>
      </section>
    );
  }

  const data = summary.data;
  const attentionTotal = Object.values(data.attention).reduce((total, value) => total + value, 0);

  return (
    <section id="genel-bakis" className="mt-8 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Bugün</p>
          <h2 className="mt-2 text-2xl font-semibold text-primary-deep">Operasyon özeti</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Son güncelleme: {new Date(data.generatedAt).toLocaleTimeString("tr-TR")}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard icon={ShoppingCart} label="Sipariş" value={String(data.today.orders)} />
        <OverviewCard
          icon={CircleDollarSign}
          label="Onaylı ciro"
          value={formatTry(data.today.revenueMinor) ?? "₺0,00"}
        />
        <OverviewCard
          icon={UserRoundPlus}
          label="Yeni müşteri"
          value={String(data.today.newCustomers)}
        />
        <OverviewCard
          icon={AlertTriangle}
          label="İlgilenilecek"
          value={String(attentionTotal)}
          warning={attentionTotal > 0}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <article className="rounded-[1.5rem] border border-border/70 bg-card p-5">
          <h3 className="font-semibold text-primary-deep">İş kuyruğu</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <QueueItem label="Ödeme bekleyen" value={data.attention.awaitingPayment} />
            <QueueItem label="Hazırlanacak" value={data.attention.toFulfil} />
            <QueueItem label="İptal / iade" value={data.attention.openRequests} />
            <QueueItem label="Düşük stok" value={data.attention.lowStock} />
          </div>
          {data.attention.failedOperations > 0 ? (
            <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {data.attention.failedOperations} teknik işlem kontrol bekliyor.
            </p>
          ) : (
            <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              Kritik teknik hata görünmüyor.
            </p>
          )}
        </article>

        <article className="rounded-[1.5rem] border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-primary-deep">Son siparişler</h3>
            <a href="#operasyonlar" className="flex items-center gap-1 text-xs text-primary-deep">
              Tümünü incele <ArrowRight size={13} />
            </a>
          </div>
          {data.recentOrders.length ? (
            <div className="mt-3 divide-y divide-border/60">
              {data.recentOrders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="grid grid-cols-[1fr_auto] gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <strong className="block text-primary-deep">{order.orderNumber}</strong>
                    <span className="block truncate text-xs text-muted-foreground">
                      {order.customerEmail} · {statusLabels[order.status] ?? order.status}
                    </span>
                  </div>
                  <span className="font-medium text-primary-deep">
                    {formatTry(order.grandTotalMinor) ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Henüz sipariş bulunmuyor.</p>
          )}
        </article>
      </div>
    </section>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  warning = false,
}: {
  icon: typeof PackageCheck;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <article
      className={`rounded-[1.5rem] border p-5 ${warning ? "border-amber-300 bg-amber-50" : "border-border/70 bg-card"}`}
    >
      <Icon size={19} className={warning ? "text-amber-700" : "text-primary"} />
      <p className="mt-4 text-xs text-muted-foreground">{label}</p>
      <strong className="mt-1 block text-2xl font-semibold text-primary-deep">{value}</strong>
    </article>
  );
}

function QueueItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <strong className="text-xl text-primary-deep">{value}</strong>
      <span className="mt-1 block text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
