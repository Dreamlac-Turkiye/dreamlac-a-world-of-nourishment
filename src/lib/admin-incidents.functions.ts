import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertStaffMfa, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const incident = z.object({
  id: z.string().uuid(),
  title: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "investigating", "monitoring", "resolved"]),
  source: z.string(),
  description: z.string(),
  assignedTo: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  updates: z.array(z.object({ status: z.string(), note: z.string(), createdAt: z.string() })),
});
export type AdminIncident = z.infer<typeof incident>;
export const listAdminIncidents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((v: unknown) => z.object({ market: z.enum(["TR", "SA"]).default("TR") }).parse(v))
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const r = await supabaseAdmin.rpc("admin_list_incidents", {
      p_actor_id: context.userId,
      p_market_code: data.market,
    });
    if (r.error) throw new Error(r.error.message);
    return z.array(incident).parse(r.data);
  });
export const saveAdminIncident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((v: unknown) =>
    z
      .object({
        id: z.string().uuid().nullable(),
        market: z.enum(["TR", "SA"]),
        title: z.string().min(3).max(160),
        severity: z.enum(["low", "medium", "high", "critical"]),
        status: z.enum(["open", "investigating", "monitoring", "resolved"]),
        description: z.string().max(4000),
        note: z.string().max(2000).nullable(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const r = await supabaseAdmin.rpc("admin_save_incident", {
      p_actor_id: context.userId,
      p_incident_id: data.id!,
      p_market_code: data.market,
      p_title: data.title,
      p_severity: data.severity,
      p_status: data.status,
      p_description: data.description,
      ...(data.note != null ? { p_note: data.note } : {}),
    });
    if (r.error) throw new Error(r.error.message);
    return z.string().uuid().parse(r.data);
  });
