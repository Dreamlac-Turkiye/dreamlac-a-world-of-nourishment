-- Audited, market-scoped promotion rules. Codes are never trusted from the browser.
CREATE TABLE public.promotion_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE RESTRICT,
  code text NOT NULL CHECK (code = upper(code) AND code ~ '^[A-Z0-9_-]{3,32}$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  discount_type text NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value integer NOT NULL CHECK (discount_value > 0),
  minimum_subtotal_minor bigint NOT NULL DEFAULT 0 CHECK (minimum_subtotal_minor >= 0),
  maximum_discount_minor bigint CHECK (maximum_discount_minor IS NULL OR maximum_discount_minor > 0),
  total_usage_limit integer CHECK (total_usage_limit IS NULL OR total_usage_limit > 0),
  per_customer_limit integer NOT NULL DEFAULT 1 CHECK (per_customer_limit > 0),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL CHECK (ends_at > starts_at),
  active boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (market_id, code),
  CHECK (discount_type <> 'percentage' OR discount_value <= 10000)
);

CREATE TABLE public.promotion_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL REFERENCES public.promotion_codes(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL UNIQUE REFERENCES public.commerce_orders(id) ON DELETE RESTRICT,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  discount_minor bigint NOT NULL CHECK (discount_minor > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX promotion_codes_market_active_idx ON public.promotion_codes(market_id,active,starts_at,ends_at);
CREATE INDEX promotion_redemptions_promotion_idx ON public.promotion_redemptions(promotion_id,created_at DESC);
CREATE INDEX promotion_redemptions_customer_idx ON public.promotion_redemptions(promotion_id,lower(customer_email));
ALTER TABLE public.promotion_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_redemptions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.promotion_codes, public.promotion_redemptions TO service_role;
CREATE TRIGGER promotion_codes_set_updated_at BEFORE UPDATE ON public.promotion_codes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.staff_role_permissions(staff_role,permission) VALUES
 ('owner','promotions.manage'),('general_manager','promotions.manage'),('store_manager','promotions.manage')
ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions(role,permission) VALUES ('admin','promotions.manage') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.admin_list_promotions(p_actor_id uuid,p_market_code text DEFAULT 'TR')
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_market uuid; v_result jsonb;
BEGIN
 IF NOT public.has_permission(p_actor_id,'promotions.manage') THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='FORBIDDEN'; END IF;
 SELECT id INTO v_market FROM public.markets WHERE code=upper(p_market_code);
 IF v_market IS NULL THEN RAISE EXCEPTION USING ERRCODE='P0002',MESSAGE='MARKET_NOT_FOUND'; END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object(
   'id',p.id,'code',p.code,'name',p.name,'discountType',p.discount_type,'discountValue',p.discount_value,
   'minimumSubtotalMinor',p.minimum_subtotal_minor,'maximumDiscountMinor',p.maximum_discount_minor,
   'totalUsageLimit',p.total_usage_limit,'perCustomerLimit',p.per_customer_limit,'startsAt',p.starts_at,
   'endsAt',p.ends_at,'active',p.active,'usageCount',coalesce(r.usage_count,0),'updatedAt',p.updated_at
 ) ORDER BY p.created_at DESC),'[]'::jsonb) INTO v_result
 FROM public.promotion_codes p LEFT JOIN (
   SELECT promotion_id,count(*)::integer usage_count FROM public.promotion_redemptions GROUP BY promotion_id
 ) r ON r.promotion_id=p.id WHERE p.market_id=v_market;
 RETURN v_result;
END $$;

CREATE OR REPLACE FUNCTION public.admin_upsert_promotion(
 p_actor_id uuid,p_id uuid,p_market_code text,p_code text,p_name text,p_discount_type text,p_discount_value integer,
 p_minimum_subtotal_minor bigint,p_maximum_discount_minor bigint,p_total_usage_limit integer,p_per_customer_limit integer,
 p_starts_at timestamptz,p_ends_at timestamptz,p_active boolean
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_market uuid; v_id uuid;
BEGIN
 IF NOT public.has_permission(p_actor_id,'promotions.manage') THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='FORBIDDEN'; END IF;
 SELECT id INTO v_market FROM public.markets WHERE code=upper(p_market_code);
 IF v_market IS NULL THEN RAISE EXCEPTION USING ERRCODE='P0002',MESSAGE='MARKET_NOT_FOUND'; END IF;
 IF p_discount_type NOT IN ('percentage','fixed') OR p_discount_value<=0 OR (p_discount_type='percentage' AND p_discount_value>10000)
   OR p_ends_at<=p_starts_at OR p_minimum_subtotal_minor<0 OR p_per_customer_limit<=0 THEN
   RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_PROMOTION';
 END IF;
 IF p_id IS NULL THEN
   INSERT INTO public.promotion_codes(market_id,code,name,discount_type,discount_value,minimum_subtotal_minor,maximum_discount_minor,total_usage_limit,per_customer_limit,starts_at,ends_at,active,created_by,updated_by)
   VALUES(v_market,upper(trim(p_code)),trim(p_name),p_discount_type,p_discount_value,p_minimum_subtotal_minor,p_maximum_discount_minor,p_total_usage_limit,p_per_customer_limit,p_starts_at,p_ends_at,p_active,p_actor_id,p_actor_id) RETURNING id INTO v_id;
 ELSE
   UPDATE public.promotion_codes SET code=upper(trim(p_code)),name=trim(p_name),discount_type=p_discount_type,discount_value=p_discount_value,
    minimum_subtotal_minor=p_minimum_subtotal_minor,maximum_discount_minor=p_maximum_discount_minor,total_usage_limit=p_total_usage_limit,
    per_customer_limit=p_per_customer_limit,starts_at=p_starts_at,ends_at=p_ends_at,active=p_active,updated_by=p_actor_id
   WHERE id=p_id AND market_id=v_market RETURNING id INTO v_id;
   IF v_id IS NULL THEN RAISE EXCEPTION USING ERRCODE='P0002',MESSAGE='PROMOTION_NOT_FOUND'; END IF;
 END IF;
 INSERT INTO public.audit_events(market_id,actor_id,actor_type,action,resource_type,resource_id,metadata)
 VALUES(v_market,p_actor_id,'admin','promotion.saved','promotion',v_id::text,jsonb_build_object('code',upper(trim(p_code)),'active',p_active));
 RETURN v_id;
END $$;

-- Read-only quote used by checkout UI. Final redemption must be repeated atomically by checkout.
CREATE OR REPLACE FUNCTION public.quote_promotion(p_market_code text,p_code text,p_subtotal_minor bigint,p_customer_email text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE p public.promotion_codes%ROWTYPE; v_used integer; v_customer_used integer; v_discount bigint;
BEGIN
 SELECT pc.* INTO p FROM public.promotion_codes pc JOIN public.markets m ON m.id=pc.market_id
 WHERE m.code=upper(p_market_code) AND pc.code=upper(trim(p_code)) AND pc.active AND now() BETWEEN pc.starts_at AND pc.ends_at;
 IF NOT FOUND THEN RETURN jsonb_build_object('valid',false,'reason','NOT_AVAILABLE'); END IF;
 IF p_subtotal_minor<p.minimum_subtotal_minor THEN RETURN jsonb_build_object('valid',false,'reason','MINIMUM_NOT_MET','minimumSubtotalMinor',p.minimum_subtotal_minor); END IF;
 SELECT count(*)::integer INTO v_used FROM public.promotion_redemptions WHERE promotion_id=p.id;
 IF p.total_usage_limit IS NOT NULL AND v_used>=p.total_usage_limit THEN RETURN jsonb_build_object('valid',false,'reason','USAGE_LIMIT'); END IF;
 IF p_customer_email IS NOT NULL THEN
   SELECT count(*)::integer INTO v_customer_used FROM public.promotion_redemptions WHERE promotion_id=p.id AND lower(customer_email)=lower(p_customer_email);
   IF v_customer_used>=p.per_customer_limit THEN RETURN jsonb_build_object('valid',false,'reason','CUSTOMER_LIMIT'); END IF;
 END IF;
 v_discount:=CASE WHEN p.discount_type='percentage' THEN (p_subtotal_minor*p.discount_value/10000) ELSE p.discount_value END;
 v_discount:=least(v_discount,p_subtotal_minor,coalesce(p.maximum_discount_minor,v_discount));
 RETURN jsonb_build_object('valid',true,'promotionId',p.id,'code',p.code,'discountMinor',v_discount,'name',p.name);
END $$;

REVOKE ALL ON FUNCTION public.admin_list_promotions(uuid,text), public.admin_upsert_promotion(uuid,uuid,text,text,text,text,integer,bigint,bigint,integer,integer,timestamptz,timestamptz,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_promotions(uuid,text), public.admin_upsert_promotion(uuid,uuid,text,text,text,text,integer,bigint,bigint,integer,integer,timestamptz,timestamptz,boolean) TO service_role;
REVOKE ALL ON FUNCTION public.quote_promotion(text,text,bigint,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.quote_promotion(text,text,bigint,text) TO anon,authenticated,service_role;
