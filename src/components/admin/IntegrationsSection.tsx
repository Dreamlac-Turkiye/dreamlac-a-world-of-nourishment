import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tr } from "@/content/tr";
import { integrationCategories, type IntegrationCategory } from "@/data/integrations";
import { supabase } from "@/integrations/supabase/client";
import {
  getWebhookReadiness,
  listIntegrationStatus,
  testIntegration,
  type IntegrationStatus,
} from "@/lib/integrations.functions";

/**
 * Entegrasyon yönetimi.
 *
 * Sağlayıcı kaydı (açık/kapalı, mod, not) veritabanında; API anahtarları güvenli
 * anahtar deposunda tutulur. Bu ekran anahtar değerlerini asla göstermez.
 */

interface SettingRow {
  provider_key: string;
  category: string;
  display_name: string;
  enabled: boolean;
  mode: string;
  admin_note: string | null;
  updated_at: string;
}

const CATEGORY_ORDER: IntegrationCategory[] = ["cargo", "payment", "invoice", "sms"];

export function IntegrationsSection() {
  const fetchStatus = useServerFn(listIntegrationStatus);
  const fetchWebhook = useServerFn(getWebhookReadiness);

  const settingsQuery = useQuery({
    queryKey: ["admin", "integration-settings"],
    queryFn: async (): Promise<SettingRow[]> => {
      const { data, error } = await supabase
        .from("integration_settings")
        .select("provider_key, category, display_name, enabled, mode, admin_note, updated_at")
        .order("category")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const statusQuery = useQuery({
    queryKey: ["admin", "integration-status"],
    queryFn: () => fetchStatus(),
  });

  const webhookQuery = useQuery({
    queryKey: ["admin", "integration-webhook"],
    queryFn: () => fetchWebhook(),
  });

  const rows = settingsQuery.data ?? [];
  const statusByKey = new Map((statusQuery.data ?? []).map((item) => [item.providerKey, item]));

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold text-primary-deep sm:text-3xl">
        {tr.admin.integrations.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {tr.admin.integrations.description}
      </p>
      <p className="mt-4 rounded-2xl bg-secondary/60 p-4 text-sm leading-relaxed text-primary-deep/90">
        {tr.admin.integrations.notice}
      </p>

      {settingsQuery.isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">{tr.states.loading}</p>
      ) : (
        CATEGORY_ORDER.map((category) => {
          const categoryRows = rows.filter((row) => row.category === category);
          if (categoryRows.length === 0) return null;

          return (
            <div key={category} className="mt-10">
              <h3 className="text-lg font-semibold text-primary-deep">
                {integrationCategories[category].title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {integrationCategories[category].description}
              </p>
              <div className="mt-5 space-y-5">
                {categoryRows.map((row) => (
                  <IntegrationCard
                    key={row.provider_key}
                    row={row}
                    status={statusByKey.get(row.provider_key) ?? null}
                    onSaved={() => void settingsQuery.refetch()}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}

      <article className="mt-10 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <h3 className="text-lg font-semibold text-primary-deep">
          {tr.admin.integrations.webhookTitle}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {tr.admin.integrations.webhookDescription}
        </p>
        <p className="mt-3 break-all rounded-xl bg-secondary/50 px-3 py-2 font-mono text-xs text-primary-deep">
          POST /api/public/kargo-durum
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {webhookQuery.data?.ready
            ? tr.admin.integrations.webhookReady
            : tr.admin.integrations.webhookPending}
          {webhookQuery.data ? ` — ${webhookQuery.data.secretName}` : ""}
        </p>
      </article>
    </section>
  );
}

function IntegrationCard({
  row,
  status,
  onSaved,
}: {
  row: SettingRow;
  status: IntegrationStatus | null;
  onSaved: () => void;
}) {
  const runTest = useServerFn(testIntegration);
  const [enabled, setEnabled] = useState(row.enabled);
  const [mode, setMode] = useState(row.mode);
  const [note, setNote] = useState(row.admin_note ?? "");
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  async function onSave() {
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("integration_settings")
        .update({
          enabled,
          mode,
          admin_note: note.trim() === "" ? null : note.trim(),
          updated_by: userData.user?.id ?? null,
        })
        .eq("provider_key", row.provider_key);

      if (error) {
        toast.error(tr.admin.integrations.saveError);
        return;
      }
      toast.success(tr.admin.integrations.saved);
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  async function onTest() {
    setTesting(true);
    try {
      const result = await runTest({ data: { providerKey: row.provider_key } });
      if (result.ok) toast.success(result.message);
      else toast.warning(result.message);
    } finally {
      setTesting(false);
    }
  }

  const idPrefix = `integration-${row.provider_key}`;
  const ready = status?.ready ?? false;

  return (
    <article className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h4 className="text-base font-semibold text-primary-deep">{row.display_name}</h4>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            ready ? "bg-secondary text-primary-deep" : "bg-champagne/30 text-champagne-foreground"
          }`}
        >
          {ready ? tr.admin.integrations.ready : tr.admin.integrations.pending}
        </span>
      </div>

      {status ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{status.purpose}</p>
      ) : null}

      {status ? (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {tr.admin.integrations.secretsTitle}
          </p>
          <ul className="mt-2 space-y-1">
            {status.requiredSecrets.map((secret) => (
              <li key={secret.env} className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-primary-deep">{secret.env}</span>
                <span className="text-muted-foreground">
                  {secret.label}
                  {secret.required ? "" : ` (${tr.admin.integrations.optional})`}
                </span>
                <span className={secret.present ? "text-primary-deep" : "text-muted-foreground"}>
                  {secret.present ? "✓" : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-mode`}>{tr.admin.integrations.modeLabel}</Label>
          <select
            id={`${idPrefix}-mode`}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="test">{tr.admin.integrations.modeTest}</option>
            <option value="live">{tr.admin.integrations.modeLive}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-note`}>{tr.admin.integrations.noteLabel}</Label>
          <Input id={`${idPrefix}-note`} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>

      <label className="mt-4 flex items-center gap-3 text-sm text-primary-deep">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="size-4 rounded border-input"
        />
        {tr.admin.integrations.enabledLabel}
      </label>

      {status && status.missingSecrets.length > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {tr.admin.integrations.missingLabel}: {status.missingSecrets.join(", ")}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button className="rounded-full" disabled={busy} onClick={() => void onSave()}>
          {busy ? tr.admin.saving : tr.admin.save}
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          disabled={testing}
          onClick={() => void onTest()}
        >
          {testing ? tr.admin.integrations.testing : tr.admin.integrations.test}
        </Button>
        {status?.docsUrl ? (
          <Button asChild variant="ghost" className="rounded-full">
            <a href={status.docsUrl} target="_blank" rel="noreferrer noopener">
              {tr.admin.integrations.docs}
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
