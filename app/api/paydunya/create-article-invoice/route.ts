import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const USE_MOCK = String(process.env.PAYDUNYA_USE_MOCK || 'false') === 'true';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { articleId, amount, currency = 'XOF', customerEmail = '', customerName = '' } = body || {};
    if (!articleId || !amount) return new NextResponse('Missing articleId or amount', { status: 400 });

    const orderId = `BAJ-ART-${articleId}-${Date.now()}`;
    const uuid = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const tx = await prisma.transaction.create({
      data: {
        uuid,
        orderId,
        amount: Number(amount),
        paymentMethod: 'paydunya',
        status: 'pending',
        description: `Publication fee for article ${articleId}`,
        customerEmail,
        bookIds: '',
        rawPayload: JSON.stringify({ articleId, currency, customerEmail, customerName }),
      },
    });

    if (USE_MOCK) {
      return NextResponse.json({ orderId, redirectUrl: `/payment-sandbox?orderId=${orderId}`, transactionId: tx.id });
    }

    // TODO: Integrate live PayDunya invoice creation
    // Placeholder response for now
    return NextResponse.json({ orderId, redirectUrl: `/payment-paydunya?orderId=${orderId}`, transactionId: tx.id });
  } catch (err: any) {
    console.error('Create article invoice error', err);
    return new NextResponse(err?.message || 'Server error', { status: 500 });
  }
}
