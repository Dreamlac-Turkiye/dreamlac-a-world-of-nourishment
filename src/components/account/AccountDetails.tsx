import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteCustomerAddress,
  getCustomerAccount,
  saveCustomerAddress,
  saveCustomerProfile,
} from "@/lib/customer-account.functions";

export function AccountDetails() {
  const read = useServerFn(getCustomerAccount),
    saveProfile = useServerFn(saveCustomerProfile),
    saveAddress = useServerFn(saveCustomerAddress),
    removeAddress = useServerFn(deleteCustomerAddress);
  const query = useQuery({ queryKey: ["customer-account"], queryFn: () => read() });
  const [fullName, setFullName] = useState(""),
    [phone, setPhone] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (query.data?.profile) {
      setFullName(query.data.profile.fullName ?? "");
      setPhone(query.data.profile.phone ?? "");
    }
  }, [query.data]);
  async function profileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await saveProfile({ data: { fullName, phone } });
      toast.success("Bilgileriniz kaydedildi.");
      void query.refetch();
    } catch {
      toast.error("Bilgiler kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }
  async function addressSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await saveAddress({
        data: {
          id: null,
          label: String(f.get("label") ?? ""),
          recipientName: String(f.get("recipientName") ?? ""),
          phone: String(f.get("phone") ?? ""),
          address: {
            city: String(f.get("city") ?? ""),
            district: String(f.get("district") ?? ""),
            line1: String(f.get("line1") ?? ""),
            postalCode: String(f.get("postalCode") ?? ""),
          },
          isDefault: Boolean(f.get("isDefault")),
        },
      });
      event.currentTarget.reset();
      toast.success("Adres eklendi.");
      void query.refetch();
    } catch {
      toast.error("Adres kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-primary-deep">Kişisel bilgiler</h2>
        <form onSubmit={profileSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="profile-name" label="Ad soyad">
            <Input
              id="profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              minLength={2}
              maxLength={120}
              required
            />
          </Field>
          <Field id="profile-phone" label="Telefon">
            <Input
              id="profile-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              minLength={7}
              maxLength={24}
              required
            />
          </Field>
          <Button disabled={busy} className="rounded-full sm:col-span-2">
            Bilgileri kaydet
          </Button>
        </form>
      </section>
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-primary-deep">Adres defteri</h2>
        {query.data?.addresses.map((a) => (
          <div
            key={a.id}
            className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-secondary/60 p-4"
          >
            <div>
              <strong className="text-sm text-primary-deep">
                {a.label || "Adres"}
                {a.isDefault ? " · Varsayılan" : ""}
              </strong>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.recipientName} · {a.phone}
                <br />
                {a.address.line1}, {a.address.district} / {a.address.city}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void removeAddress({ data: { id: a.id } }).then(() => query.refetch())}
            >
              Sil
            </Button>
          </div>
        ))}
        <form onSubmit={addressSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field id="address-label" label="Adres adı">
            <Input id="address-label" name="label" placeholder="Ev, İş" maxLength={50} />
          </Field>
          <Field id="address-recipient" label="Alıcı adı">
            <Input id="address-recipient" name="recipientName" minLength={2} required />
          </Field>
          <Field id="address-phone" label="Telefon">
            <Input id="address-phone" name="phone" minLength={7} required />
          </Field>
          <Field id="address-city" label="İl">
            <Input id="address-city" name="city" minLength={2} required />
          </Field>
          <Field id="address-district" label="İlçe">
            <Input id="address-district" name="district" minLength={2} required />
          </Field>
          <Field id="address-postal" label="Posta kodu">
            <Input id="address-postal" name="postalCode" maxLength={20} />
          </Field>
          <div className="sm:col-span-2">
            <Field id="address-line" label="Açık adres">
              <Input id="address-line" name="line1" minLength={10} maxLength={400} required />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isDefault" /> Varsayılan adres yap
          </label>
          <Button disabled={busy} className="rounded-full sm:col-span-2">
            Yeni adres ekle
          </Button>
        </form>
      </section>
    </div>
  );
}
function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
