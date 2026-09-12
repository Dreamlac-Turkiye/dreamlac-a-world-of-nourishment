import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface CustomerOrderItem {
  productId: string;
  productSlug: string;
  productName: string;
  stage: string | null;
  quantity: number;
  unitPriceKurus: number;
  lineTotalKurus: number;
}

export interface CustomerOrder {
  orderNumber: string;
  status: string;
  createdAt: string;
  totalKurus: number;
  itemCount: number;
  fullName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  city?: string | undefined;
  district?: string | undefined;
  addressLine?: string | undefined;
  note?: string | null | undefined;
  shippingOptionTitle?: string | undefined;
  paymentMethodTitle?: string | undefined;
  subtotalKurus?: number | undefined;
  shippingKurus?: number | undefined;
  items?: CustomerOrderItem[] | undefined;
}

function parseOrder(value: unknown): CustomerOrder {
  return z
    .object({
      orderNumber: z.string(),
      status: z.string(),
      createdAt: z.string(),
      totalKurus: z.number(),
      itemCount: z.number(),
      fullName: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      addressLine: z.string().optional(),
      note: z.string().nullable().optional(),
      shippingOptionTitle: z.string().optional(),
      paymentMethodTitle: z.string().optional(),
      subtotalKurus: z.number().optional(),
      shippingKurus: z.number().optional(),
      items: z
        .array(
          z.object({
            productId: z.string().uuid(),
            productSlug: z.string(),
            productName: z.string(),
            stage: z.string().nullable(),
            quantity: z.number().int().positive(),
            unitPriceKurus: z.number().nonnegative(),
            lineTotalKurus: z.number().nonnegative(),
          }),
        )
        .optional(),
    })
    .parse(value);
}

export const listMyCommerceOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CustomerOrder[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("customer_list_commerce_orders", {
      p_user_id: context.userId,
    });
    if (result.error) throw new Error(`Order list failed: ${result.error.code ?? "UNKNOWN"}`);
    return z.array(z.unknown()).parse(result.data).map(parseOrder);
  });

export const getMyCommerceOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ orderNumber: z.string().min(3).max(100) }).parse(input))
  .handler(async ({ data, context }): Promise<CustomerOrder | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("customer_get_commerce_order", {
      p_user_id: context.userId,
      p_order_number: data.orderNumber,
    });
    if (result.error) throw new Error(`Order read failed: ${result.error.code ?? "UNKNOWN"}`);
    return result.data ? parseOrder(result.data) : null;
  });
