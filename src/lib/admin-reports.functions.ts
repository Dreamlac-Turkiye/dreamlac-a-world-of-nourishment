import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertStaffMfa, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const reportSchema = z.object({
  fromDate: z.string(),
  toDate: z.string(),
  currency: z.string(),
  summary: z.object({
    orders: z.number(),
    paidOrders: z.number(),
    revenueMinor: z.number(),
    discountMinor: z.number(),
    newCustomers: z.number(),
    openTickets: z.number(),
    lowStock: z.number(),
  }),
  daily: z.array(z.object({ date: z.string(), orders: z.number(), revenueMinor: z.number() })),
  statuses: z.array(z.object({ status: z.string(), count: z.number() })),
  products: z.array(
    z.object({ sku: z.string(), name: z.string(), quantity: z.number(), revenueMinor: z.number() }),
  ),
  support: z.array(z.object({ category: z.string(), count: z.number() })),
});
export type AdminReport = z.infer<typeof reportSchema>;

export const getAdminReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) =>
    z
      .object({
        market: z.enum(["TR", "SA"]).default("TR"),
        fromDate: z.string().date(),
        toDate: z.string().date(),
      })
      .refine(
        (v) => (new Date(v.toDate).getTime() - new Date(v.fromDate).getTime()) / 86400000 <= 366,
        { message: "Range too large" },
      )
      .parse(value),
  )
  .handler(async ({ data, context }): Promise<AdminReport> => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_get_reports", {
      p_actor_id: context.userId,
      p_market_code: data.market,
      p_from_date: data.fromDate,
      p_to_date: data.toDate,
    });
    if (result.error) throw new Error(result.error.message);
    return reportSchema.parse(result.data);
  });
