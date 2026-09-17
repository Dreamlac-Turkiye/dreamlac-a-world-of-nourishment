import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertStaffMfa, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const category = z.enum(["order", "product", "delivery", "payment", "return", "other"]);
const status = z.enum(["open", "in_progress", "waiting_customer", "resolved", "closed"]);
const priority = z.enum(["low", "normal", "high", "urgent"]);
const message = z.object({
  id: z.string().uuid(),
  authorType: z.enum(["customer", "staff"]),
  body: z.string(),
  internal: z.boolean().optional().default(false),
  createdAt: z.string(),
});
const ticket = z.object({
  id: z.string().uuid(),
  ticketNumber: z.string(),
  userId: z.string().uuid().optional(),
  orderNumber: z.string().nullable().optional(),
  customerEmail: z.string().nullable().optional(),
  subject: z.string(),
  category,
  priority,
  status,
  assignedTo: z.string().uuid().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(message),
});
export type SupportTicket = z.infer<typeof ticket>;

export const createSupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) =>
    z
      .object({
        subject: z.string().trim().min(3).max(160),
        category,
        body: z.string().trim().min(1).max(4000),
        orderNumber: z.string().trim().max(100).default(""),
      })
      .parse(value),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("customer_create_support_ticket", {
      p_user_id: context.userId,
      p_subject: data.subject,
      p_category: data.category,
      p_body: data.body,
      ...(data.orderNumber != null ? { p_order_number: data.orderNumber } : {}),
    });
    if (result.error) throw new Error(result.error.message);
    return { ticketNumber: z.string().parse(result.data) };
  });
export const listMySupportTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("customer_list_support_tickets", {
      p_user_id: context.userId,
    });
    if (result.error) throw new Error(result.error.message);
    return z.array(ticket).parse(result.data);
  });
export const replySupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) =>
    z.object({ ticketNumber: z.string(), body: z.string().trim().min(1).max(4000) }).parse(value),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("customer_reply_support_ticket", {
      p_user_id: context.userId,
      p_ticket_number: data.ticketNumber,
      p_body: data.body,
    });
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });
export const listAdminSupportTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) =>
    z
      .object({ query: z.string().trim().max(200).default(""), status: status.optional() })
      .parse(value),
  )
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_list_support_tickets", {
      p_actor_id: context.userId,
      ...(data.query != null ? { p_query: data.query } : {}),
      ...(data.status != null ? { p_status: data.status } : {}),
    });
    if (result.error) throw new Error(result.error.message);
    return z.array(ticket).parse(result.data);
  });
export const updateAdminSupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) =>
    z
      .object({
        ticketId: z.string().uuid(),
        status,
        priority,
        assignedTo: z.string().uuid().nullable().default(null),
        message: z.string().trim().max(4000).default(""),
        internal: z.boolean().default(false),
      })
      .parse(value),
  )
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_update_support_ticket", {
      p_actor_id: context.userId,
      p_ticket_id: data.ticketId,
      p_status: data.status,
      p_priority: data.priority,
      ...(data.assignedTo != null ? { p_assigned_to: data.assignedTo } : {}),
      p_message: data.message,
      p_internal: data.internal,
    });
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });
