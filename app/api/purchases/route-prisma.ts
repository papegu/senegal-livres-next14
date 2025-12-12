import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/utils/jwt';

export const dynamic = 'force-dynamic';

/**
 * GET - Liste les achats de l'utilisateur connecté
 */
export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyJWT(token);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = parseInt(payload.sub);

    const purchases = await prisma.purchase.findMany({
      where: { userId },
      include: {
        book: true,
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('[Purchases GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crée un nouvel achat (utilisé après paiement validé)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, bookId, transactionId, amount } = body;

    if (!userId || !bookId) {
      return NextResponse.json(
        { error: 'userId and bookId are required' },
        { status: 400 }
      );
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId: parseInt(userId),
        bookId: parseInt(bookId),
        transactionId: transactionId ? parseInt(transactionId) : null,
        amount: amount ? parseInt(amount) : 0,
      },
      include: {
        book: true,
      },
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error: any) {
    console.error('[Purchases POST] Error:', error);

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'User or book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Met à jour un achat (ex: mettre à jour downloadCount)
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    const purchase = await prisma.purchase.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(purchase);
  } catch (error: any) {
    console.error('[Purchases PUT] Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update purchase' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprime un achat (admin)
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    const purchase = await prisma.purchase.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      message: 'Purchase deleted successfully',
      purchase,
    });
  } catch (error: any) {
    console.error('[Purchases DELETE] Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete purchase' },
      { status: 500 }
    );
  }
}
