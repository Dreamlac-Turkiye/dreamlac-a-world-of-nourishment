-- Browser-side administrative writes must carry an AAL2 JWT.
CREATE OR REPLACE FUNCTION public.current_user_has_permission(p_permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL
    AND coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    AND public.has_permission(auth.uid(), p_permission)
$$;
REVOKE ALL ON FUNCTION public.current_user_has_permission(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_has_permission(text) TO authenticated, service_role;
