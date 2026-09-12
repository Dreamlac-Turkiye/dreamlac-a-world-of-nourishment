import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export interface LegalDocumentRecord {
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  effectiveDate: string | null;
  updatedAt: string;
  reviewStatus: "review_required" | "approved";
  version: number;
}

/** Herkese açık okuma için yayın anahtarıyla oluşturulan sunucu istemcisi. */
function createPublicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

const SELECT = "slug, title, summary, body, effective_date, updated_at, review_status, version";

type Row = {
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  effective_date: string | null;
  updated_at: string;
  review_status: "review_required" | "approved";
  version: number;
};

function toRecord(row: Row): LegalDocumentRecord {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body ?? "",
    effectiveDate: row.effective_date,
    updatedAt: row.updated_at,
    reviewStatus: row.review_status,
    version: row.version,
  };
}

/** Tek bir yasal metni sayfa adresine göre getirir. Kayıt yoksa null döner. */
export const getLegalDocument = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }): Promise<LegalDocumentRecord | null> => {
    const client = createPublicClient();
    if (!client) return null;

    const { data: row, error } = await client
      .from("legal_documents")
      .select(SELECT)
      .eq("slug", data.slug)
      .maybeSingle();

    if (error || !row) return null;
    return toRecord(row as Row);
  });

/** Yönetim panelinde listeleme için tüm yasal metinler. */
export const listLegalDocuments = createServerFn({ method: "GET" }).handler(
  async (): Promise<LegalDocumentRecord[]> => {
    const client = createPublicClient();
    if (!client) return [];

    const { data, error } = await client.from("legal_documents").select(SELECT).order("slug");
    if (error || !data) return [];
    return (data as Row[]).map(toRecord);
  },
);
