export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const numericId = Number(id);

    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { orderId: id },
          { uuid: id },
          Number.isNaN(numericId) ? undefined : { id: numericId },
        ].filter(Boolean) as any,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('[Transaction API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
