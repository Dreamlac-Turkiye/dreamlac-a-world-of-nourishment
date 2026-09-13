import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const role = z.enum(["admin", "editor", "user"]);
const staffRole = z.enum([
  "owner",
  "general_manager",
  "store_manager",
  "order_agent",
  "warehouse_agent",
  "customer_support",
  "accountant",
  "content_manager",
  "compliance_officer",
  "system_admin",
  "report_viewer",
]);

const safeUser = z.object({
  id: z.string().uuid(),
  email: z.string(),
  createdAt: z.string(),
  lastSignInAt: z.string().nullable(),
  emailConfirmedAt: z.string().nullable(),
  roles: z.array(role),
  staffRole: staffRole.nullable(),
  staffActive: z.boolean(),
});

export type AdminUser = z.infer<typeof safeUser>;
export type AppRole = z.infer<typeof role>;
export type StaffRole = z.infer<typeof staffRole>;

const inviteStaffInput = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  staffRole,
});

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (result.error || !result.data) throw new Error("FORBIDDEN");
  return supabaseAdmin;
}

async function assertPermission(userId: string, permission: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin.rpc("has_permission", {
    p_user_id: userId,
    p_permission: permission,
  });
  if (result.error || !result.data) throw new Error("FORBIDDEN");
  return supabaseAdmin;
}

const staffAccess = z.object({
  isAdmin: z.boolean(),
  staffRole: staffRole.nullable(),
  active: z.boolean(),
  permissions: z.array(z.string()),
});

export type StaffAccess = z.infer<typeof staffAccess>;

export const getCurrentStaffAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("admin_get_staff_access", {
      p_actor_id: context.userId,
    });
    if (result.error) throw new Error("ACCESS_READ_FAILED");
    return staffAccess.parse(result.data);
  });

export const inviteStaffUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => inviteStaffInput.parse(input))
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertPermission(context.userId, "users.manage");
    const siteUrl = process.env["VITE_SITE_URL"];
    if (!siteUrl) throw new Error("SITE_URL_MISSING");

    const redirectTo = new URL("/giris", siteUrl).toString();
    const invitation = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      redirectTo,
      data: { staff_invitation: true, staff_role: data.staffRole },
    });
    if (invitation.error || !invitation.data.user) {
      throw new Error(invitation.error?.message ?? "INVITATION_FAILED");
    }

    const assignment = await supabaseAdmin.rpc("admin_set_staff_role", {
      p_actor_id: context.userId,
      p_user_id: invitation.data.user.id,
      p_staff_role: data.staffRole,
      p_active: true,
    });
    if (assignment.error) {
      await supabaseAdmin.auth.admin.deleteUser(invitation.data.user.id);
      throw new Error(assignment.error.message);
    }

    return { id: invitation.data.user.id, email: data.email };
  });

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ query: z.string().trim().max(200).default("") }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertPermission(context.userId, "users.manage");
    const usersResult = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (usersResult.error) throw new Error("USER_LIST_FAILED");

    const userIds = usersResult.data.users.map((user) => user.id);
    const rolesResult = userIds.length
      ? await supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", userIds)
      : { data: [], error: null };
    if (rolesResult.error) throw new Error("ROLE_LIST_FAILED");
    const staffResult = userIds.length
      ? await supabaseAdmin
          .from("staff_memberships")
          .select("user_id, staff_role, active")
          .in("user_id", userIds)
      : { data: [], error: null };
    if (staffResult.error) throw new Error("STAFF_LIST_FAILED");
    const staffByUser = new Map((staffResult.data ?? []).map((row) => [row.user_id, row] as const));

    const rolesByUser = new Map<string, AppRole[]>();
    for (const row of rolesResult.data ?? []) {
      const current = rolesByUser.get(row.user_id) ?? [];
      current.push(row.role);
      rolesByUser.set(row.user_id, current);
    }

    const query = data.query.toLocaleLowerCase("tr-TR");
    return z.array(safeUser).parse(
      usersResult.data.users
        .filter((user) => !query || (user.email ?? "").toLocaleLowerCase("tr-TR").includes(query))
        .map((user) => {
          const staff = staffByUser.get(user.id);
          return {
            id: user.id,
            email: user.email ?? "E-posta yok",
            createdAt: user.created_at,
            lastSignInAt: user.last_sign_in_at ?? null,
            emailConfirmedAt: user.email_confirmed_at ?? null,
            roles: rolesByUser.get(user.id) ?? [],
            staffRole: staff?.staff_role ?? null,
            staffActive: staff?.active ?? false,
          };
        }),
    );
  });

export const setAdminUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ userId: z.string().uuid(), role, enabled: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertAdmin(context.userId);
    const result = await supabaseAdmin.rpc("admin_set_user_role", {
      p_actor_id: context.userId,
      p_user_id: data.userId,
      p_role: data.role,
      p_enabled: data.enabled,
    });
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });

export const setAdminStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ userId: z.string().uuid(), staffRole, active: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertPermission(context.userId, "users.manage");
    const result = await supabaseAdmin.rpc("admin_set_staff_role", {
      p_actor_id: context.userId,
      p_user_id: data.userId,
      p_staff_role: data.staffRole,
      p_active: data.active,
    });
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });
