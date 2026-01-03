-- Safe bootstrap for missing tables in Supabase (PostgreSQL)
-- Creates tables if they don't already exist; does not drop existing data.
-- Apply via Supabase SQL editor or psql.

-- ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.article (
  id SERIAL PRIMARY KEY,
  uuid TEXT UNIQUE,
  authorId INTEGER NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  pdfUrl TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft', -- draft|published
  paymentStatus TEXT NOT NULL DEFAULT 'required', -- required|paid
  publishedAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ARTICLE SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.articlesubmission (
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
);

-- TRANSACTIONS TABLE
-- Quoted name to avoid keyword ambiguity
CREATE TABLE IF NOT EXISTS public."transaction" (
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
);

-- OPTIONAL: BASIC USER TABLE (if missing)
CREATE TABLE IF NOT EXISTS public."user" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OPTIONAL: ADMIN STATS TABLE (if missing)
CREATE TABLE IF NOT EXISTS public.adminstats (
  id SERIAL PRIMARY KEY,
  totalUsers INTEGER NOT NULL DEFAULT 0,
  totalBooks INTEGER NOT NULL DEFAULT 0,
  totalTransactions INTEGER NOT NULL DEFAULT 0,
  totalRevenue INTEGER NOT NULL DEFAULT 0,
  lastUpdated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES (created safely if not existing)
CREATE UNIQUE INDEX IF NOT EXISTS idx_article_uuid ON public.article (uuid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transaction_uuid ON public."transaction" (uuid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transaction_orderId ON public."transaction" (orderId);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON public."user" (email);
