CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL UNIQUE,
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  order_id uuid REFERENCES public.commerce_orders(id) ON DELETE RESTRICT,
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 3 AND 160),
  category text NOT NULL CHECK (category IN ('order','product','delivery','payment','return','other')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','waiting_customer','resolved','closed')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE TABLE public.support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE RESTRICT,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  author_type text NOT NULL CHECK (author_type IN ('customer','staff')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX support_tickets_user_idx ON public.support_tickets(user_id,created_at DESC);
CREATE INDEX support_tickets_queue_idx ON public.support_tickets(status,priority,updated_at DESC);
CREATE INDEX support_ticket_messages_ticket_idx ON public.support_ticket_messages(ticket_id,created_at);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.support_tickets,public.support_ticket_messages TO authenticated;
GRANT ALL ON public.support_tickets,public.support_ticket_messages TO service_role;
CREATE POLICY "Customers read own tickets" ON public.support_tickets FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY "Customers read public ticket messages" ON public.support_ticket_messages FOR SELECT TO authenticated USING(NOT internal AND EXISTS(SELECT 1 FROM public.support_tickets t WHERE t.id=ticket_id AND t.user_id=auth.uid()));
CREATE TRIGGER support_tickets_set_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE SEQUENCE public.support_ticket_number_seq START 1000;
CREATE OR REPLACE FUNCTION public.next_support_ticket_number() RETURNS text LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=public AS $$
  SELECT 'TR-DST-'||to_char(current_date,'YYMM')||'-'||lpad(nextval('public.support_ticket_number_seq')::text,6,'0')
$$;
REVOKE ALL ON FUNCTION public.next_support_ticket_number() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.customer_create_support_ticket(p_user_id uuid,p_subject text,p_category text,p_body text,p_order_number text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_market uuid; v_order uuid; v_ticket public.support_tickets%ROWTYPE;
BEGIN
  IF char_length(trim(p_subject)) NOT BETWEEN 3 AND 160 OR char_length(trim(p_body)) NOT BETWEEN 1 AND 4000 OR p_category NOT IN ('order','product','delivery','payment','return','other') THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_TICKET'; END IF;
  SELECT id INTO v_market FROM public.markets WHERE code='TR';
  IF nullif(trim(p_order_number),'') IS NOT NULL THEN SELECT id INTO v_order FROM public.commerce_orders WHERE order_number=trim(p_order_number) AND user_id=p_user_id; IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='ORDER_NOT_FOUND'; END IF; END IF;
  INSERT INTO public.support_tickets(ticket_number,market_id,user_id,order_id,subject,category) VALUES(public.next_support_ticket_number(),v_market,p_user_id,v_order,trim(p_subject),p_category) RETURNING * INTO v_ticket;
  INSERT INTO public.support_ticket_messages(ticket_id,author_id,author_type,body) VALUES(v_ticket.id,p_user_id,'customer',trim(p_body));
  INSERT INTO public.audit_events(market_id,actor_id,actor_type,action,resource_type,resource_id) VALUES(v_market,p_user_id,'customer','support.ticket_created','support_ticket',v_ticket.id::text);
  RETURN v_ticket.ticket_number;
END; $$;

CREATE OR REPLACE FUNCTION public.customer_list_support_tickets(p_user_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT coalesce(jsonb_agg(jsonb_build_object('id',t.id,'ticketNumber',t.ticket_number,'subject',t.subject,'category',t.category,'priority',t.priority,'status',t.status,'createdAt',t.created_at,'updatedAt',t.updated_at,'messages',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',m.id,'authorType',m.author_type,'body',m.body,'createdAt',m.created_at) ORDER BY m.created_at),'[]'::jsonb) FROM public.support_ticket_messages m WHERE m.ticket_id=t.id AND NOT m.internal)) ORDER BY t.updated_at DESC),'[]'::jsonb) FROM public.support_tickets t WHERE t.user_id=p_user_id
$$;

CREATE OR REPLACE FUNCTION public.customer_reply_support_ticket(p_user_id uuid,p_ticket_number text,p_body text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_ticket public.support_tickets%ROWTYPE;
BEGIN
  IF char_length(trim(p_body)) NOT BETWEEN 1 AND 4000 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_MESSAGE'; END IF;
  SELECT * INTO v_ticket FROM public.support_tickets WHERE ticket_number=p_ticket_number AND user_id=p_user_id AND status NOT IN ('closed') FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='P0002',MESSAGE='TICKET_NOT_FOUND'; END IF;
  INSERT INTO public.support_ticket_messages(ticket_id,author_id,author_type,body) VALUES(v_ticket.id,p_user_id,'customer',trim(p_body));
  UPDATE public.support_tickets SET status=CASE WHEN status='waiting_customer' THEN 'in_progress' ELSE status END,updated_at=now() WHERE id=v_ticket.id;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_list_support_tickets(p_actor_id uuid,p_query text DEFAULT NULL,p_status text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  IF NOT public.has_permission(p_actor_id,'support.manage') THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='FORBIDDEN'; END IF;
  RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',t.id,'ticketNumber',t.ticket_number,'userId',t.user_id,'orderNumber',o.order_number,'customerEmail',o.customer_email,'subject',t.subject,'category',t.category,'priority',t.priority,'status',t.status,'assignedTo',t.assigned_to,'createdAt',t.created_at,'updatedAt',t.updated_at,'messages',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',m.id,'authorType',m.author_type,'body',m.body,'internal',m.internal,'createdAt',m.created_at) ORDER BY m.created_at),'[]'::jsonb) FROM public.support_ticket_messages m WHERE m.ticket_id=t.id)) ORDER BY CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END,t.updated_at DESC),'[]'::jsonb) FROM public.support_tickets t LEFT JOIN public.commerce_orders o ON o.id=t.order_id WHERE (p_status IS NULL OR t.status=p_status) AND (coalesce(p_query,'')='' OR t.ticket_number ILIKE '%'||p_query||'%' OR t.subject ILIKE '%'||p_query||'%' OR o.customer_email ILIKE '%'||p_query||'%' OR o.order_number ILIKE '%'||p_query||'%'));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_update_support_ticket(p_actor_id uuid,p_ticket_id uuid,p_status text,p_priority text,p_assigned_to uuid,p_message text,p_internal boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_ticket public.support_tickets%ROWTYPE;
BEGIN
  IF NOT public.has_permission(p_actor_id,'support.manage') THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='FORBIDDEN'; END IF;
  IF p_status NOT IN ('open','in_progress','waiting_customer','resolved','closed') OR p_priority NOT IN ('low','normal','high','urgent') OR char_length(coalesce(p_message,''))>4000 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_TICKET_UPDATE'; END IF;
  UPDATE public.support_tickets SET status=p_status,priority=p_priority,assigned_to=p_assigned_to,resolved_at=CASE WHEN p_status IN ('resolved','closed') THEN coalesce(resolved_at,now()) ELSE NULL END,updated_at=now() WHERE id=p_ticket_id RETURNING * INTO v_ticket;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='P0002',MESSAGE='TICKET_NOT_FOUND'; END IF;
  IF nullif(trim(p_message),'') IS NOT NULL THEN INSERT INTO public.support_ticket_messages(ticket_id,author_id,author_type,body,internal) VALUES(p_ticket_id,p_actor_id,'staff',trim(p_message),p_internal); END IF;
  INSERT INTO public.audit_events(market_id,actor_id,actor_type,action,resource_type,resource_id,metadata) VALUES(v_ticket.market_id,p_actor_id,'admin','support.ticket_updated','support_ticket',p_ticket_id::text,jsonb_build_object('status',p_status,'priority',p_priority,'assignedTo',p_assigned_to,'internal',p_internal));
END; $$;

REVOKE ALL ON FUNCTION public.customer_create_support_ticket(uuid,text,text,text,text),public.customer_list_support_tickets(uuid),public.customer_reply_support_ticket(uuid,text,text),public.admin_list_support_tickets(uuid,text,text),public.admin_update_support_ticket(uuid,uuid,text,text,uuid,text,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.customer_create_support_ticket(uuid,text,text,text,text),public.customer_list_support_tickets(uuid),public.customer_reply_support_ticket(uuid,text,text),public.admin_list_support_tickets(uuid,text,text),public.admin_update_support_ticket(uuid,uuid,text,text,uuid,text,boolean) TO service_role;
