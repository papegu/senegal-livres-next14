import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isUrl(u: string) { try { new URL(u); return true; } catch { return false; } }

export async function GET() {
  const MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY || '';
  const PUBLIC_KEY = process.env.PAYDUNYA_PUBLIC_KEY || '';
  const PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY || '';
  const TOKEN = process.env.PAYDUNYA_TOKEN || '';
  const USE_MOCK = (process.env.PAYDUNYA_USE_MOCK || '').toLowerCase() === 'true';
  const PAYDUNYA_ENV = (process.env.PAYDUNYA_ENV || '').toLowerCase();
  const hasLiveKeys = (PUBLIC_KEY || '').startsWith('live_') || (PRIVATE_KEY || '').startsWith('live_');
  const IS_SANDBOX = PAYDUNYA_ENV
    ? PAYDUNYA_ENV === 'sandbox'
    : (!hasLiveKeys && process.env.NODE_ENV !== 'production');

  const callbackUrlEnv = process.env.PAYDUNYA_CALLBACK_URL || '';
  const derivedBaseFromCallback = (() => { try { return callbackUrlEnv ? new URL(callbackUrlEnv).origin : ''; } catch { return ''; } })();
  const BASE_URL = derivedBaseFromCallback || process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://senegal-livres.sn' : 'http://localhost:3000');
  const API_BASE = IS_SANDBOX ? 'https://sandbox.paydunya.com/api/v1' : 'https://app.paydunya.com/api/v1';

  const ok = (!!MASTER_KEY && !!PUBLIC_KEY && !!PRIVATE_KEY && !!TOKEN) || USE_MOCK;

  return NextResponse.json({
    ok,
    version: 'v1',
    env: {
      sandbox: IS_SANDBOX,
      nodeEnv: process.env.NODE_ENV,
      useMock: USE_MOCK,
      hasLiveKeys,
      paydunyaEnv: PAYDUNYA_ENV || null,
      baseUrl: BASE_URL,
      callbackUrl: callbackUrlEnv || null,
      apiBase: API_BASE,
    },
    endpoints: {
      diagnose: '/api/paydunya/diagnose',
      createInvoice: {
        get: '/api/paydunya/create-invoice',
        post: '/api/paydunya/create-invoice',
      },
      callback: '/api/paydunya/callback',
    },
    usage: {
      createInvoicePOSTExample: {
        amount: 5000,
        description: 'Test invoice',
        customerEmail: 'test@example.com'
      }
    }
  });
}
