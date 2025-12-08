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

### How to use (WinSW)
1. Build once: `pnpm build`
2. Generate WinSW assets: `pnpm prepare:win-service` → outputs to `deploy/win-service/`
   - Contains `${ServiceName}.xml` (default `CockpitVibe.xml`), `logs/`, and a copied `.env` for reference.
   - Edit the XML to add missing `<env>` entries (DB secrets, OAuth, etc.).
3. Download `winsw.exe` (https://github.com/winsw/winsw) and place it next to the XML.
4. Install/start from `deploy/win-service`:
   - `.\winsw.exe install`
   - `.\winsw.exe start`
   - Stop/remove: `.\winsw.exe stop` / `.\winsw.exe uninstall`
5. Ensure `node` is on PATH, or regenerate with `-NodePath "C:\\Program Files\\nodejs\\node.exe"` (see `scripts/win-service/prepare-win-service.ps1` params).

## Docker (optional)
- Multi-stage Dockerfile that copies build output and runs `node dist/index.js`; Express serves `dist/public`.
- No container-only assumptions; all config via env vars. Intended for Linux hosts or CI/CD.

### Quick build/run
- Build image: `pnpm package:docker` (tags `cockpit-vibe`)
- Run: `docker run -p 3000:3000 --env-file .env cockpit-vibe`

## Configuration Practices
- All runtime settings via env vars (dotenv supported already). Siehe `.env.example`.
- Ports/host konfigurierbar (`PORT`, `HOST`); kein hardcoding.
- Datenquellen: `MONGO_URI`/`MONGO_DB`/`TENANT_ID` (primär), optional `DATABASE_URL` (legacy), `COLLECTOR_BASE_URL`/`COLLECTOR_API_KEY`.
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
