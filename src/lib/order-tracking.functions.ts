import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/operations.functions";

const trackingInput = z.object({
  orderNumber: z.string().trim().min(5).max(100),
  email: z.string().trim().email().max(254),
  phoneLast4: z.string().regex(/^\d{4}$/),
});

const trackingResult = z.object({
  orderNumber: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  totalKurus: z.number().nonnegative(),
  itemCount: z.number().int().nonnegative(),
  shipmentStatus: z.string().nullable(),
  carrierName: z.string().nullable(),
  trackingNumber: z.string().nullable(),
});

export type TrackedOrder = z.infer<typeof trackingResult>;

export const trackCommerceOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => trackingInput.parse(input))
  .handler(async ({ data }): Promise<TrackedOrder | null> => {
    const normalizedEmail = data.email.toLocaleLowerCase("en-US");
    const rateLimit = await consumeRateLimit({
      scope: "guest-order-tracking",
      subject: `${normalizedEmail}:${data.orderNumber.toUpperCase()}`,
      limit: 6,
      windowSeconds: 15 * 60,
    });
    if (!rateLimit.allowed) throw new Error("RATE_LIMITED");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("track_commerce_order", {
      p_order_number: data.orderNumber,
      p_email: normalizedEmail,
      p_phone_last4: data.phoneLast4,
    });
    if (result.error) throw new Error(`Order tracking failed: ${result.error.code ?? "UNKNOWN"}`);
    return result.data ? trackingResult.parse(result.data) : null;
  });
