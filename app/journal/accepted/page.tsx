import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

async function getArticlesSafe() {
  try {
    return await prisma.article.findMany({
      where: { status: 'published', paymentStatus: 'paid' },
      orderBy: { publishedAt: 'desc' },
    });
  } catch (err) {
    console.error('[AcceptedArticles] DB query failed, returning empty list:', err);
    return [] as Array<{ id: number; title: string; abstract: string; pdfUrl: string | null; publishedAt: Date | null }>;
  }
}

export default async function AcceptedArticlesPage() {
  const articles = await getArticlesSafe();

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-[#128A41] mb-4">📚 Articles publiés</h1>
        {articles.length === 0 ? (
          <p className="text-gray-600">Aucun article publié pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {articles.map(a => (
              <li key={a.id} className="border rounded p-4">
                <div className="font-semibold text-lg">{a.title}</div>
                <div className="text-sm text-gray-600">{a.abstract}</div>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Publié</span>
                  {a.pdfUrl && (
                    <a href={a.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[#C0392B] hover:underline">Voir le PDF</a>
                  )}
                  {a.publishedAt && (
                    <span className="text-xs text-gray-500">{new Date(a.publishedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
