# Payment orchestration

## Trust boundary

Dreamlac never accepts a browser claim that payment succeeded. The selected provider adapter first
verifies the raw callback signature, timestamp and provider event shape. Only then may the normalized
event reach `apply_verified_payment_event`, which is callable by the server role only.

## State flow

1. `create_payment_attempt` locks the order, copies its trusted amount/currency and is idempotent.
2. The provider adapter creates a hosted/tokenized payment session.
3. `attach_payment_provider_reference` binds that session to the attempt exactly once.
4. Browser return pages show “processing”; they never capture or mark an order paid.
5. A signed callback is normalized to authorized, captured, failed or cancelled.
6. A capture atomically settles stock, consumes reservations, marks payment/order and emits an event.
7. Failure/cancellation atomically releases stock and records the transition.
8. Repeated provider event IDs return the original processing outcome without side effects.

## Provider adapter certification

- Hosted/tokenized fields ensure PAN/CVV never touch Dreamlac logs or servers.
- 3-D Secure success/failure and customer cancellation are tested.
- Signature comparison is constant-time and validates timestamp/replay window when supported.
- Provider reference, amount and currency are required and checked against the database attempt.
- Duplicate, delayed and out-of-order callbacks are tested.
- Timeouts, provider 5xx, partial outages and retry policy are tested.
- Refund and daily reconciliation tests must pass before production activation.

No concrete adapter is registered yet. Adding credentials alone cannot activate a provider; its code,
contract tests, staging certification and market flags must also be complete.
