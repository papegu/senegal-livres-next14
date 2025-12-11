import { NextResponse } from 'next/server';
import { readDB } from '@/utils/fileDb';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const db = await readDB();
    
    // Chercher la transaction par orderId ou id
    const transaction = db.transactions?.find(
      (t: any) => t.orderId === id || t.id === id
    );

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('[Transaction API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
