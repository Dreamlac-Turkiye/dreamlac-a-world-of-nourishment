import { dispatchOutboxEvent } from "@/services/operations/dispatcher.server";
import {
  claimOutboxBatch,
  deferOutboxEvent,
  finishOutboxEvent,
} from "@/services/operations/outbox.server";

export interface DrainSummary {
  workerId: string;
  claimed: number;
  delivered: number;
  deferred: number;
  failed: number;
  /** Events whose outcome could not be recorded, usually an expired lease. */
  unsettled: number;
}

export async function drainOutbox(limit = 50): Promise<DrainSummary> {
  const workerId = `drain-${crypto.randomUUID()}`;
  const events = await claimOutboxBatch(workerId, limit);
  const summary: DrainSummary = {
    workerId,
    claimed: events.length,
    delivered: 0,
    deferred: 0,
    failed: 0,
    unsettled: 0,
  };

  for (const event of events) {
    let outcome;
    try {
      outcome = await dispatchOutboxEvent(event);
    } catch (cause) {
      outcome = {
        kind: "failed" as const,
        error: cause instanceof Error ? cause.message : "Dispatch threw a non-Error",
      };
    }

    // Settling is a separate round trip, so a lease that expired mid-dispatch
    // rejects it. Another worker already owns the event by then; losing the
    // batch over it would strand the events still waiting behind it.
    try {
      if (outcome.kind === "deferred") {
        await deferOutboxEvent({
          eventId: event.id,
          workerId,
          reason: outcome.reason,
          retryAfterSeconds: outcome.retryAfterSeconds,
        });
        summary.deferred += 1;
      } else if (outcome.kind === "delivered") {
        await finishOutboxEvent({ eventId: event.id, workerId, success: true });
        summary.delivered += 1;
      } else {
        await finishOutboxEvent({
          eventId: event.id,
          workerId,
          success: false,
          error: outcome.error,
        });
        summary.failed += 1;
      }
    } catch {
      summary.unsettled += 1;
    }
  }

  return summary;
}
