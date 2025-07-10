# MCP Server Tools für Gemini CLI

Diese Sammlung von MCP (Model Context Protocol) Servern erweitert die Funktionalität des Gemini CLI mit nützlichen Tools für verschiedene Aufgabenbereiche.

## Verfügbare MCP Server

### 1. Database MCP Server
**Datei:** `database-mcp.ts`

Bietet Datenbankoperationen für SQLite, PostgreSQL und MySQL:

- **execute_sql_query**: Führt SQL-Abfragen aus
- **list_tables**: Listet alle Tabellen in einer Datenbank auf
- **describe_table**: Zeigt die Struktur einer Tabelle an

**Beispiel:**
```json
{
  "connection_string": "sqlite:///path/to/database.db",
  "query": "SELECT * FROM users LIMIT 10",
  "database_type": "sqlite"
}
```

### 2. Network MCP Server
**Datei:** `network-mcp.ts`

Bietet Netzwerk-Diagnose und -Tests:

- **port_scan**: Führt Port-Scans durch
- **dns_lookup**: DNS-Lookups für Domains
- **http_test**: Testet HTTP-Endpunkte
- **ping_host**: Ping-Tests für Hosts

**Beispiel:**
```json
{
  "host": "google.com",
  "ports": "80,443,8080",
  "timeout": 5000
}
```

### 3. System MCP Server
**Datei:** `system-mcp.ts`

Bietet System-Monitoring und -Verwaltung:

- **get_process_info**: Zeigt laufende Prozesse an
- **get_system_info**: System-Informationen
- **get_disk_usage**: Festplatten-Nutzung
- **get_memory_usage**: Speicher-Nutzung
- **kill_process**: Beendet Prozesse
- **get_network_connections**: Aktive Netzwerk-Verbindungen

**Beispiel:**
```json
{
  "include_detailed": true
}
```

## Konfiguration

Die MCP Server werden automatisch beim Start des Gemini CLI geladen. Die Konfiguration erfolgt in der `config.ts`:

```typescript
export const MCP_SERVER_CONFIGS = {
  database: {
    command: 'node',
    args: ['packages/core/src/tools/mcp-servers/database-mcp.js'],
    description: 'Datenbankoperationen (SQLite, PostgreSQL, MySQL)',
    trust: true,
  },
  network: {
    command: 'node',
    args: ['packages/core/src/tools/mcp-servers/network-mcp.js'],
    description: 'Netzwerkoperationen (Port-Scan, DNS, HTTP-Tests)',
    trust: true,
  },
  system: {
    command: 'node',
    args: ['packages/core/src/tools/mcp-servers/system-mcp.js'],
    description: 'Systemoperationen (Prozesse, System-Info, Disk-Usage)',
    trust: true,
  },
};
```

## Abhängigkeiten

Die folgenden npm-Pakete sind erforderlich:

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0",
    "sqlite3": "^5.1.6",
    "pg": "^8.11.3",
    "mysql2": "^3.6.5"
  }
}
```

## Verwendung

Die MCP Server werden automatisch beim Start des Gemini CLI initialisiert. Die Tools sind dann über die normale Tool-Auswahl verfügbar.

### Beispiel-Verwendung:

1. **Datenbank-Abfrage:**
   ```
   Führe eine SQL-Abfrage auf der SQLite-Datenbank aus
   ```

2. **Port-Scan:**
   ```
   Scanne die Ports 80, 443 und 8080 auf google.com
   ```

3. **System-Info:**
   ```
   Zeige detaillierte System-Informationen an
   ```

## Sicherheit

- Alle MCP Server sind standardmäßig als "trusted" konfiguriert
- Datenbankverbindungen sollten sicher konfiguriert werden
- Netzwerk-Operationen können sensibel sein - verwenden Sie mit Vorsicht

## Erweiterung

Neue MCP Server können hinzugefügt werden, indem:

1. Eine neue Server-Klasse erstellt wird (siehe `database-mcp.ts` als Beispiel)
2. Die Konfiguration in `index.ts` hinzugefügt wird
3. Die Abhängigkeiten in `package.json` aktualisiert werden

## Troubleshooting

### Häufige Probleme:

1. **MCP Server startet nicht:**
   - Überprüfen Sie die Node.js-Version
   - Stellen Sie sicher, dass alle Abhängigkeiten installiert sind

2. **Datenbankverbindung fehlschlägt:**
   - Überprüfen Sie die Verbindungsstrings
   - Stellen Sie sicher, dass die Datenbank läuft

3. **Netzwerk-Operationen funktionieren nicht:**
   - Überprüfen Sie Firewall-Einstellungen
   - Stellen Sie sicher, dass die erforderlichen Berechtigungen vorhanden sind

## Lizenz

Apache 2.0 License - siehe LICENSE-Datei für Details.