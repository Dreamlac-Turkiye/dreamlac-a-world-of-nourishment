ALTER TABLE public.commerce_orders
  ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN assigned_at timestamptz;

CREATE INDEX commerce_orders_assigned_status_idx
  ON public.commerce_orders (assigned_to, status, created_at DESC);

CREATE TABLE public.order_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.commerce_orders(id) ON DELETE RESTRICT,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 2 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX order_internal_notes_order_idx
  ON public.order_internal_notes (order_id, created_at DESC);
ALTER TABLE public.order_internal_notes ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.order_internal_notes TO service_role;

CREATE OR REPLACE FUNCTION public.admin_update_order_workflow(
  p_actor_id uuid,
  p_order_number text,
  p_next_status public.commerce_order_status DEFAULT NULL,
  p_assignment_action text DEFAULT 'keep',
  p_assigned_to uuid DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order public.commerce_orders%ROWTYPE;
  v_allowed boolean := false;
BEGIN
  IF NOT public.has_permission(p_actor_id, 'orders.manage') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'FORBIDDEN';
  END IF;

  SELECT * INTO v_order FROM public.commerce_orders
  WHERE order_number = p_order_number FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ORDER_NOT_FOUND';
  END IF;

  IF p_assignment_action NOT IN ('keep','set','clear') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_ASSIGNMENT_ACTION';
  END IF;
  IF p_assignment_action = 'set' AND (
    p_assigned_to IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = p_assigned_to AND role IN ('admin','editor')
    )
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'ASSIGNEE_IS_NOT_STAFF';
  END IF;

  IF p_next_status IS NOT NULL AND p_next_status <> v_order.status THEN
    v_allowed := CASE v_order.status
      WHEN 'awaiting_payment' THEN p_next_status IN ('payment_processing','cancelled','failed')
      WHEN 'payment_processing' THEN p_next_status IN ('cancelled','failed')
      WHEN 'paid' THEN p_next_status IN ('fulfilment_pending')
      WHEN 'fulfilment_pending' THEN p_next_status IN ('fulfilled')
      ELSE false
    END;
    IF NOT v_allowed THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_ORDER_STATUS_TRANSITION';
    END IF;

    UPDATE public.commerce_orders SET status = p_next_status, updated_at = now()
    WHERE id = v_order.id;
    INSERT INTO public.order_status_history
      (order_id, from_status, to_status, reason, actor_type, actor_id)
    VALUES (v_order.id, v_order.status, p_next_status, 'admin_workflow', 'admin', p_actor_id);
  END IF;

  IF p_assignment_action = 'set' THEN
    UPDATE public.commerce_orders SET assigned_to = p_assigned_to,
      assigned_at = now(), updated_at = now() WHERE id = v_order.id;
  ELSIF p_assignment_action = 'clear' THEN
    UPDATE public.commerce_orders SET assigned_to = NULL,
      assigned_at = NULL, updated_at = now() WHERE id = v_order.id;
  END IF;

  IF nullif(trim(p_note), '') IS NOT NULL THEN
    IF char_length(trim(p_note)) > 2000 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'NOTE_TOO_LONG';
    END IF;
    INSERT INTO public.order_internal_notes (order_id, author_id, body)
    VALUES (v_order.id, p_actor_id, trim(p_note));
  END IF;

  INSERT INTO public.audit_events
    (market_id, actor_id, actor_type, action, resource_type, resource_id, metadata)
  VALUES (
    v_order.market_id, p_actor_id, 'admin', 'order.workflow_updated', 'commerce_order',
    v_order.id::text, jsonb_strip_nulls(jsonb_build_object(
      'previousStatus', v_order.status, 'nextStatus', p_next_status,
      'assignmentAction', p_assignment_action, 'assignedTo', p_assigned_to,
      'noteAdded', nullif(trim(p_note), '') IS NOT NULL
    ))
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_order_workflow(
  uuid,text,public.commerce_order_status,text,uuid,text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_order_workflow(
  uuid,text,public.commerce_order_status,text,uuid,text
) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_get_order(p_actor_id uuid,p_order_number text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_order public.commerce_orders%ROWTYPE;
BEGIN
  IF NOT public.has_permission(p_actor_id,'orders.read') THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='FORBIDDEN';
  END IF;
  SELECT * INTO v_order FROM public.commerce_orders WHERE order_number=p_order_number;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'order',to_jsonb(v_order)-'billing_address'-'shipping_address',
    'billingAddress',v_order.billing_address,'shippingAddress',v_order.shipping_address,
    'items',(SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.created_at),'[]'::jsonb) FROM public.commerce_order_items x WHERE x.order_id=v_order.id),
    'payments',(SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.created_at),'[]'::jsonb) FROM public.payment_attempts x WHERE x.order_id=v_order.id),
    'shipments',(SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.created_at),'[]'::jsonb) FROM public.shipments x WHERE x.order_id=v_order.id),
    'invoice',(SELECT to_jsonb(x) FROM public.invoices x WHERE x.order_id=v_order.id LIMIT 1),
    'history',(SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.created_at),'[]'::jsonb) FROM public.order_status_history x WHERE x.order_id=v_order.id),
    'internalNotes',(SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id',n.id,'body',n.body,'authorId',n.author_id,'createdAt',n.created_at
    ) ORDER BY n.created_at DESC),'[]'::jsonb) FROM public.order_internal_notes n WHERE n.order_id=v_order.id)
  );
END;
$$;
