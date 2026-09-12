# Fulfilment and outbox operations

- Shipment and invoice creation are idempotent server operations available only after captured payment.
- Provider calls happen after the database transaction through durable outbox events.
- Workers claim rows with `FOR UPDATE SKIP LOCKED`, a lease and a stable worker identifier.
- Failures retry with exponential backoff; ten failed attempts move an event to `dead` for intervention.
- Only the worker holding a lease may complete or fail that event.
- Shipment, invoice and notification provider references contain no credentials.
- Customer contact destinations are represented by hashes in delivery records; message bodies are not stored.

Concrete cargo/e-invoice/email/SMS adapters remain disabled until credentials and sandbox certification
are available. Admin screens must expose pending, failed and dead events before launch.
