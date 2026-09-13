CREATE OR REPLACE FUNCTION public.current_user_has_permission(p_permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND public.has_permission(auth.uid(), p_permission)
$$;
REVOKE ALL ON FUNCTION public.current_user_has_permission(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_has_permission(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_get_staff_access(p_actor_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_is_admin boolean; v_has_membership boolean; v_membership public.staff_memberships%ROWTYPE; v_permissions jsonb;
BEGIN
  v_is_admin := public.has_role(p_actor_id, 'admin');
  SELECT * INTO v_membership FROM public.staff_memberships WHERE user_id=p_actor_id AND active;
  v_has_membership := FOUND;
  SELECT coalesce(jsonb_agg(permission ORDER BY permission),'[]'::jsonb) INTO v_permissions FROM (
    SELECT DISTINCT rp.permission FROM public.user_roles ur JOIN public.role_permissions rp ON rp.role=ur.role WHERE ur.user_id=p_actor_id
    UNION
    SELECT DISTINCT srp.permission FROM public.staff_memberships sm JOIN public.staff_role_permissions srp ON srp.staff_role=sm.staff_role WHERE sm.user_id=p_actor_id AND sm.active
  ) permissions;
  RETURN jsonb_build_object('isAdmin',v_is_admin,'staffRole',CASE WHEN v_has_membership THEN v_membership.staff_role ELSE NULL END,'active',v_is_admin OR v_has_membership,'permissions',v_permissions);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_get_staff_access(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_staff_access(uuid) TO service_role;

DROP POLICY IF EXISTS "Admins can insert product settings" ON public.product_settings;
DROP POLICY IF EXISTS "Admins can update product settings" ON public.product_settings;
DROP POLICY IF EXISTS "Admins can delete product settings" ON public.product_settings;
CREATE POLICY "Catalog staff insert product settings" ON public.product_settings FOR INSERT TO authenticated WITH CHECK (public.current_user_has_permission('catalog.manage'));
CREATE POLICY "Catalog staff update product settings" ON public.product_settings FOR UPDATE TO authenticated USING (public.current_user_has_permission('catalog.manage')) WITH CHECK (public.current_user_has_permission('catalog.manage'));
CREATE POLICY "Catalog staff delete product settings" ON public.product_settings FOR DELETE TO authenticated USING (public.current_user_has_permission('catalog.manage'));

DROP POLICY IF EXISTS "Admins can read integration settings" ON public.integration_settings;
DROP POLICY IF EXISTS "Admins can insert integration settings" ON public.integration_settings;
DROP POLICY IF EXISTS "Admins can update integration settings" ON public.integration_settings;
DROP POLICY IF EXISTS "Admins can delete integration settings" ON public.integration_settings;
CREATE POLICY "Integration staff read settings" ON public.integration_settings FOR SELECT TO authenticated USING (public.current_user_has_permission('integrations.manage'));
CREATE POLICY "Integration staff insert settings" ON public.integration_settings FOR INSERT TO authenticated WITH CHECK (public.current_user_has_permission('integrations.manage'));
CREATE POLICY "Integration staff update settings" ON public.integration_settings FOR UPDATE TO authenticated USING (public.current_user_has_permission('integrations.manage')) WITH CHECK (public.current_user_has_permission('integrations.manage'));
CREATE POLICY "Integration staff delete settings" ON public.integration_settings FOR DELETE TO authenticated USING (public.current_user_has_permission('integrations.manage'));

DROP POLICY IF EXISTS "Admins can insert legal documents" ON public.legal_documents;
DROP POLICY IF EXISTS "Admins can update legal documents" ON public.legal_documents;
DROP POLICY IF EXISTS "Admins can delete legal documents" ON public.legal_documents;
CREATE POLICY "Legal staff insert documents" ON public.legal_documents FOR INSERT TO authenticated WITH CHECK (public.current_user_has_permission('legal.manage'));
CREATE POLICY "Legal staff update documents" ON public.legal_documents FOR UPDATE TO authenticated USING (public.current_user_has_permission('legal.manage')) WITH CHECK (public.current_user_has_permission('legal.manage'));
CREATE POLICY "Legal staff delete documents" ON public.legal_documents FOR DELETE TO authenticated USING (public.current_user_has_permission('legal.manage'));

-- Support and warehouse roles need to execute their operational workflows.
INSERT INTO public.staff_role_permissions(staff_role, permission) VALUES
  ('customer_support', 'orders.manage'),
  ('warehouse_agent', 'orders.manage')
ON CONFLICT DO NOTHING;
