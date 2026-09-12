import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const role = z.enum(["admin", "editor", "user"]);

const safeUser = z.object({
  id: z.string().uuid(),
  email: z.string(),
  createdAt: z.string(),
  lastSignInAt: z.string().nullable(),
  emailConfirmedAt: z.string().nullable(),
  roles: z.array(role),
});

export type AdminUser = z.infer<typeof safeUser>;
export type AppRole = z.infer<typeof role>;

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (result.error || !result.data) throw new Error("FORBIDDEN");
  return supabaseAdmin;
}

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ query: z.string().trim().max(200).default("") }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertAdmin(context.userId);
    const usersResult = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (usersResult.error) throw new Error("USER_LIST_FAILED");

    const userIds = usersResult.data.users.map((user) => user.id);
    const rolesResult = userIds.length
      ? await supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", userIds)
      : { data: [], error: null };
    if (rolesResult.error) throw new Error("ROLE_LIST_FAILED");

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
        .map((user) => ({
          id: user.id,
          email: user.email ?? "E-posta yok",
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at ?? null,
          emailConfirmedAt: user.email_confirmed_at ?? null,
          roles: rolesByUser.get(user.id) ?? [],
        })),
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
