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

  useEffect(() => {
    fetchCart();
    fetchBooks();
  }, []);

  async function fetchCart() {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        router.push("/auth/login");
        return;
      }
      const data = await res.json();
      setCart(data.cart || []);
    } catch (err) {
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBooks() {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error("Failed to load books");
    }
  }

  async function removeFromCart(bookId: string) {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, action: "remove" }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (err) {
      setError("Failed to remove item");
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

        {error && <p className="text-red-600 mb-4">{error}</p>}

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
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {cartBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex gap-4 p-4 border-b last:border-b-0 items-center"
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-20 h-32 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-[#128A41] font-semibold mt-2">
                      {book.price} FCFA
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(book.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-[#128A41]">{total} FCFA</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push("/books")}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
              >
                Continuer vos achats
              </button>
              <button
                onClick={() => router.push("/checkout")}
                className="flex-1 bg-[#C0392B] text-white py-2 px-4 rounded hover:bg-black transition"
              >
                Procéder au paiement
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
