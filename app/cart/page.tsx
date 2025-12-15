"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
  eBook?: boolean;
  pdfFile?: string;
}

interface CartItem {
  book: Book;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch cart - requires authentication via cookie
      const cartRes = await fetch("/api/cart", { credentials: 'include' });
      if (cartRes.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (!cartRes.ok) {
        throw new Error("Failed to load cart");
      }
      const cartData = await cartRes.json();
      setCart(Array.isArray(cartData.cart) ? cartData.cart : []);

      // Fetch books - public endpoint
      const booksRes = await fetch("/api/books");
      if (!booksRes.ok) {
        throw new Error("Failed to load books");
      }
      const booksData = await booksRes.json();
      const booksList = Array.isArray(booksData.books) ? booksData.books : (Array.isArray(booksData) ? booksData : []);
      setBooks(booksList);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load cart";
      setError(message);
      console.error("[CartPage] Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromCart(bookId: string) {
    setRemoving(bookId);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ bookId, action: "remove" }),
      });
      if (!res.ok) {
        throw new Error("Failed to remove item");
      }
      const data = await res.json();
      setCart(Array.isArray(data.cart) ? data.cart : []);
    } catch (err) {
      setError("Failed to remove item");
      console.error("[CartPage] Remove error:", err);
    } finally {
      setRemoving(null);
    }
  }

  const cartBooks = books.filter((b) => cart.includes(b.id));
  const total = cartBooks.reduce((sum, b) => sum + b.price, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4E9CE]">
        <p className="text-xl">Chargement du panier...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#C0392B] mb-6">Mon Panier</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ⚠️ {error}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">Votre panier est vide</p>
            <Link
              href="/books"
              className="text-[#128A41] font-semibold hover:underline"
            >
              Continuer vos achats
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cartBooks.length === 0 ? (
                <p className="text-gray-600">Erreur: Livres non trouvés dans le catalogue</p>
              ) : (
                cartBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{book.title}</h3>
                      <p className="text-gray-600">{book.author}</p>
                      {book.eBook && (
                        <p className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded inline-block mt-2">
                          📱 E-Book {book.pdfFile ? "✓" : "❌"}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#128A41]">
                        {book.price} FCFA
                      </p>
                      <button
                        onClick={() => removeFromCart(book.id)}
                        disabled={removing === book.id}
                        className="text-red-600 hover:text-red-800 mt-2 disabled:opacity-50"
                      >
                        {removing === book.id ? "Suppression..." : "Supprimer"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartBooks.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-between items-center mb-6 pb-6 border-b-2">
                  <span className="text-2xl font-bold">Total:</span>
                  <span className="text-3xl font-bold text-[#128A41]">
                    {total} FCFA
                  </span>
                </div>

                <div className="flex gap-4">
                  <Link
                    href="/books"
                    className="flex-1 bg-gray-500 text-white py-3 rounded hover:bg-gray-600 transition text-center font-bold"
                  >
                    Continuer les achats
                  </Link>
                  <Link
                    href="/checkout"
                    className="flex-1 bg-[#128A41] text-white py-3 rounded hover:bg-green-700 transition text-center font-bold"
                  >
                    Passer la commande
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

