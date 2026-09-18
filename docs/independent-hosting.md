# Independent hosting and design preview

GitHub is the source of truth. Lovable may run the Vite development server to
review the UI, but is not needed for authentication, builds, or production hosting.
Do not rewrite pushed history. Merge this branch only after reviewing the preview.

## Local and Lovable preview

Use Node 24 and Bun. Run `bun install --frozen-lockfile`, then `bun run dev`.
With no public Supabase variables the development server uses offline demo mode.
To force offline preview even when the editor injects existing variables, set
`VITE_DATA_MODE=demo` in its environment. No connection or reconnection to
Lovable Cloud is required. A partial live configuration fails explicitly instead
of silently hiding an error.

`bun run build:preview` creates a standalone preview bundle; `bun run start`
serves it on Node. `bun run check:preview` starts that bundle without Supabase
variables and checks 25 public pages over HTTP.

Preview uses the existing catalog (not invented nutritional or price claims).
The cart remains local. `/yonetim-onizleme` is the existing fictional admin
dashboard. Protected routes redirect there only in demo mode; they do not obtain
a fake authenticated session. Sign-in is disabled and server-function requests
are blocked in both browser and server middleware. Database access through the
admin client is also blocked. This is a design preview, not a simulated order
processing system. Public legal pages show their existing fallback when no
approved text is loaded. No preview information is saved to the real database.

## Live configuration

`bun run build` is the production build and rejects demo or missing public
connection settings. Use `VITE_DATA_MODE=supabase` and provide these at build time:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (public/anon, never service-role)
- `VITE_SITE_URL`

Set the server runtime environment separately:

- `APP_ENV=production`
- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` matching the browser project
- `SUPABASE_SERVICE_ROLE_KEY` in the hosting secret manager only
- `VITE_SITE_URL`, `VITE_DEFAULT_MARKET=TR`, and existing provider settings from
  `.env.example`; keep payment/shipping/invoice providers disabled until certified.

Node: build with the default `node-server` preset and run `bun run start` (or
`node .output/server/index.mjs`). Configure runtime variables in your service.
Cloudflare Workers: set `NITRO_PRESET=cloudflare-module` during the build. Nitro
generates `.output/server/wrangler.json` with assets and Node compatibility.
This is an SSR app, not a static Pages upload.

The manual `deploy-cloudflare.yml` workflow runs only from `main`. Before using
it, configure a protected GitHub `production` environment with the three public
build variables above, `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets,
and the matching runtime secrets on the `dreamlac-turkey` Worker. Confirm that
Worker name belongs to this project before deploying. This change does not
deploy, select an account, migrate data, rotate keys, or alter DNS.

## Supabase ownership and Google login

The live project must be accessible from your own Supabase account. Changing
application code does not transfer ownership of a Lovable-managed database.
If it is managed only by Lovable, inventory and export its database, auth users,
storage and functions and plan a separate migration with backups before cutover.
Do not replace or delete the existing database merely to fix preview.

Google sign-in now uses Supabase OAuth directly. Enable the Google provider on
the independent Supabase project and register its callback with Google. Add the
live site's `/giris` URL (and authorised staging URLs) to Supabase's redirect
allow-list. Test email login, Google redirects, password recovery, MFA, RLS and
server functions in staging before enabling production traffic. These cannot be
certified with offline preview data.

## Verification and limitations

Run `bun run check:environment`, `bun run typecheck`, `bun run lint`,
`bun run check:commerce`, `bun run check:release`, `bun run build:preview`, and
`bun run check:preview`. The environment tests reject unsafe browser keys,
partial configuration, invalid modes, and production demo fallback.

Existing server services, migrations, RBAC, MFA, CSRF and commerce safeguards are
preserved. This change does not redesign every administrative database query
behind a new repository abstraction. No real secrets have been added. Ignoring
`.env` does not remove previously committed secrets from Git history; any genuine
secret exposure requires separate rotation and an approved remediation plan.

Lovable editor compatibility must be checked after an approved merge into its
connected branch; passing local SSR tests is not proof of the hosted editor's
behavior. Native TanStack/Vite/Nitro replace the Lovable-specific build wrapper.
