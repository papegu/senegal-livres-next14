import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/AdminAuth';

export const dynamic = 'force-dynamic';

/**
 * GET - Liste tous les livres (public)
 */
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ books });
  } catch (error) {
    console.error('[Books GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crée un nouveau livre (admin)
 */
export async function POST(req: Request) {
  try {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const body = await req.json();
    const {
      title,
      author,
      description,
      price,
      coverImage,
      category,
      stock,
      eBook,
      source,
    } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description: description || '',
        price: parseInt(price) || 0,
        coverImage: coverImage || '',
        category: category || '',
        stock: parseInt(stock) || 0,
        eBook: eBook ?? true,
        source: source || 'admin',
        status: 'available',
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('[Books POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Met à jour un livre (admin)
 */
export async function PUT(req: Request) {
  try {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Convert numeric fields
    if (updateData.price !== undefined) updateData.price = parseInt(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);

    const book = await prisma.book.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(book);
  } catch (error: any) {
    console.error('[Books PUT] Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprime un livre (admin)
 */
export async function DELETE(req: Request) {
  try {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    const book = await prisma.book.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      message: 'Book deleted successfully',
      book,
    });
  } catch (error: any) {
    console.error('[Books DELETE] Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
