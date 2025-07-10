# MCP Server Beispiel-Verwendung

## Database MCP Server

### SQLite Datenbank-Abfrage
```bash
# SQLite-Datenbank erstellen und abfragen
sqlite3 test.db "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);"
sqlite3 test.db "INSERT INTO users (name, email) VALUES ('Max Mustermann', 'max@example.com');"

# Über Gemini CLI
gemini "Führe eine SQL-Abfrage auf der SQLite-Datenbank test.db aus: SELECT * FROM users;"
```

### PostgreSQL Datenbank-Abfrage
```bash
# PostgreSQL-Verbindung
gemini "Verbinde dich mit PostgreSQL und führe eine Abfrage aus: SELECT version();"
```

### MySQL Datenbank-Abfrage
```bash
# MySQL-Verbindung
gemini "Verbinde dich mit MySQL und zeige alle Tabellen an"
```

## Network MCP Server

### Port-Scan
```bash
# Standard-Ports scannen
gemini "Scanne die Ports 80, 443 und 8080 auf google.com"

# Port-Bereich scannen
gemini "Scanne die Ports 1-1000 auf localhost"
```

### DNS-Lookup
```bash
# A-Record Lookup
gemini "Führe einen DNS-Lookup für google.com durch"

# MX-Record Lookup
gemini "Zeige die MX-Records für gmail.com an"
```

### HTTP-Test
```bash
# HTTP-GET Test
gemini "Teste die HTTP-Antwort von https://httpbin.org/get"

# HTTP-POST Test
gemini "Führe einen POST-Request an https://httpbin.org/post durch"
```

### Ping-Test
```bash
# Ping-Test
gemini "Pinge google.com 4 mal an"
```

## System MCP Server

### Prozess-Informationen
```bash
# Alle Prozesse anzeigen
gemini "Zeige alle laufenden Prozesse an"

# Spezifischen Prozess suchen
gemini "Suche nach Node.js-Prozessen"
```

### System-Informationen
```bash
# Basis-System-Info
gemini "Zeige System-Informationen an"

# Detaillierte System-Info
gemini "Zeige detaillierte System-Informationen an"
```

### Festplatten-Nutzung
```bash
# Aktuelle Festplatten-Nutzung
gemini "Zeige die Festplatten-Nutzung an"

# Spezifischen Pfad überprüfen
gemini "Überprüfe die Festplatten-Nutzung für /home"
```

### Speicher-Nutzung
```bash
# Speicher in MB
gemini "Zeige die Speicher-Nutzung in MB an"

# Speicher in GB
gemini "Zeige die Speicher-Nutzung in GB an"
```

### Prozess beenden
```bash
# Prozess mit PID beenden
gemini "Beende den Prozess mit PID 12345"

# Prozess mit SIGKILL beenden
gemini "Beende den Prozess mit PID 12345 mit SIGKILL"
```

### Netzwerk-Verbindungen
```bash
# Alle TCP-Verbindungen
gemini "Zeige alle TCP-Verbindungen an"

# Nur LISTEN-Verbindungen
gemini "Zeige nur lauschende Netzwerk-Verbindungen an"
```

## Kombinierte Beispiele

### System-Monitoring
```bash
gemini "Führe eine vollständige System-Analyse durch: Zeige System-Info, Speicher-Nutzung, Festplatten-Nutzung und laufende Prozesse"
```

### Netzwerk-Diagnose
```bash
gemini "Führe eine Netzwerk-Diagnose für google.com durch: DNS-Lookup, Ping-Test und Port-Scan der wichtigsten Ports"
```

### Datenbank-Monitoring
```bash
gemini "Überprüfe die Datenbank-Performance: Zeige alle Tabellen, beschreibe die wichtigsten Tabellen und führe eine Test-Abfrage aus"
```

## Erweiterte Konfiguration

### Benutzerdefinierte MCP-Server
```typescript
// In der Konfiguration
const customMCPServers = {
  myDatabase: {
    command: 'node',
    args: ['/path/to/my-database-mcp.js'],
    description: 'Meine benutzerdefinierte Datenbank',
    trust: true,
  },
  myNetwork: {
    command: 'python3',
    args: ['/path/to/my-network-mcp.py'],
    description: 'Meine benutzerdefinierte Netzwerk-Tools',
    trust: false,
  },
};
```

### Umgebungsvariablen
```bash
# MCP-Server mit Umgebungsvariablen
export DB_PASSWORD="mysecretpassword"
gemini "Verbinde dich mit der Datenbank und führe eine Abfrage aus"
```

## Troubleshooting

### MCP-Server startet nicht
```bash
# Überprüfe Node.js-Version
node --version

# Überprüfe Abhängigkeiten
npm list @modelcontextprotocol/sdk

# Teste MCP-Server direkt
node packages/core/src/tools/mcp-servers/database-mcp.js
```

### Datenbankverbindung fehlschlägt
```bash
# Teste SQLite-Verbindung
sqlite3 test.db ".tables"

# Teste PostgreSQL-Verbindung
psql -h localhost -U username -d database -c "SELECT 1;"

# Teste MySQL-Verbindung
mysql -h localhost -u username -p database -e "SELECT 1;"
```

### Netzwerk-Operationen funktionieren nicht
```bash
# Teste DNS-Lookup
nslookup google.com

# Teste Port-Scan
nc -zv google.com 80

# Teste HTTP-Request
curl -I https://httpbin.org/get
```

## Best Practices

1. **Sicherheit**: Verwenden Sie sichere Verbindungsstrings für Datenbanken
2. **Performance**: Begrenzen Sie Port-Scans auf notwendige Bereiche
3. **Monitoring**: Überwachen Sie System-Ressourcen regelmäßig
4. **Logging**: Aktivieren Sie Logging für wichtige Operationen
5. **Backup**: Sichern Sie Datenbanken vor wichtigen Operationen