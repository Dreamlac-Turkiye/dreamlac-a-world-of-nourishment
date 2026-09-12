import { z } from "zod";

const eventSchema = z.object({
  id: z.string().uuid(),
  aggregate_type: z.string(),
  aggregate_id: z.string().uuid(),
  event_type: z.string(),
  payload: z.record(z.unknown()),
  attempt_count: z.number().int().positive(),
});

export async function claimOutboxBatch(workerId: string, limit = 50) {
  const input = z
    .object({ workerId: z.string().min(3).max(100), limit: z.number().int().min(1).max(500) })
    .parse({ workerId, limit });
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("claim_outbox_events", {
    p_worker_id: input.workerId,
    p_limit: input.limit,
    p_lease_seconds: 60,
  });
  if (error) throw new Error(`Outbox claim failed: ${error.code ?? "UNKNOWN"}`);
  return z.array(eventSchema).parse(data);
}

export async function finishOutboxEvent(input: {
  eventId: string;
  workerId: string;
  success: boolean;
  error?: string;
}) {
  const parsed = z
    .object({
      eventId: z.string().uuid(),
      workerId: z.string().min(3).max(100),
      success: z.boolean(),
      error: z.string().max(2000).optional(),
    })
    .parse(input);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.rpc("finish_outbox_event", {
    p_event_id: parsed.eventId,
    p_worker_id: parsed.workerId,
    p_success: parsed.success,
    p_error: parsed.error ?? null,
  });
  if (error) throw new Error(`Outbox finish failed: ${error.code ?? "UNKNOWN"}`);
}
