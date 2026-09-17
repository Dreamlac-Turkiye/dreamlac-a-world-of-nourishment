import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertStaffMfa, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const entry = z.object({
  id: z.string().uuid(),
  locale: z.string(),
  contentType: z.enum(["article", "page", "faq"]),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  body: z.string(),
  category: z.string(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  canonicalPath: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  status: z.enum(["draft", "review", "published", "archived"]),
  version: z.number(),
  publishedAt: z.string().nullable(),
  updatedAt: z.string(),
});
export type AdminContentEntry = z.infer<typeof entry>;
const input = z.object({
  id: z.string().uuid().nullable(),
  market: z.enum(["TR", "SA"]),
  locale: z.string().min(2).max(10),
  contentType: z.enum(["article", "page", "faq"]),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(3).max(160),
  excerpt: z.string().max(320),
  body: z.string(),
  category: z.string().min(1).max(80),
  seoTitle: z.string().max(60).nullable(),
  seoDescription: z.string().max(160).nullable(),
  canonicalPath: z.string().max(300).nullable(),
  coverImageUrl: z.string().url().max(1000).nullable(),
  status: z.enum(["draft", "review", "published", "archived"]),
});
export const listAdminContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((v: unknown) => z.object({ market: z.enum(["TR", "SA"]).default("TR") }).parse(v))
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const r = await supabaseAdmin.rpc("admin_list_content", {
      p_actor_id: context.userId,
      p_market_code: data.market,
    });
    if (r.error) throw new Error(r.error.message);
    return z.array(entry).parse(r.data);
  });
export const saveAdminContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((v: unknown) => input.parse(v))
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const r = await supabaseAdmin.rpc("admin_save_content", {
      p_actor_id: context.userId,
      p_id: data.id ?? undefined,
      p_market_code: data.market,
      p_locale: data.locale,
      p_content_type: data.contentType,
      p_slug: data.slug,
      p_title: data.title,
      p_excerpt: data.excerpt,
      p_body: data.body,
      p_category: data.category,
      p_seo_title: data.seoTitle ?? undefined,
      p_seo_description: data.seoDescription ?? undefined,
      p_canonical_path: data.canonicalPath ?? undefined,
      p_cover_image_url: data.coverImageUrl ?? undefined,
      p_status: data.status,
    });
    if (r.error) throw new Error(r.error.message);
    return z.string().uuid().parse(r.data);
  });
