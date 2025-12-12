import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/AdminAuth';

export const dynamic = 'force-dynamic';

/**
 * GET - Liste toutes les transactions (admin)
 */
export async function GET(req: Request) {
  try {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        purchases: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[Transactions GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crée une nouvelle transaction (utilisé par les routes de paiement)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderId,
      userId,
      amount,
      paymentMethod,
      description,
      customerEmail,
      bookIds,
    } = body;

    if (!orderId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'orderId, amount, and paymentMethod are required' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        orderId,
        userId: userId ? parseInt(userId) : null,
        amount: parseInt(amount),
        paymentMethod,
        status: 'pending',
        description: description || '',
        customerEmail: customerEmail || '',
        bookIds: bookIds ? JSON.stringify(bookIds) : '[]',
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error('[Transactions POST] Error:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Transaction with this orderId already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Met à jour une transaction (par paiements webhooks)
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { orderId, ...updateData } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.update({
      where: { orderId },
      data: updateData,
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('[Transactions PUT] Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
