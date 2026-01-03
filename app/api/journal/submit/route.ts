import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, abstract, category, pdfPublicUrl, pdfFileName } = body || {};

    if (!title || !abstract || !category || !pdfPublicUrl) {
      return new NextResponse('Champs manquants', { status: 400 });
    }

    // Generate a UUID for the submission; associate a placeholder userId (0) for now
    const uuid = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const userId = 0;

    const submission = await prisma.articlesubmission.create({
      data: {
        uuid,
        userId,
        title,
        abstract,
        category,
        pdfUrl: pdfPublicUrl,
        status: 'pending',
        reviewNotes: JSON.stringify({ filename: pdfFileName || null }),
      },
    });

    return NextResponse.json({ ok: true, submissionId: submission.id });
  } catch (err: any) {
    console.error('Submit article error', err);
    return new NextResponse(err?.message || 'Erreur serveur', { status: 500 });
  }
}
