# Prohori Operations Hub — Web

Next.js web client for synthetic multi-provider operations review. Supabase handles authentication/session only. Domain data must come from NestJS API under `/api/v1`.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Obtain values and seeded test accounts from API owner.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

## Checks

```bash
npm run lint
npm run build
```

## Contract status

`prohori-api/openapi.yaml` does not exist yet. Do not invent endpoint models. When API owner releases versioned OpenAPI contract, copy it to `openapi.yaml`, update local types, and record version here.

## Authentication

Supabase SSR authentication uses browser/server clients and Next.js `proxy.ts` cookie refresh. Add the Supabase URL, publishable key, and seeded user credentials before testing sign-in.

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
