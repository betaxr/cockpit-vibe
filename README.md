# Cockpit Vibe - Agent Management System

Ein modernes Dashboard zur Verwaltung und Überwachung von KI-Agenten in Unternehmensprozessen.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=flat&logo=trpc&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## Übersicht

Cockpit Vibe ist ein Enterprise-Dashboard für die Verwaltung von KI-Agenten-Teams. Das System ermöglicht:

- **Team-Management**: Verwaltung von 5 Teams (Marketing, Verkauf, Logistik, Support, Production)
- **Prozess-Überwachung**: Echtzeit-Tracking von automatisierten Prozessen
- **KPI-Dashboard**: Wertschöpfung, Zeitersparnis und Zuverlässigkeitsmetriken
- **24/7 Scheduling**: Visuelle Darstellung der Agenten-Aktivitäten

## Features

### Dashboard
- Modulare Karten mit Drag-and-Drop (Edit-Mode)
- Team-Portraits mit SVG-Silhouetten
- Gebündelte KPIs (Wertschöpfung + Zeitersparnis)
- Prozess-Status-Farbcodierung

### Teams
| Team | Farbe | Agenten | Fokus |
|------|-------|---------|-------|
| Marketing | Gelb | 3 | Social Media und Kampagnen |
| Verkauf | Orange | 2 | Kundenberatung und Verkauf |
| Logistik | Grün | 4 | Wareneingang und Versand |
| Support | Blau | 2 | Kundenservice und Retouren |
| Production | Pink | 5 | Herstellung und Qualität |

### Prozesse
- Social Media Posting
- Bestellbestätigung
- Inventur-Check
- Ticket-Triage
- Retouren-Verarbeitung
- Preisvergleich
- Newsletter-Versand
- Versandvorbereitung

## Tech Stack

### Frontend
- React 19 + TypeScript
- Tailwind CSS 4 (OKLCH Farben)
- shadcn/ui Komponenten
- Wouter (Routing)

### Backend
- Express 4 + tRPC 11
- Drizzle ORM + MySQL/TiDB
- Manus OAuth Integration

### Testing
- Vitest (29 Tests)

## Installation

```bash
# Dependencies installieren
pnpm install

# Entwicklungsserver starten
pnpm dev

# Tests ausführen
pnpm test

# Datenbank-Schema pushen
pnpm db:push
```

## Projektstruktur

```
client/
  src/
    components/     # UI-Komponenten
      FullBodyAgent.tsx    # SVG-Silhouette
      KPICard.tsx          # KPI-Karten
      TeamPortrait.tsx     # Team-Darstellung
    pages/          # Seiten-Komponenten
    App.tsx         # Routing
  index.html
server/
  routers.ts          # tRPC API-Endpunkte
  db.ts               # Datenbank-Operationen
  seedData.ts         # Mock-Daten
  *.test.ts           # Unit-Tests
drizzle/
  schema.ts           # Datenbank-Schema
shared/
  const.ts            # Gemeinsame Konstanten
```

## API-Endpunkte

### Authentication
- `auth.me` - Aktueller Benutzer
- `auth.logout` - Abmelden
- `auth.testLogin` - Test-Login (admin/admin)

### Agents und Teams
- `agents.list` - Alle Agenten
- `agents.getById` - Agent-Details
- `teams.list` - Alle Teams
- `teams.getById` - Team-Details

### Processes und Schedule
- `processes.list` - Alle Prozesse
- `processes.running` - Laufende Prozesse
- `schedule.byAgent` - Zeitplan pro Agent
- `schedule.week` - Wochenübersicht

### Statistics
- `stats.global` - Globale KPIs

## Design-System

### Farben (OKLCH)
- Background: `oklch(0.14 0.02 50)`
- Border: `oklch(0.55 0.15 45 / 40%)`
- Accent: `oklch(0.60 0.16 45)`

### Komponenten
- Glassmorphism-Karten
- SVG-basierte Silhouetten
- Responsive Grid-Layouts

## Lizenz

Proprietär - Cockpit Vibe Team

---

Entwickelt vom Cockpit Vibe Team
