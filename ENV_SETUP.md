# Environment Setup für Cockpit Vibe

Diese Anleitung erklärt, wie du das Projekt lokal einrichtest.

## Voraussetzungen

- Node.js 18+
- pnpm
- MySQL/TiDB Datenbank

## 1. Repository klonen

```bash
git clone https://github.com/betaxr/cockpit-vibe.git
cd cockpit-vibe
pnpm install
```

## 2. Environment Variables

Erstelle eine `.env` Datei im Projektroot mit folgenden Variablen:

```env
# =============================================================================
# Database (MySQL/TiDB)
# =============================================================================
DATABASE_URL=mysql://user:password@host:3306/database_name

# =============================================================================
# Authentication
# =============================================================================
# JWT Secret für Session-Cookies (min. 32 Zeichen, zufällig generieren)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Manus OAuth Configuration
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# Owner Information (für Admin-Rechte)
OWNER_OPEN_ID=your-manus-open-id
OWNER_NAME=Your Name

# =============================================================================
# Manus Built-in APIs (optional)
# =============================================================================
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key

# Frontend Forge API
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-api-key

# =============================================================================
# App Configuration
# =============================================================================
VITE_APP_TITLE=Cockpit Vibe
VITE_APP_LOGO=/logo.svg

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# =============================================================================
# Development
# =============================================================================
NODE_ENV=development
PORT=3000
```

## 3. Variablen erklärt

| Variable | Beschreibung | Erforderlich |
|----------|--------------|--------------|
| `DATABASE_URL` | MySQL/TiDB Connection String | ✅ Ja |
| `JWT_SECRET` | Secret für Session-Cookies (min. 32 Zeichen) | ✅ Ja |
| `VITE_APP_ID` | Manus OAuth App ID | ✅ Ja |
| `OAUTH_SERVER_URL` | Manus OAuth Backend URL | ✅ Ja |
| `VITE_OAUTH_PORTAL_URL` | Manus Login Portal URL | ✅ Ja |
| `OWNER_OPEN_ID` | Deine Manus Open ID (für Admin-Rechte) | ✅ Ja |
| `OWNER_NAME` | Dein Name | ❌ Optional |
| `BUILT_IN_FORGE_API_URL` | Manus API URL für LLM/Storage | ❌ Optional |
| `BUILT_IN_FORGE_API_KEY` | Manus API Key (Server-side) | ❌ Optional |
| `VITE_FRONTEND_FORGE_API_*` | Manus API für Frontend | ❌ Optional |
| `VITE_APP_TITLE` | App-Titel | ❌ Optional |
| `VITE_APP_LOGO` | Logo-Pfad | ❌ Optional |

## 4. Datenbank einrichten

```bash
# Schema zur Datenbank pushen
pnpm db:push
```

## 5. Entwicklungsserver starten

```bash
pnpm dev
```

Die App läuft dann auf `http://localhost:3000`

## 6. Tests ausführen

```bash
pnpm test
```

## Hinweise

- Die `.env` Datei **niemals committen** (ist in `.gitignore`)
- Für Produktion andere Secrets verwenden
- JWT_SECRET sollte ein zufälliger String sein (z.B. `openssl rand -base64 32`)

## Test-Login

Für lokale Entwicklung ohne Manus OAuth:
- Username: `admin`
- Password: `admin`

Dies erstellt einen Test-Admin-User in der Datenbank.
