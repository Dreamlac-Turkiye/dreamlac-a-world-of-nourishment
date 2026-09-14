import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertStaffMfa, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const schema = z.object({
  market: z.string(),
  ready: z.boolean(),
  checkoutEnabled: z.boolean(),
  checks: z.array(z.object({ key: z.string(), label: z.string(), ready: z.boolean() })),
  checkedAt: z.string(),
});
export type LaunchReadiness = z.infer<typeof schema>;
export const getLaunchReadiness = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((v: unknown) => z.object({ market: z.enum(["TR", "SA"]).default("TR") }).parse(v))
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const r = await supabaseAdmin.rpc("admin_launch_readiness", {
      p_actor_id: context.userId,
      p_market_code: data.market,
    });
    if (r.error) throw new Error(r.error.message);
    return schema.parse(r.data);
  });
export const setCheckoutEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((v: unknown) =>
    z.object({ market: z.enum(["TR", "SA"]), enabled: z.boolean() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const r = await supabaseAdmin.rpc("admin_set_checkout_enabled", {
      p_actor_id: context.userId,
      p_market_code: data.market,
      p_enabled: data.enabled,
    });
    if (r.error) throw new Error(r.error.message);
    return schema.parse(r.data);
  });
