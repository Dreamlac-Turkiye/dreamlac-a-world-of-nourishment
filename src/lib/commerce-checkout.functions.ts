import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { resolveMarketByHost } from "@/config/markets";
import { getRuntimeConfig } from "@/config/runtime.server";

const addressSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(7).max(24),
    country: z.enum(["TR", "SA"]),
    city: z.string().trim().min(1).max(100),
    district: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().max(20).optional(),
    line1: z.string().trim().min(5).max(300),
    line2: z.string().trim().max(300).optional(),
  })
  .strict();

const checkoutSchema = z
  .object({
    market: z.enum(["TR", "SA"]),
    idempotencyKey: z.string().trim().min(16).max(200),
    customer: z
      .object({
        email: z.string().trim().email().max(320),
        phone: z.string().trim().min(7).max(24),
      })
      .strict(),
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    items: z
      .array(
        z
          .object({
            variantId: z.string().uuid(),
            quantity: z.number().int().min(1).max(100),
          })
          .strict(),
      )
      .min(1)
      .max(50),
    termsVersion: z.string().trim().min(1).max(100),
    privacyVersion: z.string().trim().min(1).max(100),
    customerNote: z.string().trim().max(1000).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const ids = value.items.map((item) => item.variantId);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["items"], message: "Duplicate item" });
    }
    if (
      value.billingAddress.country !== value.market ||
      value.shippingAddress.country !== value.market
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["market"],
        message: "Address market mismatch",
      });
    }
  });

export type CommerceCheckoutInput = z.infer<typeof checkoutSchema>;

export interface CommerceCheckoutResult {
  orderId: string;
  orderNumber: string;
  status: "awaiting_payment";
  currency: "TRY" | "SAR";
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  shippingMinor: number;
  grandTotalMinor: number;
  itemCount: number;
  reservationExpiresAt: string;
}

function assertResult(value: unknown): asserts value is CommerceCheckoutResult {
  const parsed = z
    .object({
      orderId: z.string().uuid(),
      orderNumber: z.string().min(1),
      status: z.literal("awaiting_payment"),
      currency: z.enum(["TRY", "SAR"]),
      subtotalMinor: z.number().int().nonnegative(),
      discountMinor: z.number().int().nonnegative(),
      taxMinor: z.number().int().nonnegative(),
      shippingMinor: z.number().int().nonnegative(),
      grandTotalMinor: z.number().int().nonnegative(),
      itemCount: z.number().int().positive(),
      reservationExpiresAt: z.string().datetime({ offset: true }),
    })
    .safeParse(value);
  if (!parsed.success) throw new Error("Invalid checkout response");
}

async function getOptionalUserId(token: string | null): Promise<string | null> {
  if (!token) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized");
  return data.user.id;
}

export const createCommerceCheckout = createServerFn({ method: "POST" })
  .validator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data }): Promise<CommerceCheckoutResult> => {
    const request = getRequest();
    const config = getRuntimeConfig();
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
    const hostMarket = resolveMarketByHost(host);

    if (config.APP_ENV === "production" && hostMarket?.code !== data.market) {
      throw new Error("Market does not match request host");
    }

    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const userId = await getOptionalUserId(token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("create_commerce_checkout", {
      p_market_code: data.market,
      p_user_id: userId,
      p_customer_email: data.customer.email,
      p_customer_phone: data.customer.phone,
      p_billing_address: data.billingAddress,
      p_shipping_address: data.shippingAddress,
      p_items: data.items,
      p_terms_version: data.termsVersion,
      p_privacy_version: data.privacyVersion,
      p_idempotency_key: data.idempotencyKey,
      p_customer_note: data.customerNote ?? null,
    });
    if (error) throw new Error(`Checkout failed: ${error.code ?? "UNKNOWN"}`);
    assertResult(result);
    return result;
  });
