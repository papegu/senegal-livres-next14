"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

interface User {
  name?: string;
  role?: string;
}

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchCartCount();

    // Refresh auth status when the window regains focus (helps update header after logout)
    const onFocus = () => checkAuth();
    window.addEventListener('focus', onFocus);
    // Listen for custom auth-change events dispatched after login/logout
    window.addEventListener('auth-change', checkAuth as EventListener);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('auth-change', checkAuth as EventListener);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setUser(data.user || null);
        return;
      }
    } catch (err) {
      // ignore
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const { cart } = await res.json();
        setCartCount(cart?.length || 0);
      }
    } catch (err) {
      // User not authenticated or cart empty
      setCartCount(0);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // ignore
    }
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo2.jpg"
            width={70}
            height={70}
            alt="Sénégal Livres"
            priority
          />
          <h1 className="text-2xl font-bold text-[#C0392B]">
            SÉNÉGAL LIVRES
          </h1>
        </Link>

        <nav className="flex gap-6 text-lg items-center">
          <Link href="/books">Catalogue</Link>
          <Link href="/submit-book" className="text-amber-600 font-bold hover:text-amber-700">📤 Vendre un Livre</Link>

          {isAuthenticated && (
            <>
              <Link href="/cart" className="relative">
                🛒 Panier
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/purchases">📚 Mes Livres</Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="bg-yellow-500 text-white px-3 py-1 rounded font-bold flex items-center gap-1">
                  <span>⚙️</span>
                  <span>Admin</span>
                </Link>
              )}
              <Link href="/account" className="text-blue-600 font-bold flex items-center gap-2">
                <span>👤</span>
                <span>{user?.name || 'Mon Compte'}</span>
                {user?.role === 'admin' && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-semibold">Admin</span>}
              </Link>
              <button onClick={handleLogout} className="text-red-600 font-bold hover:underline bg-transparent border-0 cursor-pointer">
                Déconnexion
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link href="/auth/login">Connexion</Link>
              <Link href="/auth/register" className="bg-[#128A41] text-white px-4 py-2 rounded">
                S'inscrire
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
