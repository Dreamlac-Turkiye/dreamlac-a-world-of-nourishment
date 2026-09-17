import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertStaffMfa, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const promotion = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().int().positive(),
  minimumSubtotalMinor: z.number().int().nonnegative(),
  maximumDiscountMinor: z.number().int().positive().nullable(),
  totalUsageLimit: z.number().int().positive().nullable(),
  perCustomerLimit: z.number().int().positive(),
  startsAt: z.string(),
  endsAt: z.string(),
  active: z.boolean(),
  usageCount: z.number().int().nonnegative(),
  updatedAt: z.string(),
});
export type AdminPromotion = z.infer<typeof promotion>;

const input = z
  .object({
    id: z.string().uuid().nullable().default(null),
    market: z.enum(["TR", "SA"]).default("TR"),
    code: z
      .string()
      .trim()
      .min(3)
      .max(32)
      .regex(/^[A-Za-z0-9_-]+$/),
    name: z.string().trim().min(2).max(120),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().int().positive(),
    minimumSubtotalMinor: z.number().int().nonnegative(),
    maximumDiscountMinor: z.number().int().positive().nullable(),
    totalUsageLimit: z.number().int().positive().nullable(),
    perCustomerLimit: z.number().int().min(1).max(100),
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    active: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.discountType === "percentage" && value.discountValue > 10000)
      context.addIssue({ code: "custom", path: ["discountValue"], message: "Invalid percentage" });
    if (new Date(value.endsAt) <= new Date(value.startsAt))
      context.addIssue({ code: "custom", path: ["endsAt"], message: "Invalid period" });
  });

export const listAdminPromotions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) =>
    z.object({ market: z.enum(["TR", "SA"]).default("TR") }).parse(value),
  )
  .handler(async ({ data, context }): Promise<AdminPromotion[]> => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_list_promotions", {
      p_actor_id: context.userId,
      p_market_code: data.market,
    });
    if (result.error) throw new Error(result.error.message);
    return z.array(promotion).parse(result.data);
  });

export const saveAdminPromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) => input.parse(value))
  .handler(async ({ data, context }) => {
    assertStaffMfa(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_upsert_promotion", {
      p_actor_id: context.userId,
      ...(data.id != null ? { p_id: data.id } : {}),
      p_market_code: data.market,
      p_code: data.code,
      p_name: data.name,
      p_discount_type: data.discountType,
      p_discount_value: data.discountValue,
      p_minimum_subtotal_minor: data.minimumSubtotalMinor,
      ...(data.maximumDiscountMinor != null ? { p_maximum_discount_minor: data.maximumDiscountMinor } : {}),
      ...(data.totalUsageLimit != null ? { p_total_usage_limit: data.totalUsageLimit } : {}),
      p_per_customer_limit: data.perCustomerLimit,
      p_starts_at: data.startsAt,
      p_ends_at: data.endsAt,
      p_active: data.active,
    });
    if (result.error) throw new Error(result.error.message);
    return z.string().uuid().parse(result.data);
  });
