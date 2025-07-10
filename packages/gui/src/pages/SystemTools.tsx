import React, { useState, useEffect } from 'react';
import { Monitor, Activity, HardDrive, Memory, Cpu, Network } from 'lucide-react';

const SystemTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'processes' | 'system' | 'disk' | 'memory' | 'network'>('processes');
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simuliere System-Informationen beim Laden
    setSystemInfo({
      platform: 'Linux',
      architecture: 'x64',
      cpu_count: 8,
      cpu_model: 'Intel Core i7-10700K',
      total_memory: 16777216, // 16GB in MB
      free_memory: 8388608,   // 8GB in MB
      memory_usage_percent: '50.0',
      uptime: 86400, // 24 Stunden
    });

    // Simuliere Prozess-Liste
    setProcesses([
      { user: 'root', pid: 1, cpu: 0.1, mem: 0.5, command: 'systemd' },
      { user: 'user', pid: 1234, cpu: 2.3, mem: 1.2, command: 'node' },
      { user: 'user', pid: 5678, cpu: 1.8, mem: 0.8, command: 'chrome' },
    ]);
  }, []);

  const handleKillProcess = (pid: number) => {
    setLoading(true);
    setTimeout(() => {
      setProcesses(processes.filter(p => p.pid !== pid));
      setLoading(false);
    }, 1000);
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center">
          <Monitor className="h-8 w-8 text-purple-500 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System-Tools</h1>
            <p className="mt-2 text-gray-600">
              Überwachen und verwalten Sie System-Prozesse und Ressourcen.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'processes', name: 'Prozesse', icon: Activity },
            { id: 'system', name: 'System-Info', icon: Cpu },
            { id: 'disk', name: 'Festplatte', icon: HardDrive },
            { id: 'memory', name: 'Speicher', icon: Memory },
            { id: 'network', name: 'Netzwerk', icon: Network },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 inline mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'processes' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Laufende Prozesse</h3>
              <button className="btn-secondary">Aktualisieren</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Benutzer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPU %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speicher %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kommando</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processes.map((process) => (
                    <tr key={process.pid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.pid}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.cpu}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.mem}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.command}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => handleKillProcess(process.pid)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Beenden
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'system' && systemInfo && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System-Informationen</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Betriebssystem:</span>
                  <span className="text-sm font-medium text-gray-900">{systemInfo.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Architektur:</span>
                  <span className="text-sm font-medium text-gray-900">{systemInfo.architecture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CPU-Kerne:</span>
                  <span className="text-sm font-medium text-gray-900">{systemInfo.cpu_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CPU-Modell:</span>
                  <span className="text-sm font-medium text-gray-900">{systemInfo.cpu_model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Laufzeit:</span>
                  <span className="text-sm font-medium text-gray-900">{formatUptime(systemInfo.uptime)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Speicher-Übersicht</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gesamter Speicher:</span>
                  <span className="text-sm font-medium text-gray-900">{formatBytes(systemInfo.total_memory * 1024 * 1024)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Freier Speicher:</span>
                  <span className="text-sm font-medium text-gray-900">{formatBytes(systemInfo.free_memory * 1024 * 1024)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Speicher-Nutzung:</span>
                  <span className="text-sm font-medium text-gray-900">{systemInfo.memory_usage_percent}%</span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${systemInfo.memory_usage_percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'disk' && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Festplatten-Nutzung</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">/ (Root)</span>
                  <span className="text-sm text-gray-600">75% verwendet</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100GB von 500GB</span>
                  <span>400GB verfügbar</span>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">/home</span>
                  <span className="text-sm text-gray-600">45% verwendet</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>225GB von 500GB</span>
                  <span>275GB verfügbar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Speicher-Details</h3>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">RAM-Nutzung</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gesamt:</span>
                    <span className="text-sm font-medium text-gray-900">16 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Verwendet:</span>
                    <span className="text-sm font-medium text-gray-900">8 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frei:</span>
                    <span className="text-sm font-medium text-gray-900">8 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Swap-Nutzung</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gesamt:</span>
                    <span className="text-sm font-medium text-gray-900">4 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Verwendet:</span>
                    <span className="text-sm font-medium text-gray-900">0 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frei:</span>
                    <span className="text-sm font-medium text-gray-900">4 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Netzwerk-Verbindungen</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protokoll</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokale Adresse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Externe Adresse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TCP</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0.0.0.0:22</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0.0.0.0:0</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        LISTEN
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TCP</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">127.0.0.1:3000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">127.0.0.1:54321</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        ESTABLISHED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemTools;