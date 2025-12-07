# Cockpit Vibe – Architecture Findings (2025-02-07)

## Context
- App is a cockpit/overview for another system; processes/schedules are external concepts, so this service mostly aggregates/visualizes rather than executing work.
- Stack: Express + tRPC 11 + Drizzle/MySQL + React/Vite/Tailwind; shared types between client/server via `@shared`.

## Strengths
- Type-safe end-to-end: shared constants/types, tRPC with superjson, Drizzle schema checked in.
- Developer ergonomics: Vite middleware for dev, esbuild bundle for API, clear aliases, basic auth tests.
- Auth flow contained: OAuth callback + session issuing in one place; cookie helper centralizes flags.

## Issues / Gaps (highest impact first)
- Data layer unused: Routers serve static `seedData`; Drizzle CRUD is not wired, and `getDb` silently no-ops when `DATABASE_URL` missing → easy to ship without real persistence.
- No tenancy or authz model: Tables lack tenant/customer scoping; all data global. `testLogin` backdoor lives in production code.
- Security hardening: Session cookies `SameSite=None` without CSRF protection; no rate limiting; encryption key for DB passwords derived from `JWT_SECRET` and padded; OAuth flow lacks PKCE/state validation beyond base64 decode.
- Ops readiness: No request logging, structured error middleware, metrics, or HTTP health probe; no graceful shutdown hooks. Config not validated at startup.
- Frontend access control: Routes/pages don’t gate on auth; user redirected only after tRPC 401s.
- Testing/CI: Only auth router has tests; no DB or integration coverage; no CI config visible.
- External API hygiene: OAuth/Data API calls lack observability and retry/backoff; errors are minimally surfaced.

## Suggested Next Steps (tailored to “cockpit” role)
1) Wire real persistence for cockpit data: introduce service layer (e.g., `services/agents.ts`) using Drizzle; swap seed-driven routers to query DB; fail fast if `DATABASE_URL` missing.
2) Add tenant/role boundaries: add `tenant_id` to relevant tables and scope queries; define roles/permissions; remove or dev-guard `auth.testLogin`.
3) Security pass: add CSRF protection for cookies (`SameSite=Lax` for web), rate limiting on auth, dedicated encryption key from secret store, PKCE/state validation for OAuth; consider JWT rotation/expiry enforcement.
4) Ops & reliability: add pino/http logging + error middleware, `/healthz` probe, metrics (Prometheus/OpenTelemetry), graceful shutdown on SIGTERM; validate env with zod at boot.
5) Frontend gating: wrap routes in an auth guard; central layout with fallback/loading; keep query/mutation error handling consistent.
6) Delivery pipeline: add CI to run `pnpm check`, `pnpm test`, `pnpm build`; add Dockerfile (multi-stage) and `.env.example` parity checks.
7) Observability for external calls: standardize clients with retries, timeouts, and logging/tracing for OAuth/Data API.
8) Data protection & audits: move DB connection secrets to a vault/KMS; audit log admin actions (connections, user/session events); plan backups and tested restores.
