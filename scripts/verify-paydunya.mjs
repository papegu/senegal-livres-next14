#!/usr/bin/env node
/**
 * PayDunya configuration and credential verifier
 * - Loads env vars (process + .env/.env.local), masks secrets in output
 * - Validates presence/format of URLs
 * - Attempts to create a minimal invoice against sandbox/production
 */

import fs from 'node:fs';
import path from 'node:path';

function mask(val) { if (!val) return ''; const s = String(val); return s.length <= 6 ? '***' : `${s.slice(0,3)}…${s.slice(-2)}`; }
function isUrl(u) { try { new URL(u); return true; } catch { return false; } }

function readEnvFile(file) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return {};
  const txt = fs.readFileSync(p, 'utf8');
  const out = {};
  for (const line of txt.split(/\r?\n/)) {
    if (!line || /^\s*#/.test(line)) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

function coalesceEnv() {
  const fromProcess = { ...process.env };
  const fromDotEnv = readEnvFile('.env');
  const fromDotEnvLocal = readEnvFile('.env.local');
  return { ...fromDotEnv, ...fromDotEnvLocal, ...fromProcess };
}

async function main() {
  const env = coalesceEnv();
  const MASTER_KEY = env.PAYDUNYA_MASTER_KEY || '';
  const PUBLIC_KEY = env.PAYDUNYA_PUBLIC_KEY || '';
  const PRIVATE_KEY = env.PAYDUNYA_PRIVATE_KEY || '';
  const TOKEN = env.PAYDUNYA_TOKEN || '';
  const USE_MOCK = (env.PAYDUNYA_USE_MOCK || '').toLowerCase() === 'true';
  const NODE_ENV = env.NODE_ENV || 'development';
  const BASE_URL = env.NEXT_PUBLIC_BASE_URL || (NODE_ENV === 'production' ? 'https://senegal-livres.sn' : 'http://localhost:3000');
  const API_BASE = NODE_ENV === 'production' ? 'https://app.paydunya.com/api/v1' : 'https://sandbox.paydunya.com/api/v1';

  const report = {
    ok: false,
    reason: '',
    inputs: {
      PAYDUNYA_MASTER_KEY: mask(MASTER_KEY),
      PAYDUNYA_PUBLIC_KEY: mask(PUBLIC_KEY),
      PAYDUNYA_PRIVATE_KEY: mask(PRIVATE_KEY),
      PAYDUNYA_TOKEN: mask(TOKEN),
      NEXT_PUBLIC_BASE_URL: BASE_URL,
      API_BASE: API_BASE,
      PAYDUNYA_USE_MOCK: USE_MOCK,
    },
    checks: {
      masterKeyPresent: !!MASTER_KEY,
      publicKeyPresent: !!PUBLIC_KEY,
      privateKeyPresent: !!PRIVATE_KEY,
      tokenPresent: !!TOKEN,
      baseUrlValid: isUrl(BASE_URL),
    },
    attempt: { status: 0, body: '', json: undefined, redirect: '' },
  };

  const prelimErrors = [];
  if (!USE_MOCK) {
    if (!report.checks.masterKeyPresent) prelimErrors.push('Missing PAYDUNYA_MASTER_KEY');
    if (!report.checks.publicKeyPresent) prelimErrors.push('Missing PAYDUNYA_PUBLIC_KEY');
    if (!report.checks.privateKeyPresent) prelimErrors.push('Missing PAYDUNYA_PRIVATE_KEY');
    if (!report.checks.tokenPresent) prelimErrors.push('Missing PAYDUNYA_TOKEN');
  }
  if (!report.checks.baseUrlValid) prelimErrors.push('Invalid NEXT_PUBLIC_BASE_URL');

  if (prelimErrors.length) {
    report.reason = prelimErrors.join('; ');
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }

  if (USE_MOCK) {
    report.ok = true;
    report.reason = 'Mock mode enabled';
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 0;
    return;
  }

  const payload = {
    invoice: {
      items: [ { name: 'Test Sénégal Livres', quantity: 1, unit_price: 1000, total_price: 1000 } ],
      total_amount: 1000,
      description: 'Verification PayDunya'
    },
    store: {
      name: 'Sénégal Livres',
      website_url: BASE_URL
    },
    actions: {
      callback_url: `${BASE_URL}/api/paydunya/callback`,
      cancel_url: `${BASE_URL}/payment-cancel`,
      return_url: `${BASE_URL}/payment-success?orderId=TEST-${Date.now()}`
    },
    custom_data: { orderId: `TEST-${Date.now()}` }
  };

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'PAYDUNYA-MASTER-KEY': MASTER_KEY,
    'PAYDUNYA-PRIVATE-KEY': PRIVATE_KEY,
    'PAYDUNYA-PUBLIC-KEY': PUBLIC_KEY,
    'PAYDUNYA-TOKEN': TOKEN,
  };

  let res;
  try {
    res = await fetch(`${API_BASE}/checkout-invoice/create`, { method: 'POST', headers, body: JSON.stringify(payload) });
  } catch (e) {
    report.reason = e?.message || 'fetch failed';
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch {}
  const redirect = json?.response_text || json?.invoice_url || json?.url || '';
  report.attempt = { status: res.status, body: text, json, redirect };
  report.ok = !!redirect || json?.response_code === '00';
  if (!report.ok) report.reason = text || `HTTP ${res.status}`;

  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.ok ? 0 : 1;
}

main().catch((e) => { console.error(JSON.stringify({ ok: false, reason: e?.message || 'Unhandled error' }, null, 2)); process.exitCode = 1; });
