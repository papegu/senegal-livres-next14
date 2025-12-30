export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { sendEmail, renderFailNotification } from '@/lib/email';

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_BASE_URL || 'https://senegal-livres.sn',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { transactionRef, bookTitle, customerPhone, timestampIso } = await req.json();

    const html = renderFailNotification({
      transactionRef: String(transactionRef || ''),
      bookTitle: bookTitle ? String(bookTitle) : undefined,
      customerPhone: customerPhone ? String(customerPhone) : undefined,
      timestampIso: String(timestampIso || new Date().toISOString()),
    });

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@senegal-livres.sn';
    await sendEmail(ADMIN_EMAIL, 'PayDunya - Échec de paiement', html);

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (err) {
    console.error('[NotifyPaymentFail] Error:', err);
    return NextResponse.json({ ok: false }, { status: 500, headers: corsHeaders });
  }
}
