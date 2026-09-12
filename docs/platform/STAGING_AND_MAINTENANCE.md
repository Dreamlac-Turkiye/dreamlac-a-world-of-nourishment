# Staging and maintenance

Create an isolated staging deployment with a separate Supabase project, provider sandbox credentials and synthetic customer data. Never copy production personal data into staging.

Add STAGING_BASE_URL to the GitHub staging environment and protect that environment with an approval reviewer. The manual Staging smoke workflow performs bounded, read-only requests, refuses the Turkey production hostname and requires HTTPS.

Schedule run_commerce_maintenance() every five minutes using the platform scheduler. It deletes expired rate-limit and idempotency records in bounded batches and queues reconciliation events for payment attempts pending over 15 minutes. The integration worker must verify each payment directly with its provider before changing order state.

Before launch, run staged scenarios for successful payment, declined payment, delayed webhook, duplicate webhook, cargo timeout, invoice failure, inventory contention, worker restart and provider outage.
