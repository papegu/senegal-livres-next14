export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// CORS headers pour permettre PayDunya et le front (production)
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://senegal-livres.sn',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    // Lire le JSON envoyé par PayDunya
    const payload = await req.json();
    
    console.log('[PayDunya Callback] ✅ Webhook received:', JSON.stringify(payload, null, 2));
    
    // Extraire les données du webhook PayDunya
    const responseCode = payload.response_code || '';
    const status = payload.status || '';
    const invoiceToken = payload.invoice?.token || payload.token || '';
    const customData = payload.custom_data || payload.invoice?.custom_data || {};
    const orderId = customData.orderId || payload.orderId || '';

    console.log('[PayDunya Callback] Response Code:', responseCode);
    console.log('[PayDunya Callback] Status:', status);
    console.log('[PayDunya Callback] Invoice Token:', invoiceToken);
    console.log('[PayDunya Callback] Order ID:', orderId);

    // Déterminer le statut du paiement
    let paymentStatus = 'pending';
    let isSuccess = false;

    if (responseCode === '00' || status === 'completed') {
      paymentStatus = 'validated';
      isSuccess = true;
      console.log('[PayDunya Callback] ✅ Payment successful!');
    } else if (responseCode === '01' || status === 'failed' || status === 'cancelled') {
      paymentStatus = 'cancelled';
      console.log('[PayDunya Callback] ❌ Payment failed or cancelled');
    } else {
      console.log('[PayDunya Callback] ⏳ Payment pending or unknown status:', responseCode, status);
    }

    // Mettre à jour la transaction dans la base de données
    if (orderId) {
      try {
        const tx = await prisma.transaction.findFirst({
          where: { OR: [{ orderId }, { uuid: orderId }] },
        });

        if (tx) {
          const updated = await prisma.transaction.update({
            where: { id: tx.id },
            data: {
              status: paymentStatus,
              paydunyaInvoiceToken: invoiceToken || tx.paydunyaInvoiceToken,
              paydunyaResponseCode: responseCode,
              paydunyaStatus: status,
              paymentConfirmedAt: isSuccess ? new Date() : tx.paymentConfirmedAt,
            },
          });

          console.log(`[PayDunya Callback] ✅ Transaction ${orderId} updated to status: ${paymentStatus}`);

          if (isSuccess && updated.bookIds) {
            try {
              const parsedBookIds = (() => {
                try { return JSON.parse(updated.bookIds); } catch { return []; }
              })();
              const bookIdsArray = Array.isArray(parsedBookIds)
                ? parsedBookIds
                : typeof updated.bookIds === 'string'
                  ? updated.bookIds.split(',').map((v: string) => v.trim()).filter(Boolean)
                  : [];

              if (bookIdsArray.length > 0 && updated.userId) {
                const user = await prisma.user.findUnique({ where: { id: updated.userId } });

                if (user?.email) {
                  console.log('[PayDunya Callback] Sending eBooks to:', user.email);

                  const emailRes = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-book`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: user.email,
                        bookIds: bookIdsArray,
                        transactionId: updated.uuid || updated.id,
                        userEmail: user.email,
                      }),
                    }
                  );

                  const emailResult = await emailRes.json();
                  console.log('[PayDunya Callback] Email sending result:', emailResult);
                }
              }
            } catch (emailError) {
              console.error('[PayDunya Callback] Error sending eBooks:', emailError);
            }
          }
        } else {
          console.warn('[PayDunya Callback] ⚠️  Transaction not found with orderId:', orderId);
        }
      } catch (dbError) {
        console.error('[PayDunya Callback] Error updating database:', dbError);
      }
    } else {
      console.warn('[PayDunya Callback] ⚠️  No orderId in callback payload');
    }

    // Confirmer le paiement avec l'API PayDunya (uniquement si succès)
    if (isSuccess && invoiceToken) {
      try {
        const MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY;
        const PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY;
        const PUBLIC_KEY = process.env.PAYDUNYA_PUBLIC_KEY;
        const TOKEN = process.env.PAYDUNYA_TOKEN;
        const IS_SANDBOX = process.env.NODE_ENV !== 'production';

        const confirmHeaders = {
          'Content-Type': 'application/json',
          'PAYDUNYA-MASTER-KEY': MASTER_KEY || '',
          'PAYDUNYA-PRIVATE-KEY': PRIVATE_KEY || '',
          'PAYDUNYA-PUBLIC-KEY': PUBLIC_KEY || '',
          'PAYDUNYA-TOKEN': TOKEN || '',
        };

        const apiBaseUrl = IS_SANDBOX 
          ? 'https://sandbox.paydunya.com/api/v1'
          : 'https://app.paydunya.com/api/v1';

        console.log('[PayDunya Callback] Calling confirm endpoint:', `${apiBaseUrl}/checkout-invoice/confirm`);

        const confirmResponse = await fetch(
          `${apiBaseUrl}/checkout-invoice/confirm`,
          {
            method: 'POST',
            headers: confirmHeaders,
            body: JSON.stringify({ token: invoiceToken }),
          }
        );

        const confirmData = await confirmResponse.json();
        console.log('[PayDunya Callback] Confirmation API response:', JSON.stringify(confirmData, null, 2));
        
        if (confirmData.response_code === '00') {
          console.log('[PayDunya Callback] ✅ Payment confirmed with PayDunya API');
        } else {
          console.warn('[PayDunya Callback] ⚠️  Confirm API returned code:', confirmData.response_code);
        }
      } catch (confirmError) {
        console.error('[PayDunya Callback] Error calling confirm endpoint:', confirmError);
        // Continue anyway - payment is already marked as validated in local DB
      }
    }
    
    // Retourner OK à PayDunya avec CORS headers
    console.log('[PayDunya Callback] Returning 200 OK to PayDunya');
    return new Response('OK', { status: 200, headers: corsHeaders });
    
  } catch (error) {
    console.error('[PayDunya Callback] ❌ Error processing webhook:', error);
    // Toujours retourner OK pour éviter que PayDunya réessaie indéfiniment
    return new Response('OK', { status: 200, headers: corsHeaders });
  }
}

// Endpoint GET pour tester
export async function GET(req: Request) {
  return NextResponse.json({
    message: 'PayDunya webhook endpoint is active',
    endpoint: '/api/paydunya/callback',
    method: 'POST',
    description: 'Webhook for receiving payment confirmations from PayDunya',
  }, { headers: corsHeaders });
}
