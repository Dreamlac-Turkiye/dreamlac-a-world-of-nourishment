import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Siren, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminState } from "@/components/admin/AdminState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  listAdminIncidents,
  saveAdminIncident,
  type AdminIncident,
} from "@/lib/admin-incidents.functions";
export function IncidentManagementSection() {
  const list = useServerFn(listAdminIncidents),
    save = useServerFn(saveAdminIncident);
  const q = useQuery({
    queryKey: ["admin", "incidents"],
    queryFn: () => list({ data: { market: "TR" } }),
  });
  const [edit, setEdit] = useState<AdminIncident | null | undefined>();
  const [f, setF] = useState({
    title: "",
    severity: "medium" as AdminIncident["severity"],
    status: "open" as AdminIncident["status"],
    description: "",
    note: "",
  });
  function open(x: AdminIncident | null) {
    setEdit(x);
    setF(
      x
        ? {
            title: x.title,
            severity: x.severity,
            status: x.status,
            description: x.description,
            note: "",
          }
        : { title: "", severity: "medium", status: "open", description: "", note: "" },
    );
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await save({ data: { id: edit?.id ?? null, market: "TR", ...f, note: f.note || null } });
      toast.success("Olay kaydedildi.");
      setEdit(undefined);
      void q.refetch();
    } catch {
      toast.error("Olay kaydedilemedi.");
    }
  }
  return (
    <section
      id="sistem"
      className="mt-10 scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6"
    >
      <div className="flex justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-primary-deep">
            <Siren className="text-primary" />
            Sistem sağlığı ve olaylar
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Kesinti ve operasyon sorunlarını kayıt altına alın.
          </p>
        </div>
        <Button size="sm" className="rounded-full" onClick={() => open(null)}>
          <Plus size={14} />
          Olay aç
        </Button>
      </div>
      {edit !== undefined ? (
        <form
          className="mt-5 grid gap-3 rounded-2xl bg-secondary/50 p-4 sm:grid-cols-2"
          onSubmit={submit}
        >
          <Input
            placeholder="Olay başlığı"
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
            required
          />
          <select
            className="h-10 rounded-xl border bg-background px-3"
            value={f.severity}
            onChange={(e) => setF({ ...f, severity: e.target.value as typeof f.severity })}
          >
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
            <option value="critical">Kritik</option>
          </select>
          <select
            className="h-10 rounded-xl border bg-background px-3"
            value={f.status}
            onChange={(e) => setF({ ...f, status: e.target.value as typeof f.status })}
          >
            <option value="open">Açık</option>
            <option value="investigating">İnceleniyor</option>
            <option value="monitoring">İzleniyor</option>
            <option value="resolved">Çözüldü</option>
          </select>
          <Input
            placeholder="Yeni güncelleme notu"
            value={f.note}
            onChange={(e) => setF({ ...f, note: e.target.value })}
          />
          <Textarea
            className="sm:col-span-2"
            placeholder="Açıklama ve etki"
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />
          <div className="flex gap-2 sm:col-span-2">
            <Button>Kaydet</Button>
            <Button type="button" variant="outline" onClick={() => setEdit(undefined)}>
              Vazgeç
            </Button>
          </div>
        </form>
      ) : null}
      <div className="mt-5 space-y-2">
        {q.isLoading ? (
          <AdminState kind="loading" message="Olay kayıtları yükleniyor…" />
        ) : q.isError ? (
          <AdminState
            kind="error"
            message="Olay kayıtları alınamadı."
            onRetry={() => void q.refetch()}
          />
        ) : q.data?.length ? (
          q.data.map((x) => (
            <button
              key={x.id}
              onClick={() => open(x)}
              className="flex w-full items-center justify-between rounded-2xl border p-4 text-left"
            >
              <span>
                <strong className="block text-primary-deep">{x.title}</strong>
                <small className="text-muted-foreground">
                  {x.source} · {new Date(x.updatedAt).toLocaleString("tr-TR")}
                </small>
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs ${x.severity === "critical" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}
              >
                {x.severity} · {x.status}
              </span>
            </button>
          ))
        ) : (
          <AdminState kind="empty" message="Açık operasyon olayı bulunmuyor." />
        )}
      </div>
    </section>
  );
}
