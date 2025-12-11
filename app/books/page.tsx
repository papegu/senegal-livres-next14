'use client';

import { Book } from "@/types/Book";
import { useEffect, useState } from "react";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState<string>("");

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("/api/books");
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        setBooks(data.books || []);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  const handleAddToCart = async (bookId: string, bookTitle: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, action: "add" }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          window.location.href = "/auth/login";
          return;
        }
        throw new Error(data.message || "Failed to add to cart");
      }

      setCartMessage(`✓ "${bookTitle}" added to cart`);
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-10 bg-[#F4E9CE] min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="p-10 bg-[#F4E9CE] min-h-screen">
      <h1 className="text-4xl font-bold text-[#C0392B] mb-10 text-center">
        📚 Catalogue Sénégal Livres
      </h1>

      {cartMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {cartMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:scale-105 transition"
          >
            <img
              src={book.coverImage}
              alt={book.title}
              className="h-56 w-full object-cover"
            />

            <div className="p-4">
              <h2 className="font-bold text-lg">{book.title}</h2>
              <p className="text-sm text-gray-600">{book.author}</p>

              <p className="mt-2 font-semibold text-[#128A41]">
                {book.price} FCFA
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleAddToCart(book.id, book.title)}
                  className="flex-1 bg-[#128A41] text-white py-2 rounded hover:bg-green-700 transition"
                >
                  Add to Cart
                </button>
                <a
                  href={`/books/${book.id}`}
                  className="flex-1 text-center bg-[#C0392B] text-white py-2 rounded hover:bg-black transition"
                >
                  Details
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
