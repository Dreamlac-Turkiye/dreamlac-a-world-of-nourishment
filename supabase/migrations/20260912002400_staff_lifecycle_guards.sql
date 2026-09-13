-- Prevent users.manage delegates from escalating a user to the business-owner role.
CREATE OR REPLACE FUNCTION public.admin_set_staff_role(
  p_actor_id uuid,
  p_user_id uuid,
  p_staff_role public.staff_role,
  p_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_existing public.staff_memberships%ROWTYPE;
  v_owner_count integer;
BEGIN
  IF NOT public.has_permission(p_actor_id, 'users.manage') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'FORBIDDEN';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'USER_NOT_FOUND';
  END IF;
  IF p_staff_role = 'owner' AND NOT public.has_role(p_actor_id, 'admin') AND NOT EXISTS (
    SELECT 1 FROM public.staff_memberships
    WHERE user_id = p_actor_id AND staff_role = 'owner' AND active
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'OWNER_ASSIGNMENT_FORBIDDEN';
  END IF;

  SELECT * INTO v_existing FROM public.staff_memberships WHERE user_id = p_user_id FOR UPDATE;
  IF FOUND AND v_existing.staff_role = 'owner' AND (p_staff_role <> 'owner' OR NOT p_active) THEN
    SELECT count(*) INTO v_owner_count FROM public.staff_memberships
      WHERE staff_role = 'owner' AND active;
    IF p_actor_id = p_user_id OR v_owner_count <= 1 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'CANNOT_REMOVE_PROTECTED_OWNER';
    END IF;
  END IF;

  INSERT INTO public.staff_memberships
    (user_id, staff_role, active, assigned_by, assigned_at)
  VALUES (p_user_id, p_staff_role, p_active, p_actor_id, now())
  ON CONFLICT (user_id) DO UPDATE SET
    staff_role = EXCLUDED.staff_role,
    active = EXCLUDED.active,
    assigned_by = EXCLUDED.assigned_by,
    assigned_at = now(),
    updated_at = now();

  INSERT INTO public.audit_events
    (actor_id, actor_type, action, resource_type, resource_id, metadata)
  VALUES (
    p_actor_id, 'admin', 'staff.membership_updated', 'user', p_user_id::text,
    jsonb_build_object('staffRole', p_staff_role, 'active', p_active)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_staff_role(uuid,uuid,public.staff_role,boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_staff_role(uuid,uuid,public.staff_role,boolean)
  TO service_role;
