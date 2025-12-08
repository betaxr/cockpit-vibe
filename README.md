# Cockpit Vibe - Agent Management System

Ein modernes Dashboard zur Verwaltung und Überwachung von KI-Agenten in Unternehmensprozessen.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=flat&logo=trpc&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## Übersicht

Cockpit Vibe ist ein Enterprise-Dashboard für die Verwaltung von KI-Agenten-Teams. Das System läuft **vollständig standalone** ohne externe Abhängigkeiten.

## Quick Start (Docker)

Der schnellste Weg zum Starten:

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

## Quick Start (Lokal)

```bash
# Repository klonen
git clone https://github.com/betaxr/cockpit-vibe.git
cd cockpit-vibe

# Dependencies installieren
pnpm install

# .env Datei erstellen (siehe unten)
cp .env.example .env

# Datenbank-Schema erstellen
pnpm db:push

# Entwicklungsserver starten
pnpm dev

# Öffne http://localhost:3000
# Login: admin / admin
```

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

Für Standalone-Betrieb brauchst du nur:

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `DATABASE_URL` | MySQL Connection String | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | Session-Secret (min. 32 Zeichen) | `openssl rand -base64 32` |

## Features

- **Team-Management**: 5 Teams (Marketing, Verkauf, Logistik, Support, Production)
- **Prozess-Überwachung**: Echtzeit-Tracking von automatisierten Prozessen
- **KPI-Dashboard**: Wertschöpfung, Zeitersparnis und Zuverlässigkeitsmetriken
- **24/7 Scheduling**: Visuelle Darstellung der Agenten-Aktivitäten
- **Modulares Design**: Drag-and-Drop Karten im Edit-Mode

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

### Testing
- Vitest (29 Tests)

## Projektstruktur

```
client/                 # Frontend
  src/
    components/         # UI-Komponenten
    pages/              # Seiten
    App.tsx             # Routing
server/                 # Backend
  _core/
    standaloneAuth.ts   # Lokale Authentifizierung
    context.ts          # tRPC Context
    env.ts              # Environment Config
  routers.ts            # API-Endpunkte
  db.ts                 # Datenbank-Operationen
  seedData.ts           # Demo-Daten
drizzle/
  schema.ts             # Datenbank-Schema
docker-compose.yml      # Docker Setup
Dockerfile              # Container Build
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

## Tests

```bash
# Alle Tests ausführen
pnpm test

# Tests im Watch-Mode
pnpm test:watch
```

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

### Manuell

```bash
# Build erstellen
pnpm build

# Produktionsserver starten
NODE_ENV=production node dist/server/index.js
```

## Lizenz

MIT License

---

Entwickelt vom Cockpit Vibe Team
