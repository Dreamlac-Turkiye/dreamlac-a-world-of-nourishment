# Commerce operations runbook

## Alert thresholds

- Outbox dead events: alert immediately.
- Oldest ready outbox event: warn after 2 minutes, critical after 10 minutes.
- Pending payment older than 15 minutes: investigate provider callbacks and reconciliation.
- Received webhook older than 5 minutes: investigate signature validation and worker availability.
- Failed payments over 24 hours: watch both count and failure ratio by provider.

## Recovery

1. Confirm the provider is healthy and credentials are valid.
2. Inspect the redacted failure and correlation ID.
3. Correct the provider or payload issue.
4. Retry only failed/dead events through the permissioned operation.
5. Confirm the event becomes sent and the aggregate reaches the expected state.

Retry is audited. Workers use leases and exponential backoff, so multiple workers can safely process the queue. Scheduled maintenance should delete expired rate-limit buckets in small batches.

Rate-limit subjects must be normalized and hashed before storage. Recommended starting limits are 10 login attempts per 15 minutes, 30 checkout attempts per 10 minutes per account, and provider webhook limits sized from measured traffic rather than a hard-coded global value.
