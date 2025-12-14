'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  successTransactions: number;
  pendingTransactions: number;
  cancelledTransactions: number;
  totalRevenue: number;
  totalBooks: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
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
        throw new Error('Failed to fetch stats');
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4E9CE]">
      <nav className="bg-[#C0392B] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🔑 Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-700 px-4 py-2 rounded hover:bg-red-800 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm">Successful Transactions</p>
                <p className="text-4xl font-bold text-green-600">{stats.successTransactions}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm">Pending Transactions</p>
                <p className="text-4xl font-bold text-yellow-600">{stats.pendingTransactions}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm">Cancelled Transactions</p>
                <p className="text-4xl font-bold text-red-600">{stats.cancelledTransactions}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-4xl font-bold text-[#128A41]">{stats.totalRevenue.toLocaleString()} FCFA</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Link
                href="/admin/transactions"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <h2 className="text-2xl font-bold text-[#C0392B] mb-2">💳 Transactions</h2>
                <p className="text-gray-600 mb-4">View and filter transactions by status</p>
                <span className="text-[#128A41] font-semibold">View Details →</span>
              </Link>

              <Link
                href="/admin/books"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <h2 className="text-2xl font-bold text-[#C0392B] mb-2">📚 Books</h2>
                <p className="text-gray-600 mb-4">Manage inventory and book status</p>
                <span className="text-[#128A41] font-semibold">View Details →</span>
              </Link>

              <Link
                href="/admin/users"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <h2 className="text-2xl font-bold text-[#C0392B] mb-2">👥 Users</h2>
                <p className="text-gray-600 mb-4">View registered users and their activity</p>
                <span className="text-[#128A41] font-semibold">View Details →</span>
              </Link>

              <Link
                href="/admin/submissions"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-amber-400"
              >
                <h2 className="text-2xl font-bold text-amber-600 mb-2">📋 Submissions</h2>
                <p className="text-gray-600 mb-4">Review book submissions from users</p>
                <span className="text-amber-600 font-semibold">View Details →</span>
              </Link>

              <Link
                href="/admin/database"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-purple-400"
              >
                <h2 className="text-2xl font-bold text-purple-600 mb-2">🗄️ Base de Données</h2>
                <p className="text-gray-600 mb-4">Administration et monitoring MySQL</p>
                <span className="text-purple-600 font-semibold">View Details →</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
