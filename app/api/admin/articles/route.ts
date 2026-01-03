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
  const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  if (!checkAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  try {
    const body = await req.json();
    const { title, abstract, category, pdfUrl, authorId } = body || {};
    if (!title || !abstract) return new NextResponse('Missing fields', { status: 400 });
    const uuid = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const article = await prisma.article.create({
      data: {
        uuid,
        authorId: authorId ?? 0,
        title,
        abstract,
        category: category ?? '',
        pdfUrl: pdfUrl ?? '',
        status: 'draft',
        paymentStatus: 'required',
      },
    });
    return NextResponse.json(article);
  } catch (err: any) {
    return new NextResponse(err?.message || 'Server error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!checkAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const id = idParam ? parseInt(idParam, 10) : undefined;
    const body = await req.json();
    if (!id) return new NextResponse('Missing id', { status: 400 });
    const article = await prisma.article.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(article);
  } catch (err: any) {
    return new NextResponse(err?.message || 'Server error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!checkAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const id = idParam ? parseInt(idParam, 10) : undefined;
    if (!id) return new NextResponse('Missing id', { status: 400 });
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return new NextResponse(err?.message || 'Server error', { status: 500 });
  }
}
