export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuid } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, description, customerEmail, userId, bookIds } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Récupérer les clés PayDunya depuis l'environnement
    const MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY;
    const PUBLIC_KEY = process.env.PAYDUNYA_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY;
    const TOKEN = process.env.PAYDUNYA_TOKEN;
    const USE_MOCK = process.env.PAYDUNYA_USE_MOCK?.toLowerCase() === 'true';
    // Allow explicit env override; auto-detect production when using live_* keys
    const PAYDUNYA_ENV = (process.env.PAYDUNYA_ENV || '').toLowerCase();
    const hasLiveKeys = (PUBLIC_KEY || '').startsWith('live_') || (PRIVATE_KEY || '').startsWith('live_');
    const IS_SANDBOX = PAYDUNYA_ENV
      ? PAYDUNYA_ENV === 'sandbox'
      : (!hasLiveKeys && process.env.NODE_ENV !== 'production');

    console.log('[PayDunya] Environment Check:', {
      MASTER_KEY: !!MASTER_KEY,
      PUBLIC_KEY: !!PUBLIC_KEY,
      PRIVATE_KEY: !!PRIVATE_KEY,
      TOKEN: !!TOKEN,
      IS_SANDBOX,
      USE_MOCK,
      NODE_ENV: process.env.NODE_ENV,
    });

    // Si MOCK activé, autoriser sans clés pour tests locaux
    if (!USE_MOCK && (!MASTER_KEY || !PUBLIC_KEY || !PRIVATE_KEY || !TOKEN)) {
      console.error('[PayDunya] Missing API keys');
      return NextResponse.json({ error: 'PayDunya not configured' }, { status: 500 });
    }

    // Générer un orderId unique
    const orderId = uuid();
    const transactionId = uuid();

    // Créer la transaction dans la base de données (MySQL via Prisma)
    await prisma.transaction.create({
      data: {
        uuid: transactionId,
        orderId,
        userId: userId ? Number(userId) : null,
        bookIds: Array.isArray(bookIds) ? JSON.stringify(bookIds) : "",
        amount: Math.round(Number(amount)),
        paymentMethod: 'paydunya',
        status: 'pending',
      },
    });

    // Construire le payload PayDunya
    // Base URL de l'application (prod: https://www.senegal-livres.sn)
    const callbackUrlEnv = process.env.PAYDUNYA_CALLBACK_URL;
    // Prefer deriving base URL from callback origin if provided, to avoid localhost in prod
    const derivedBaseFromCallback = (() => {
      try {
        return callbackUrlEnv ? new URL(callbackUrlEnv).origin : null;
      } catch {
        return null;
      }
    })();
    const baseUrl = derivedBaseFromCallback
      || process.env.NEXT_PUBLIC_BASE_URL
      || (IS_SANDBOX ? 'http://localhost:3000' : 'https://senegal-livres.sn');
    const payload = {
      invoice: {
        items: [
          {
            name: description || 'Achat de livres',
            quantity: 1,
            unit_price: Math.round(Number(amount)),
            total_price: Math.round(Number(amount)),
          },
        ],
        total_amount: Math.round(Number(amount)),
        description: description || 'Paiement Sénégal Livres',
      },
      store: {
        name: 'Sénégal Livres',
        website_url: baseUrl,
      },
      actions: {
        callback_url: callbackUrlEnv && callbackUrlEnv.length > 0 ? callbackUrlEnv : `${baseUrl}/api/paydunya/callback`,
        cancel_url: `${baseUrl}/payment-cancel`,
        return_url: `${baseUrl}/payment-success?orderId=${orderId}`,
      },
      custom_data: {
        orderId,
        transactionId,
        customerEmail: customerEmail || null,
      },
    };

    // Headers pour l'API PayDunya
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // En MOCK, on évite d'envoyer des headers non définis
      'PAYDUNYA-MASTER-KEY': MASTER_KEY || '',
      'PAYDUNYA-PRIVATE-KEY': PRIVATE_KEY || '',
      'PAYDUNYA-PUBLIC-KEY': PUBLIC_KEY || '',
      'PAYDUNYA-TOKEN': TOKEN || '',
    };

    // Appel à l'API PayDunya pour créer la facture
    const apiBaseUrl = IS_SANDBOX 
      ? 'https://sandbox.paydunya.com/api/v1'
      : 'https://app.paydunya.com/api/v1';
    
    console.log(`[PayDunya] Using ${IS_SANDBOX ? 'SANDBOX' : 'PRODUCTION'} API at ${apiBaseUrl}`);
    console.log('[PayDunya] Creating invoice with payload:', JSON.stringify(payload, null, 2));

    // Mode MOCK pour développement local
    if (USE_MOCK) {
      console.log('[PayDunya] 📋 MOCK MODE - Redirecting to local payment page');
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const mockRedirectUrl = `${baseUrl}/payment-paydunya?token=${transactionId}&orderId=${orderId}&amount=${amount}`;
      
      console.log('[PayDunya] Mock redirect URL:', mockRedirectUrl);
      
      return NextResponse.json({
        success: true,
        redirect_url: mockRedirectUrl,
        invoice_token: transactionId,
        orderId,
        transactionId,
        mockMode: true,
      });
    }

    let response: Response;
    try {
      response = await fetch(`${apiBaseUrl}/checkout-invoice/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      // Network/DNS failures: fall back to mock if allowed
      const isNetworkError = err?.code === 'ENOTFOUND' || err?.cause?.code === 'ENOTFOUND' || /fetch failed/i.test(String(err));
      if (USE_MOCK || isNetworkError) {
        console.warn('[PayDunya] Network error, using MOCK fallback:', err?.message || err);
        const baseUrlMock = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const mockRedirectUrl = `${baseUrlMock}/payment-paydunya?token=${transactionId}&orderId=${orderId}&amount=${amount}`;
        return NextResponse.json({
          success: true,
          redirect_url: mockRedirectUrl,
          invoice_token: transactionId,
          orderId,
          transactionId,
          mockMode: true,
        });
      }
      throw err;
    }

    const data = await response.json();
    
    console.log('[PayDunya] API Response:', JSON.stringify(data, null, 2));

    // Gérer les erreurs de KYC
    if (data.response_code === '1001') {
      console.warn('[PayDunya] ⚠️  KYC validation required. Use PAYDUNYA_USE_MOCK=true in .env.local for testing.');
      return NextResponse.json(
        { 
          error: 'PayDunya account requires KYC validation. For development, set PAYDUNYA_USE_MOCK=true in .env.local',
          details: data,
        },
        { status: 403 }
      );
    }

    if (!response.ok || !data.response_code || data.response_code !== '00') {
      console.error('[PayDunya] Invoice creation failed:', { status: response.status, apiBaseUrl, data });
      return NextResponse.json(
        {
          error: 'Failed to create PayDunya invoice',
          status: response.status,
          api: apiBaseUrl,
          details: data,
          env: {
            sandbox: IS_SANDBOX,
            nodeEnv: process.env.NODE_ENV,
            hasLiveKeys,
            baseUrl,
          },
        },
        { status: 400 }
      );
    }

    // Extraire l'URL de redirection
    const redirectUrl = data.response_text || data.invoice_url || data.url || '';

    if (!redirectUrl) {
      console.error('[PayDunya] No redirect URL in response:', data);
      return NextResponse.json({ error: 'No redirect URL received from PayDunya' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      redirect_url: redirectUrl,
      invoice_token: data.token || null,
      orderId,
      transactionId,
    });

  } catch (error) {
    console.error('[PayDunya] Create invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY;
    const PUBLIC_KEY = process.env.PAYDUNYA_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY;
    const TOKEN = process.env.PAYDUNYA_TOKEN;
    const USE_MOCK = process.env.PAYDUNYA_USE_MOCK?.toLowerCase() === 'true';
    const PAYDUNYA_ENV = (process.env.PAYDUNYA_ENV || '').toLowerCase();
    const hasLiveKeys = (PUBLIC_KEY || '').startsWith('live_') || (PRIVATE_KEY || '').startsWith('live_');
    const IS_SANDBOX = PAYDUNYA_ENV
      ? PAYDUNYA_ENV === 'sandbox'
      : (!hasLiveKeys && process.env.NODE_ENV !== 'production');

    const callbackUrlEnv = process.env.PAYDUNYA_CALLBACK_URL;
    const derivedBaseFromCallback = (() => {
      try {
        return callbackUrlEnv ? new URL(callbackUrlEnv).origin : null;
      } catch {
        return null;
      }
    })();
    const baseUrl = derivedBaseFromCallback
      || process.env.NEXT_PUBLIC_BASE_URL
      || (IS_SANDBOX ? 'http://localhost:3000' : 'https://senegal-livres.sn');

    const apiBaseUrl = IS_SANDBOX
      ? 'https://sandbox.paydunya.com/api/v1'
      : 'https://app.paydunya.com/api/v1';

    return NextResponse.json({
      ok: true,
      api: apiBaseUrl,
      env: {
        sandbox: IS_SANDBOX,
        nodeEnv: process.env.NODE_ENV,
        useMock: USE_MOCK,
        hasLiveKeys,
        paydunyaEnv: PAYDUNYA_ENV || null,
        baseUrl,
        callbackUrl: callbackUrlEnv || null,
      },
      keys: {
        masterKeyPresent: !!MASTER_KEY,
        publicKeyPresent: !!PUBLIC_KEY,
        privateKeyPresent: !!PRIVATE_KEY,
        tokenPresent: !!TOKEN,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
