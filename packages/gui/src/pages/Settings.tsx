import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'de',
    autoRefresh: true,
    refreshInterval: 30,
    notifications: true,
    mcpServers: {
      database: true,
      network: true,
      system: true,
    },
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simuliere Speichern
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  const handleReset = () => {
    setSettings({
      theme: 'light',
      language: 'de',
      autoRefresh: true,
      refreshInterval: 30,
      notifications: true,
      mcpServers: {
        database: true,
        network: true,
        system: true,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center">
          <SettingsIcon className="h-8 w-8 text-gray-500 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
            <p className="mt-2 text-gray-600">
              Konfigurieren Sie die Gemini CLI GUI nach Ihren Wünschen.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="space-y-6">
        {/* Appearance */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Erscheinungsbild</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="input-field"
              >
                <option value="light">Hell</option>
                <option value="dark">Dunkel</option>
                <option value="auto">Automatisch</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sprache
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="input-field"
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* MCP Server Configuration */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">MCP Server Konfiguration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Datenbank-Server</label>
                <p className="text-sm text-gray-600">SQLite, PostgreSQL, MySQL Support</p>
              </div>
              <input
                type="checkbox"
                checked={settings.mcpServers.database}
                onChange={(e) => setSettings({
                  ...settings,
                  mcpServers: { ...settings.mcpServers, database: e.target.checked }
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Netzwerk-Server</label>
                <p className="text-sm text-gray-600">Port-Scan, DNS-Lookup, HTTP-Tests</p>
              </div>
              <input
                type="checkbox"
                checked={settings.mcpServers.network}
                onChange={(e) => setSettings({
                  ...settings,
                  mcpServers: { ...settings.mcpServers, network: e.target.checked }
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">System-Server</label>
                <p className="text-sm text-gray-600">Prozess-Management, System-Monitoring</p>
              </div>
              <input
                type="checkbox"
                checked={settings.mcpServers.system}
                onChange={(e) => setSettings({
                  ...settings,
                  mcpServers: { ...settings.mcpServers, system: e.target.checked }
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Auto Refresh */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Automatische Aktualisierung</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Auto-Refresh aktivieren</label>
                <p className="text-sm text-gray-600">Automatische Aktualisierung der System-Daten</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => setSettings({ ...settings, autoRefresh: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            
            {settings.autoRefresh && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aktualisierungsintervall (Sekunden)
                </label>
                <input
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) })}
                  min="5"
                  max="300"
                  className="input-field"
                />
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Benachrichtigungen</h3>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Browser-Benachrichtigungen</label>
              <p className="text-sm text-gray-600">Erhalten Sie Benachrichtigungen über abgeschlossene Tasks</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleReset}
            className="btn-secondary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Speichern...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </div>
            )}
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System-Informationen</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">GUI-Version</h4>
            <p className="text-sm text-gray-600">1.0.0</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Node.js Version</h4>
            <p className="text-sm text-gray-600">18.17.0</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">React Version</h4>
            <p className="text-sm text-gray-600">18.2.0</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Build-Datum</h4>
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString('de-DE')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;