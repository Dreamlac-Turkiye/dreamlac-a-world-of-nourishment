import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminState } from "@/components/admin/AdminState";
import { listAdminAuditEvents } from "@/lib/admin-audit.functions";

export function AdminAuditLogSection() {
  const load = useServerFn(listAdminAuditEvents);
  const query = useQuery({
    queryKey: ["admin", "audit-events"],
    queryFn: () => load({ data: { limit: 50 } }),
  });

  return (
    <section
      id="denetim"
      className="mt-10 scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6"
    >
      <h2 className="text-xl font-semibold text-primary-deep">İşlem geçmişi</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Ürün, entegrasyon ve yasal belge değişiklikleri burada zaman sırasıyla izlenir.
      </p>
      <div className="mt-5 overflow-x-auto">
        {query.isLoading ? (
          <AdminState kind="loading" message="İşlem geçmişi yükleniyor…" />
        ) : query.isError ? (
          <AdminState
            kind="error"
            message="İşlem geçmişi alınamadı."
            onRetry={() => void query.refetch()}
          />
        ) : query.data?.length ? (
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="border-b border-border/70 text-xs text-muted-foreground">
              <tr>
                <th className="pb-3">Zaman</th>
                <th className="pb-3">İşlem</th>
                <th className="pb-3">Kaynak</th>
                <th className="pb-3">Kayıt</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((event) => (
                <tr key={event.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 whitespace-nowrap">
                    {new Date(event.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td className="py-3 font-medium text-primary-deep">{event.action}</td>
                  <td className="py-3">{event.tableName}</td>
                  <td className="py-3 font-mono text-xs">{event.recordId ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <AdminState kind="empty" message="Henüz kayıtlı bir işlem yok." />
        )}
      </div>
    </section>
  );
}
