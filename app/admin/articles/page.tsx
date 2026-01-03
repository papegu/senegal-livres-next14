import { prisma } from '@/lib/prisma';

async function getArticles() {
  return prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
}

async function addArticle(formData: FormData) {
  'use server';
  const token = process.env.ADMIN_TOKEN || '';
  const payload = {
    title: String(formData.get('title') || ''),
    abstract: String(formData.get('abstract') || ''),
    category: String(formData.get('category') || ''),
    pdfUrl: String(formData.get('pdfUrl') || ''),
    authorId: Number(formData.get('authorId') || 0),
  };
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/articles`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'x-admin-token': token } : {}) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function deleteArticle(id: number) {
  'use server';
  const token = process.env.ADMIN_TOKEN || '';
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/articles?id=${id}`, {
    method: 'DELETE', headers: { ...(token ? { 'x-admin-token': token } : {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function AdminArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-[#128A41] mb-4">📄 Gestion des articles</h1>

        <form action={addArticle} className="grid grid-cols-1 md:grid-cols-2 gap-3 border p-4 rounded mb-6">
          <input name="title" placeholder="Titre" className="border px-3 py-2 rounded" required />
          <input name="authorId" placeholder="Auteur ID (optionnel)" className="border px-3 py-2 rounded" />
          <input name="category" placeholder="Catégorie" className="border px-3 py-2 rounded" />
          <input name="pdfUrl" placeholder="PDF URL (optionnel)" className="border px-3 py-2 rounded" />
          <textarea name="abstract" placeholder="Résumé" className="md:col-span-2 border px-3 py-2 rounded" required />
          <button type="submit" className="md:col-span-2 bg-[#128A41] text-white px-4 py-2 rounded">Ajouter</button>
        </form>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Titre</th>
              <th className="p-2">Statut</th>
              <th className="p-2">Paiement</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id} className="border-b">
                <td className="p-2">{a.id}</td>
                <td className="p-2">{a.title}</td>
                <td className="p-2"><span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{a.status}</span></td>
                <td className="p-2"><span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{a.paymentStatus}</span></td>
                <td className="p-2">
                  <form action={async () => { await deleteArticle(a.id); }}>
                    <button type="submit" className="bg-red-600 text-white px-3 py-1 rounded">Supprimer</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
