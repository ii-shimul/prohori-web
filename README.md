# Prohori Operations Hub — Web

Next.js web client for synthetic multi-provider operations review. Supabase handles authentication/session only. Domain data must come from NestJS API under `/api/v1`.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set Supabase project URL and publishable key in `.env.local`.
3. Keep `NEXT_PUBLIC_PROHORI_API_URL=https://prohori-api.onrender.com/api/v1` for remote API use.
4. Run `npm install`.
5. Run `npm run check:remote-api` to verify remote API health.
6. Run `npm run dev`.
7. Open `http://localhost:3001`.

## Checks

```bash
npm run lint
npm run test
npm run build
```

`npm run test` runs deterministic fixture smoke tests for Provider A scope, dashboard filters, Scenarios A–D, simulation routes, auth guardrail source, and no-action UI boundary. It does not claim a live Supabase/API end-to-end pass.

`npm run check:remote-api` verifies `${NEXT_PUBLIC_PROHORI_API_URL}/health/live` returns HTTP 200 with `{ "status": "ok" }`. It does not require local Supabase, Docker, or a local API process.

Live auth/domain verification still requires Supabase test credentials, a valid `/me` role response, domain endpoints, and scenario control endpoints. Record any live failure with route, role, scenario, API response/error code, and correlation ID.

## Contract status

Authoritative backend contract is `../prohori-api/openapi.yaml`, version `1.0.0`. `npm run check:api-contract` verifies generated types and contract version; `npm run generate:api` refreshes them. Current contract still types `CurrentUser.memberships` and `assignments` as unstructured objects, so role projection remains a contract gap for Phase 1. Until API reads are integrated, typed fixture data remains isolated from production API integration.

## Authentication

Supabase SSR authentication uses server clients and Next.js `proxy.ts` cookie refresh. Add the Supabase URL, publishable key, and seeded user credentials before testing sign-in. In Render API environment variables, set `CORS_ORIGINS` to a comma-separated allowlist containing `http://localhost:3001` and deployed web origin. Do not use `*`.

- `/` redirects to `/login` without verified claims and `/dashboard` with verified claims.
- Dashboard routes fail closed when session or Supabase configuration is missing.
- Sign-in and sign-out use Server Actions. Session cookie refresh happens in `proxy.ts`.
- `/me` role projection and real NestJS domain calls remain blocked until API owner provides contract and endpoint.

## UI system

Shadcn initialized with Shadcnblocks registry in `components.json`. Add reviewed blocks with:

```bash
npx shadcn@latest add @shadcnblocks/{blockId}
```

Brand tokens live in `app/globals.css`. Use semantic Tailwind classes such as `bg-primary`, `text-muted-foreground`, and `border-border`, not raw hex values in components.

## Fixture mode

Until API contract handoff, `/dashboard` and `/outlets` use typed Provider A fixture data behind the existing authenticated route guard. Filters remain URL-backed. Use `?view=loading`, `?view=empty`, or `?view=error` to inspect reusable states. Remove fixture adapter after live outlet/dashboard endpoints are integrated.

For local visual testing without Supabase credentials, run `npm run dev` and open `/preview/operations`. This synthetic-data route exists only in development; production returns 404.

Alert fixture preview: open `/preview/operations/alerts`. Scenario B evidence uses `alert-b-liquidity`, `alert-b-activity`, and `alert-b-review`; Scenario C uses `alert-c-inconsistency`.

Case workflow preview: open `/preview/operations/cases/case-204`. Commands simulate the full lifecycle only in browser memory; refresh resets it. Production case routes render read-only until API workflow commands exist.

Phase 4 fixture previews: `/preview/operations/feed-health` defaults to `DATA_STEWARD`; `/preview/operations/management/readiness` defaults to `PLATFORM_MANAGEMENT`. Add `?role=PROVIDER_OPERATIONS` to either route to verify its unauthorized state. Feed-health supports `?view=loading`, `?view=empty`, and `?view=error`. Both preview routes return 404 in production. Protected routes apply server-side convenience role checks from verified Supabase claims; NestJS API remains authorization authority when live endpoints arrive.

Scenario-control preview: `/preview/operations/simulation` defaults to `DEMO_ADMIN`. Use `?scenario=A|B|C|D&stage=baseline|started|step-1|step-2` to test deterministic controls and refresh behavior. Add `?role=PROVIDER_OPERATIONS` to verify denial. It is URL-backed UI preview only: no API request, database change, or financial control exists. Live simulation stays contract-pending until authorized API endpoints arrive.

Locale preview: use the top-bar `বাংলা` / `English` control on any preview route. It writes only the `prohori_locale` preference cookie, then refreshes server-rendered content; it does not store or change authentication data. Alert and case labels, freshness/state labels, and required Bengali alert summaries/safe next steps are localized. IDs, numeric values, timestamps, and API-error/correlation values remain unchanged.

## Safety boundary

- No direct Supabase query to application/domain tables.
- No access tokens in `localStorage`.
- No transfer, refill, settlement, wallet, fraud-verdict, or other financial-action control.
- Show synthetic-data status in all operations routes.
