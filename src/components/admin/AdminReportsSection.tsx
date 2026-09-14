import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, CalendarRange, Download, RefreshCw } from "lucide-react";
import { AdminState } from "@/components/admin/AdminState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminReports, type AdminReport } from "@/lib/admin-reports.functions";

const today = () => new Date().toISOString().slice(0, 10);
const monthAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return d.toISOString().slice(0, 10);
};
const money = (value: number) =>
  `${(value / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`;

const previewReport: AdminReport = {
  fromDate: monthAgo(),
  toDate: today(),
  currency: "TRY",
  summary: {
    orders: 128,
    paidOrders: 113,
    revenueMinor: 18642000,
    discountMinor: 865000,
    newCustomers: 92,
    openTickets: 5,
    lowStock: 1,
  },
  daily: [
    { date: "2026-09-08", orders: 14, revenueMinor: 1948000 },
    { date: "2026-09-09", orders: 17, revenueMinor: 2336000 },
    { date: "2026-09-10", orders: 21, revenueMinor: 2984000 },
    { date: "2026-09-11", orders: 19, revenueMinor: 2761000 },
    { date: "2026-09-12", orders: 22, revenueMinor: 3149000 },
    { date: "2026-09-13", orders: 16, revenueMinor: 2411000 },
    { date: "2026-09-14", orders: 19, revenueMinor: 3053000 },
  ],
  statuses: [
    { status: "fulfilled", count: 68 },
    { status: "fulfilment_pending", count: 31 },
    { status: "paid", count: 14 },
    { status: "awaiting_payment", count: 10 },
    { status: "cancelled", count: 5 },
  ],
  products: [
    { sku: "DL-1-400", name: "Dreamlac 1", quantity: 64, revenueMinor: 7440000 },
    { sku: "DL-2-400", name: "Dreamlac 2", quantity: 58, revenueMinor: 6728000 },
    { sku: "DL-3-400", name: "Dreamlac 3", quantity: 41, revenueMinor: 4474000 },
  ],
  support: [
    { category: "order", count: 8 },
    { category: "delivery", count: 5 },
    { category: "product", count: 3 },
  ],
};

export function AdminReportsSection({ preview = false }: { preview?: boolean }) {
  const load = useServerFn(getAdminReports);
  const [range, setRange] = useState({ from: monthAgo(), to: today() });
  const validRange = range.from <= range.to;
  const query = useQuery({
    queryKey: ["admin", "reports", "TR", range],
    queryFn: () => load({ data: { market: "TR", fromDate: range.from, toDate: range.to } }),
    enabled: !preview && validRange,
  });
  const data = preview ? previewReport : query.data;
  function exportCsv() {
    if (!data) return;
    const rows = [
      ["Tarih", "Sipariş", "Ciro"],
      ...data.daily.map((x) => [x.date, String(x.orders), String(x.revenueMinor)]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dreamlac-rapor-${data.fromDate}-${data.toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section
      id="raporlar"
      className="mt-10 scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            <h2 className="text-xl font-semibold text-primary-deep">Yönetim raporları</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Satış, sipariş, ürün, stok ve destek performansını tek görünümde izleyin.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => void query.refetch()}
            disabled={preview}
          >
            <RefreshCw size={14} className="mr-2" />
            Yenile
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={exportCsv}
            disabled={!data}
          >
            <Download size={14} className="mr-2" />
            CSV
          </Button>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl bg-secondary/50 p-4">
        <CalendarRange size={18} className="mb-2.5 text-primary" />
        <DateField
          label="Başlangıç"
          value={range.from}
          onChange={(from) => setRange((r) => ({ ...r, from }))}
        />
        <DateField
          label="Bitiş"
          value={range.to}
          onChange={(to) => setRange((r) => ({ ...r, to }))}
        />
        {preview ? <span className="mb-2 text-xs text-amber-700">Örnek veri</span> : null}
      </div>
      {!validRange && !preview ? (
        <AdminState kind="error" message="Başlangıç tarihi bitiş tarihinden önce olmalıdır." />
      ) : query.isLoading && !preview ? (
        <AdminState kind="loading" message="Rapor hazırlanıyor…" />
      ) : query.isError && !preview ? (
        <AdminState
          kind="error"
          message="Rapor alınamadı."
          onRetry={() => void query.refetch()}
        />
      ) : data ? (
        <ReportBody data={data} />
      ) : (
        <AdminState kind="empty" message="Seçilen tarih aralığında rapor verisi bulunmuyor." />
      )
    </section>
  );
}
function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type="date"
        value={value}
        max={today()}
        onChange={(e) => onChange(e.target.value)}
        className="w-44"
      />
    </div>
  );
}
function ReportBody({ data }: { data: AdminReport }) {
  const cards = [
    ["Toplam sipariş", data.summary.orders.toLocaleString("tr-TR")],
    ["Ödenen sipariş", data.summary.paidOrders.toLocaleString("tr-TR")],
    ["Net satış", money(data.summary.revenueMinor)],
    ["Toplam indirim", money(data.summary.discountMinor)],
    ["Yeni müşteri", data.summary.newCustomers.toLocaleString("tr-TR")],
    ["Açık destek", String(data.summary.openTickets)],
    ["Düşük stok", String(data.summary.lowStock)],
  ];
  const max = Math.max(1, ...data.daily.map((x) => x.revenueMinor));
  return (
    <>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border/60 p-4">
            <span className="text-xs text-muted-foreground">{label}</span>
            <strong className="mt-2 block text-xl text-primary-deep">{value}</strong>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border/60 p-4">
          <h3 className="font-semibold text-primary-deep">Günlük satış eğilimi</h3>
          <div className="mt-5 flex h-48 items-end gap-2">
            {data.daily.slice(-14).map((x) => (
              <div
                key={x.date}
                className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] text-muted-foreground">{money(x.revenueMinor)}</span>
                <div
                  className="w-full rounded-t-lg bg-primary/75"
                  style={{ height: `${Math.max(5, (x.revenueMinor / max) * 130)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{x.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 p-4">
          <h3 className="font-semibold text-primary-deep">Sipariş durumları</h3>
          <div className="mt-4 space-y-3">
            {data.statuses.map((x) => (
              <div key={x.status} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{x.status}</span>
                <strong>{x.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ReportTable
          title="Ürün performansı"
          headers={["Ürün", "Adet", "Ciro"]}
          rows={data.products.map((x) => [
            `${x.name} · ${x.sku}`,
            String(x.quantity),
            money(x.revenueMinor),
          ])}
        />
        <ReportTable
          title="Destek kategorileri"
          headers={["Kategori", "Talep"]}
          rows={data.support.map((x) => [x.category, String(x.count)])}
        />
      </div>
    </>
  );
}
function ReportTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 p-4">
      <h3 className="font-semibold text-primary-deep">{title}</h3>
      <table className="mt-3 w-full text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr>
            {headers.map((h) => (
              <th key={h} className="pb-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, i) => (
              <tr key={i} className="border-t border-border/50">
                {row.map((cell, j) => (
                  <td key={j} className="py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="py-4 text-muted-foreground">
                Veri bulunmuyor.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
