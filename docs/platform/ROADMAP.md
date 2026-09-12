# Dreamlac Commerce Platform Roadmap

This roadmap is the execution contract for turning the Turkish storefront into a production
commerce platform that can launch in more countries without forking the application. A phase is
complete only when its exit criteria pass.

## Principles

- One codebase, multiple markets; country differences are configuration and data.
- The server owns price, discount, tax, shipping, inventory and order state.
- Money is integer minor units plus an ISO-4217 currency.
- Payment card data never enters Dreamlac systems.
- External callbacks are authenticated, idempotent, stored and replay-safe.
- Orders, stock and payments use explicit state machines and append-only history.
- Integrations stay disabled until sandbox, failure, retry and reconciliation tests pass.

## Target markets

| Market       | Domain            | Locale  | Currency | Status         |
| ------------ | ----------------- | ------- | -------- | -------------- |
| Turkey       | `dreamlac.com.tr` | `tr-TR` | `TRY`    | First launch   |
| Saudi Arabia | `dreamlac.com.sa` | `ar-SA` | `SAR`    | Future profile |

## Phase 0 — Baseline and governance

- Architecture decisions, environment matrix, secret inventory and ownership.
- Definition of done, release checklist, rollback and incident procedure.
- CI must build, type-check, lint and test every change.

Exit: no committed secrets; production cannot use test credentials; CI is mandatory.

## Phase 1 — Multi-market foundation

- Validated market profile: hosts, locales, currency, timezone and regulatory flags.
- Market-specific legal entity, tax, address and phone schemas.
- Provider contracts for payment, shipping, invoicing and notifications.
- Fail-closed feature flags for every commerce integration.

Exit: Turkey resolves from a profile; a Saudi launch requires configuration/data, not copied UI.

## Phase 2 — Commerce data model

- Products, variants, market listings, price books and tax categories.
- Warehouses, stock ledger, balances and expiring reservations.
- Customer profiles, versioned addresses and server-side carts.
- Orders with immutable snapshots, totals breakdown and status history.
- Payments, refunds, shipments, invoices, webhooks, idempotency and outbox records.

Exit: constraints reject invalid values; public clients cannot write authoritative commerce tables;
market-scoped indexes cover checkout, account and administration queries.

## Phase 3 — Authoritative checkout

- Versioned server-side validation and calculation.
- Atomic order creation and inventory reservation.
- Guest/authenticated checkout with terms and privacy evidence.
- Mandatory idempotency key on every order attempt.

Exit: browser manipulation cannot change totals; the final unit cannot be oversold; retries cannot
duplicate orders; failures leave no orphan orders or reservations.

## Phase 4 — Payment orchestration

- Provider adapter, hosted/tokenized entry and 3-D Secure.
- Signed webhook verification, deduplication and replay protection.
- Attempts, capture, cancellation, partial/full refunds and reconciliation.

Exit: redirects cannot mark orders paid; only verified events confirm payment; duplicate and
out-of-order callbacks are harmless; reconciliation detects every mismatch.

## Phase 5 — Shipping, invoicing and notifications

- Shipping quotes, serviceability, labels, tracking, cancellation and returns.
- Invoice issue/status/document reference and credit-note support.
- Transactional outbox workers with retry, backoff and dead-letter handling.

Exit: provider outages lose no paid orders; customers/admins see a complete timeline.

## Phase 6 — Customer and admin operations

- Profiles, address book, history, cancellation/return requests and consent center.
- Admin order queue, payment/refund, fulfilment, stock, catalog and customer screens.
- Role permissions, approval gates and append-only audit log.

Exit: support needs no direct database access; sensitive actions are authorized and audited;
inventory changes are ledger entries, never silent edits.

## Phase 7 — Reliability, security and compliance

- Rate limits, bot protection, security headers and dependency scanning.
- Structured logs, correlation IDs, error monitoring and business metrics.
- Backup/restore drill, retention jobs and incident runbooks.
- KVKK/cookie/e-commerce approvals and infant-formula content review.

Exit: recovery is tested; alerts cover checkout, webhooks, stock and reconciliation; legal/medical
claims have named approval owners.

## Phase 8 — Load, launch and template certification

- Unit, integration, end-to-end, contract, migration and load tests.
- Browse, checkout, webhook-burst and administration load profiles.
- Staged launch, rollback drill and Saudi dry-run with fake providers.

Exit: agreed service objectives pass with headroom; concurrency tests cause no oversell or duplicate
charge; the second market is provisioned without copying business logic.

## Inputs that must not be guessed

- Registered entity, MERSIS/tax/trade registry details and official addresses.
- Approved consumer, privacy, cookie, marketing and infant-formula legal text.
- Verified product label, barcode, SKU, nutrition, allergen and preparation data.
- Tax adviser decision on VAT and invoice treatment.
- Production contacts, warehouse and return addresses.
- Payment, cargo, e-invoice, email/SMS and monitoring providers plus credentials.
- Target peak traffic and orders used for capacity certification.
