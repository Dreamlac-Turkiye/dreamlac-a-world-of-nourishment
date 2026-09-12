CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  p_actor_id uuid,
  p_user_id uuid,
  p_role public.app_role,
  p_enabled boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_admin_count integer;
BEGIN
  IF NOT public.has_role(p_actor_id, 'admin') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'FORBIDDEN';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'USER_NOT_FOUND';
  END IF;

  IF p_role = 'admin' AND NOT p_enabled THEN
    IF p_actor_id = p_user_id THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'CANNOT_REMOVE_OWN_ADMIN_ROLE';
    END IF;

    SELECT count(*) INTO v_admin_count
    FROM public.user_roles
    WHERE role = 'admin';

    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'CANNOT_REMOVE_LAST_ADMIN';
    END IF;
  END IF;

  IF p_enabled THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, p_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role;
  END IF;

  INSERT INTO public.audit_events (
    actor_id, actor_type, action, resource_type, resource_id, metadata
  ) VALUES (
    p_actor_id,
    'admin',
    CASE WHEN p_enabled THEN 'user.role_granted' ELSE 'user.role_revoked' END,
    'user',
    p_user_id::text,
    jsonb_build_object('role', p_role, 'enabled', p_enabled)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid,uuid,public.app_role,boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid,uuid,public.app_role,boolean)
  TO service_role;
