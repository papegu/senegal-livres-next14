import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function checkAdmin(req: Request) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return true;
  const header = req.headers.get('x-admin-token');
  return header === token;
}

export async function GET(req: Request) {
  if (!checkAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const subs = await prisma.articlesubmission.findMany({ orderBy: { submittedAt: 'desc' } });
  return NextResponse.json(subs);
}

export async function PUT(req: Request) {
  if (!checkAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  try {
    const body = await req.json();
    const { id, action, note } = body || {};
    if (!id || !action) return new NextResponse('Missing id or action', { status: 400 });

    const sub = await prisma.articlesubmission.findUnique({ where: { id } });
    if (!sub) return new NextResponse('Not found', { status: 404 });

    if (action === 'reject') {
      const updated = await prisma.articlesubmission.update({
        where: { id },
        data: { status: 'rejected', reviewedAt: new Date(), reviewNotes: note ? String(note) : sub.reviewNotes },
      });
      return NextResponse.json({ ok: true, submission: updated });
    }

    if (action === 'approve') {
      const updated = await prisma.articlesubmission.update({
        where: { id },
        data: { status: 'accepted', reviewedAt: new Date(), reviewNotes: note ? String(note) : sub.reviewNotes },
      });

      const uuid = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const article = await prisma.article.create({
        data: {
          uuid,
          authorId: sub.userId ?? 0,
          title: sub.title,
          abstract: sub.abstract,
          category: sub.category,
          pdfUrl: sub.pdfUrl,
          status: 'draft',
          paymentStatus: 'required',
        },
      });

      return NextResponse.json({ ok: true, submission: updated, article });
    }

    return new NextResponse('Invalid action', { status: 400 });
  } catch (err: any) {
    console.error('Admin approve/reject error', err);
    return new NextResponse(err?.message || 'Server error', { status: 500 });
  }
}
