import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/fileDb';

export const dynamic = 'force-dynamic';

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
        const db = await readDB();
        
        // Trouver la transaction
        const transactionIndex = db.transactions?.findIndex(
          (t: any) => t.orderId === orderId || t.id === orderId
        ) ?? -1;

        console.log('[PayDunya Callback] Transaction search result:', {
          orderId,
          found: transactionIndex !== -1,
          index: transactionIndex,
          totalTransactions: db.transactions?.length || 0,
        });

        if (transactionIndex !== -1 && db.transactions && transactionIndex >= 0) {
          const transaction = db.transactions[transactionIndex];
          console.log('[PayDunya Callback] Found transaction:', transaction);

          // Mettre à jour le statut
          db.transactions[transactionIndex] = {
            ...transaction,
            status: paymentStatus,
            paydunyaInvoiceToken: invoiceToken || transaction.paydunyaInvoiceToken,
            paydunyaResponseCode: responseCode,
            paydunyaStatus: status,
            updatedAt: new Date().toISOString(),
            paymentConfirmedAt: isSuccess ? new Date().toISOString() : transaction.paymentConfirmedAt,
          };

          // Écrire la mise à jour
          await writeDB(db);
          console.log(`[PayDunya Callback] ✅ Transaction ${orderId} updated to status: ${paymentStatus}`);

          // Si paiement réussi, envoyer les livres électroniques par email
          if (isSuccess && transaction.bookIds && transaction.bookIds.length > 0) {
            try {
              // Chercher l'utilisateur pour récupérer son email
              const user = (db.users || []).find((u: any) => u.id === transaction.userId);
              
              if (user && user.email) {
                console.log('[PayDunya Callback] Sending eBooks to:', user.email);
                
                // Appeler l'endpoint d'envoi d'email
                const emailRes = await fetch(
                  `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-book`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: user.email,
                      bookIds: transaction.bookIds,
                      transactionId: transaction.id,
                      userEmail: user.email,
                    }),
                  }
                );

                const emailResult = await emailRes.json();
                console.log('[PayDunya Callback] Email sending result:', emailResult);
              }
            } catch (emailError) {
              console.error('[PayDunya Callback] Error sending eBooks:', emailError);
              // Continue anyway - paiement est validé même si email échoue
            }
          }
        } else {
          console.warn('[PayDunya Callback] ⚠️  Transaction not found with orderId:', orderId);
          console.log('[PayDunya Callback] Available transactions:', db.transactions?.map((t: any) => ({ id: t.id, orderId: t.orderId })));
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
    
    // Retourner OK à PayDunya
    console.log('[PayDunya Callback] Returning 200 OK to PayDunya');
    return new Response('OK', { status: 200 });
    
  } catch (error) {
    console.error('[PayDunya Callback] ❌ Error processing webhook:', error);
    // Toujours retourner OK pour éviter que PayDunya réessaie indéfiniment
    return new Response('OK', { status: 200 });
  }
}

// Endpoint GET pour tester
export async function GET(req: Request) {
  return NextResponse.json({
    message: 'PayDunya webhook endpoint is active',
    endpoint: '/api/paydunya/callback',
    method: 'POST',
    description: 'Webhook for receiving payment confirmations from PayDunya',
  });
}
