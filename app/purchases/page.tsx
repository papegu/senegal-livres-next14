'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/types/Book';
import { isValidHttpUrl } from '@/utils/url';

interface Purchase {
  id: string;
  userId: string;
  bookIds: string[];
  transactionId: string;
  amount: number;
  date: string;
}

export default function PurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const purchasesRes = await fetch('/api/purchases', { credentials: 'include' });
      if (!purchasesRes.ok) {
        if (purchasesRes.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch purchases');
      }

      const { purchases: userPurchases } = await purchasesRes.json();
      setPurchases(userPurchases || []);

      const booksRes = await fetch('/api/books');
      const { books: allBooks } = await booksRes.json();
      setBooks(allBooks || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const getPurchaseBooks = (purchase: Purchase) => {
    return purchase.bookIds
      .map(id => books.find(b => b.id === id))
      .filter(Boolean) as Book[];
  };

  const handleDownload = async (bookId: string, bookTitle: string) => {
    try {
      // First, try to get the book's pdfFile URL
      const book = books.find(b => b.id === bookId);
      
      // If pdfFile exists and is a valid URL (Supabase), download directly
      if (book?.pdfFile && isValidHttpUrl(book.pdfFile)) {
        // Direct link to Supabase - open in new tab for download
        const a = document.createElement('a');
        a.href = book.pdfFile;
        a.download = `${bookTitle}.pdf`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // Fallback: use API endpoint
      const response = await fetch(`/api/pdfs/download?bookId=${bookId}`);
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bookTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading purchases...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#C0392B] mb-8">📚 My Purchases</h1>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {purchases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't purchased any books yet</p>
            <a
              href="/books"
              className="inline-block bg-[#128A41] text-white px-6 py-3 rounded hover:bg-green-700"
            >
              Browse Books
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Purchase Date: {new Date(purchase.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Transaction ID: {purchase.transactionId}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-[#128A41]">{purchase.amount} €</p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-800 mb-4">Books Purchased:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getPurchaseBooks(purchase).map((book) => (
                      <div
                        key={book.id}
                        className="flex gap-4 p-4 bg-gray-50 rounded border border-gray-200"
                      >
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-20 h-32 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{book.title}</h4>
                          <p className="text-sm text-gray-600">{book.author}</p>
                          <p className="text-[#128A41] font-semibold mt-2">{book.price} €</p>
                          <button
                            onClick={() => handleDownload(book.id, book.title)}
                            className="mt-3 bg-[#C0392B] text-white px-4 py-2 rounded text-sm hover:bg-black transition"
                          >
                            ⬇️ Download PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <a
            href="/books"
            className="text-[#128A41] hover:underline font-semibold"
          >
            ← Back to Catalog
          </a>
        </div>
      </div>
    </div>
  );
}
