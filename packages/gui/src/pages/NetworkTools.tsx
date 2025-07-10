import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Network, Search, Globe, Wifi, Activity } from 'lucide-react';

const networkSchema = z.object({
  host: z.string().min(1, 'Host ist erforderlich'),
  ports: z.string().min(1, 'Ports sind erforderlich'),
  timeout: z.number().min(1000).max(30000).default(5000),
});

type NetworkFormData = z.infer<typeof networkSchema>;

const NetworkTools: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'portscan' | 'dns' | 'http' | 'ping'>('portscan');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NetworkFormData>({
    resolver: zodResolver(networkSchema),
    defaultValues: {
      host: '',
      ports: '80,443,8080',
      timeout: 5000,
    },
  });

  const onSubmit = async (data: NetworkFormData) => {
    setLoading(true);
    try {
      console.log('Netzwerk-Test:', data);
      
      // Simulierte Antwort basierend auf Tab
      setTimeout(() => {
        if (activeTab === 'portscan') {
          setResults({
            success: true,
            host: data.host,
            scan_results: [
              { port: 80, status: 'open', service: 'HTTP' },
              { port: 443, status: 'open', service: 'HTTPS' },
              { port: 8080, status: 'closed', service: 'Unknown' },
            ],
            total_ports: 3,
            open_ports: [80, 443],
          });
        } else if (activeTab === 'dns') {
          setResults({
            success: true,
            domain: data.host,
            records: [
              { address: '142.250.185.78', family: 4 },
              { address: '2a00:1450:4001:81b::200e', family: 6 },
            ],
          });
        }
        setLoading(false);
      }, 1000);
    } catch (error) {
      setResults({
        success: false,
        error: 'Fehler beim Netzwerk-Test',
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center">
          <Network className="h-8 w-8 text-green-500 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Netzwerk-Tools</h1>
            <p className="mt-2 text-gray-600">
              Führen Sie Port-Scans, DNS-Lookups und HTTP-Tests durch.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'portscan', name: 'Port-Scan', icon: Search },
            { id: 'dns', name: 'DNS-Lookup', icon: Globe },
            { id: 'http', name: 'HTTP-Test', icon: Wifi },
            { id: 'ping', name: 'Ping-Test', icon: Activity },
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

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Host Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeTab === 'portscan' || activeTab === 'ping' ? 'Host/IP' : 'Domain'}
            </label>
            <input
              type="text"
              {...register('host')}
              placeholder={activeTab === 'portscan' || activeTab === 'ping' ? 'google.com' : 'example.com'}
              className="input-field"
            />
            {errors.host && (
              <p className="mt-1 text-sm text-red-600">{errors.host.message}</p>
            )}
          </div>

          {/* Ports Input (only for port scan) */}
          {activeTab === 'portscan' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ports
              </label>
              <input
                type="text"
                {...register('ports')}
                placeholder="80,443,8080 oder 1-1000"
                className="input-field"
              />
              {errors.ports && (
                <p className="mt-1 text-sm text-red-600">{errors.ports.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Einzelne Ports: 80,443,8080 oder Bereiche: 1-1000
              </p>
            </div>
          )}

          {/* HTTP Method (only for HTTP test) */}
          {activeTab === 'http' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTTP-Methode
              </label>
              <select className="input-field">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
              </select>
            </div>
          )}

          {/* Timeout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout (ms)
            </label>
            <input
              type="number"
              {...register('timeout', { valueAsNumber: true })}
              min="1000"
              max="30000"
              className="input-field"
            />
            {errors.timeout && (
              <p className="mt-1 text-sm text-red-600">{errors.timeout.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Test läuft...
                </div>
              ) : (
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Test starten
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {results && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ergebnisse</h3>
          {results.success ? (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800">Test erfolgreich abgeschlossen</p>
              </div>
              
              {activeTab === 'portscan' && results.scan_results && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Port-Scan Ergebnisse für {results.host}</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Port</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.scan_results.map((result: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.port}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                result.status === 'open' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {result.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.service}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Offene Ports: {results.open_ports.join(', ')}</p>
                    <p>Gescannte Ports: {results.total_ports}</p>
                  </div>
                </div>
              )}

              {activeTab === 'dns' && results.records && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">DNS-Lookup für {results.domain}</h4>
                  <div className="space-y-2">
                    {results.records.map((record: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">{record.address}</span>
                        <span className="text-xs text-gray-500">IPv{record.family}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{results.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hilfe</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Port-Scan</h4>
            <p className="text-sm text-gray-600">
              Scannen Sie einzelne Ports oder Port-Bereiche. Verwenden Sie Kommas für einzelne Ports oder Bindestriche für Bereiche.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">DNS-Lookup</h4>
            <p className="text-sm text-gray-600">
              Führen Sie DNS-Lookups für Domains durch. Unterstützt A-Records und IPv4/IPv6-Adressen.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">HTTP-Test</h4>
            <p className="text-sm text-gray-600">
              Testen Sie HTTP-Endpunkte mit verschiedenen Methoden und Headers.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Ping-Test</h4>
            <p className="text-sm text-gray-600">
              Führen Sie Ping-Tests für Hosts durch und messen Sie die Antwortzeiten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTools;