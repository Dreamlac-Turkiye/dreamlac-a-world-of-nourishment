import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export interface ProductSettingRecord {
  slug: string;
  priceKurus: number | null;
  weight: string | null;
  ingredients: string[];
  stock: "in_stock" | "out_of_stock" | "pending";
  directSaleEnabled: boolean;
  adminNote: string | null;
  updatedAt: string;
}

/**
 * Yönetim panelinden girilen ticari alanlar (fiyat, gramaj, bileşen listesi).
 * Herkese açık okuma; yazma yetkisi yalnızca yönetici rolündedir (veritabanı kuralları).
 */
export const listProductSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductSettingRecord[]> => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return [];

    const supabasePublic = createClient<Database>(url, key, {
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

    const { data, error } = await supabasePublic
      .from("product_settings")
      .select("slug, price_kurus, weight, ingredients, stock, direct_sale_enabled, admin_note, updated_at");

    if (error || !data) return [];

    return data.map((row) => ({
      slug: row.slug,
      priceKurus: row.price_kurus,
      weight: row.weight,
      ingredients: row.ingredients ?? [],
      stock: (row.stock as ProductSettingRecord["stock"]) ?? "pending",
      directSaleEnabled: row.direct_sale_enabled,
      adminNote: row.admin_note,
      updatedAt: row.updated_at,
    }));
  },
);
