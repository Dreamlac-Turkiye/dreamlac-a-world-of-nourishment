# Security and delivery baseline

Every response receives a correlation ID and baseline browser security headers. Upstream proxies should preserve `x-request-id`; logs, payment attempts, shipments and support incidents should record it.

GitHub Actions now validates migration uniqueness, required commerce entities, the public environment template, TypeScript and the production build. Branch protection should require the `verify` job before merging.

## Before production

- Store service-role, payment, cargo and invoice credentials only in the deployment secret manager.
- Enable Supabase point-in-time recovery, database alerts and daily restore verification.
- Put the application behind a CDN/WAF with per-IP and per-account rate limits.
- Configure CSP in report-only mode, inspect violations, then enforce it.
- Add error tracking and metrics for checkout latency, payment failures, outbox backlog and inventory reservation failures.
- Require two-person approval for production secrets, refunds, database migrations and emergency access.
- Run load tests in staging with provider sandboxes; never load-test production checkout.

The existing repository-wide lint debt is not yet a release gate. New commerce modules are linted during implementation; full lint enforcement should be enabled after legacy findings are remediated.
