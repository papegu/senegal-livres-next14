#!/usr/bin/env node
/**
 * Inspect existing tables and create missing ones in Supabase Postgres.
 * - Reads .env/.env.local manually (no dotenv dependency)
 * - Connects via DATABASE_URL using pg
 * - Prints existing tables and creates missing tables using IF NOT EXISTS
 * - Adds safe indexes with IF NOT EXISTS
 *
 * Usage:
 *   node scripts/inspect-and-bootstrap-db.mjs         # list + create
 *   node scripts/inspect-and-bootstrap-db.mjs --list  # list only, no changes
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  const args = new Set(process.argv.slice(2));
  const LIST_ONLY = args.has('--list');
  const env = coalesceEnv();
  const DATABASE_URL = env.DATABASE_URL || env.DIRECT_URL || '';
  if (!DATABASE_URL) {
    console.error('DATABASE_URL missing in env (.env or process.env)');
    process.exitCode = 1;
    return;
  }

  let pg;
  try {
    pg = await import('pg');
  } catch (e) {
    console.error('Dependency "pg" not installed. Run: npm install pg');
    process.exitCode = 1;
    return;
  }

  const { Pool } = pg;
  const pool = new Pool({ connectionString: DATABASE_URL });

  const desired = {
    article: {
      create: `CREATE TABLE IF NOT EXISTS public.article (
        id SERIAL PRIMARY KEY,
        uuid TEXT UNIQUE,
        authorId INTEGER NOT NULL,
        title TEXT NOT NULL,
        abstract TEXT NOT NULL,
        pdfUrl TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'draft',
        paymentStatus TEXT NOT NULL DEFAULT 'required',
        publishedAt TIMESTAMPTZ,
        createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      indexes: [
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_article_uuid ON public.article (uuid)`
      ]
    },
    articlesubmission: {
      create: `CREATE TABLE IF NOT EXISTS public.articlesubmission (
        id SERIAL PRIMARY KEY,
        uuid TEXT UNIQUE,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        abstract TEXT NOT NULL,
        pdfUrl TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        reviewNotes TEXT NOT NULL DEFAULT '',
        submittedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewedAt TIMESTAMPTZ,
        createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      indexes: []
    },
    'transaction': {
      create: `CREATE TABLE IF NOT EXISTS public."transaction" (
        id SERIAL PRIMARY KEY,
        uuid TEXT UNIQUE,
        orderId TEXT UNIQUE,
        userId INTEGER,
        amount INTEGER NOT NULL,
        paymentMethod TEXT NOT NULL,
        status TEXT NOT NULL,
        paydunyaInvoiceToken TEXT NOT NULL DEFAULT '',
        paydunyaResponseCode TEXT NOT NULL DEFAULT '',
        paydunyaStatus TEXT NOT NULL DEFAULT '',
        providerTxId TEXT NOT NULL DEFAULT '',
        bookIds TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        customerEmail TEXT NOT NULL DEFAULT '',
        rawPayload TEXT NOT NULL DEFAULT '',
        paymentConfirmedAt TIMESTAMPTZ,
        createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      indexes: [
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_transaction_uuid ON public."transaction" (uuid)`
      ]
    },
    'user': {
      create: `CREATE TABLE IF NOT EXISTS public."user" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'client',
        blocked BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      indexes: [
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON public."user" (email)`
      ]
    },
    adminstats: {
      create: `CREATE TABLE IF NOT EXISTS public.adminstats (
        id SERIAL PRIMARY KEY,
        totalUsers INTEGER NOT NULL DEFAULT 0,
        totalBooks INTEGER NOT NULL DEFAULT 0,
        totalTransactions INTEGER NOT NULL DEFAULT 0,
        totalRevenue INTEGER NOT NULL DEFAULT 0,
        lastUpdated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      indexes: []
    },
    book: {
      create: `CREATE TABLE IF NOT EXISTS public.book (
        id SERIAL PRIMARY KEY,
        uuid TEXT UNIQUE,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        coverImage TEXT NOT NULL DEFAULT '',
        pdfFile TEXT NOT NULL DEFAULT '',
        pdfFileName TEXT NOT NULL DEFAULT '',
        stock INTEGER NOT NULL DEFAULT 0,
        category TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'available',
        eBook BOOLEAN NOT NULL DEFAULT TRUE,
        source TEXT NOT NULL DEFAULT 'admin',
        createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        slug TEXT UNIQUE,
        cover_image_url TEXT,
        pdf_r2_key TEXT,
        pdf_r2_url TEXT,
        has_ebook BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      indexes: [
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_book_uuid ON public.book (uuid)`
      ]
    },
    cartitem: {
      create: `CREATE TABLE IF NOT EXISTS public.cartitem (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL,
        bookId INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        addedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      indexes: [
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_cartitem_user_book ON public.cartitem ("userId","bookId")`
      ]
    },
    purchase: {
      create: `CREATE TABLE IF NOT EXISTS public.purchase (
        id SERIAL PRIMARY KEY,
        uuid TEXT UNIQUE,
        userId INTEGER NOT NULL,
        bookId INTEGER NOT NULL,
        transactionId INTEGER,
        amount INTEGER NOT NULL,
        downloadCount INTEGER NOT NULL DEFAULT 0,
        lastDownload TIMESTAMPTZ,
        createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      indexes: [
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_uuid ON public.purchase (uuid)`
      ]
    },
    submission: {
      create: `CREATE TABLE IF NOT EXISTS public.submission (
        id SERIAL PRIMARY KEY,
        uuid TEXT UNIQUE,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT NOT NULL,
        pdfFile TEXT NOT NULL DEFAULT '',
        pdfFileName TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        reviewNotes TEXT NOT NULL DEFAULT '',
        submittedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewedAt TIMESTAMPTZ,
        createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      indexes: []
    }
  };

  const report = { ok: false, existingTables: [], created: [], errors: [] };

  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('Failed to connect to database:', e?.message || e);
    process.exitCode = 1;
    return;
  }

  try {
    const res = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`
    );
    const existing = res.rows.map(r => r.table_name);
    report.existingTables = existing.slice().sort();

    if (LIST_ONLY) {
      report.ok = true;
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    for (const [name, spec] of Object.entries(desired)) {
      const exists = existing.includes(name);
      if (!exists) {
        try {
          await client.query(spec.create);
          report.created.push(name);
        } catch (e) {
          report.errors.push({ table: name, error: e?.message || String(e) });
          continue;
        }
      }
      // Apply indexes regardless; IF NOT EXISTS keeps it safe
      if (Array.isArray(spec.indexes)) {
        for (const idxSQL of spec.indexes) {
          try { await client.query(idxSQL); } catch (e) {
            report.errors.push({ table: name, index: idxSQL, error: e?.message || String(e) });
          }
        }
      }

      // Special-case: transaction.orderId column casing may vary in existing DB
      if (name === 'transaction') {
        try {
          const cols = await client.query(
            `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='transaction'`
          );
          const colNames = cols.rows.map(r => r.column_name);
          if (colNames.includes('orderId')) {
            try {
              await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_transaction_orderId ON public."transaction" ("orderId")`);
            } catch (e) {
              report.errors.push({ table: name, index: 'idx_transaction_orderId', error: e?.message || String(e) });
            }
          } else if (colNames.includes('orderid')) {
            try {
              await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_transaction_orderId ON public."transaction" (orderid)`);
            } catch (e) {
              report.errors.push({ table: name, index: 'idx_transaction_orderId', error: e?.message || String(e) });
            }
          } else {
            report.errors.push({ table: name, index: 'idx_transaction_orderId', error: 'orderId/orderid column not found' });
          }
        } catch (e) {
          report.errors.push({ table: name, index: 'idx_transaction_orderId', error: e?.message || String(e) });
        }
      }
    }

    report.ok = report.errors.length === 0;
    console.log(JSON.stringify(report, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(JSON.stringify({ ok: false, error: e?.message || 'Unhandled error' }, null, 2)); process.exitCode = 1; });
