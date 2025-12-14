'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  userId: string;
  bookId?: string;
  amount: number;
  paymentMethod?: string;
  method?: string;
  status: 'pending' | 'validated' | 'cancelled';
  createdAt?: string;
  orderId: string;
}

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'validated' | 'pending' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, statusFilter]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/transactions', {
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
        throw new Error('Failed to fetch transactions');
      }

      const { transactions: trans } = await res.json();
      setTransactions(trans || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (statusFilter === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(t => t.status === statusFilter));
    }
  };

  const updateTransactionStatus = async (transactionId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: transactionId, status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update transaction');

      const { transaction } = await res.json();
      setTransactions(prev => prev.map(t => t.id === transactionId ? transaction : t));
      setSelectedStatus(prev => ({ ...prev, [transactionId]: '' }));
    } catch (err) {
      console.error('Error updating transaction:', err);
      alert('Failed to update transaction status');
    }
  };

  const deleteTransaction = async (transactionId: string, orderId: string) => {
    if (!confirm(`Are you sure you want to delete transaction ${orderId}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: transactionId }),
      });

      if (!res.ok) throw new Error('Failed to delete transaction');

      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center">
        <p className="text-xl text-gray-600">Chargement des transactions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#C0392B]">💳 Transactions</h1>
          <a
            href="/admin"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Tableau de bord
          </a>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Filtrer par statut</h2>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'validated', 'pending', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded transition ${
                  statusFilter === status
                    ? 'bg-[#C0392B] text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'Tous' : status === 'validated' ? 'Validées' : status === 'pending' ? 'En attente' : 'Annulées'}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Aucune transaction trouvée</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-6 py-3 text-left font-bold text-gray-800">ID Commande</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">ID Utilisateur</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Montant</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Méthode</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Statut</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Date</th>
                  <th className="px-6 py-3 text-center font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800 font-mono text-sm">{transaction.orderId}</td>
                    <td className="px-6 py-4 text-gray-800 font-mono text-sm">{transaction.userId || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-[#128A41]">
                      {transaction.amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-gray-800">{transaction.paymentMethod || transaction.method || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(transaction.status)}`}>
                        {transaction.status === 'validated' ? 'Validée' : transaction.status === 'pending' ? 'En attente' : 'Annulée'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <select
                          value={selectedStatus[transaction.id] || transaction.status}
                          onChange={(e) => {
                            setSelectedStatus(prev => ({ ...prev, [transaction.id]: e.target.value }));
                            updateTransactionStatus(transaction.id, e.target.value);
                          }}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="pending">En attente</option>
                          <option value="validated">Validée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                        <button
                          onClick={() => deleteTransaction(transaction.id, transaction.orderId)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8">
          <a
            href="/admin"
            className="text-[#128A41] hover:underline font-semibold"
          >
            ← Retour au tableau de bord
          </a>
        </div>
      </div>
    </div>
  );
}
