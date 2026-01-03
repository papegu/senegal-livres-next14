'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase-client';

export default function SubmitArticlePage() {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Seuls les fichiers PDF sont acceptés');
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
      if (!title || !abstract || !category || !pdfFile) {
        setError('Veuillez remplir tous les champs requis');
        setLoading(false);
        return;
      }

      // 1) Ask server for signed upload URL
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

      // 2) Upload directly to Supabase Storage
      const { error: upErr } = await supabaseClient.storage
        .from('pdfs')
        .uploadToSignedUrl(path, token, pdfFile);
      if (upErr) throw new Error(upErr.message || 'Échec du téléversement du PDF');

      // 3) Send metadata to server
      const res = await fetch('/api/journal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, abstract, category, pdfPublicUrl: publicUrl, pdfFileName: pdfFile.name }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Échec de la soumission');
      }

      setSuccess('✓ Article soumis avec succès. Un éditeur va le valider.');
      setTitle('');
      setAbstract('');
      setCategory('');
      setPdfFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de soumission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-[#C0392B] mb-4">📝 Soumettre un article</h1>
        {error && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded">{error}</div>}
        {success && <div className="mb-4 bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Titre *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Résumé *</label>
            <textarea value={abstract} onChange={e => setAbstract(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fichier PDF *</label>
            <input type="file" accept=".pdf" onChange={handleFileChange} className="w-full" required />
            <p className="text-xs text-gray-500 mt-2">Si le fichier est trop grand, envoyez-le à contact@senegal-livres.sn.</p>
          </div>
          <button type="submit" disabled={loading} className="bg-[#128A41] text-white px-4 py-2 rounded font-semibold">{loading ? 'Envoi...' : 'Soumettre'}</button>
        </form>
      </div>
    </div>
  );
}
