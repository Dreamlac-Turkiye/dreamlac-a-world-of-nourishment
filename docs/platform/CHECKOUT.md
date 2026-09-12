# Checkout invariants and activation

## Guarantees

- Client sends variant IDs and quantities; database listings supply names and prices.
- A market, listing, product, variant and warehouse must all be active.
- Currency comes from the market and cannot be selected by the browser.
- Inventory is reserved with a conditional row update inside the order transaction.
- A repeated idempotency key with the same payload returns the original response.
- Reusing a key with a different payload is rejected.
- Order, items, reservations, ledger, history and outbox either all commit or all roll back.
- Guest orders are supported; an authenticated user is attached only after token verification.
- Reservations expire after 20 minutes and a trusted scheduled worker releases them.

## Activation order

1. Apply migrations to a disposable/test database and run migration tests.
2. Import verified products, variants, listings and opening inventory.
3. Configure an active Turkish warehouse.
4. Add approved terms/privacy version identifiers.
5. Connect payment in sandbox and verify signed callbacks and reconciliation.
6. Connect shipping quote calculation; never accept a fee from the browser.
7. Run checkout concurrency, retry and expiry tests.
8. Set `providers_ready=true` in the Turkish market only after all required adapters pass.
9. Set `checkout_enabled=true`, perform a controlled staging order, then enable production traffic.

## Required scheduled work

Run `release_expired_inventory_reservations` at least once per minute through a trusted scheduler.
The scheduler uses a server credential and records invocation, duration, released count and errors.
Multiple workers are safe because rows are selected with `FOR UPDATE SKIP LOCKED`.

## Deliberately excluded until the next phases

- Tax engine and shipping quote are currently zero and cannot be overridden by the browser.
- Payment session creation and verified webhook transition.
- Capture, refund, shipment and invoice workers.
- Legacy preview-order migration and UI cutover.
