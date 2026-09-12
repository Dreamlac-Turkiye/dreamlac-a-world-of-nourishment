import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listAdminUsers, setAdminUserRole, type AppRole } from "@/lib/admin-users.functions";

const roleLabels: Record<AppRole, string> = {
  admin: "Yönetici",
  editor: "Editör",
  user: "Müşteri",
};

export function UserManagementSection() {
  const readUsers = useServerFn(listAdminUsers);
  const updateRole = useServerFn(setAdminUserRole);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const users = useQuery({
    queryKey: ["admin", "users", submittedQuery],
    queryFn: () => readUsers({ data: { query: submittedQuery } }),
  });

  async function toggleRole(userId: string, role: AppRole, enabled: boolean) {
    if (role === "admin" && enabled) {
      const confirmed = window.confirm(
        "Bu kullanıcı tüm yönetim yetkilerine sahip olacak. Devam etmek istiyor musunuz?",
      );
      if (!confirmed) return;
    }

    const key = `${userId}:${role}`;
    setBusyKey(key);
    try {
      await updateRole({ data: { userId, role, enabled } });
      toast.success("Kullanıcı rolü güncellendi.");
      await users.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message.includes("CANNOT_REMOVE")
          ? "Kendi yönetici rolünüzü veya son yöneticiyi kaldıramazsınız."
          : "Kullanıcı rolü güncellenemedi.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <section className="mt-10 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex items-center gap-2">
        <Users size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-primary-deep">Kullanıcı yönetimi</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Kayıtlı hesapları görüntüleyin ve en az ayrıcalık ilkesiyle rollerini yönetin.
      </p>

      <form
        className="mt-5 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query.trim());
        }}
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="E-posta ile kullanıcı ara"
          maxLength={200}
        />
        <Button type="submit" variant="outline" className="rounded-full">
          <Search size={15} className="mr-2" /> Ara
        </Button>
      </form>

      {users.isLoading ? (
        <p className="mt-5 text-sm text-muted-foreground">Kullanıcılar yükleniyor…</p>
      ) : users.isError ? (
        <p className="mt-5 text-sm text-destructive">Kullanıcı listesi alınamadı.</p>
      ) : users.data?.length ? (
        <div className="mt-5 space-y-3">
          {users.data.map((user) => (
            <article key={user.id} className="rounded-2xl border border-border/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-sm text-primary-deep">{user.email}</strong>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR")} · Son giriş:{" "}
                    {user.lastSignInAt
                      ? new Date(user.lastSignInAt).toLocaleString("tr-TR")
                      : "Henüz yok"}
                  </span>
                </div>
                {user.emailConfirmedAt ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
                    <ShieldCheck size={13} /> Doğrulandı
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-800">
                    Doğrulanmadı
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(["admin", "editor", "user"] as const).map((role) => {
                  const enabled = user.roles.includes(role);
                  const key = `${user.id}:${role}`;
                  return (
                    <Button
                      key={role}
                      type="button"
                      size="sm"
                      variant={enabled ? "default" : "outline"}
                      className="rounded-full"
                      disabled={busyKey !== null}
                      aria-pressed={enabled}
                      onClick={() => void toggleRole(user.id, role, !enabled)}
                    >
                      {busyKey === key ? "Kaydediliyor…" : roleLabels[role]}
                    </Button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">Eşleşen kullanıcı bulunamadı.</p>
      )}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Güvenlik: Son yönetici ve kendi yönetici rolünüz kaldırılamaz. Tüm rol değişiklikleri
        denetim kaydına yazılır.
      </p>
    </section>
  );
}
