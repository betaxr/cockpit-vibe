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
- [x] Wire real persistence for cockpit data (Mongo-backed `dataProvider` + Drizzle services; prod fail-fast if `DATABASE_URL` is missing).
- [x] Add tenant/role boundaries (tenantId columns + dev-only `testLogin`).
- [x] Security pass (CSRF + rate limiting in `security.ts`, dedicated `ENCRYPTION_KEY`, OAuth state/nonce validation).
- [x] Ops & reliability (pino HTTP logging, `/healthz`, graceful shutdown, env validation at boot).
- [x] Frontend gating (AuthGuard + `withAuth` wrap all routed pages with loading/unauthorized fallbacks).
- [x] Delivery pipeline (Dockerfile + CI with env parity check).
- [x] Observability for external calls (instrumented OAuth client with retries/telemetry).
- [x] Data protection & audits (S3 backup/restore helper for audit logs).
