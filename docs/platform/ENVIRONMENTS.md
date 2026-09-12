# Environments and secrets

| Environment | Purpose                   | Data               | Providers        | Domain          |
| ----------- | ------------------------- | ------------------ | ---------------- | --------------- |
| Local       | developer feedback        | synthetic          | disabled/fake    | localhost       |
| Preview     | pull-request UI           | synthetic          | disabled/fake    | temporary       |
| Staging     | integration certification | isolated test data | provider sandbox | private host    |
| Production  | real commerce             | real customers     | production only  | official domain |

Each environment uses a separate Supabase project. Production secrets live only in the deployment
secret manager. Preview/staging cannot access production data or providers. Credentials have an
owner and rotation date; webhook endpoints and secrets are environment-specific.

Production is blocked until migrations, tests, provider contract tests, backup verification and
rollback instructions pass. Checkout is enabled separately after deployment for safe smoke tests.
