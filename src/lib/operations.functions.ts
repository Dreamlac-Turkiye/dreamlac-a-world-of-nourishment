import { createHash } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export async function consumeRateLimit(input: {
  scope: string;
  subject: string;
  limit: number;
  windowSeconds: number;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const subjectHash = createHash("sha256").update(input.subject).digest("hex");
  const result = await supabaseAdmin.rpc("consume_rate_limit", {
    p_scope: input.scope,
    p_subject_hash: subjectHash,
    p_limit: input.limit,
    p_window_seconds: input.windowSeconds,
  });
  if (result.error) throw new Error(`Rate limit failed: ${result.error.code ?? "UNKNOWN"}`);
  return result.data as { allowed: boolean; remaining: number; retryAfterSeconds: number };
}

export const getOperationalHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_operational_health", {
      p_actor_id: context.userId,
    });
    if (result.error) throw new Error(`Health read failed: ${result.error.code ?? "UNKNOWN"}`);
    return result.data;
  });

export const retryOutboxEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ eventId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_retry_outbox_event", {
      p_actor_id: context.userId,
      p_event_id: data.eventId,
    });
    if (result.error) throw new Error(`Outbox retry failed: ${result.error.code ?? "UNKNOWN"}`);
    return { ok: true };
  });
