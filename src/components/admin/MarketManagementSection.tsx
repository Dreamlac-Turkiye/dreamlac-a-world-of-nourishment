import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Globe2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listAdminMarkets,
  updateAdminMarket,
  type AdminMarket,
} from "@/lib/admin-markets.functions";
export function MarketManagementSection() {
  const list = useServerFn(listAdminMarkets);
  const q = useQuery({ queryKey: ["admin", "markets"], queryFn: () => list() });
  return (
    <section
      id="pazarlar"
      className="mt-10 scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6"
    >
      <h2 className="flex items-center gap-2 text-xl font-semibold text-primary-deep">
        <Globe2 className="text-primary" />
        Ülke ve pazar şablonları
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Her ülkenin alan adı, dili, para birimi ve yayın durumu ayrı tutulur.
      </p>
      <div className="mt-5 space-y-4">
        {q.data?.map((x) => (
          <MarketCard key={x.id} market={x} saved={() => void q.refetch()} />
        ))}
        {q.isLoading ? <p className="text-sm text-muted-foreground">Pazarlar yükleniyor…</p> : null}
      </div>
    </section>
  );
}
function MarketCard({ market, saved }: { market: AdminMarket; saved: () => void }) {
  const update = useServerFn(updateAdminMarket);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await update({
        data: {
          code: market.code,
          name: String(fd.get("name")),
          domain: String(fd.get("domain")),
          defaultLocale: String(fd.get("locale")),
          supportedLocales: String(fd.get("locales"))
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          timezone: String(fd.get("timezone")),
          enabled: fd.get("enabled") === "on",
        },
      });
      toast.success(`${market.code} pazarı güncellendi.`);
      saved();
    } catch {
      toast.error("Pazar güncellenemedi. Canlı satış açıksa önce kapatın.");
    }
  }
  return (
    <form onSubmit={submit} className="rounded-2xl border border-border/60 p-4">
      <div className="flex justify-between">
        <strong className="text-primary-deep">
          {market.code} · {market.currency}
        </strong>
        <span
          className={`text-xs ${market.enabled ? "text-emerald-700" : "text-muted-foreground"}`}
        >
          {market.enabled ? "Etkin" : "Kapalı"}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input name="name" defaultValue={market.name} aria-label="Pazar adı" />
        <Input name="domain" defaultValue={market.domain} aria-label="Alan adı" />
        <Input name="locale" defaultValue={market.defaultLocale} aria-label="Varsayılan dil" />
        <Input
          name="locales"
          defaultValue={market.supportedLocales.join(", ")}
          aria-label="Desteklenen diller"
        />
        <Input name="timezone" defaultValue={market.timezone} aria-label="Saat dilimi" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input name="enabled" type="checkbox" defaultChecked={market.enabled} />
          Pazarı etkinleştir
        </label>
        <Button size="sm" className="rounded-full">
          Kaydet
        </Button>
      </div>
    </form>
  );
}
