# Gemini CLI GUI

Eine moderne, benutzerfreundliche Web-GUI für das Gemini CLI mit integrierten MCP-Server-Tools.

## 🚀 Features

### 📊 Dashboard
- Übersicht über alle verfügbaren Tools
- Schnellzugriff auf häufig verwendete Funktionen
- Status-Übersicht der MCP-Server

### 🗄️ Datenbank-Tools
- **SQLite, PostgreSQL und MySQL Unterstützung**
- SQL-Abfragen ausführen
- Tabellen auflisten und beschreiben
- Sichere Verbindungsstrings

### 🌐 Netzwerk-Tools
- **Port-Scanning** mit konfigurierbaren Bereichen
- **DNS-Lookup** für verschiedene Record-Typen
- **HTTP-Tests** mit verschiedenen Methoden
- **Ping-Tests** für Host-Verfügbarkeit

### 💻 System-Tools
- **Prozess-Management** mit Kill-Funktionen
- **System-Monitoring** (CPU, RAM, Festplatte)
- **Netzwerk-Verbindungen** anzeigen
- **Echtzeit-Updates** der System-Daten

### ⚙️ Einstellungen
- Theme-Auswahl (Hell/Dunkel/Auto)
- MCP-Server Konfiguration
- Auto-Refresh Einstellungen
- Benachrichtigungen

## 🛠️ Installation

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Gemini CLI Core

### Setup

1. **Abhängigkeiten installieren:**
```bash
cd packages/gui
npm install
```

2. **Entwicklungsserver starten:**
```bash
npm run dev
```

3. **Produktions-Build erstellen:**
```bash
npm run build
```

## 🏗️ Technologie-Stack

- **React 18** - Moderne UI-Bibliothek
- **TypeScript** - Typsichere Entwicklung
- **Tailwind CSS** - Utility-First CSS Framework
- **Vite** - Schneller Build-Tool
- **React Router** - Client-seitiges Routing
- **React Hook Form** - Formular-Management
- **Zod** - Schema-Validierung
- **Lucide React** - Moderne Icons

## 📁 Projektstruktur

```
packages/gui/
├── src/
│   ├── components/
│   │   └── Layout.tsx          # Haupt-Layout mit Sidebar
│   ├── pages/
│   │   ├── Dashboard.tsx       # Dashboard-Übersicht
│   │   ├── DatabaseTools.tsx   # Datenbank-Tools
│   │   ├── NetworkTools.tsx    # Netzwerk-Tools
│   │   ├── SystemTools.tsx     # System-Tools
│   │   └── Settings.tsx        # Einstellungen
│   ├── App.tsx                 # Haupt-App-Komponente
│   ├── main.tsx                # Einstiegspunkt
│   └── index.css               # Globale Styles
├── public/                     # Statische Assets
├── package.json                # Abhängigkeiten
├── vite.config.ts              # Vite-Konfiguration
├── tailwind.config.js          # Tailwind-Konfiguration
└── tsconfig.json               # TypeScript-Konfiguration
```

## 🎨 Design-System

### Farben
- **Primary**: Blau (#3B82F6) für Hauptaktionen
- **Secondary**: Grau (#64748B) für sekundäre Elemente
- **Success**: Grün (#10B981) für erfolgreiche Aktionen
- **Warning**: Gelb (#F59E0B) für Warnungen
- **Error**: Rot (#EF4444) für Fehler

### Komponenten
- **Cards**: Weiße Hintergründe mit Schatten
- **Buttons**: Abgerundete Ecken mit Hover-Effekten
- **Forms**: Validierung mit Fehlermeldungen
- **Tables**: Responsive Tabellen mit Sortierung

## 🔧 Konfiguration

### MCP-Server Integration
Die GUI ist vollständig mit den MCP-Servern integriert:

```typescript
// MCP Server Konfiguration
const mcpServers = {
  database: {
    command: 'node',
    args: ['packages/core/src/tools/mcp-servers/database-mcp.js'],
    trust: true,
  },
  network: {
    command: 'node', 
    args: ['packages/core/src/tools/mcp-servers/network-mcp.js'],
    trust: true,
  },
  system: {
    command: 'node',
    args: ['packages/core/src/tools/mcp-servers/system-mcp.js'],
    trust: true,
  },
};
```

### Umgebungsvariablen
```bash
# Entwicklung
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Produktion
VITE_API_URL=https://api.gemini-cli.com
VITE_WS_URL=wss://api.gemini-cli.com
```

## 🚀 Entwicklung

### Verfügbare Scripts

```bash
# Entwicklungsserver starten
npm run dev

# Produktions-Build
npm run build

# Build-Vorschau
npm run preview

# Linting
npm run lint

# TypeScript-Check
npm run typecheck

# Code-Formatierung
npm run format
```

### Code-Struktur

#### Komponenten
- **Funktionale Komponenten** mit TypeScript
- **Custom Hooks** für wiederverwendbare Logik
- **Context API** für globalen State

#### Styling
- **Tailwind CSS** für Utility-Klassen
- **CSS Modules** für komponentenspezifische Styles
- **Responsive Design** für alle Bildschirmgrößen

#### State Management
- **React Hooks** für lokalen State
- **Zustand** für globalen State (optional)
- **React Query** für Server-State (optional)

## 🧪 Testing

```bash
# Unit Tests
npm run test

# E2E Tests (optional)
npm run test:e2e

# Coverage Report
npm run test:coverage
```

## 📦 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Nginx
```nginx
server {
    listen 80;
    server_name gemini-cli.local;
    
    location / {
        root /var/www/gemini-cli-gui;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔒 Sicherheit

- **HTTPS** in Produktion
- **CORS** konfiguriert
- **Input-Validierung** mit Zod
- **XSS-Schutz** durch React
- **CSRF-Token** für API-Calls

## 📈 Performance

- **Code-Splitting** mit React Router
- **Lazy Loading** für Komponenten
- **Tree Shaking** für Bundle-Optimierung
- **Service Worker** für Caching (optional)

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

### Coding Standards
- **ESLint** für Code-Qualität
- **Prettier** für Formatierung
- **TypeScript** für Typsicherheit
- **Conventional Commits** für Commit-Messages

## 📄 Lizenz

Apache 2.0 License - siehe LICENSE-Datei für Details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Dokumentation**: README.md
- **Beispiele**: example-usage.md
- **API-Docs**: OpenAPI/Swagger (optional)

---

**Entwickelt mit ❤️ für die Gemini CLI Community**