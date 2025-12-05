# Cockpit Vibe

**Enterprise Agent Management Dashboard** - Ein modulares Backend-Dashboard mit Multi-Datenbank-Unterstützung, Agent-Management und Prozess-Tracking.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=flat&logo=trpc&logoColor=white)

## Features

### Agent Management System
- **Teams & Agents**: Verwaltung von AI-Agenten in Teams (Marketing, Verkauf, Logistik, Support, Production)
- **SVG-Silhouetten**: Visuelle Darstellung der Agenten-Auslastung als Balkendiagramm
- **Prozess-Tracking**: Echtzeit-Überwachung laufender Prozesse mit Zuverlässigkeitsstatistiken

### Design
- **Glassmorphism**: Modernes Design mit transparenten Elementen und Blur-Effekten
- **Dark Theme**: Dunkler Hintergrund mit Orange/Amber-Akzenten
- **Apple HIG-inspiriert**: Minimalistisches Design mit klarer Hierarchie

### Prozess-Status-Farbsystem
| Status | Farbe | Beschreibung |
|--------|-------|--------------|
| Restkapazitäten | Grau-Schwarz | Ungenutzte Kapazität |
| Geplante Prozesse | Grau | Für später geplant |
| Neue Test Prozesse | Weiß | In der Testphase |
| Teilautomatisiert | Hell-Orange | Mit manuellen Schritten |
| Reguläre Auslastung | Neon-Orange | Vollautomatisiert |

### Navigation
- **Agenten**: Team-Übersicht mit Agenten-Portraits
- **Wochenplan**: 24h/Wochen-Ansicht für Agenten-Schedules
- **Cortex**: Wissensdatenbank
- **Prozesse**: Prozess-Liste mit Statistiken
- **Arbeitsplätze**: Workspace/Installation-Verwaltung

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend**: Express, tRPC 11
- **Database**: Drizzle ORM mit MySQL/TiDB
- **Testing**: Vitest (35 Tests)
- **Auth**: Manus OAuth + Test-Login (admin/admin)

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
├── client/
│   ├── src/
│   │   ├── components/     # React-Komponenten
│   │   │   ├── FullBodyAgent.tsx    # SVG-Silhouette als Balkendiagramm
│   │   │   ├── ProcessLegend.tsx    # Farbcodierte Legende
│   │   │   ├── KPICard.tsx          # KPI-Karten
│   │   │   └── ...
│   │   ├── pages/          # Seiten-Komponenten
│   │   │   ├── Agents.tsx           # Team-Übersicht
│   │   │   ├── AgentDetail.tsx      # Agent-Detailansicht
│   │   │   ├── Wochenplan.tsx       # Wochenplan
│   │   │   └── ...
│   │   └── ...
├── server/
│   ├── routers.ts          # tRPC Router
│   ├── seedData.ts         # Narrative Mock-Daten
│   ├── db.ts               # Datenbank-Operationen
│   └── *.test.ts           # Unit-Tests
├── drizzle/
│   └── schema.ts           # Datenbank-Schema
└── ...
```

## KPIs

Das Dashboard zeigt folgende Kennzahlen:
- **Wertschöpfung**: Generierter Wert in EUR
- **Zeitersparnis**: Gesparte Zeit in Stunden
- **Aktive Agenten**: Anzahl aktiver Agenten
- **Laufende Prozesse**: Aktuell ausgeführte Prozesse
- **Zuverlässigkeit**: Durchschnittliche Erfolgsrate

## Test-Login

Für Entwicklungszwecke:
- **Username**: admin
- **Password**: admin

## Lizenz

MIT

---

Entwickelt mit ❤️ vom Cockpit Vibe Team
