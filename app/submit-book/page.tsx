'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase-client';

interface SubmissionFormData {
  title: string;
  author: string;
  price: string;
  description: string;
  category: string;
  eBook: boolean;
  // Nouveaux champs optionnels (alignés avec book)
  slug?: string;
  cover_image_url?: string;
  pdf_r2_key?: string;
  pdf_r2_url?: string;
  has_ebook?: boolean;
  // Contact auteur pour livraison physique
  authorEmail?: string;
  authorPhone?: string;
  address?: string;
}

const initialFormData: SubmissionFormData = {
  title: '',
  author: '',
  price: '',
  description: '',
  category: '',
  eBook: false,
  slug: '',
  cover_image_url: '',
  pdf_r2_key: '',
  pdf_r2_url: '',
  has_ebook: false,
  authorEmail: '',
  authorPhone: '',
  address: '',
};

export default function SubmitBookPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SubmissionFormData>(initialFormData);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? '' : value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        setPdfFile(null);
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB');
        setPdfFile(null);
        return;
      }
      setPdfFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.title || !formData.author || !formData.price || !formData.category) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (!pdfFile) {
        setError('Please select a PDF file');
        setLoading(false);
        return;
      }

      // Normalize and validate price (allow comma or dot)
      const normalizedPriceStr = (formData.price || '').replace(/\s/g, '').replace(',', '.');
      const priceNum = parseFloat(normalizedPriceStr);
      if (Number.isNaN(priceNum)) {
        setError('Le prix doit être un nombre (utilisez "," ou ".")');
        setLoading(false);
        return;
      }
      if (priceNum < 0 || priceNum > 1500) {
        setError('Le prix doit être compris entre 0 et 1500 €');
        setLoading(false);
        return;
      }

      // Request signed upload and upload PDF directly to Supabase
      let uploadedPublicUrl = '';
      let uploadedFileName = '';
      if (pdfFile) {
        const signedRes = await fetch('/api/storage/signed-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: pdfFile.name, contentType: pdfFile.type || 'application/pdf' }),
        });
        if (!signedRes.ok) {
          const msg = await signedRes.text();
          throw new Error(msg || 'Impossible de préparer le téléversement');
        }
        const { path, token, publicUrl } = await signedRes.json();
        const { error: upErr } = await supabaseClient.storage
          .from('pdfs')
          .uploadToSignedUrl(path, token, pdfFile);
        if (upErr) throw new Error(upErr.message || 'Échec du téléversement du PDF');
        uploadedPublicUrl = publicUrl;
        uploadedFileName = path.split('/').pop() || pdfFile.name;
      }

      // Create FormData for metadata only (no file sent to server)
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('author', formData.author);
      uploadFormData.append('price', String(priceNum));
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('eBook', String(formData.eBook));
      if (uploadedPublicUrl) uploadFormData.append('pdfPublicUrl', uploadedPublicUrl);
      if (uploadedFileName) uploadFormData.append('pdfFileName', uploadedFileName);
      // Champs optionnels
      if (formData.slug) uploadFormData.append('slug', formData.slug);
      if (formData.cover_image_url) uploadFormData.append('cover_image_url', formData.cover_image_url);
      if (formData.pdf_r2_key) uploadFormData.append('pdf_r2_key', formData.pdf_r2_key);
      if (formData.pdf_r2_url) uploadFormData.append('pdf_r2_url', formData.pdf_r2_url);
      if (typeof formData.has_ebook === 'boolean') uploadFormData.append('has_ebook', String(formData.has_ebook));
      if (formData.authorEmail) uploadFormData.append('authorEmail', formData.authorEmail);
      if (formData.authorPhone) uploadFormData.append('authorPhone', formData.authorPhone);
      if (formData.address) uploadFormData.append('address', formData.address);

      const res = await fetch('/api/submit-book', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) {
        // Try to parse JSON; if not JSON, fallback to text (e.g., Request Entity Too Large)
        let message = 'Failed to submit book';
        let status = res.status;
        try {
          const errData = await res.json();
          message = errData.error || message;
        } catch {
          try {
            const txt = await res.text();
            message = txt || message;
          } catch {}
        }
        if (status === 413 || /Request Entity Too Large/i.test(message)) {
          message = 'Fichier trop volumineux (limite hébergeur atteinte). Réduisez le PDF (~4–5 Mo) ou contactez-nous.';
        }
        throw new Error(message);
      }

      setSuccess('✓ Book submitted successfully! The admin will review it soon.');
      setFormData(initialFormData);
      setPdfFile(null);
      
      // Redirect after 2 seconds
      setTimeout(() => router.push('/books'), 2000);
    } catch (err) {
      console.error('Error submitting book:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#C0392B]">📚 Submit Your Book</h1>
          <a
            href="/books"
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to Catalog
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 mb-6">
            Share your book with our community! Submit your PDF and provide book details. 
            Our admin team will review and add approved books to the catalog.
          </p>
          <div className="text-sm text-gray-700 mb-6">
            <p className="font-semibold mb-2">Quick guide (English):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Required</strong>: Title, Author, Category, Price, and PDF file.</li>
              <li><strong>Optional</strong>: Description, Slug, Cover Image (R2 URL), PDF R2 Key/URL, “Has eBook”, Author Email/Phone, Physical Address.</li>
              <li><strong>Tips</strong>: If an eBook is available, add the PDF R2 URL for faster delivery; the Slug helps SEO.</li>
              <li><strong>Privacy</strong>: Your contact details are used only to coordinate physical delivery if needed.</li>
            </ul>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Histoire">Histoire</option>
                  <option value="Science">Science</option>
                  <option value="Technologie">Technologie</option>
                  <option value="Littérature">Littérature</option>
                  <option value="Éducation">Éducation</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix (€) *
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                  placeholder="ex: 12,50 ou 12.50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Entre 0 et 1500 € (virgule ou point autorisé)</p>
              </div>
            </div>

            {/* Champs Cloudflare / SEO (optionnels) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (optionnel)</label>
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

            {/* Coordonnées auteur pour livraison physique */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email de l'auteur (optionnel)</label>
                <input
                  type="email"
                  name="authorEmail"
                  value={formData.authorEmail || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                  placeholder="auteur@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone de l'auteur (optionnel)</label>
                <input
                  type="tel"
                  name="authorPhone"
                  value={formData.authorPhone || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                  placeholder="+221 77 000 00 00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse pour livraison physique (optionnel)</label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#128A41]"
                placeholder="Quartier, Ville, Pays"
                rows={3}
              />
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
                placeholder="Enter book description (optional)"
                rows={4}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="eBook"
                id="eBook"
                checked={formData.eBook}
                onChange={(e) => setFormData(prev => ({ ...prev, eBook: e.target.checked }))}
                className="w-4 h-4 text-[#128A41] border-gray-300 rounded focus:ring-[#128A41]"
              />
              <label htmlFor="eBook" className="ml-2 text-sm font-semibold text-gray-700">
                📱 This book is available as eBook (electronic version)
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PDF File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full"
                  required
                />
                {pdfFile && (
                  <p className="mt-2 text-green-600 font-semibold">
                    ✓ {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Téléversement direct vers Supabase Storage. Taille conseillée: &lt; 50 Mo (selon votre connexion)
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#128A41] text-white px-4 py-3 rounded hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : '📤 Submit Book'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-400 text-white px-4 py-3 rounded hover:bg-gray-500 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Note:</strong> All submitted books are reviewed by our admin team before being added to the catalog. 
            We may contact you for additional information if needed. Once approved, your book will be available for sale!
          </p>
        </div>
      </div>
    </div>
  );
}
