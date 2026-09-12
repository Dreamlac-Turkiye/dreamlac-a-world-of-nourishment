import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Package, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { supabase } from "@/integrations/supabase/client";
import { AccountDetails } from "@/components/account/AccountDetails";

export const Route = createFileRoute("/_authenticated/hesabim")({
  head: () => ({
    meta: [
      { title: "Hesabım — Dreamlac" },
      { name: "description", content: tr.account.description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: role } = await supabase.rpc("has_role", {
          _user_id: data.user.id,
          _role: "admin",
        });
        setIsAdmin(Boolean(role));
      }
    })();
  }, []);

  async function onSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/giris", replace: true });
  }

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold text-primary-deep sm:text-4xl">{tr.account.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tr.account.description}</p>

      <div className="mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {tr.account.signedInAs}
        </p>
        <p className="mt-1 text-sm font-medium text-primary-deep">{email ?? "…"}</p>
        <Button variant="outline" className="mt-4 rounded-full" onClick={() => void onSignOut()}>
          {tr.account.signOut}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to="/siparislerim"
          className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40"
        >
          <Package size={20} className="text-primary-deep" aria-hidden="true" />
          <h2 className="mt-3 text-base font-semibold text-primary-deep">
            {tr.account.ordersTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{tr.account.ordersDescription}</p>
        </Link>

        {isAdmin ? (
          <Link
            to="/yonetim"
            className="rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40"
          >
            <ShieldCheck size={20} className="text-primary-deep" aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-primary-deep">{tr.admin.navLabel}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{tr.account.adminDescription}</p>
          </Link>
        ) : null}
      </div>
      <AccountDetails />
    </main>
  );
}
