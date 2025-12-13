# Vercel Environment Setup

## Required Environment Variables

- DATABASE_URL: Supabase pooler (port 6543) with `?pgbouncer=true&sslmode=require`
- DIRECT_URL: Supabase direct (port 5432) with `?sslmode=require`
- NEXT_PUBLIC_BASE_URL: `https://senegal-livres.sn`
- JWT_SECRET: Strong random string used by JWT utils
- STRIPE_SECRET_KEY: If payments enabled
- PAYDUNYA_*: If PayDunya flows are enabled

## Cookie & Runtime
- Production cookies are `httpOnly`, `Secure`, `SameSite=Lax`, `Domain=senegal-livres.sn`.
- All App Router API routes should export `runtime = "nodejs"`.

## Deployment Notes
- Prisma client is generated via `postinstall`.
- Do not run `prisma db push` on Vercel; schema is managed in Supabase via SQL.
- Validate deployment with `GET /api/health` (expects `{ ok: true, db: "connected" }`).

## Troubleshooting
- 401 on `/api/auth/me`: Check that auth cookie is set (Secure, proper domain) over HTTPS.
- 500 on `/api/auth`: Verify env vars are present and Prisma client generated.
- If migration needed: apply changes via `supabase_init.sql` locally in Supabase.
