'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/types/Book';

interface BookWithStatus extends Book {
  status?: 'available' | 'pending';
}

interface BookFormData {
  title: string;
  author: string;
  price: number | string;
  description: string;
  coverImage: string;
  status: 'available' | 'pending';
  eBook: boolean;
  pdfFile?: File | null;
  // Cloudflare / SEO (optionnels)
  slug?: string;
  cover_image_url?: string;
  pdf_r2_key?: string;
  pdf_r2_url?: string;
  has_ebook?: boolean;
}

const initialFormData: BookFormData = {
  title: '',
  author: '',
  price: '',
  description: '',
  coverImage: '',
  status: 'available',
  eBook: false,
  pdfFile: null,
  slug: '',
  cover_image_url: '',
  pdf_r2_key: '',
  pdf_r2_url: '',
  has_ebook: false,
};

export default function AdminBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<BookWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<BookFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/admin/books', {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch books');
      
      const { books: bookList } = await res.json();
      setBooks(bookList || []);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      // Remplacer pdf par pdfFile
      setFormData(prev => ({ ...prev, pdfFile: file }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' ? (value === '' ? '' : Number(value)) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!formData.title || !formData.author || !formData.price || !formData.coverImage) {
        setError('Please fill in all required fields');
        return;
      }

      const adminToken = localStorage.getItem('admin_token') || '';
      let res;

      if (editingId) {
        // PATCH via Supabase route: persist Cloudflare fields and slug
        const patchBody = {
          title: formData.title,
          author: formData.author,
          price: formData.price,
          description: formData.description,
          coverImage: formData.coverImage,
          status: formData.status,
          // Cloudflare / SEO (optionnels)
          slug: formData.slug,
          cover_image_url: formData.cover_image_url,
          pdf_r2_key: formData.pdf_r2_key,
          pdf_r2_url: formData.pdf_r2_url,
          has_ebook: formData.has_ebook,
        };

        res = await fetch(`/api/books/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchBody),
        });
      } else {
        // Create flow remains on admin/books (existing logic)
        const method = 'POST';
        if (formData.pdfFile) {
          const data = new FormData();
          data.append('title', formData.title);
          data.append('author', formData.author);
          data.append('price', String(formData.price));
          data.append('description', formData.description);
          data.append('coverImage', formData.coverImage);
          data.append('status', formData.status);
          data.append('eBook', String(!!formData.has_ebook));
          data.append('pdfFile', formData.pdfFile);
          // Optional Cloudflare fields
          if (formData.slug) data.append('slug', formData.slug);
          if (formData.cover_image_url) data.append('cover_image_url', formData.cover_image_url);
          if (formData.pdf_r2_key) data.append('pdf_r2_key', formData.pdf_r2_key);
          if (formData.pdf_r2_url) data.append('pdf_r2_url', formData.pdf_r2_url);
          if (typeof formData.has_ebook === 'boolean') data.append('has_ebook', String(formData.has_ebook));

          res = await fetch('/api/admin/books', {
            method,
            credentials: 'include',
            headers: { 'x-admin-token': adminToken },
            body: data,
          });
        } else {
          const body = { ...formData };
          res = await fetch('/api/admin/books', {
            method,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-token': adminToken,
            },
            body: JSON.stringify(body),
          });
        }
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to ${editingId ? 'update' : 'create'} book`);
      }

      await fetchBooks();
      setFormData(initialFormData);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error submitting book form:', err);
      setError(err instanceof Error ? err.message : 'Failed to save book');
    }
  };

  const handleEdit = (book: BookWithStatus) => {
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      description: book.description || '',
      coverImage: book.coverImage,
      status: book.status || 'available',
      eBook: book.eBook || false,
      pdfFile: null,
      // Préremplir les champs Cloudflare si présents
      slug: book.slug || '',
      cover_image_url: book.cover_image_url || '',
      pdf_r2_key: book.pdf_r2_key || '',
      pdf_r2_url: book.pdf_r2_url || '',
      has_ebook: !!book.has_ebook,
    });
    setEditingId(book.id);
    setShowForm(true);
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      setError('');
      const res = await fetch(`/api/admin/books?id=${bookId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete book');
      }

      await fetchBooks();
    } catch (err) {
      console.error('Error deleting book:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete book');
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#C0392B]">📚 Manage Books Catalog</h1>
          <a
            href="/admin"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Dashboard
          </a>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingId ? 'Edit Book' : 'Add New Book'}
            </h2>
            {showForm && (
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (€) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                    placeholder="Enter price in euro"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Image URL *
                </label>
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                  placeholder="Enter image URL"
                  required
                />
              </div>

              {/* Champs Cloudflare / SEO (optionnels) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (Cloudflare) - optionnel</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                    placeholder="ex: l-art-de-la-lecture"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image (R2 URL) - optionnel</label>
                  <input
                    type="url"
                    name="cover_image_url"
                    value={formData.cover_image_url || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                    placeholder="https://cdn.example/r2/covers/123.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">PDF R2 Key - optionnel</label>
                  <input
                    type="text"
                    name="pdf_r2_key"
                    value={formData.pdf_r2_key || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                    placeholder="ebooks/123.pdf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">PDF R2 URL - optionnel</label>
                  <input
                    type="url"
                    name="pdf_r2_url"
                    value={formData.pdf_r2_url || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                    placeholder="https://cdn.example/r2/ebooks/123.pdf"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                  placeholder="Enter book description"
                  rows={4}
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PDF du livre (optionnel)
                </label>
                <input
                  type="file"
                  name="pdfFile"
                  accept="application/pdf"
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                  // Le PDF n'est pas requis
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="has_ebook"
                  id="has_ebook"
                  checked={!!formData.has_ebook}
                  onChange={(e) => setFormData(prev => ({ ...prev, has_ebook: e.target.checked, eBook: e.target.checked }))}
                  className="w-4 h-4 text-[#128A41] border-gray-300 rounded focus:ring-[#128A41]"
                />
                <label htmlFor="has_ebook" className="ml-2 text-sm font-semibold text-gray-700">
                  📱 Has eBook (Cloudflare) - optionnel
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#128A41] text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
                >
                  {editingId ? 'Update Book' : 'Add Book'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#128A41] text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
            >
              + Add New Book
            </button>
          )}
        </div>

        {/* Books List */}
        {books.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No books in catalog</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200 border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-800">Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-800">Author</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-800">Price (€)</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-800">Status</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-800">eBook</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book, index) => (
                    <tr
                      key={book.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-3 text-gray-800 font-medium">{book.title}</td>
                      <td className="px-4 py-3 text-gray-600">{book.author}</td>
                      <td className="px-4 py-3 text-gray-800 font-semibold text-[#128A41]">
                        {book.price} €
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            (book.status || 'available') === 'available'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {(book.status || 'available').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-lg">
                          {book.eBook ? '📱' : '📖'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(book)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
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
          </div>
        )}

        <div className="mt-8">
          <a
            href="/admin"
            className="text-[#128A41] hover:underline font-semibold"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
