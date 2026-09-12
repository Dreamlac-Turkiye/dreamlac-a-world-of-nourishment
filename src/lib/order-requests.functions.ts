import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const requestType = z.enum(["cancellation", "return"]);
const requestStatus = z.enum(["submitted", "reviewing", "approved", "rejected", "completed"]);
const customerRequest = z.object({
  id: z.string().uuid(),
  requestType,
  status: requestStatus,
  reason: z.string(),
  resolutionNote: z.string().nullable(),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
});
const adminRequest = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  requestType,
  status: requestStatus,
  reason: z.string(),
  customerEmail: z.string(),
  createdAt: z.string(),
});
export type CustomerOrderRequest = z.infer<typeof customerRequest>;
export type AdminOrderRequest = z.infer<typeof adminRequest>;

export const listOrderRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) => z.object({ orderNumber: z.string().min(3).max(100) }).parse(value))
  .handler(async ({ data, context }): Promise<CustomerOrderRequest[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("customer_list_order_requests", {
      p_user_id: context.userId,
      p_order_number: data.orderNumber,
    });
    if (result.error) throw new Error(`Order requests failed: ${result.error.code ?? "UNKNOWN"}`);
    return z.array(customerRequest).parse(result.data);
  });

export const createOrderRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) =>
    z
      .object({
        orderNumber: z.string().min(3).max(100),
        requestType,
        reason: z.string().trim().min(5).max(1000),
      })
      .parse(value),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("customer_create_order_request", {
      p_user_id: context.userId,
      p_order_number: data.orderNumber,
      p_request_type: data.requestType,
      p_reason: data.reason,
    });
    if (result.error) throw new Error(result.error.message || "ORDER_REQUEST_FAILED");
    return { id: z.string().uuid().parse(result.data) };
  });

export const listAdminOrderRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOrderRequest[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_list_order_requests", {
      p_actor_id: context.userId,
      p_status: null,
    });
    if (result.error)
      throw new Error(`Admin order requests failed: ${result.error.code ?? "UNKNOWN"}`);
    return z.array(adminRequest).parse(result.data);
  });

export const resolveOrderRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) =>
    z
      .object({
        requestId: z.string().uuid(),
        status: requestStatus.exclude(["submitted"]),
        resolutionNote: z.string().trim().max(2000).default(""),
      })
      .parse(value),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_resolve_order_request", {
      p_actor_id: context.userId,
      p_request_id: data.requestId,
      p_status: data.status,
      p_resolution_note: data.resolutionNote,
    });
    if (result.error)
      throw new Error(`Resolve order request failed: ${result.error.code ?? "UNKNOWN"}`);
    return { ok: true };
  });
