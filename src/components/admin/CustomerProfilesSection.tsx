import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminState } from "@/components/admin/AdminState";
import { Input } from "@/components/ui/input";
import {
  getAdminCustomer360,
  searchAdminCustomers,
  type AdminCustomerDetail,
} from "@/lib/admin-customers.functions";
import { formatTry } from "@/services/checkout";

export function CustomerProfilesSection() {
  const search = useServerFn(searchAdminCustomers),
    readDetail = useServerFn(getAdminCustomer360);
  const [query, setQuery] = useState(""),
    [submitted, setSubmitted] = useState(""),
    [offset, setOffset] = useState(0),
    [selected, setSelected] = useState<string | null>(null);
  const customers = useQuery({
    queryKey: ["admin", "customers", submitted, offset],
    queryFn: () => search({ data: { query: submitted, offset } }),
  });
  const detail = useQuery({
    queryKey: ["admin", "customer", selected],
    queryFn: () => readDetail({ data: { userId: selected! } }),
    enabled: Boolean(selected),
  });
  return (
    <section className="mt-10 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex items-center gap-2">
        <UserRound size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-primary-deep">Müşteri 360°</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Hesap, sipariş, adres, onay ve destek geçmişini tek müşteri kaydında inceleyin.
      </p>
      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setOffset(0);
          setSubmitted(query.trim());
        }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad, e-posta veya telefon ile ara"
          maxLength={200}
        />
        <Button type="submit" variant="outline" className="rounded-full">
          <Search size={14} className="mr-2" />
          Ara
        </Button>
      </form>
      {customers.isLoading ? (
        <AdminState kind="loading" message="Müşteriler yükleniyor…" />
      ) : customers.isError ? (
        <AdminState kind="error" message="Müşteri listesi alınamadı." onRetry={() => void customers.refetch()} />
      ) : (
        <>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {customers.data?.items.length ? customers.data.items.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`rounded-2xl border p-4 text-left transition-colors ${selected === c.id ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"}`}
              >
                <strong className="block truncate text-sm text-primary-deep">
                  {c.fullName || c.email || "İsimsiz müşteri"}
                </strong>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {c.email} · {c.phone || "Telefon yok"}
                </span>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <Metric label="Sipariş" value={String(c.orderCount)} />
                  <Metric label="Toplam değer" value={formatTry(c.lifetimeValueMinor) ?? "₺0"} />
                  <Metric label="Açık destek" value={String(c.openTicketCount)} />
                </div>
              </button>
            )) : <AdminState kind="empty" message="Bu arama ile eşleşen müşteri bulunamadı." />}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{customers.data?.total ?? 0} müşteri</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - 25))}
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={offset + 25 >= (customers.data?.total ?? 0)}
                onClick={() => setOffset(offset + 25)}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </>
      )}
      {selected ? (
        <div className="mt-6 border-t border-border/60 pt-6">
          {detail.isLoading ? (
            <AdminState kind="loading" message="Müşteri dosyası hazırlanıyor…" />
          ) : detail.isError ? (
            <AdminState
              kind="error"
              message="Müşteri dosyası alınamadı."
              onRetry={() => void detail.refetch()}
            />
          ) : detail.data ? (
            <CustomerDetail data={detail.data} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl bg-secondary/60 p-2">
      <strong className="block text-primary-deep">{value}</strong>
      {label}
    </span>
  );
}
function CustomerDetail({ data }: { data: AdminCustomerDetail }) {
  return (
    <div>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-primary-deep">
            {data.profile?.fullName || data.email}
          </h3>
          <p className="text-xs text-muted-foreground">
            {data.email} · {data.profile?.phone || "Telefon yok"}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs">
          Pazarlama: {data.marketing?.status ?? "onay yok"}
        </span>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <DetailGroup title={`Adresler (${data.addresses.length})`}>
          {data.addresses.length ? (
            data.addresses.map((a) => (
              <p key={a.id} className="text-sm">
                <strong>{a.label || "Adres"}</strong> · {a.recipientName}
                <span className="block text-xs text-muted-foreground">
                  {Object.values(a.address).filter(Boolean).join(", ")}
                </span>
              </p>
            ))
          ) : (
            <Empty />
          )}
        </DetailGroup>
        <DetailGroup title={`Son siparişler (${data.orders.length})`}>
          {data.orders.length ? (
            data.orders.map((o) => (
              <p key={o.orderNumber} className="flex justify-between gap-3 text-sm">
                <span>
                  <strong>{o.orderNumber}</strong> · {o.status}
                  <small className="block text-muted-foreground">
                    Sözleşme {o.termsVersion} · Gizlilik {o.privacyVersion}
                  </small>
                </span>
                <strong>{formatTry(o.grandTotalMinor) ?? "—"}</strong>
              </p>
            ))
          ) : (
            <Empty />
          )}
        </DetailGroup>
        <DetailGroup title={`İptal / iade (${data.serviceRequests.length})`}>
          {data.serviceRequests.length ? (
            data.serviceRequests.map((r) => (
              <p key={r.id} className="text-sm">
                <strong>{r.orderNumber}</strong> · {r.requestType} · {r.status}
                <span className="block text-xs text-muted-foreground">{r.reason}</span>
              </p>
            ))
          ) : (
            <Empty />
          )}
        </DetailGroup>
        <DetailGroup title={`Destek geçmişi (${data.tickets.length})`}>
          {data.tickets.length ? (
            data.tickets.map((t) => (
              <p key={t.ticketNumber} className="text-sm">
                <strong>{t.ticketNumber}</strong> · {t.subject}
                <span className="block text-xs text-muted-foreground">
                  {t.priority} · {t.status}
                </span>
              </p>
            ))
          ) : (
            <Empty />
          )}
        </DetailGroup>
      </div>
    </div>
  );
}
function DetailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-border/60 p-4">
      <h4 className="mb-3 text-sm font-semibold text-primary-deep">{title}</h4>
      <div className="space-y-3">{children}</div>
    </article>
  );
}
function Empty() {
  return <p className="text-sm text-muted-foreground">Kayıt bulunmuyor.</p>;
}
