# Environment Setup für Cockpit Vibe

Diese Anleitung erklärt, wie du das Projekt lokal einrichtest - **ohne Manus-Abhängigkeiten**.

## Voraussetzungen

- Node.js 18+ (empfohlen: 22)
- pnpm (`npm install -g pnpm`)
- MySQL 8.0+ oder Docker

## Option A: Mit Docker (empfohlen)

Der einfachste Weg - Docker startet MySQL automatisch:

```bash
# Repository klonen
git clone https://github.com/betaxr/cockpit-vibe.git
cd cockpit-vibe

# Alles starten
docker-compose up -d

# Datenbank-Schema erstellen
docker-compose exec app pnpm db:push

# Fertig! Öffne http://localhost:3000
```

## Option B: Lokale Installation

### 1. Repository klonen

```bash
git clone https://github.com/betaxr/cockpit-vibe.git
cd cockpit-vibe
pnpm install
```

### 2. MySQL Datenbank

Du brauchst eine MySQL-Datenbank. Optionen:

**Lokal installiert:**
```bash
mysql -u root -p
CREATE DATABASE cockpit_vibe;
CREATE USER 'cockpit'@'localhost' IDENTIFIED BY 'dein-passwort';
GRANT ALL PRIVILEGES ON cockpit_vibe.* TO 'cockpit'@'localhost';
```

**Mit Docker (nur DB):**
```bash
docker run -d \
  --name cockpit-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=cockpit_vibe \
  -e MYSQL_USER=cockpit \
  -e MYSQL_PASSWORD=cockpitpassword \
  -p 3306:3306 \
  mysql:8.0
```

### 3. Environment Variables

Erstelle eine `.env` Datei im Projektroot:

```env
# ============================================
# ERFORDERLICH
# ============================================

# MySQL Datenbank-Verbindung
DATABASE_URL=mysql://cockpit:cockpitpassword@localhost:3306/cockpit_vibe

# JWT Secret für Sessions (min. 32 Zeichen)
# Generieren mit: openssl rand -base64 32
JWT_SECRET=dein-super-geheimer-schluessel-mindestens-32-zeichen

# ============================================
# OPTIONAL
# ============================================

# Entwicklungsmodus
NODE_ENV=development

# Port (Standard: 3000)
PORT=3000

# Standalone-Modus aktivieren (keine Manus-APIs)
STANDALONE_MODE=true
```

### 4. Datenbank-Schema erstellen

```bash
pnpm db:push
```

### 5. Entwicklungsserver starten

```bash
pnpm dev
```

Die App läuft auf `http://localhost:3000`

## Test-Login

Für lokale Entwicklung:
- **Username:** `admin`
- **Password:** `admin`

Dies erstellt automatisch einen Admin-User.

## Variablen-Referenz

| Variable | Erforderlich | Beschreibung |
|----------|--------------|--------------|
| `DATABASE_URL` | ✅ | MySQL Connection String |
| `JWT_SECRET` | ✅ | Session-Secret (min. 32 Zeichen) |
| `NODE_ENV` | ❌ | `development` oder `production` |
| `PORT` | ❌ | Server-Port (Standard: 3000) |
| `STANDALONE_MODE` | ❌ | `true` für Betrieb ohne Manus |

## Troubleshooting

### "Connection refused" bei MySQL

```bash
# Prüfe ob MySQL läuft
docker ps | grep mysql
# oder
systemctl status mysql
```

### "JWT_SECRET must be at least 32 characters"

Generiere einen neuen Secret:
```bash
openssl rand -base64 32
```

### Tests schlagen fehl

```bash
# Prüfe ob alle Dependencies installiert sind
pnpm install

# Tests ausführen
pnpm test
```

## Nächste Schritte

1. **Eigene User anlegen**: Aktuell nur Test-Login, erweitere `standaloneAuth.ts`
2. **Echte Daten**: Ersetze `seedData.ts` durch Datenbank-Abfragen
3. **Deployment**: Nutze `docker-compose.yml` oder baue mit `Dockerfile`
