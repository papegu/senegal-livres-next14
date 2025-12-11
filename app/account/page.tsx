'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface Purchase {
  id: string;
  bookIds: string[];
  amount: number;
  date: string;
}

export default function ClientAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch user');
      }
      const userData = await res.json();
      setUser(userData);

      // Fetch purchases
      const purchasesRes = await fetch('/api/purchases');
      if (purchasesRes.ok) {
        const purchasesData = await purchasesRes.json();
        setPurchases(purchasesData.purchases || []);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center">
        <p className="text-xl text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4E9CE]">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[#C0392B] mb-2">Mon Compte</h1>
              {user && (
                <div className="text-gray-600">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Nom:</strong> {user.name}</p>
                  <p><strong>Membre depuis:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition font-bold"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/purchases"
            className="bg-[#128A41] text-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-bold mb-2">📚 Mes Livres</h2>
            <p className="text-sm opacity-90">Accéder à vos livres achetés</p>
          </Link>

          <Link
            href="/cart"
            className="bg-[#C0392B] text-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-bold mb-2">🛒 Mon Panier</h2>
            <p className="text-sm opacity-90">Continuer vos achats</p>
          </Link>

          <Link
            href="/books"
            className="bg-gray-700 text-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-bold mb-2">📖 Catalogue</h2>
            <p className="text-sm opacity-90">Découvrir d'autres livres</p>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-[#C0392B] mb-6">Historique des Achats</h2>
          {purchases.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Aucun achat pour le moment</p>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="border-b pb-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{purchase.bookIds.length} livre(s)</p>
                    <p className="text-sm text-gray-600">{new Date(purchase.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-lg font-bold text-[#128A41]">{purchase.amount} FCFA</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
