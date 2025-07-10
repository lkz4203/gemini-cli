import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Database, Play, FileText, Table } from 'lucide-react';

const databaseSchema = z.object({
  databaseType: z.enum(['sqlite', 'postgresql', 'mysql']),
  connectionString: z.string().min(1, 'Verbindungsstring ist erforderlich'),
  query: z.string().min(1, 'SQL-Abfrage ist erforderlich'),
});

type DatabaseFormData = z.infer<typeof databaseSchema>;

const DatabaseTools: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'query' | 'tables' | 'describe'>('query');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DatabaseFormData>({
    resolver: zodResolver(databaseSchema),
    defaultValues: {
      databaseType: 'sqlite',
      connectionString: '',
      query: '',
    },
  });

  const databaseType = watch('databaseType');

  const onSubmit = async (data: DatabaseFormData) => {
    setLoading(true);
    try {
      // Hier würde die tatsächliche API-Anfrage an den MCP-Server erfolgen
      console.log('Datenbank-Abfrage:', data);
      
      // Simulierte Antwort
      setTimeout(() => {
        setResults({
          success: true,
          data: [
            { id: 1, name: 'Max Mustermann', email: 'max@example.com' },
            { id: 2, name: 'Anna Schmidt', email: 'anna@example.com' },
          ],
          message: 'Abfrage erfolgreich ausgeführt',
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      setResults({
        success: false,
        error: 'Fehler bei der Datenbank-Abfrage',
      });
      setLoading(false);
    }
  };

  const connectionStringExamples = {
    sqlite: 'sqlite:///path/to/database.db',
    postgresql: 'postgresql://username:password@localhost:5432/database',
    mysql: 'mysql://username:password@localhost:3306/database',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center">
          <Database className="h-8 w-8 text-blue-500 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Datenbank-Tools</h1>
            <p className="mt-2 text-gray-600">
              Führen Sie SQL-Abfragen auf SQLite, PostgreSQL und MySQL Datenbanken aus.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'query', name: 'SQL-Abfrage', icon: Play },
            { id: 'tables', name: 'Tabellen auflisten', icon: Table },
            { id: 'describe', name: 'Tabelle beschreiben', icon: FileText },
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
          {/* Database Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datenbank-Typ
            </label>
            <select
              {...register('databaseType')}
              className="input-field"
            >
              <option value="sqlite">SQLite</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
            </select>
          </div>

          {/* Connection String */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verbindungsstring
            </label>
            <input
              type="text"
              {...register('connectionString')}
              placeholder={connectionStringExamples[databaseType]}
              className="input-field"
            />
            {errors.connectionString && (
              <p className="mt-1 text-sm text-red-600">{errors.connectionString.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Beispiel: {connectionStringExamples[databaseType]}
            </p>
          </div>

          {/* Query */}
          {activeTab === 'query' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SQL-Abfrage
              </label>
              <textarea
                {...register('query')}
                rows={6}
                placeholder="SELECT * FROM users LIMIT 10;"
                className="input-field"
              />
              {errors.query && (
                <p className="mt-1 text-sm text-red-600">{errors.query.message}</p>
              )}
            </div>
          )}

          {/* Table Name for Describe */}
          {activeTab === 'describe' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tabellenname
              </label>
              <input
                type="text"
                placeholder="users"
                className="input-field"
              />
            </div>
          )}

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
                  Ausführen...
                </div>
              ) : (
                <div className="flex items-center">
                  <Play className="h-4 w-4 mr-2" />
                  Abfrage ausführen
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
                <p className="text-green-800">{results.message}</p>
              </div>
              {results.data && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(results.data[0] || {}).map((key) => (
                          <th
                            key={key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.data.map((row: any, index: number) => (
                        <tr key={index}>
                          {Object.values(row).map((value: any, cellIndex: number) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
            <h4 className="font-medium text-gray-900">SQLite</h4>
            <p className="text-sm text-gray-600">
              Verwenden Sie den Pfad zur SQLite-Datei als Verbindungsstring.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">PostgreSQL</h4>
            <p className="text-sm text-gray-600">
              Format: postgresql://username:password@host:port/database
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">MySQL</h4>
            <p className="text-sm text-gray-600">
              Format: mysql://username:password@host:port/database
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTools;