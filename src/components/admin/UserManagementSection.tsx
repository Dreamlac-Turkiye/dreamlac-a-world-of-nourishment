import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, ShieldCheck, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { AdminState } from "@/components/admin/AdminState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  inviteStaffUser,
  listAdminUsers,
  setAdminStaffRole,
  setAdminUserRole,
  type AppRole,
  type StaffRole,
} from "@/lib/admin-users.functions";

const roleLabels: Record<AppRole, string> = {
  admin: "Yönetici",
  editor: "Editör",
  user: "Müşteri",
};

const staffRoleLabels: Record<StaffRole, string> = {
  owner: "İşletme sahibi",
  general_manager: "Genel müdür",
  store_manager: "Mağaza müdürü",
  order_agent: "Sipariş görevlisi",
  warehouse_agent: "Depo görevlisi",
  customer_support: "Müşteri hizmetleri",
  accountant: "Muhasebe",
  content_manager: "İçerik yöneticisi",
  compliance_officer: "Uyum sorumlusu",
  system_admin: "Sistem yöneticisi",
  report_viewer: "Rapor görüntüleyici",
};

export function UserManagementSection() {
  const readUsers = useServerFn(listAdminUsers);
  const updateRole = useServerFn(setAdminUserRole);
  const updateStaffRole = useServerFn(setAdminStaffRole);
  const inviteStaff = useServerFn(inviteStaffUser);
  const [query, setQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<StaffRole>("order_agent");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const users = useQuery({
    queryKey: ["admin", "users", submittedQuery],
    queryFn: () => readUsers({ data: { query: submittedQuery } }),
  });

  async function inviteEmployee(event: React.FormEvent) {
    event.preventDefault();
    if (!window.confirm(`${inviteEmail} adresine çalışan daveti gönderilsin mi?`)) return;
    setBusyKey("invite");
    try {
      await inviteStaff({ data: { email: inviteEmail, staffRole: inviteRole } });
      toast.success("Çalışan daveti gönderildi ve görevi hazırlandı.");
      setInviteEmail("");
      await users.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message.toLowerCase().includes("registered") || message.toLowerCase().includes("exists")
          ? "Bu e-posta adresiyle kayıtlı bir hesap zaten var."
          : "Çalışan daveti gönderilemedi.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function toggleRole(userId: string, role: AppRole, enabled: boolean) {
    if (!enabled) {
      const confirmed = window.confirm("Bu rol kaldırılacak ve ilgili yetkiler hemen kapanacak. Devam edilsin mi?");
      if (!confirmed) return;
    }
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

  async function changeStaffRole(userId: string, staffRole: StaffRole, active = true) {
    if (
      staffRole === "owner" &&
      !window.confirm("Bu kullanıcı işletme sahibi yetkisine sahip olacak. Devam edilsin mi?")
    )
      return;
    setBusyKey(`${userId}:staff`);
    try {
      await updateStaffRole({ data: { userId, staffRole, active } });
      toast.success("Çalışan görevi ve yetkileri güncellendi.");
      await users.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message.includes("PROTECTED_OWNER")
          ? "Korunan işletme sahibi görevi kaldırılamaz."
          : "Çalışan görevi güncellenemedi.",
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
        className="mt-5 rounded-2xl border border-primary/15 bg-secondary/35 p-4"
        onSubmit={(event) => void inviteEmployee(event)}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-primary-deep">
          <UserPlus size={17} /> Yeni çalışan davet et
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Çalışana güvenli bir katılım bağlantısı gönderilir; seçilen görev davet sırasında atanır.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.6fr)_auto]">
          <Input
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            aria-label="Çalışan e-posta adresi"
            placeholder="calisan@dreamlac.com.tr"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
          />
          <select
            aria-label="Çalışan görevi"
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as StaffRole)}
          >
            {Object.entries(staffRoleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit" className="rounded-full" disabled={busyKey !== null}>
            {busyKey === "invite" ? "Gönderiliyor…" : "Davet gönder"}
          </Button>
        </div>
      </form>

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
        <AdminState kind="loading" message="Kullanıcılar yükleniyor…" />
      ) : users.isError ? (
        <AdminState
          kind="error"
          message="Kullanıcı listesi alınamadı."
          onRetry={() => void users.refetch()}
        />
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
              <div className="mt-4 border-t border-border/60 pt-4">
                <label
                  className="text-xs font-medium text-muted-foreground"
                  htmlFor={`staff-${user.id}`}
                >
                  Çalışan görevi ve bölüm yetkileri
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <select
                    id={`staff-${user.id}`}
                    className="h-10 min-w-56 rounded-xl border border-input bg-background px-3 text-sm"
                    value={user.staffRole ?? ""}
                    disabled={busyKey !== null}
                    onChange={(event) => {
                      if (event.target.value)
                        void changeStaffRole(user.id, event.target.value as StaffRole, true);
                    }}
                  >
                    <option value="" disabled>
                      Görev seçin
                    </option>
                    {Object.entries(staffRoleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {user.staffRole ? (
                    <Button
                      type="button"
                      size="sm"
                      variant={user.staffActive ? "outline" : "default"}
                      className="rounded-full"
                      disabled={busyKey !== null}
                      onClick={() =>
                        void changeStaffRole(user.id, user.staffRole!, !user.staffActive)
                      }
                    >
                      {busyKey === `${user.id}:staff`
                        ? "Kaydediliyor…"
                        : user.staffActive
                          ? "Görevi pasifleştir"
                          : "Görevi etkinleştir"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminState kind="empty" message="Eşleşen kullanıcı bulunamadı." />
      )}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Güvenlik: Pasifleştirilen görev tüm bölüm yetkilerini hemen kapatır. Son yönetici ve korunan
        işletme sahibi kaldırılamaz. Tüm rol değişiklikleri denetim kaydına yazılır.
      </p>
    </section>
  );
}
