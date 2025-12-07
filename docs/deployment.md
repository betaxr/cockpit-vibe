# Deployment Options – Windows Services and Docker

Goal: keep one codebase/build and support both Windows services (primary) and optional Docker without platform-specific branches.

## Build Once, Package Twice
- Canonical artifact: `pnpm build` → `dist/index.js` (API) + `dist/public` (static client served by Express). No platform assumptions in code.
- Runtime entrypoint: `node dist/index.js` (equivalent to `pnpm start`).

## Windows Service (first-class)
- Use a lightweight wrapper (e.g., WinSW or nssm) to run `node dist/index.js` as a service.
- Provide a small PowerShell script to install/remove/start/stop the service and set env vars.
- Logging: write to `logs/` (rotated by WinSW/nssm) or stdout if run interactively.
- Config: `.env` for secrets/settings; avoid hardcoded paths and write only under the app directory.

## Docker (optional)
- Multi-stage Dockerfile that copies build output and runs `node dist/index.js`; Express serves `dist/public`.
- No container-only assumptions; all config via env vars. Intended for Linux hosts or CI/CD.

## Configuration Practices
- All runtime settings via env vars (dotenv supported already).
- Ports/host configurable (`PORT`, `HOST`); avoid platform-specific defaults.
- Keep dependencies pure JS/TS (current stack is fine for Windows).

## Suggested Scripts/Docs
- Optional scripts: `prepare:win-service` (build + stage WinSW config), `package:docker` (build + docker build).
- README sections:
  - Windows: how to install/start/stop the service using the provided PowerShell wrapper.
  - Docker: `docker build` and `docker run` snippets with env var mapping.

## Key Principles
- No divergent code paths; only packaging differs.
- Keep logs and data relative to the app root.
- Treat Docker as an optional convenience; Windows service is the default operational mode.
