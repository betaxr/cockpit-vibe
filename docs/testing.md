# Testing Status and Strategy

## Current State (Feb 2025)
- Scope: Vitest unit tests call tRPC routers via `appRouter.createCaller`. Coverage is mostly happy-path for seed-data endpoints.
- Auth: Protected/admin middleware is not exercised for failure paths; access-control regressions would slip through.
- Assertions: Many checks only verify arrays exist or length > 0; payload shapes and required fields are not enforced.
- Time-based logic: Routes depending on `new Date().getHours()` (e.g., running processes) aren’t time-controlled, so results can vary by clock.
- HTTP surface: The Express adapter, cookies, headers, and serialization aren’t tested (no end-to-end HTTP tests).
- Database: Drizzle CRUD helpers and encryption/decryption are untested; tests mock context and never touch persistence.
- Frontend: No tests for React pages/hooks (auth flow, routing, query wiring).

## Recommended Strategy

1) **Harden API unit tests**
   - Add failure-path coverage for `protectedProcedure` and admin-only routes (unauthorized/forbidden).
   - Strengthen assertions with shape checks (required keys/types), not just array existence.
   - Use `vi.useFakeTimers()` to freeze time around time-dependent procedures.

2) **Add HTTP integration tests (Express + tRPC adapter)**
   - Start the Express app (or handler) in tests and hit `/api/trpc` with `@trpc/client` or `supertest`.
   - Assert cookies are set/cleared with correct options; verify auth middleware behavior over HTTP.

3) **Cover database helpers**
   - Use an in-memory or test MySQL/TiDB instance (or a Drizzle mock) to exercise `upsertUser`, connection CRUD, encryption/decryption, and error paths when DB is unavailable.
   - Add contract-style tests for return shapes from `getAllDatabaseConnections`, etc.

4) **Frontend smoke tests**
   - Add a few React tests (e.g., `useAuth`, login page) to ensure query wiring, redirects, and error handling keep working.
   - Optional: lightweight component tests for critical pages (Dashboard, Agents list).

5) **Stability and tooling**
   - Freeze global date/time in suites that depend on clock-based logic.
   - Add factories/fixtures for seed data to avoid brittle assertions.
   - Keep `pnpm test` as the single entry point; consider a separate `pnpm test:api` for HTTP integration if it needs a server bootstrap.

## Minimal Next Steps
- Write auth failure-path tests (unauthenticated/forbidden) and stronger shape assertions on key routes.
- Add a small HTTP integration test to assert cookie issuance/clearing on login/logout.
- Freeze time in running-process/schedule tests.
