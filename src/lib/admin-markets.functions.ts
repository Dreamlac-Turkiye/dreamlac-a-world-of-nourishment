import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertStaffMfa, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const market = z.object({
  id: z.string().uuid(),
  code: z.enum(["TR", "SA"]),
  name: z.string(),
  domain: z.string(),
  defaultLocale: z.string(),
  supportedLocales: z.array(z.string()),
  currency: z.enum(["TRY", "SAR"]),
  timezone: z.string(),
  enabled: z.boolean(),
  checkoutEnabled: z.boolean(),
  updatedAt: z.string(),
});
export type AdminMarket = z.infer<typeof market>;
export const listAdminMarkets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const r = await supabaseAdmin.rpc("admin_list_markets", { p_actor_id: context.userId });
    if (r.error) throw new Error(r.error.message);
    return z.array(market).parse(r.data);
  });
export const updateAdminMarket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((v: unknown) =>
    z
      .object({
        code: z.enum(["TR", "SA"]),
        name: z.string().min(2).max(80),
        domain: z.string().min(4).max(253),
        defaultLocale: z.string().min(2).max(10),
        supportedLocales: z.array(z.string().min(2).max(10)).min(1),
        timezone: z.string().min(3).max(80),
        enabled: z.boolean(),
      })
      .refine((v) => v.supportedLocales.includes(v.defaultLocale))
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const r = await supabaseAdmin.rpc("admin_update_market", {
      p_actor_id: context.userId,
      p_market_code: data.code,
      p_name: data.name,
      p_domain: data.domain,
      p_default_locale: data.defaultLocale,
      p_supported_locales: data.supportedLocales,
      p_timezone: data.timezone,
      p_enabled: data.enabled,
    });
    if (r.error) throw new Error(r.error.message);
  });
