DROP POLICY IF EXISTS "Users can read shipment events of their own orders" ON public.shipment_events;

CREATE POLICY "Users can read shipment events of their own commerce orders"
ON public.shipment_events FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.commerce_orders o
    WHERE o.order_number = shipment_events.order_number AND o.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

COMMENT ON TABLE public.orders IS
  'DEPRECATED: legacy prototype table. commerce_orders is canonical. Verify empty before removal.';
COMMENT ON TABLE public.order_items IS
  'DEPRECATED: legacy prototype table. commerce_order_items is canonical. Verify empty before removal.';

REVOKE INSERT, UPDATE, DELETE ON public.orders FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM authenticated;
