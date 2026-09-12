# Dreamlac Commerce Architecture

## Model

Use a modular monolith: one deployable application and one relational consistency boundary with
strict modules. It is simpler to operate than microservices at launch while provider and market
interfaces preserve a later split if measured load requires it.

Each host resolves to a validated market profile. Country-specific records carry `market_id`; shared
brand/product identity stays global. Cross-market access is denied by default.

| Module     | Owns                                  | Must not trust             |
| ---------- | ------------------------------------- | -------------------------- |
| Catalog    | products, variants, localized copy    | browser prices             |
| Pricing    | price books, discounts, tax inputs    | client totals              |
| Inventory  | ledger, reservations, availability    | cart quantity alone        |
| Checkout   | validated intent, address, consent    | product names/fees from UI |
| Orders     | immutable snapshot, state history     | provider redirects         |
| Payments   | attempts, captures, refunds, webhooks | unsigned callbacks         |
| Fulfilment | shipments, tracking, returns          | client order state         |
| Invoicing  | requests and document references      | unverified payment claims  |
| Identity   | accounts, roles, addresses, consent   | client role flags          |
| Operations | outbox, audit, reconciliation         | uncorrelated events        |

## Checkout sequence

1. Client submits market, variant IDs, quantities, address and an idempotency key.
2. Server resolves the allowed host and validates the request.
3. Server loads active prices and calculates tax, discounts and shipping.
4. A transaction reserves inventory and writes order, items, totals and consent snapshots.
5. After commit, the payment adapter creates a session using the server total.
6. The customer completes payment in provider-owned fields/pages.
7. The signed webhook is stored before processing; duplicates return the previous outcome.
8. State advances through allowed transitions and an outbox event commits with it.
9. Workers create invoice/shipment and notify the customer with retry/dead-letter handling.

## Scale and security

- CDN-cache assets/catalog; keep checkout writes short and transactional.
- Never call providers inside a database transaction.
- Use pooled, indexed market-scoped queries and horizontal app instances.
- Use uniqueness and idempotency rather than timing assumptions.
- Browser receives publishable credentials only; service/provider secrets stay server-side.
- Authoritative writes use server functions/RPC, not public table inserts.
- Webhooks retain redacted payload, signature and processing outcome.
- Administrative mutations require roles and immutable audit events.
- Never store, proxy or log card number/CVV.
