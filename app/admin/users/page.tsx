'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  blocked?: boolean;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', name: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
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
        throw new Error('Failed to fetch users');
      }

      const { users: userList } = await res.json();
      setUsers(userList || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ email: '', name: '', password: '' });
    setShowForm(true);
  };

  const handleEditClick = (user: User) => {
    setEditingId(user.id);
    setFormData({ email: user.email, name: user.name, password: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update user
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'x-admin-token': localStorage.getItem('admin_token') || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: editingId, ...formData }),
        });

        if (!res.ok) throw new Error('Failed to update user');
        const updated = await res.json();
        setUsers(prev => prev.map(u => u.id === editingId ? updated : u));
      } else {
        // Create user
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'x-admin-token': localStorage.getItem('admin_token') || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error('Failed to create user');
        const created = await res.json();
        setUsers(prev => [...prev, created]);
      }
      setShowForm(false);
      setFormData({ email: '', name: '', password: '' });
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Failed to save user');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const targetRole = currentRole === 'admin' ? 'client' : 'admin';
    if (!confirm(`Etes-vous sûr de vouloir ${targetRole === 'admin' ? 'nommer administrateur' : 'retirer le rôle administrateur'} pour cet utilisateur ?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId, role: targetRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
    } catch (err) {
      console.error('Error toggling role:', err);
      alert('Impossible de modifier le rôle');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
        },
      });

      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleToggleBlock = async (userId: string, currentBlocked: boolean) => {
    const newStatus = !currentBlocked;
    if (!confirm(`Êtes-vous sûr de vouloir ${newStatus ? 'bloquer les achats' : 'débloquer'} cet utilisateur ?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId, blocked: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update user status');
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: updated.blocked } : u));
    } catch (err) {
      console.error('Error toggling block:', err);
      alert('Impossible de modifier le statut');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center">
        <p className="text-xl text-gray-600">Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#C0392B]">👥 Utilisateurs</h1>
          <div className="flex gap-4">
            <button
              onClick={handleAddClick}
              className="bg-[#128A41] text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Ajouter utilisateur
            </button>
            <a
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              ← Tableau de bord
            </a>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">{editingId ? 'Modifier' : 'Ajouter'} utilisateur</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe {editingId ? '(optionnel pour modifier)' : '(requis)'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-[#128A41] text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {editingId ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        {users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Email</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Nom</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Rôle</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Inscrit le</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{user.email}</td>
                    <td className="px-6 py-4 text-gray-800">{user.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? '⚙️ Admin' : 'client'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Supprimer
                      </button>
                      <button
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        {user.role === 'admin' ? 'Retirer Admin' : 'Promouvoir Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleBlock(user.id, user.blocked || false)}
                        className={`px-3 py-1 rounded text-sm text-white font-semibold ${
                          user.blocked 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-orange-600 hover:bg-orange-700'
                        }`}
                      >
                        {user.blocked ? '✓ Débloqué' : '🚫 Bloquer'}
                      </button>
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
