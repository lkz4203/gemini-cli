import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Network, 
  Monitor, 
  Play,
  Activity,
  Zap
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const tools = [
    {
      name: 'Datenbank-Tools',
      description: 'SQLite, PostgreSQL und MySQL Operationen',
      icon: Database,
      href: '/database',
      color: 'bg-blue-500',
      features: ['SQL-Abfragen ausführen', 'Tabellen auflisten', 'Datenbankstruktur analysieren']
    },
    {
      name: 'Netzwerk-Tools',
      description: 'Port-Scanning, DNS-Lookup und HTTP-Tests',
      icon: Network,
      href: '/network',
      color: 'bg-green-500',
      features: ['Port-Scans durchführen', 'DNS-Lookups', 'HTTP-Endpunkte testen']
    },
    {
      name: 'System-Tools',
      description: 'Prozess-Management und System-Monitoring',
      icon: Monitor,
      href: '/system',
      color: 'bg-purple-500',
      features: ['Prozesse verwalten', 'System-Informationen', 'Ressourcen überwachen']
    }
  ];

  const quickActions = [
    {
      name: 'System-Status prüfen',
      description: 'Schnelle Übersicht über System-Ressourcen',
      icon: Activity,
      action: () => console.log('System-Status prüfen')
    },
    {
      name: 'Netzwerk-Diagnose',
      description: 'Port-Scan und DNS-Lookup für localhost',
      icon: Network,
      action: () => console.log('Netzwerk-Diagnose')
    },
    {
      name: 'Datenbank-Verbindung testen',
      description: 'SQLite-Datenbank erstellen und testen',
      icon: Database,
      action: () => console.log('Datenbank-Verbindung testen')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Willkommen bei der Gemini CLI GUI. Hier finden Sie alle verfügbaren Tools und Funktionen.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <button
            key={action.name}
            onClick={action.action}
            className="card hover:shadow-md transition-shadow duration-200 text-left"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <action.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Tools Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verfügbare Tools</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              to={tool.href}
              className="card hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${tool.color} text-white`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600">{tool.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {tool.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <Play className="h-4 w-4 text-primary-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">MCP Server</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verfügbare Tools</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Database className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Datenbanken</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Network className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Netzwerk-Tests</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;