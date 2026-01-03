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
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://senegal-livres.sn' : 'http://localhost:3000');
  const API_BASE = process.env.NODE_ENV === 'production' ? 'https://app.paydunya.com/api/v1' : 'https://sandbox.paydunya.com/api/v1';
  const USE_MOCK = (process.env.PAYDUNYA_USE_MOCK || '').toLowerCase() === 'true';

  const payload = {
    ok: (!!MASTER_KEY && !!PUBLIC_KEY && !!PRIVATE_KEY && !!TOKEN) || USE_MOCK,
    inputs: {
      PAYDUNYA_MASTER_KEY_PRESENT: !!MASTER_KEY,
      PAYDUNYA_PUBLIC_KEY_PRESENT: !!PUBLIC_KEY,
      PAYDUNYA_PRIVATE_KEY_PRESENT: !!PRIVATE_KEY,
      PAYDUNYA_TOKEN_PRESENT: !!TOKEN,
      NEXT_PUBLIC_BASE_URL_VALID: isUrl(BASE_URL),
      PAYDUNYA_USE_MOCK: USE_MOCK,
      API_BASE: API_BASE,
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
  };

  return NextResponse.json(payload, { status: payload.ok ? 200 : 400 });
}
