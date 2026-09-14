CREATE INDEX IF NOT EXISTS customer_profiles_name_idx ON public.customer_profiles (lower(full_name));
CREATE INDEX IF NOT EXISTS customer_profiles_phone_idx ON public.customer_profiles (phone);

CREATE OR REPLACE FUNCTION public.admin_search_customers(p_actor_id uuid,p_query text DEFAULT NULL,p_limit integer DEFAULT 25,p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,auth,pg_temp AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT public.has_permission(p_actor_id,'customers.read') THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='FORBIDDEN'; END IF;
  IF p_limit NOT BETWEEN 1 AND 100 OR p_offset<0 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_PAGINATION'; END IF;
  SELECT jsonb_build_object('items',coalesce(jsonb_agg(row_data ORDER BY created_at DESC),'[]'::jsonb),'total',(SELECT count(*) FROM auth.users au LEFT JOIN public.customer_profiles cp ON cp.user_id=au.id WHERE coalesce(p_query,'')='' OR au.email ILIKE '%'||p_query||'%' OR cp.full_name ILIKE '%'||p_query||'%' OR cp.phone ILIKE '%'||p_query||'%'),'limit',p_limit,'offset',p_offset) INTO v_result FROM (
    SELECT au.created_at,jsonb_build_object('id',au.id,'email',au.email,'fullName',cp.full_name,'phone',cp.phone,'createdAt',au.created_at,'lastSignInAt',au.last_sign_in_at,'orderCount',(SELECT count(*) FROM public.commerce_orders o WHERE o.user_id=au.id),'lifetimeValueMinor',(SELECT coalesce(sum(o.grand_total_minor),0) FROM public.commerce_orders o WHERE o.user_id=au.id AND o.status IN ('paid','fulfilment_pending','fulfilled')),'openTicketCount',(SELECT count(*) FROM public.support_tickets t WHERE t.user_id=au.id AND t.status NOT IN ('resolved','closed')),'lastOrderAt',(SELECT max(o.created_at) FROM public.commerce_orders o WHERE o.user_id=au.id)) row_data
    FROM auth.users au LEFT JOIN public.customer_profiles cp ON cp.user_id=au.id
    WHERE coalesce(p_query,'')='' OR au.email ILIKE '%'||p_query||'%' OR cp.full_name ILIKE '%'||p_query||'%' OR cp.phone ILIKE '%'||p_query||'%'
    ORDER BY au.created_at DESC LIMIT p_limit OFFSET p_offset
  ) rows;
  RETURN v_result;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_get_customer_360(p_actor_id uuid,p_user_id uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,auth,pg_temp AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT public.has_permission(p_actor_id,'customers.read') THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='FORBIDDEN'; END IF;
  SELECT jsonb_build_object(
    'id',u.id,'email',u.email,'createdAt',u.created_at,'lastSignInAt',u.last_sign_in_at,
    'profile',(SELECT jsonb_build_object('fullName',p.full_name,'phone',p.phone,'locale',p.locale) FROM public.customer_profiles p WHERE p.user_id=u.id),
    'addresses',coalesce((SELECT jsonb_agg(jsonb_build_object('id',a.id,'label',a.label,'recipientName',a.recipient_name,'phone',a.phone,'address',a.address,'isDefault',a.is_default) ORDER BY a.is_default DESC,a.created_at DESC) FROM public.customer_addresses a WHERE a.user_id=u.id),'[]'::jsonb),
    'orders',coalesce((SELECT jsonb_agg(jsonb_build_object('orderNumber',x.order_number,'status',x.status,'grandTotalMinor',x.grand_total_minor,'currency',x.currency_code,'termsVersion',x.terms_version,'privacyVersion',x.privacy_version,'createdAt',x.created_at) ORDER BY x.created_at DESC) FROM (SELECT * FROM public.commerce_orders o WHERE o.user_id=u.id ORDER BY o.created_at DESC LIMIT 20)x),'[]'::jsonb),
    'serviceRequests',coalesce((SELECT jsonb_agg(jsonb_build_object('id',r.id,'orderNumber',o.order_number,'requestType',r.request_type,'status',r.status,'reason',r.reason,'createdAt',r.created_at) ORDER BY r.created_at DESC) FROM public.order_service_requests r JOIN public.commerce_orders o ON o.id=r.order_id WHERE r.user_id=u.id),'[]'::jsonb),
    'tickets',coalesce((SELECT jsonb_agg(jsonb_build_object('ticketNumber',t.ticket_number,'subject',t.subject,'status',t.status,'priority',t.priority,'updatedAt',t.updated_at) ORDER BY t.updated_at DESC) FROM public.support_tickets t WHERE t.user_id=u.id),'[]'::jsonb),
    'marketing',(SELECT jsonb_build_object('status',m.status,'consentVersion',m.consent_version,'consentedAt',m.consented_at) FROM public.marketing_subscriptions m WHERE lower(m.email)=lower(u.email) AND m.market_code='TR')
  ) INTO v_result FROM auth.users u WHERE u.id=p_user_id;
  IF v_result IS NULL THEN RAISE EXCEPTION USING ERRCODE='P0002',MESSAGE='CUSTOMER_NOT_FOUND'; END IF;
  RETURN v_result;
END; $$;

REVOKE ALL ON FUNCTION public.admin_search_customers(uuid,text,integer,integer),public.admin_get_customer_360(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_search_customers(uuid,text,integer,integer),public.admin_get_customer_360(uuid,uuid) TO service_role;
