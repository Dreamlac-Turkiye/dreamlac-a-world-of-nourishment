import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const addressFields = z.object({
  city: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100),
  line1: z.string().trim().min(10).max(400),
  postalCode: z.string().trim().max(20).optional(),
});
const address = z.object({
  id: z.string().uuid(),
  label: z.string().nullable(),
  recipientName: z.string(),
  phone: z.string(),
  address: addressFields,
  isDefault: z.boolean(),
});
const account = z.object({
  profile: z
    .object({
      fullName: z.string().nullable(),
      phone: z.string().nullable(),
      locale: z.string().nullable(),
    })
    .nullable(),
  addresses: z.array(address),
});
export type CustomerAccount = z.infer<typeof account>;

export const getCustomerAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CustomerAccount> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("customer_get_account", { p_user_id: context.userId });
    if (result.error) throw new Error(`Account read failed: ${result.error.code ?? "UNKNOWN"}`);
    return account.parse(result.data);
  });

export const saveCustomerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(2).max(120),
        phone: z.string().trim().min(7).max(24),
      })
      .parse(value),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("customer_upsert_profile", {
      p_user_id: context.userId,
      p_full_name: data.fullName,
      p_phone: data.phone,
    });
    if (result.error) throw new Error(`Profile save failed: ${result.error.code ?? "UNKNOWN"}`);
    return { ok: true };
  });

export const saveCustomerAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) =>
    z
      .object({
        id: z.string().uuid().nullable().default(null),
        label: z.string().trim().max(50).default(""),
        recipientName: z.string().trim().min(2).max(120),
        phone: z.string().trim().min(7).max(24),
        address: addressFields,
        isDefault: z.boolean().default(false),
      })
      .parse(value),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("customer_save_address", {
      p_user_id: context.userId,
      p_address_id: data.id,
      p_label: data.label,
      p_recipient_name: data.recipientName,
      p_phone: data.phone,
      p_address: data.address,
      p_is_default: data.isDefault,
    });
    if (result.error) throw new Error(`Address save failed: ${result.error.code ?? "UNKNOWN"}`);
    return { id: z.string().uuid().parse(result.data) };
  });

export const deleteCustomerAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) => z.object({ id: z.string().uuid() }).parse(value))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("customer_delete_address", {
      p_user_id: context.userId,
      p_address_id: data.id,
    });
    if (result.error) throw new Error(`Address delete failed: ${result.error.code ?? "UNKNOWN"}`);
    return { ok: true };
  });
