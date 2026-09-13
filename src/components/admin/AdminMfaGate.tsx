import { useEffect, useState, type ReactNode } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type Factor = { id: string; status: string };

export function AdminMfaGate({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [factor, setFactor] = useState<Factor | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadState() {
    const [aal, factors] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]);
    if (aal.error || factors.error) throw aal.error ?? factors.error;
    setVerified(aal.data.currentLevel === "aal2");
    setFactor(factors.data.totp.find((item) => item.status === "verified") ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void loadState().catch(() => {
      setLoading(false);
      toast.error("İki adımlı doğrulama durumu alınamadı.");
    });
  }, []);

  async function beginEnrollment() {
    setBusy(true);
    try {
      const result = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Dreamlac Yönetim ${Date.now()}`,
      });
      if (result.error) throw result.error;
      setFactor({ id: result.data.id, status: "unverified" });
      setQrCode(result.data.totp.qr_code);
      setSecret(result.data.totp.secret);
    } catch {
      toast.error("Doğrulama kurulumu başlatılamadı.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    if (!factor) return;
    setBusy(true);
    try {
      const result = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
      if (result.error) throw result.error;
      await supabase.auth.refreshSession();
      setVerified(true);
      toast.success("İki adımlı doğrulama etkinleştirildi.");
    } catch {
      toast.error("Kod doğrulanamadı. Yeni kodu deneyin.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="mt-10 text-sm text-muted-foreground">Güvenlik denetleniyor…</p>;
  if (verified) return children;

  return (
    <section className="mt-8 rounded-[1.75rem] border border-primary/20 bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-primary-deep">
        <ShieldCheck size={22} />
        <h2 className="text-xl font-semibold">Yönetim hesabınızı koruyun</h2>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Yönetim paneline erişmek için bir doğrulama uygulamasından alınan tek kullanımlık kod
        gerekir.
      </p>
      {!factor ? (
        <Button
          className="mt-5 rounded-full"
          disabled={busy}
          onClick={() => void beginEnrollment()}
        >
          <KeyRound size={16} className="mr-2" /> Doğrulamayı kur
        </Button>
      ) : (
        <form className="mt-5 max-w-sm space-y-4" onSubmit={(event) => void verifyCode(event)}>
          {qrCode ? (
            <div className="rounded-2xl border border-border bg-white p-4">
              <img src={qrCode} alt="Doğrulama uygulaması QR kodu" className="mx-auto size-48" />
              {secret ? (
                <p className="mt-3 break-all text-center text-xs text-slate-600">{secret}</p>
              ) : null}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="admin-mfa-code">6 haneli doğrulama kodu</Label>
            <Input
              id="admin-mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={busy || code.length !== 6}
          >
            {busy ? "Doğrulanıyor…" : "Doğrula ve devam et"}
          </Button>
        </form>
      )}
    </section>
  );
}
