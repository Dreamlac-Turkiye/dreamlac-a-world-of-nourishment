import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tr } from "@/content/tr";
import { mockProducts } from "@/data/mock/products";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationsSection } from "@/components/admin/IntegrationsSection";

export const Route = createFileRoute("/_authenticated/yonetim")({
  head: () => ({
    meta: [
      { title: "Ürün Yönetimi — Dreamlac" },
      { name: "description", content: "Dreamlac ürünleri için fiyat, gramaj ve bileşen yönetimi." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type StockValue = "in_stock" | "out_of_stock" | "pending";

interface SettingRow {
  slug: string;
  price_kurus: number | null;
  weight: string | null;
  ingredients: string[];
  stock: string;
  direct_sale_enabled: boolean;
  admin_note: string | null;
  updated_at: string;
}

function AdminPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  const roleQuery = useQuery({
    queryKey: ["admin", "role"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      setEmail(userData.user?.email ?? null);
      const { data } = await supabase.rpc("has_role", {
        _user_id: userData.user?.id ?? "",
        _role: "admin",
      });
      return Boolean(data);
    },
  });

  const settingsQuery = useQuery({
    queryKey: ["admin", "product-settings"],
    queryFn: async (): Promise<SettingRow[]> => {
      const { data, error } = await supabase
        .from("product_settings")
        .select(
          "slug, price_kurus, weight, ingredients, stock, direct_sale_enabled, admin_note, updated_at",
        )
        .order("slug");
      if (error) throw error;
      return data ?? [];
    },
    enabled: roleQuery.data === true,
  });

  async function onSignOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/giris" });
  }

  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold text-primary-deep sm:text-4xl">{tr.admin.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {tr.admin.description}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {email ? (
            <p className="max-w-[16rem] truncate">
              {tr.auth.signedInAs}: {email}
            </p>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 rounded-full"
            onClick={() => void onSignOut()}
          >
            {tr.auth.signOut}
          </Button>
        </div>
      </div>

      {roleQuery.isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">{tr.states.loading}</p>
      ) : roleQuery.data ? (
        <>
          <p className="mt-8 rounded-2xl bg-champagne/25 p-4 text-sm leading-relaxed text-champagne-foreground/90">
            {tr.admin.responsibility}
          </p>
          <div className="mt-8 space-y-6">
            {settingsQuery.data?.map((row) => (
              <ProductSettingsForm
                key={row.slug}
                row={row}
                onSaved={() => void settingsQuery.refetch()}
              />
            ))}
          </div>

          <LegalDocumentsSection />

          <IntegrationsSection />
        </>

      ) : (
        <div className="mt-10 rounded-[1.75rem] border border-border/70 bg-card p-6">
          <h2 className="text-lg font-semibold text-primary-deep">{tr.admin.noAccessTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {tr.admin.noAccessDescription}
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link to="/iletisim">{tr.nav.contact}</Link>
          </Button>
        </div>
      )}
    </main>
  );
}

function ProductSettingsForm({ row, onSaved }: { row: SettingRow; onSaved: () => void }) {
  const product = mockProducts.find((p) => p.slug === row.slug);
  const [price, setPrice] = useState(
    row.price_kurus === null ? "" : (row.price_kurus / 100).toFixed(2).replace(".", ","),
  );
  const [weight, setWeight] = useState(row.weight ?? "");
  const [ingredients, setIngredients] = useState(row.ingredients.join("\n"));
  const [stock, setStock] = useState<StockValue>((row.stock as StockValue) ?? "pending");
  const [directSale, setDirectSale] = useState(row.direct_sale_enabled);
  const [note, setNote] = useState(row.admin_note ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (price.trim() === "") setDirectSale(false);
  }, [price]);

  function parsePrice(): number | null | "invalid" {
    const raw = price.trim().replace(/\s/g, "").replace(",", ".");
    if (raw === "") return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return "invalid";
    return Math.round(value * 100);
  }

  async function onSave() {
    const parsed = parsePrice();
    if (parsed === "invalid") {
      toast.error(tr.admin.priceInvalid);
      return;
    }
    if (directSale && parsed === null) {
      toast.error(tr.admin.priceRequiredForSale);
      return;
    }

    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("product_settings")
        .update({
          price_kurus: parsed,
          weight: weight.trim() === "" ? null : weight.trim(),
          ingredients: ingredients
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0),
          stock,
          direct_sale_enabled: directSale,
          admin_note: note.trim() === "" ? null : note.trim(),
          updated_by: userData.user?.id ?? null,
        })
        .eq("slug", row.slug);

      if (error) {
        toast.error(tr.admin.saveError);
        return;
      }
      toast.success(tr.admin.saved);
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  const idPrefix = `setting-${row.slug}`;

  return (
    <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-primary-deep">{product?.name ?? row.slug}</h2>
        <p className="text-xs text-muted-foreground">
          {tr.admin.lastUpdated}: {new Date(row.updated_at).toLocaleString("tr-TR")}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-price`}>{tr.admin.fields.price}</Label>
          <Input
            id={`${idPrefix}-price`}
            inputMode="decimal"
            placeholder={tr.admin.fields.pricePlaceholder}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-weight`}>{tr.admin.fields.weight}</Label>
          <Input
            id={`${idPrefix}-weight`}
            placeholder={tr.admin.fields.weightPlaceholder}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-stock`}>{tr.admin.fields.stock}</Label>
          <select
            id={`${idPrefix}-stock`}
            value={stock}
            onChange={(e) => setStock(e.target.value as StockValue)}
            className="h-10 w-full rounded-full border border-input bg-background px-4 text-sm text-foreground"
          >
            {(["in_stock", "out_of_stock", "pending"] as const).map((value) => (
              <option key={value} value={value}>
                {tr.admin.stockOptions[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-sale`}>{tr.admin.fields.directSale}</Label>
          <div className="flex h-10 items-center gap-2">
            <input
              id={`${idPrefix}-sale`}
              type="checkbox"
              className="size-4 rounded border-input"
              checked={directSale}
              disabled={price.trim() === ""}
              onChange={(e) => setDirectSale(e.target.checked)}
            />
            <span className="text-xs text-muted-foreground">{tr.admin.fields.directSaleHint}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor={`${idPrefix}-ingredients`}>{tr.admin.fields.ingredients}</Label>
        <Textarea
          id={`${idPrefix}-ingredients`}
          rows={5}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">{tr.admin.fields.ingredientsHint}</p>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor={`${idPrefix}-note`}>{tr.admin.fields.note}</Label>
        <Input id={`${idPrefix}-note`} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button className="rounded-full" disabled={busy} onClick={() => void onSave()}>
          {busy ? tr.admin.saving : tr.admin.save}
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/urunler/$slug" params={{ slug: row.slug }}>
            {tr.products.detailsCta}
          </Link>
        </Button>
      </div>
    </section>
  );
}

interface LegalRow {
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  effective_date: string | null;
  updated_at: string;
}

/** Yasal sayfa adresleri — yönetim panelinden ilgili sayfaya bağlantı için. */
const LEGAL_ROUTES = {
  kvkk: "/kvkk",
  "gizlilik-politikasi": "/gizlilik-politikasi",
  "cerez-politikasi": "/cerez-politikasi",
  "mesafeli-satis-sozlesmesi": "/mesafeli-satis-sozlesmesi",
} as const;

function LegalDocumentsSection() {
  const legalQuery = useQuery({
    queryKey: ["admin", "legal-documents"],
    queryFn: async (): Promise<LegalRow[]> => {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("slug, title, summary, body, effective_date, updated_at")
        .order("slug");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold text-primary-deep sm:text-3xl">
        {tr.admin.legal.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {tr.admin.legal.description}
      </p>
      <p className="mt-4 rounded-2xl bg-secondary/60 p-4 text-sm leading-relaxed text-primary-deep/90">
        {tr.admin.legal.notice}
      </p>

      <div className="mt-8 space-y-6">
        {legalQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">{tr.states.loading}</p>
        ) : (
          legalQuery.data?.map((row) => (
            <LegalDocumentForm key={row.slug} row={row} onSaved={() => void legalQuery.refetch()} />
          ))
        )}
      </div>
    </section>
  );
}

function LegalDocumentForm({ row, onSaved }: { row: LegalRow; onSaved: () => void }) {
  const [title, setTitle] = useState(row.title);
  const [summary, setSummary] = useState(row.summary ?? "");
  const [effectiveDate, setEffectiveDate] = useState(row.effective_date ?? "");
  const [body, setBody] = useState(row.body);
  const [busy, setBusy] = useState(false);

  const href = LEGAL_ROUTES[row.slug as keyof typeof LEGAL_ROUTES];

  async function onSave() {
    if (title.trim() === "") {
      toast.error(tr.admin.legal.titleRequired);
      return;
    }
    if (body.trim() === "") {
      toast.error(tr.admin.legal.bodyRequired);
      return;
    }

    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("legal_documents")
        .update({
          title: title.trim(),
          summary: summary.trim() === "" ? null : summary.trim(),
          effective_date: effectiveDate.trim() === "" ? null : effectiveDate,
          body,
          updated_by: userData.user?.id ?? null,
        })
        .eq("slug", row.slug);

      if (error) {
        toast.error(tr.admin.legal.saveError);
        return;
      }
      toast.success(tr.admin.legal.saved);
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  const idPrefix = `legal-${row.slug}`;

  return (
    <article className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold text-primary-deep">{row.title}</h3>
        <p className="text-xs text-muted-foreground">
          {tr.admin.lastUpdated}: {new Date(row.updated_at).toLocaleString("tr-TR")}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-title`}>{tr.admin.legal.fields.title}</Label>
          <Input
            id={`${idPrefix}-title`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-date`}>{tr.admin.legal.fields.effectiveDate}</Label>
          <Input
            id={`${idPrefix}-date`}
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor={`${idPrefix}-summary`}>{tr.admin.legal.fields.summary}</Label>
        <Input
          id={`${idPrefix}-summary`}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor={`${idPrefix}-body`}>{tr.admin.legal.fields.body}</Label>
        <Textarea
          id={`${idPrefix}-body`}
          rows={16}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="font-mono text-xs leading-relaxed"
        />
        <p className="text-xs text-muted-foreground">{tr.admin.legal.fields.bodyHint}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button className="rounded-full" disabled={busy} onClick={() => void onSave()}>
          {busy ? tr.admin.saving : tr.admin.save}
        </Button>
        {href ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link to={href}>{tr.admin.legal.view}</Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
