'use client';

import { Book } from "@/types/Book";
import { useEffect, useState } from "react";

export default function BooksPage() {
    useEffect(() => {
      // Détection blocage cookies/localStorage (anti-tracking)
      try {
        localStorage.setItem('test', '1');
        if (localStorage.getItem('test') !== '1') {
          alert("Votre navigateur bloque le stockage local. Certaines fonctionnalités peuvent être limitées.");
        }
        localStorage.removeItem('test');
      } catch (e) {
        alert("Votre navigateur bloque le stockage local ou les cookies. Certaines fonctionnalités peuvent être limitées.");
      }
    }, []);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("/api/books");
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        setBooks(data.books || data || []);
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
      // Si c'est un eBook, vérifier qu'on a le PDF
      const book = books.find(b => b.id === bookId);
      if (book?.eBook && !book?.pdfFile) {
        alert("⚠️ Ce livre électronique n'a pas encore de fichier PDF. Veuillez contacter l'administrateur.");
        return;
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
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

  const handlePdfSelect = (bookId: string) => {
    setSelectedBook(bookId);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier que c'est un PDF
      if (file.type !== 'application/pdf') {
        alert('Veuillez sélectionner un fichier PDF');
        return;
      }

      // Vérifier la taille (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 50MB)');
        return;
      }

      setPdfFile(file);
    }
  };

  const handlePdfUpload = async (bookId: string) => {
    if (!pdfFile) {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('bookId', bookId);

      const res = await fetch('/api/books/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }

      // Rafraîchir les livres
      const booksRes = await fetch("/api/books");
      const data = await booksRes.json();
      setBooks(data.books || data || []);

      setCartMessage('✓ PDF téléchargé avec succès!');
      setSelectedBook(null);
      setPdfFile(null);
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      alert("Erreur lors du téléchargement du PDF");
    } finally {
      setUploading(false);
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

              {book.eBook && (
                <p className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded mt-1 inline-block">
                  📱 E-Book
                </p>
              )}

              <p className="mt-2 font-semibold text-[#128A41]">
                {book.price} FCFA
              </p>

              {/* Si c'est un eBook et pas de PDF, afficher option d'upload */}
              {book.eBook && !book.pdfFile && selectedBook === book.id && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-semibold mb-2">📄 Ajouter fichier PDF:</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="text-xs mb-2 w-full"
                  />
                  <button
                    onClick={() => handlePdfUpload(book.id)}
                    disabled={!pdfFile || uploading}
                    className="w-full bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Téléchargement...' : 'Télécharger PDF'}
                  </button>
                  <button
                    onClick={() => { setSelectedBook(null); setPdfFile(null); }}
                    className="w-full bg-gray-400 text-white py-1 rounded text-sm mt-1 hover:bg-gray-500"
                  >
                    Annuler
                  </button>
                </div>
              )}

              {book.eBook && !book.pdfFile && selectedBook !== book.id && (
                <button
                  onClick={() => handlePdfSelect(book.id)}
                  className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition text-sm"
                >
                  📄 Ajouter PDF
                </button>
              )}

              {book.eBook && book.pdfFile && (
                <p className="text-xs text-green-600 mt-2">✓ PDF disponible</p>
              )}

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

