import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, CircleAlert, Rocket } from "lucide-react";
import { toast } from "sonner";
import { AdminState } from "@/components/admin/AdminState";
import { Button } from "@/components/ui/button";
import {
  getLaunchReadiness,
  setCheckoutEnabled,
  type LaunchReadiness,
} from "@/lib/admin-launch.functions";
const demo: LaunchReadiness = {
  market: "TR",
  ready: false,
  checkoutEnabled: false,
  checkedAt: new Date().toISOString(),
  checks: [
    { key: "company", label: "Şirket ve vergi bilgileri", ready: false },
    { key: "catalog", label: "Ürün fiyatları ve yayın durumu", ready: false },
    { key: "inventory", label: "Satılabilir depo stoğu", ready: true },
    { key: "legal", label: "Zorunlu sözleşme onayları", ready: false },
    { key: "payment", label: "Canlı ödeme sağlayıcısı", ready: false },
    { key: "cargo", label: "Canlı kargo sağlayıcısı", ready: false },
    { key: "invoice", label: "Canlı fatura sağlayıcısı", ready: false },
  ],
};
export function LaunchReadinessSection({ preview = false }: { preview?: boolean }) {
  const read = useServerFn(getLaunchReadiness),
    toggle = useServerFn(setCheckoutEnabled);
  const q = useQuery({
    queryKey: ["admin", "launch", "TR"],
    queryFn: () => read({ data: { market: "TR" } }),
    enabled: !preview,
  });
  const data = preview ? demo : q.data;
  async function change() {
    if (!data) return;
    try {
      await toggle({ data: { market: "TR", enabled: !data.checkoutEnabled } });
      toast.success(data.checkoutEnabled ? "Satış durduruldu." : "Satış etkinleştirildi.");
      void q.refetch();
    } catch {
      toast.error("Eksik gereksinimler tamamlanmadan satış açılamaz.");
    }
  }
  return (
    <section
      id="lansman"
      className="mt-10 scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6"
    >
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-primary-deep">
            <Rocket className="text-primary" />
            Yayına hazırlık merkezi
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Canlı satış açılmadan önce zorunlu işletme kontrolleri.
          </p>
        </div>
        {data ? (
          <span
            className={`h-fit rounded-full px-3 py-1.5 text-xs font-semibold ${data.ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
          >
            {data.ready ? "Yayına hazır" : "Hazırlık sürüyor"}
          </span>
        ) : null}
      </div>
      {q.isLoading && !preview ? (
        <AdminState kind="loading" message="Kontroller çalıştırılıyor…" />
      ) : q.isError && !preview ? (
        <AdminState
          kind="error"
          message="Yayına hazırlık kontrolleri alınamadı."
          onRetry={() => void q.refetch()}
        />
      ) : data ? (
        <>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {data.checks.map((c) => (
              <div
                key={c.key}
                className="flex items-center gap-3 rounded-2xl border border-border/60 p-3"
              >
                {c.ready ? (
                  <CheckCircle2 className="text-emerald-600" size={19} />
                ) : (
                  <CircleAlert className="text-amber-600" size={19} />
                )}
                <span className="text-sm">{c.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Satış durumu: <strong>{data.checkoutEnabled ? "Açık" : "Kapalı"}</strong>
            </p>
            {!preview ? (
              <Button
                className="rounded-full"
                variant={data.checkoutEnabled ? "destructive" : "default"}
                disabled={(!data.ready && !data.checkoutEnabled) || q.isFetching}
                onClick={() => void change()}
              >
                {q.isFetching ? "İşleniyor…" : data.checkoutEnabled ? "Satışı güvenle durdur" : "Canlı satışı etkinleştir"}
              </Button>
            ) : (
              <span className="text-xs text-amber-700">Önizleme — işlem kapalı</span>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
