# Cockpit Vibe - Agent Management System

Ein modernes Dashboard zur Verwaltung und Überwachung von KI-Agenten in Unternehmensprozessen.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=flat&logo=trpc&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## Übersicht

Cockpit Vibe ist ein Enterprise-Dashboard für die Verwaltung von KI-Agenten-Teams. Das System läuft **vollständig standalone** ohne externe Abhängigkeiten und unterstützt sowohl Windows-Service als auch Docker-Deployment.

## Quick Start

### Option 1: Docker (empfohlen)

```bash
# Repository klonen
git clone https://github.com/betaxr/cockpit-vibe.git
cd cockpit-vibe

# Mit Docker starten (inkl. MySQL)
docker-compose up -d

# Datenbank-Schema erstellen
docker-compose exec app pnpm db:push

# Öffne http://localhost:3000
# Login: admin / admin
```

### Option 2: Lokale Installation

```bash
# Repository klonen
git clone https://github.com/betaxr/cockpit-vibe.git
cd cockpit-vibe

# Dependencies installieren
pnpm install

# .env Datei erstellen
cp .env.example .env
# Editiere .env mit deinen Werten

# Datenbank-Schema erstellen
pnpm db:push

# Entwicklungsserver starten
pnpm dev

# Öffne http://localhost:3000
# Login: admin / admin
```

### Option 3: Windows Service

Siehe [Windows Service Deployment](#windows-service-deployment) weiter unten.

## Environment Variables

Erstelle eine `.env` Datei im Projektroot:

```env
# Erforderlich
DATABASE_URL=mysql://user:password@localhost:3306/cockpit_vibe
JWT_SECRET=dein-geheimer-schluessel-mindestens-32-zeichen

# Optional
NODE_ENV=development
PORT=3000
STANDALONE_MODE=true
```

### Minimale Konfiguration

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `DATABASE_URL` | MySQL Connection String | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | Session-Secret (min. 32 Zeichen) | `openssl rand -base64 32` |

## Features

### Dashboard
- **Team-Management**: 5 Teams (Marketing, Verkauf, Logistik, Support, Production)
- **Prozess-Überwachung**: Echtzeit-Tracking von automatisierten Prozessen
- **KPI-Dashboard**: Wertschöpfung, Zeitersparnis und Zuverlässigkeitsmetriken
- **24/7 Scheduling**: Visuelle Darstellung der Agenten-Aktivitäten
- **Modulares Design**: Drag-and-Drop Karten im Edit-Mode

### Architektur (neu)
- **Service Layer**: Abstrahierte Datenbankzugriffe mit Fallback auf Seed-Daten
- **Security Middleware**: CSRF-Schutz, Rate-Limiting, Security-Headers
- **Ops & Reliability**: Structured Logging, Health-Check Endpoint, Graceful Shutdown
- **ENV-Validierung**: Zod-basierte Validierung beim Start
- **Frontend Auth-Guards**: Geschützte Routen mit automatischer Weiterleitung

## Tech Stack

### Frontend
- React 19 + TypeScript
- Tailwind CSS 4 (OKLCH Farben)
- shadcn/ui Komponenten
- Wouter (Routing)

### Backend
- Express 4 + tRPC 11
- Drizzle ORM + MySQL
- bcrypt (Passwort-Hashing)
- JWT (Session-Management)
- Zod (Validierung)

### Testing
- Vitest (43 Tests)
- Auth-Failure-Tests
- Shape-Assertions für API-Responses

## Projektstruktur

```
client/                 # Frontend
  src/
    components/         # UI-Komponenten
      AuthGuard.tsx     # Auth-Protection HOC
    pages/              # Seiten
    App.tsx             # Routing
server/                 # Backend
  _core/
    standaloneAuth.ts   # Lokale Authentifizierung
    context.ts          # tRPC Context
    env.ts              # Environment Config
    security.ts         # CSRF, Rate-Limiting
    ops.ts              # Logging, Health-Check
    envValidation.ts    # Zod ENV-Validierung
  services/             # Service Layer (neu)
    agents.ts           # Agent-Operationen
    teams.ts            # Team-Operationen
  routers.ts            # API-Endpunkte
  db.ts                 # Datenbank-Operationen
  seedData.ts           # Demo-Daten
drizzle/
  schema.ts             # Datenbank-Schema
deploy/                 # Deployment-Konfigurationen
  windows/              # Windows Service Files
    cockpit-vibe-service.xml  # WinSW Config
    install-service.ps1       # Installation
    start-service.ps1         # Service starten
    stop-service.ps1          # Service stoppen
    status-service.ps1        # Status prüfen
docker-compose.yml      # Docker Setup
Dockerfile              # Container Build
docs/                   # Dokumentation
  deployment.md         # Deployment-Strategie
  testing.md            # Testing-Strategie
  todo.md               # Architektur-Findings
```

## API-Endpunkte

### Authentication
- `auth.me` - Aktueller Benutzer
- `auth.logout` - Abmelden
- `auth.testLogin` - Login mit Username/Password

### Agents & Teams
- `agents.list` - Alle Agenten
- `teams.list` - Alle Teams

### Processes & Schedule
- `processes.list` - Alle Prozesse
- `schedule.week` - Wochenübersicht

### Statistics
- `stats.global` - Globale KPIs

### Operations (neu)
- `GET /healthz` - Health-Check Endpoint

## Tests

```bash
# Alle Tests ausführen
pnpm test

# Tests im Watch-Mode
pnpm test:watch
```

### Test-Abdeckung
- **43 Tests** insgesamt
- Auth-Failure-Tests (unauthorized/forbidden)
- Shape-Assertions für API-Responses
- Agents, Teams, Schedule Router Tests

## Deployment

### Docker

```bash
# Image bauen
docker build -t cockpit-vibe .

# Container starten
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://... \
  -e JWT_SECRET=... \
  cockpit-vibe
```

### Windows Service Deployment

Das Projekt unterstützt Windows Service Deployment als **primären Betriebsmodus**.

#### Voraussetzungen
1. Node.js installiert
2. [WinSW](https://github.com/winsw/winsw/releases) herunterladen
3. WinSW exe umbenennen zu `cockpit-vibe-service.exe`

#### Installation

```powershell
# Als Administrator ausführen
cd deploy\windows

# Service installieren
.\install-service.ps1

# Service starten
.\start-service.ps1

# Status prüfen
.\status-service.ps1

# Service stoppen
.\stop-service.ps1
```

#### Konfiguration
- Alle Einstellungen über `.env` Datei
- Logs unter `logs/` (automatische Rotation)
- Health-Check: `http://localhost:3000/healthz`

### Manuell

```bash
# Build erstellen
pnpm build

# Produktionsserver starten
NODE_ENV=production node dist/server/index.js
```

## Security Features

### CSRF-Schutz
- SameSite Cookie-Attribute
- CSRF-Token-Validierung für state-changing Requests

### Rate-Limiting
- 100 Requests/Minute für allgemeine API
- 10 Login-Versuche/15 Minuten für Auth-Endpoints

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Referrer-Policy
- Content-Security-Policy (Production)

## Ops & Monitoring

### Health-Check
```bash
curl http://localhost:3000/healthz
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-08T10:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": { "status": "connected", "latency": 5 },
    "memory": { "used": 128, "total": 512, "percentage": 25 }
  }
}
```

### Graceful Shutdown
- SIGTERM/SIGINT Handling
- Bestehende Requests werden abgeschlossen
- Datenbankverbindungen werden sauber geschlossen

### Structured Logging
- JSON-Format für einfaches Parsing
- Log-Level: debug, info, warn, error
- Request-Logging mit Timing

## Bekannte Einschränkungen

- `testLogin` ist aktuell auch in Production aktiv (sollte auf Development beschränkt werden)
- Routers nutzen teilweise noch direkt seedData statt Service Layer
- Kein Multi-Tenancy Support

## Roadmap

- [ ] Routers vollständig auf Service Layer umstellen
- [ ] DB-Seeding Script für Initialdaten
- [ ] testLogin auf Development-Mode beschränken
- [ ] Multi-Tenancy Support
- [ ] CI/CD Pipeline
- [ ] Frontend-Tests

## Lizenz

MIT License

---

Entwickelt vom Cockpit Vibe Team
