import type { MarketCode } from "@/config/markets";
import { commerceProviders } from "@/integrations/commerce/registry.server";
import type { VerifiedWebhook } from "@/integrations/commerce/contracts";
import { z } from "zod";

const attemptSchema = z.object({
  attemptId: z.string().uuid(),
  orderId: z.string().uuid(),
  orderNumber: z.string().min(1),
  provider: z.string().min(1),
  status: z.enum(["created", "pending"]),
  amountMinor: z.number().int().positive(),
  currency: z.enum(["TRY", "SAR"]),
  customerEmail: z.string().email(),
});

export async function startOrderPayment(input: {
  market: MarketCode;
  orderId: string;
  provider: string;
  idempotencyKey: string;
  correlationId: string;
  returnUrl: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("create_payment_attempt", {
    p_order_id: input.orderId,
    p_provider: input.provider,
    p_idempotency_key: input.idempotencyKey,
  });
  if (error) throw new Error(`Payment attempt failed: ${error.code ?? "UNKNOWN"}`);
  const attempt = attemptSchema.parse(data);

  const provider = commerceProviders.payment(input.market);
  if (provider.id !== input.provider) throw new Error("Payment provider mismatch");
  const session = await provider.createSession(
    {
      market: input.market,
      correlationId: input.correlationId,
      idempotencyKey: input.idempotencyKey,
    },
    {
      orderId: attempt.orderId,
      orderNumber: attempt.orderNumber,
      amount: { amount: attempt.amountMinor, currency: attempt.currency },
      customerEmail: attempt.customerEmail,
      returnUrl: input.returnUrl,
    },
  );

  const { error: attachError } = await supabaseAdmin.rpc("attach_payment_provider_reference", {
    p_attempt_id: attempt.attemptId,
    p_provider_reference: session.providerReference,
  });
  if (attachError) throw new Error(`Payment reference failed: ${attachError.code ?? "UNKNOWN"}`);
  return { attemptId: attempt.attemptId, ...session };
}

export async function verifyAndApplyPaymentWebhook(input: {
  market: MarketCode;
  providerId: string;
  rawBody: string;
  headers: Headers;
  toPaymentEvent: (event: VerifiedWebhook) => {
    providerReference: string;
    status: "authorized" | "captured" | "failed" | "cancelled";
    amountMinor: number;
    currency: "TRY" | "SAR";
  };
}) {
  const provider = commerceProviders.payment(input.market);
  if (provider.id !== input.providerId) throw new Error("Payment provider mismatch");
  const verified = await provider.verifyWebhook(input.rawBody, input.headers);
  const normalized = input.toPaymentEvent(verified);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("apply_verified_payment_event", {
    p_provider: input.providerId,
    p_provider_event_id: verified.providerEventId,
    p_provider_reference: normalized.providerReference,
    p_event_type: verified.eventType,
    p_payment_status: normalized.status,
    p_amount_minor: normalized.amountMinor,
    p_currency_code: normalized.currency,
    p_payload: verified.payload,
  });
  if (error) throw new Error(`Payment event failed: ${error.code ?? "UNKNOWN"}`);
  return data;
}

const refundSchema = z.object({
  refundId: z.string().uuid(),
  paymentAttemptId: z.string().uuid(),
  status: z.enum(["pending", "succeeded", "failed", "cancelled"]),
  amountMinor: z.number().int().positive(),
  currency: z.enum(["TRY", "SAR"]),
});

/** Queue a provider refund. Authorization must be completed before calling this service. */
export async function queueOrderRefund(input: {
  orderId: string;
  amountMinor: number;
  reason: string;
  idempotencyKey: string;
  actorId: string;
}) {
  const validated = z
    .object({
      orderId: z.string().uuid(),
      amountMinor: z.number().int().positive(),
      reason: z.string().trim().min(3).max(500),
      idempotencyKey: z.string().trim().min(16).max(200),
      actorId: z.string().uuid(),
    })
    .parse(input);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("request_payment_refund", {
    p_order_id: validated.orderId,
    p_amount_minor: validated.amountMinor,
    p_reason: validated.reason,
    p_idempotency_key: validated.idempotencyKey,
    p_actor_id: validated.actorId,
  });
  if (error) throw new Error(`Refund request failed: ${error.code ?? "UNKNOWN"}`);
  return refundSchema.parse(data);
}
