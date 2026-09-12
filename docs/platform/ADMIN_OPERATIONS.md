# Commerce administration

Administrative commerce mutations run through server functions and service-only database RPCs. A
valid login is not sufficient: every operation checks a named permission and writes audit evidence.

Initial permissions cover order reading/management, refunds, fulfilment, inventory, catalog,
customers and operations. Inventory cannot be edited silently: every adjustment has a reason,
idempotency key, actor, ledger entry and resulting balance. Adjustments that would make physical
stock negative or lower than reserved stock are rejected.

The order work queue supports market, status and customer/order search with bounded pagination. The
detail response includes immutable items, payments, shipments, invoice and status history. UI screens
will consume these RPCs after staging migrations and realistic test data are available.
