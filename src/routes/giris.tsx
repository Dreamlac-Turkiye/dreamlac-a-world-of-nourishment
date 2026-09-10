import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tr } from "@/content/tr";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

const title = "Giriş Yap — Dreamlac";
const description = "Dreamlac yönetim paneline erişmek için hesabınızla giriş yapın.";

export const Route = createFileRoute("/giris")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/yonetim" });
    });
  }, [navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signIn") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(tr.auth.signInError);
          return;
        }
        await navigate({ to: "/yonetim" });
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/giris` },
      });
      if (error) {
        toast.error(tr.auth.signUpError);
        return;
      }
      toast.success(tr.auth.signUpSuccess);
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(tr.auth.signInError);
      return;
    }
    if (result.redirected) return;
    await navigate({ to: "/yonetim" });
  }

  return (
    <main id="main" className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-primary-deep">{tr.auth.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tr.auth.description}</p>

      <div
        role="tablist"
        aria-label={tr.auth.title}
        className="mt-8 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1"
      >
        {(["signIn", "signUp"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === value
                ? "bg-card text-primary-deep shadow-[var(--shadow-soft)]"
                : "text-muted-foreground"
            }`}
          >
            {value === "signIn" ? tr.auth.signInTab : tr.auth.signUpTab}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="auth-email">{tr.auth.email}</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-password">{tr.auth.password}</Label>
          <Input
            id="auth-password"
            type="password"
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{tr.auth.passwordHint}</p>
        </div>
        <Button type="submit" className="w-full rounded-full" disabled={busy}>
          {busy ? tr.auth.loading : mode === "signIn" ? tr.auth.signIn : tr.auth.signUp}
        </Button>
      </form>

      <Button
        variant="outline"
        className="mt-3 w-full rounded-full"
        onClick={() => void onGoogle()}
      >
        {tr.auth.google}
      </Button>
    </main>
  );
}
