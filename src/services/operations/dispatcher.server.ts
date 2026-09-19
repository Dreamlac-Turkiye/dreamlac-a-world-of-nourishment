import { marketProfiles } from "@/config/markets";
import type { CommerceProviderKind, MarketProfile } from "@/config/markets/types";
import {
  getCargoAdapter,
  getInvoiceAdapter,
  getPaymentAdapter,
  getSmsAdapter,
} from "@/services/integrations/adapters.server";
import type { IntegrationResult } from "@/services/integrations/types";

export interface OutboxEvent {
  id: string;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  attempt_count: number;
}

export type DispatchOutcome =
  | { kind: "delivered" }
  | { kind: "deferred"; reason: string; retryAfterSeconds: number }
  | { kind: "failed"; error: string };

/**
 * Which provider capability each published event needs before it can leave the
 * queue. An event type missing from this map is a defect — something publishes
 * work nothing delivers — so it fails and dead-letters rather than deferring
 * quietly.
 */
const CAPABILITY_BY_EVENT: Readonly<Record<string, CommerceProviderKind>> = {
  "invoice.requested": "invoicing",
  "shipment.requested": "shipping",
  "payment.reconciliation_requested": "payment",
  "refund.requested": "payment",
  "order.created": "email",
  "order.cancelled": "email",
  "order.workflow_updated": "email",
  "order_request.submitted": "email",
  "order_request.status_changed": "email",
};

const PROVIDER_PENDING_RETRY_SECONDS = 3600;

function resolveMarket(): MarketProfile | null {
  const enabled = Object.values(marketProfiles).filter((market) => market.enabled);
  // Events do not carry a market yet. One enabled market is unambiguous; more
  // than one would make this a guess, and guessing routes a customer's invoice
  // through the wrong country's provider.
  return enabled.length === 1 ? (enabled[0] ?? null) : null;
}

async function callProvider(
  kind: CommerceProviderKind,
  providerKey: string,
): Promise<IntegrationResult<unknown>> {
  switch (kind) {
    case "shipping":
      return getCargoAdapter(providerKey).trackShipment("");
    case "invoicing":
      return getInvoiceAdapter(providerKey).createInvoice({
        orderNumber: "",
        customerName: "",
        customerEmail: "",
        lines: [],
      });
    case "payment":
      return getPaymentAdapter(providerKey).verifyPayment("");
    case "email":
    case "sms":
      return getSmsAdapter(providerKey).sendSms({ phone: "", message: "" });
  }
}

export async function dispatchOutboxEvent(event: OutboxEvent): Promise<DispatchOutcome> {
  const capability = CAPABILITY_BY_EVENT[event.event_type];
  if (!capability) {
    return { kind: "failed", error: `Unhandled outbox event type: ${event.event_type}` };
  }

  const market = resolveMarket();
  if (!market) {
    return {
      kind: "deferred",
      reason: "No single enabled market to route this event to",
      retryAfterSeconds: PROVIDER_PENDING_RETRY_SECONDS,
    };
  }

  const selection = market.providers[capability];
  if (!selection.enabled || !selection.provider) {
    return {
      kind: "deferred",
      reason: `${market.code} ${capability} provider is not enabled yet`,
      retryAfterSeconds: PROVIDER_PENDING_RETRY_SECONDS,
    };
  }

  const result = await callProvider(capability, selection.provider);
  if (result.ok) return { kind: "delivered" };
  if (result.notConfigured) {
    return {
      kind: "deferred",
      reason: result.error ?? `${selection.provider} is not configured`,
      retryAfterSeconds: PROVIDER_PENDING_RETRY_SECONDS,
    };
  }
  return { kind: "failed", error: result.error ?? `${selection.provider} call failed` };
}
