CREATE TYPE public.staff_role AS ENUM (
  'owner',
  'general_manager',
  'store_manager',
  'order_agent',
  'warehouse_agent',
  'customer_support',
  'accountant',
  'content_manager',
  'compliance_officer',
  'system_admin',
  'report_viewer'
);

CREATE TABLE public.staff_memberships (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_role public.staff_role NOT NULL,
  active boolean NOT NULL DEFAULT true,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.staff_role_permissions (
  staff_role public.staff_role NOT NULL,
  permission text NOT NULL CHECK (permission ~ '^[a-z]+\.[a-z_]+$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (staff_role, permission)
);

ALTER TABLE public.staff_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_role_permissions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.staff_memberships, public.staff_role_permissions TO service_role;
GRANT SELECT ON public.staff_memberships, public.staff_role_permissions TO authenticated;

CREATE POLICY "Staff read own membership" ON public.staff_memberships
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins read staff memberships" ON public.staff_memberships
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated read staff permissions" ON public.staff_role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE TRIGGER staff_memberships_set_updated_at
BEFORE UPDATE ON public.staff_memberships
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.staff_role_permissions (staff_role, permission) VALUES
  ('owner','orders.read'), ('owner','orders.manage'), ('owner','payments.refund'),
  ('owner','fulfilment.manage'), ('owner','inventory.manage'), ('owner','catalog.manage'),
  ('owner','customers.read'), ('owner','customers.manage'), ('owner','support.manage'),
  ('owner','content.manage'), ('owner','legal.manage'), ('owner','finance.read'),
  ('owner','reports.read'), ('owner','operations.read'), ('owner','integrations.manage'),
  ('owner','users.manage'),
  ('general_manager','orders.read'), ('general_manager','orders.manage'),
  ('general_manager','inventory.manage'), ('general_manager','catalog.manage'),
  ('general_manager','customers.read'), ('general_manager','customers.manage'),
  ('general_manager','support.manage'), ('general_manager','content.manage'),
  ('general_manager','legal.manage'), ('general_manager','finance.read'),
  ('general_manager','reports.read'), ('general_manager','operations.read'),
  ('general_manager','users.manage'),
  ('store_manager','orders.read'), ('store_manager','orders.manage'),
  ('store_manager','fulfilment.manage'), ('store_manager','inventory.manage'),
  ('store_manager','catalog.manage'), ('store_manager','customers.read'),
  ('store_manager','reports.read'), ('store_manager','operations.read'),
  ('order_agent','orders.read'), ('order_agent','orders.manage'),
  ('order_agent','fulfilment.manage'), ('order_agent','customers.read'),
  ('warehouse_agent','orders.read'), ('warehouse_agent','fulfilment.manage'),
  ('warehouse_agent','inventory.manage'),
  ('customer_support','orders.read'), ('customer_support','customers.read'),
  ('customer_support','customers.manage'), ('customer_support','support.manage'),
  ('accountant','orders.read'), ('accountant','payments.refund'),
  ('accountant','finance.read'), ('accountant','reports.read'),
  ('content_manager','catalog.manage'), ('content_manager','content.manage'),
  ('compliance_officer','orders.read'), ('compliance_officer','legal.manage'),
  ('compliance_officer','reports.read'),
  ('system_admin','operations.read'), ('system_admin','integrations.manage'),
  ('system_admin','users.manage'),
  ('report_viewer','reports.read'), ('report_viewer','finance.read');

CREATE OR REPLACE FUNCTION public.has_permission(p_user_id uuid, p_permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = p_user_id AND rp.permission = p_permission
  ) OR EXISTS (
    SELECT 1 FROM public.staff_memberships sm
    JOIN public.staff_role_permissions srp ON srp.staff_role = sm.staff_role
    WHERE sm.user_id = p_user_id AND sm.active AND srp.permission = p_permission
  )
$$;

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

INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin','users.manage'), ('admin','customers.manage'), ('admin','support.manage'),
  ('admin','content.manage'), ('admin','legal.manage'), ('admin','finance.read'),
  ('admin','reports.read'), ('admin','integrations.manage')
ON CONFLICT DO NOTHING;
