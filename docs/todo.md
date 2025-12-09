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

## New TODOs — DB-first UX statt Mockups
- [ ] Datenmodell finalisieren (Mongo): tenantId als Pflicht; Collections für Teams, Agents, Workplaces, Processes, Schedules, Runs, Skills; Indizes `{tenantId, externalId}` unique + `{tenantId, agentId|workplaceId|processId}`.
- [ ] Status-Definitionen verankern: Agents (active/busy/idle/offline/planned), Workplaces (available/busy/idle/offline/maintenance), Processes (planned/scheduled/running/completed/failed/canceled/test); Auslastung = busyAgents/totalAgents (Agents != offline).
- [ ] APIs bereitstellen: Dashboard-Endpoint mit Zeitfenster (Tag/Woche) für KPIs + Summary (activeTeams/totalAgents/runningProcesses); Teams/Agents/Workplaces/Processes/Skills/Schedules/Runs Endpunkte liefern obige Felder.
- [ ] Wochenplan: Endpoint `scope=team|workplace` mit Lanes und Blocks `{processId, name, startTime, endTime, status}`; Filtern nach Tenant + Zeitrange.
- [ ] Frontend: Team-Karten auf API-Daten umstellen; Daily-Capacity als agents*24h + narrativer Tooltip; Summary-Zahlen aus Dashboard-Endpoint statt lokal summieren.
- [ ] Frontend: Wochenplan UI umschalten Team/Workplace; keine 24h-Capacity im Plan; Prozesse/Workplaces/Skills anzeigen wie in Mockups.
- [ ] Skills: Liste + “used in” Übersicht (Aggregat aus Processes/Runs); Prozesse erlauben mehrere Skills.
- [ ] Workplaces: Felder aus Mockups übernehmen (type VM/PC, location/department, status, currentProcessId/allowedProcessIds oder Traits); UI anzeigen, welcher Prozess gerade läuft.
- [ ] Runs: Ausführungs-Historie separat speichern (per Prozess/Workplace/Agent) für KPIs und Timeline; Prozesse bleiben Stammdaten.
- [ ] Zeitkontext: Kalender-Modus (Tag/Woche) propagiert an KPIs/Plan/Runs Queries; UI zeigt aktiven Zeitraum.
- [ ] Sidebar-UI: Glass/blur (10px) + transparente Tokens, klare Active/Hover/Fokus States.
- [ ] Tooltips/i18n: Short helps für Nav (Agenten/Wochenplan/Cortex/Prozesse/Arbeitsplätze) + KPIs (Prozesse/Wertschöpfung/Zeitersparnis/Auslastung) DE/EN.
- [ ] Layout-Persistenz: Sticky-Grid an allen Seiten anbinden; vorerst localStorage, optional API `/api/layouts {tenantId,userId,page,positions}`.

## TODOs — Business Value, Narrative, Relations
- [ ] Processes (Stammdaten) um Business-Felder ergänzen: `businessName`, `businessDescription`, `domain/category`, `businessOwnerId`, `criticality (low/medium/high/mission_critical)`, `environment (test/stage/prod)`, `narrativeSummary`.
- [ ] Processes um Value-Modell: `valueModelType (time_saving/revenue_gain/cost_avoidance/risk_reduction)`, `baselineManualTimePerItemMinutes`, `baselineCostPerHour`, `baselineVolumePerPeriod`, `plannedAutomationRatePercent`, `plannedQualityImprovementPercent?`, `estimatedValuePerPeriodEuro`, `valueAssumptionsNote`.
- [ ] Runs (Realität) erweitern: `itemsProcessed`, `humanTimeUsedMinutes`, `manualInterventionsCount`, `errorsCount/exceptionsCount`, `actualTimeSavedMinutes`, `actualValueEuro`, `valueConfidence (measured/estimated/unknown)`.
- [ ] SLA/Risk-Felder: Processes `slaTargetSeconds`, `maxAllowedErrorRatePercent`, `riskCategory (compliance/data_privacy/financial/operational)`; Runs `breachedSla`, `slaDelaySeconds`, `retryCount`, optional `incidentId`.
- [ ] Skills: Mehrfach pro Prozess (`skillIds[]`), Skill-Stammdaten `id/tenantId/name/description/tags/params?/version`; Übersicht “used in processes/runs”.
- [ ] Workplaces: Aus Mockups übernehmen und schärfen: `type (VM/PC/...)`, `status`, `location/department`, `allowedProcessIds|traits`, `currentRunId`, `tags`. Relation zu Prozessen sichtbar machen (welcher Prozess läuft dort).
- [ ] Relations/Hierarchie anlegen: Map → Collective → Team → Agent → Process Plan → Run; Felder für Aggregation (teamId/collectiveId/mapId auf Runs/Processes/Workplaces/Agents).
- [ ] QueueItems (optional) für Backlog/Wert: `queueItemId`, `processId`, `businessReference`, `estimatedItemValueEuro`, `priority`, `dueDate`.
- [ ] KPI/ROI-Logik im Backend: geplante Werte (aus Process-Value-Modell) vs. reale Aggregationen (aus Runs) je Zeitraum (Tag/Woche) liefern; Abweichungen berechnen.
- [ ] Frontend: Narrative-Module mit `narrativeSummary`/Business-Feldern befüllen; KPI-Module um “planned vs. actual” erweitern; Tooltip/Hinweise zur Confidence (valueConfidence).
