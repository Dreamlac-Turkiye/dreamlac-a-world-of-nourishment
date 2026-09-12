import type { MarketCode } from "@/config/markets";

export interface MinorMoney {
  amount: number;
  currency: "TRY" | "SAR";
}
export interface IntegrationContext {
  market: MarketCode;
  correlationId: string;
  idempotencyKey: string;
}
export interface PaymentSessionRequest {
  orderId: string;
  orderNumber: string;
  amount: MinorMoney;
  customerEmail: string;
  returnUrl: string;
}
export interface PaymentSessionResult {
  providerReference: string;
  redirectUrl?: string;
  clientToken?: string;
  expiresAt?: string;
}
export interface VerifiedWebhook<TPayload = unknown> {
  providerEventId: string;
  eventType: string;
  occurredAt: string;
  payload: TPayload;
}
export interface PaymentProvider {
  readonly id: string;
  createSession(
    context: IntegrationContext,
    request: PaymentSessionRequest,
  ): Promise<PaymentSessionResult>;
  verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedWebhook>;
  refund(
    context: IntegrationContext,
    request: {
      paymentReference: string;
      amount: MinorMoney;
      reason?: string;
    },
  ): Promise<{ providerRefundReference: string; status: "pending" | "succeeded" }>;
}
export interface ShippingQuoteRequest {
  destination: { country: MarketCode; city: string; district?: string; postalCode?: string };
  parcels: Array<{ weightGrams: number; quantity: number }>;
}
export interface ShippingProvider {
  readonly id: string;
  quote(
    context: IntegrationContext,
    request: ShippingQuoteRequest,
  ): Promise<
    Array<{
      serviceCode: string;
      title: string;
      fee: MinorMoney;
      estimatedMinDays?: number;
      estimatedMaxDays?: number;
    }>
  >;
  createShipment(
    context: IntegrationContext,
    request: {
      orderId: string;
      serviceCode: string;
    },
  ): Promise<{ shipmentReference: string; trackingNumber?: string; labelUrl?: string }>;
  cancelShipment(context: IntegrationContext, shipmentReference: string): Promise<void>;
}
export interface InvoiceProvider {
  readonly id: string;
  issue(
    context: IntegrationContext,
    request: {
      orderId: string;
      orderNumber: string;
      amount: MinorMoney;
    },
  ): Promise<{ invoiceReference: string; status: "queued" | "issued"; documentUrl?: string }>;
  credit(
    context: IntegrationContext,
    request: {
      invoiceReference: string;
      amount: MinorMoney;
      reason: string;
    },
  ): Promise<{ creditNoteReference: string }>;
}
export class IntegrationDisabledError extends Error {
  constructor(kind: string, market: MarketCode) {
    super(`${kind} integration is not enabled for market ${market}`);
    this.name = "IntegrationDisabledError";
  }
}
