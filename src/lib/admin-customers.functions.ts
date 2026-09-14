import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertStaffMfa, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const summary = z.object({
  id: z.string().uuid(),
  email: z.string().nullable(),
  fullName: z.string().nullable(),
  phone: z.string().nullable(),
  createdAt: z.string(),
  lastSignInAt: z.string().nullable(),
  orderCount: z.number(),
  lifetimeValueMinor: z.number(),
  openTicketCount: z.number(),
  lastOrderAt: z.string().nullable(),
});
const searchResult = z.object({
  items: z.array(summary),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});
const detail = z.object({
  id: z.string().uuid(),
  email: z.string().nullable(),
  createdAt: z.string(),
  lastSignInAt: z.string().nullable(),
  profile: z
    .object({
      fullName: z.string().nullable(),
      phone: z.string().nullable(),
      locale: z.string().nullable(),
    })
    .nullable(),
  addresses: z.array(
    z.object({
      id: z.string().uuid(),
      label: z.string().nullable(),
      recipientName: z.string(),
      phone: z.string(),
      address: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])),
      isDefault: z.boolean(),
    }),
  ),
  orders: z.array(
    z.object({
      orderNumber: z.string(),
      status: z.string(),
      grandTotalMinor: z.number(),
      currency: z.string(),
      termsVersion: z.string(),
      privacyVersion: z.string(),
      createdAt: z.string(),
    }),
  ),
  serviceRequests: z.array(
    z.object({
      id: z.string().uuid(),
      orderNumber: z.string(),
      requestType: z.string(),
      status: z.string(),
      reason: z.string(),
      createdAt: z.string(),
    }),
  ),
  tickets: z.array(
    z.object({
      ticketNumber: z.string(),
      subject: z.string(),
      status: z.string(),
      priority: z.string(),
      updatedAt: z.string(),
    }),
  ),
  marketing: z
    .object({ status: z.string(), consentVersion: z.string(), consentedAt: z.string() })
    .nullable(),
});
export type AdminCustomerSummary = z.infer<typeof summary>;
export type AdminCustomerDetail = z.infer<typeof detail>;
export const searchAdminCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((v: unknown) =>
    z
      .object({
        query: z.string().trim().max(200).default(""),
        offset: z.number().int().min(0).default(0),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_search_customers", {
      p_actor_id: context.userId,
      p_query: data.query || null,
      p_limit: 25,
      p_offset: data.offset,
    });
    if (result.error) throw new Error(result.error.message);
    return searchResult.parse(result.data);
  });
export const getAdminCustomer360 = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((v: unknown) => z.object({ userId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_get_customer_360", {
      p_actor_id: context.userId,
      p_user_id: data.userId,
    });
    if (result.error) throw new Error(result.error.message);
    return detail.parse(result.data);
  });
