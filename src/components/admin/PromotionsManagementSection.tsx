import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BadgePercent, Pencil, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminState } from "@/components/admin/AdminState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listAdminPromotions,
  saveAdminPromotion,
  type AdminPromotion,
} from "@/lib/admin-promotions.functions";

const money = (minor: number) =>
  `${(minor / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`;
const localInput = (value: Date) =>
  new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export function PromotionsManagementSection() {
  const list = useServerFn(listAdminPromotions);
  const query = useQuery({
    queryKey: ["admin", "promotions", "TR"],
    queryFn: () => list({ data: { market: "TR" } }),
  });
  const [editing, setEditing] = useState<AdminPromotion | null | undefined>(undefined);
  return (
    <section className="mt-10 scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BadgePercent size={20} className="text-primary" />
            <h2 className="text-xl font-semibold text-primary-deep">Kampanya ve kuponlar</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Türkiye pazarı için süre, kullanım sınırı ve minimum sepet kuralları tanımlayın.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => void query.refetch()}
          >
            <RefreshCw size={14} className="mr-2" />
            Yenile
          </Button>
          <Button size="sm" className="rounded-full" onClick={() => setEditing(null)}>
            <Plus size={14} className="mr-2" />
            Yeni kampanya
          </Button>
        </div>
      </div>
      {editing !== undefined ? (
        <PromotionForm
          value={editing}
          onCancel={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            void query.refetch();
          }}
        />
      ) : null}
      {query.isLoading ? (
        <AdminState kind="loading" message="Kampanyalar yükleniyor…" />
      ) : query.isError ? (
        <AdminState
          kind="error"
          message="Kampanyalar alınamadı."
          onRetry={() => void query.refetch()}
        />
      ) : query.data?.length ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {query.data.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border/60 p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary-deep">
                    {item.code}
                  </span>
                  <h3 className="mt-3 font-semibold text-primary-deep">{item.name}</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditing(item)}>
                  <Pencil size={14} />
                  <span className="sr-only">Düzenle</span>
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>
                  İndirim:{" "}
                  <strong className="text-foreground">
                    {item.discountType === "percentage"
                      ? `%${item.discountValue / 100}`
                      : money(item.discountValue)}
                  </strong>
                </span>
                <span>
                  Kullanım:{" "}
                  <strong className="text-foreground">
                    {item.usageCount}
                    {item.totalUsageLimit ? ` / ${item.totalUsageLimit}` : ""}
                  </strong>
                </span>
                <span>
                  Alt sepet:{" "}
                  <strong className="text-foreground">{money(item.minimumSubtotalMinor)}</strong>
                </span>
                <span className={item.active ? "text-emerald-700" : "text-muted-foreground"}>
                  {item.active ? "Aktif" : "Pasif"}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(item.startsAt).toLocaleString("tr-TR")} –{" "}
                {new Date(item.endsAt).toLocaleString("tr-TR")}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <AdminState kind="empty" message="Henüz kampanya tanımlanmadı." />
      )}
    </section>
  );
}

function PromotionForm({
  value,
  onCancel,
  onSaved,
}: {
  value: AdminPromotion | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const save = useServerFn(saveAdminPromotion);
  const now = new Date();
  const later = new Date(now.getTime() + 30 * 86400000);
  const [form, setForm] = useState({
    code: value?.code ?? "",
    name: value?.name ?? "",
    discountType: value?.discountType ?? ("percentage" as "percentage" | "fixed"),
    discount: value
      ? String(
          value.discountType === "percentage"
            ? value.discountValue / 100
            : value.discountValue / 100,
        )
      : "",
    minimum: value ? String(value.minimumSubtotalMinor / 100) : "0",
    maximum: value?.maximumDiscountMinor ? String(value.maximumDiscountMinor / 100) : "",
    totalLimit: value?.totalUsageLimit ? String(value.totalUsageLimit) : "",
    customerLimit: String(value?.perCustomerLimit ?? 1),
    startsAt: localInput(value ? new Date(value.startsAt) : now),
    endsAt: localInput(value ? new Date(value.endsAt) : later),
    active: value?.active ?? false,
  });
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form, next: string | boolean) =>
    setForm((current) => ({ ...current, [key]: next }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const discount = Number(form.discount.replace(",", ".")),
      minimum = Number(form.minimum.replace(",", ".")),
      maximum = form.maximum ? Number(form.maximum.replace(",", ".")) : null,
      total = form.totalLimit ? Number(form.totalLimit) : null,
      customer = Number(form.customerLimit),
      startsAt = new Date(form.startsAt),
      endsAt = new Date(form.endsAt);
    if (
      !form.code.trim() ||
      !form.name.trim() ||
      !Number.isFinite(discount) ||
      discount <= 0 ||
      (form.discountType === "percentage" && discount > 100) ||
      !Number.isFinite(minimum) ||
      minimum < 0 ||
      (maximum !== null && (!Number.isFinite(maximum) || maximum < 0)) ||
      (total !== null && (!Number.isInteger(total) || total < 1)) ||
      !Number.isInteger(customer) ||
      customer < 1 ||
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime()) ||
      endsAt <= startsAt
    ) {
      toast.error("Kod, tutar ve tarihleri kontrol edin. Yüzde indirimi %100'ü geçemez.");
      return;
    }
    setBusy(true);
    try {
      await save({
        data: {
          id: value?.id ?? null,
          market: "TR",
          code: form.code.toUpperCase(),
          name: form.name,
          discountType: form.discountType,
          discountValue:
            form.discountType === "percentage"
              ? Math.round(discount * 100)
              : Math.round(discount * 100),
          minimumSubtotalMinor: Math.round(minimum * 100),
          maximumDiscountMinor: maximum === null ? null : Math.round(maximum * 100),
          totalUsageLimit: total,
          perCustomerLimit: customer,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          active: form.active,
        },
      });
      toast.success("Kampanya kaydedildi.");
      onSaved();
    } catch {
      toast.error("Kampanya kaydedilemedi. Kod ve tarihleri kontrol edin.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Kupon kodu">
          <Input
            value={form.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            maxLength={32}
            required
          />
        </Field>
        <Field label="Kampanya adı">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={120}
            required
          />
        </Field>
        <Field label="İndirim türü">
          <select
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            value={form.discountType}
            onChange={(e) => set("discountType", e.target.value)}
          >
            <option value="percentage">Yüzde</option>
            <option value="fixed">Sabit tutar</option>
          </select>
        </Field>
        <Field label={form.discountType === "percentage" ? "İndirim (%)" : "İndirim (₺)"}>
          <Input
            inputMode="decimal"
            value={form.discount}
            onChange={(e) => set("discount", e.target.value)}
            required
          />
        </Field>
        <Field label="Minimum sepet (₺)">
          <Input
            inputMode="decimal"
            value={form.minimum}
            onChange={(e) => set("minimum", e.target.value)}
            required
          />
        </Field>
        <Field label="Azami indirim (₺)">
          <Input
            inputMode="decimal"
            value={form.maximum}
            onChange={(e) => set("maximum", e.target.value)}
            placeholder="Sınırsız"
          />
        </Field>
        <Field label="Toplam kullanım limiti">
          <Input
            type="number"
            min="1"
            value={form.totalLimit}
            onChange={(e) => set("totalLimit", e.target.value)}
            placeholder="Sınırsız"
          />
        </Field>
        <Field label="Müşteri başına">
          <Input
            type="number"
            min="1"
            max="100"
            value={form.customerLimit}
            onChange={(e) => set("customerLimit", e.target.value)}
            required
          />
        </Field>
        <Field label="Başlangıç">
          <Input
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => set("startsAt", e.target.value)}
            required
          />
        </Field>
        <Field label="Bitiş">
          <Input
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => set("endsAt", e.target.value)}
            required
          />
        </Field>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="size-4"
          />
          Satışta aktif
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="submit" className="rounded-full" disabled={busy}>
          {busy ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onCancel}>
          Vazgeç
        </Button>
      </div>
    </form>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
