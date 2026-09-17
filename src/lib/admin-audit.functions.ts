import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertStaffMfa, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const auditEvent = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid().nullable(),
  action: z.string(),
  tableName: z.string(),
  recordId: z.string().nullable(),
  createdAt: z.string(),
});

export type AuditEvent = z.infer<typeof auditEvent>;

export const listAdminAuditEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(100).default(50) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const permission = await supabaseAdmin.rpc("has_permission", {
      p_user_id: context.userId,
      p_permission: "operations.read",
    });
    if (permission.error || !permission.data) throw new Error("FORBIDDEN");
    const result = await supabaseAdmin
      .from("admin_audit_events")
      .select("id, actor_id, action, table_name, record_id, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (result.error) throw new Error("AUDIT_LIST_FAILED");
    return z.array(auditEvent).parse(
      (result.data ?? []).map((row) => ({
        id: row.id,
        actorId: row.actor_id,
        action: row.action,
        tableName: row.table_name,
        recordId: row.record_id,
        createdAt: row.created_at,
      })),
    );
  });
