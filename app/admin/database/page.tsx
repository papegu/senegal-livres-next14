'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TableStats {
  TABLE_NAME: string;
  TABLE_ROWS: number;
  DATA_LENGTH: number;
  INDEX_LENGTH: number;
  TOTAL_SIZE: number;
}

interface DbStats {
  totalRows: number;
  dataSize: number;
  indexSize: number;
  totalSize: number;
}

interface DatabaseStats {
  tables: TableStats[];
  dbStats: DbStats;
  counts: {
    users: number;
    books: number;
    transactions: number;
    purchases: number;
    submissions: number;
  };
}

export default function DatabaseAdmin() {
  const router = useRouter();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/database', {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch database stats');
      }

      const data = await res.json();
      
      // Vérifier si c'est un avertissement (base de données pas encore initialisée)
      if (data.warning) {
        setError(data.warning);
      }
      
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Base de données non disponible. Veuillez exécuter: npx prisma migrate dev');
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/database', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error(`Action failed: ${res.statusText}`);
      }

      const data = await res.json();
      setActionMessage(data.message || 'Action completed successfully');
      
      // Rafraîchir les stats
      setTimeout(() => {
        fetchDatabaseStats();
        setActionMessage('');
      }, 2000);
    } catch (err) {
      setActionMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Retour au Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Administration Base de Données</h1>
          <p className="text-gray-400">Gestion et monitoring de la base de données MySQL</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {actionMessage && (
          <div className={`rounded-lg p-4 mb-8 ${
            actionMessage.startsWith('Error') 
              ? 'bg-red-900 border border-red-700' 
              : 'bg-green-900 border border-green-700'
          }`}>
            <p className={actionMessage.startsWith('Error') ? 'text-red-200' : 'text-green-200'}>
              {actionMessage}
            </p>
          </div>
        )}

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm">Utilisateurs</div>
              <div className="text-3xl font-bold text-blue-400">{stats.counts.users}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm">Livres</div>
              <div className="text-3xl font-bold text-green-400">{stats.counts.books}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm">Transactions</div>
              <div className="text-3xl font-bold text-yellow-400">{stats.counts.transactions}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm">Achats</div>
              <div className="text-3xl font-bold text-purple-400">{stats.counts.purchases}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-400 text-sm">Soumissions</div>
              <div className="text-3xl font-bold text-pink-400">{stats.counts.submissions}</div>
            </div>
          </div>
        )}

        {/* Database Size Info */}
        {stats?.dbStats && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold mb-4">Taille de la Base de Données</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Taille des Données</div>
                <div className="text-xl font-semibold text-blue-400">
                  {formatBytes(stats.dbStats.dataSize)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Taille des Index</div>
                <div className="text-xl font-semibold text-green-400">
                  {formatBytes(stats.dbStats.indexSize)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Taille Totale</div>
                <div className="text-xl font-semibold text-yellow-400">
                  {formatBytes(stats.dbStats.totalSize)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Nombre Total de Lignes</div>
                <div className="text-xl font-semibold text-purple-400">
                  {(stats.dbStats.totalRows || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold mb-4">Actions d'Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => performAction('optimize')}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              {actionLoading ? 'En cours...' : '🔧 Optimiser la Base de Données'}
            </button>
            <button
              onClick={() => performAction('backup')}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              {actionLoading ? 'En cours...' : '💾 Créer une Sauvegarde'}
            </button>
            <button
              onClick={() => performAction('getConnections')}
              disabled={actionLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              {actionLoading ? 'En cours...' : '🔌 Voir les Connexions'}
            </button>
            <button
              onClick={fetchDatabaseStats}
              disabled={actionLoading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              🔄 Rafraîchir
            </button>
          </div>
        </div>

        {/* Tables Details */}
        {stats?.tables && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">Détails des Tables</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">Nom de la Table</th>
                  <th className="text-right py-3 px-4 text-gray-400">Lignes</th>
                  <th className="text-right py-3 px-4 text-gray-400">Données</th>
                  <th className="text-right py-3 px-4 text-gray-400">Index</th>
                  <th className="text-right py-3 px-4 text-gray-400">Taille Totale</th>
                </tr>
              </thead>
              <tbody>
                {stats.tables.map((table: TableStats) => (
                  <tr key={table.TABLE_NAME} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4 font-medium">{table.TABLE_NAME}</td>
                    <td className="text-right py-3 px-4">
                      {(table.TABLE_ROWS || 0).toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-blue-400">
                      {formatBytes(table.DATA_LENGTH)}
                    </td>
                    <td className="text-right py-3 px-4 text-green-400">
                      {formatBytes(table.INDEX_LENGTH)}
                    </td>
                    <td className="text-right py-3 px-4 text-yellow-400 font-semibold">
                      {formatBytes(table.TOTAL_SIZE)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MySQL User Creation Instructions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-8">
          <h2 className="text-2xl font-bold mb-4">Configuration Utilisateur MySQL</h2>
          <p className="text-gray-300 mb-4">
            Pour créer l'utilisateur administrateur <code className="bg-gray-900 px-2 py-1 rounded text-yellow-400">papeabdoulaye</code> avec le mot de passe <code className="bg-gray-900 px-2 py-1 rounded text-yellow-400">pape1982</code>, exécutez cette commande dans MySQL :
          </p>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
            <code className="text-green-400 text-sm">
              {`CREATE USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982';
GRANT ALL PRIVILEGES ON *.* TO 'papeabdoulaye'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;`}
            </code>
          </div>
          <p className="text-gray-400 text-sm">
            Cette commande doit être exécutée directement via MySQL CLI ou phpMyAdmin avec un compte administrateur root.
          </p>
        </div>
      </div>
    </div>
  );
}
