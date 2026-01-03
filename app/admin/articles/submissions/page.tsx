import { prisma } from '@/lib/prisma';

async function getSubmissions() {
  return prisma.articlesubmission.findMany({ orderBy: { submittedAt: 'desc' } });
}

async function moderate(id: number, action: 'approve'|'reject') {
  'use server';
  const token = process.env.ADMIN_TOKEN || '';
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/articles/submissions`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'x-admin-token': token } : {}) },
    body: JSON.stringify({ id, action }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function AdminArticleSubmissionsPage() {
  const submissions = await getSubmissions();

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-[#128A41] mb-4">🛠️ Modération des soumissions</h1>
        {submissions.length === 0 ? (
          <p className="text-gray-600">Aucune soumission pour le moment.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">ID</th>
                <th className="p-2">Titre</th>
                <th className="p-2">Catégorie</th>
                <th className="p-2">Statut</th>
                <th className="p-2">PDF</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">{s.id}</td>
                  <td className="p-2">{s.title}</td>
                  <td className="p-2">{s.category}</td>
                  <td className="p-2">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{s.status}</span>
                  </td>
                  <td className="p-2">
                    {s.pdfUrl ? (<a href={s.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[#C0392B] hover:underline">Voir PDF</a>) : '—'}
                  </td>
                  <td className="p-2">
                    <form action={async () => { await moderate(s.id, 'approve'); }}>
                      <button type="submit" className="mr-2 bg-green-600 text-white px-3 py-1 rounded">Approuver</button>
                    </form>
                    <form action={async () => { await moderate(s.id, 'reject'); }}>
                      <button type="submit" className="bg-red-600 text-white px-3 py-1 rounded">Rejeter</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
