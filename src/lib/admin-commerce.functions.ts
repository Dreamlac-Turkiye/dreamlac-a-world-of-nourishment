import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertStaffMfa, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const market = z.enum(["TR", "SA"]);

const adminOrder = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  status: z.string(),
  currency: z.string(),
  grandTotalMinor: z.number(),
  customerEmail: z.string(),
  customerPhone: z.string(),
  createdAt: z.string(),
  paymentStatus: z.string().nullable(),
  shipmentStatus: z.string().nullable(),
  invoiceStatus: z.string().nullable(),
});

const adminOrderSearch = z.object({
  items: z.array(adminOrder),
  limit: z.number(),
  offset: z.number(),
});

export type AdminOrderSummary = z.infer<typeof adminOrder>;

const inventoryItem = z.object({
  warehouseId: z.string().uuid(),
  warehouseCode: z.string(),
  warehouseName: z.string(),
  variantId: z.string().uuid(),
  sku: z.string(),
  productName: z.string(),
  onHand: z.number().int(),
  reserved: z.number().int(),
  available: z.number().int(),
  updatedAt: z.string(),
});

export type AdminInventoryItem = z.infer<typeof inventoryItem>;

export const listCommerceInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ market: market.default("TR") }).parse(input))
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_list_inventory", {
      p_actor_id: context.userId,
      p_market_code: data.market,
    });
    if (result.error) throw new Error(`Inventory read failed: ${result.error.code ?? "UNKNOWN"}`);
    return z.array(inventoryItem).parse(result.data);
  });

export const searchCommerceOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        market: market.default("TR"),
        status: z.string().max(40).optional(),
        query: z.string().max(200).optional(),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).default(0),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_search_orders", {
      p_actor_id: context.userId,
      p_market_code: data.market,
      p_status: data.status ?? null,
      p_query: data.query ?? null,
      p_limit: data.limit,
      p_offset: data.offset,
    });
    if (result.error) throw new Error(`Order search failed: ${result.error.code ?? "UNKNOWN"}`);
    return adminOrderSearch.parse(result.data);
  });

export const getCommerceOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ orderNumber: z.string().min(3).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_get_order", {
      p_actor_id: context.userId,
      p_order_number: data.orderNumber,
    });
    if (result.error) throw new Error(`Order read failed: ${result.error.code ?? "UNKNOWN"}`);
    return result.data;
  });

const orderStatus = z.enum([
  "draft",
  "awaiting_payment",
  "payment_processing",
  "paid",
  "fulfilment_pending",
  "fulfilled",
  "cancelled",
  "refunded",
  "failed",
]);

export const updateCommerceOrderWorkflow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        orderNumber: z.string().min(3).max(100),
        nextStatus: orderStatus.nullable().default(null),
        assignmentAction: z.enum(["keep", "set", "clear"]).default("keep"),
        assignedTo: z.string().uuid().nullable().default(null),
        note: z.string().trim().max(2000).nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_update_order_workflow", {
      p_actor_id: context.userId,
      p_order_number: data.orderNumber,
      p_next_status: data.nextStatus,
      p_assignment_action: data.assignmentAction,
      p_assigned_to: data.assignedTo,
      p_note: data.note,
    });
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });

export const adjustCommerceInventory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        warehouseId: z.string().uuid(),
        variantId: z.string().uuid(),
        quantityDelta: z
          .number()
          .int()
          .refine((x) => x !== 0),
        reason: z.string().trim().min(3).max(500),
        idempotencyKey: z.string().min(16).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("adjust_inventory", {
      p_actor_id: context.userId,
      p_warehouse_id: data.warehouseId,
      p_variant_id: data.variantId,
      p_quantity_delta: data.quantityDelta,
      p_reason: data.reason,
      p_idempotency_key: data.idempotencyKey,
    });
    if (result.error)
      throw new Error(`Inventory adjustment failed: ${result.error.code ?? "UNKNOWN"}`);
    return result.data;
  });
