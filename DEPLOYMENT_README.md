# Vercel Build + Prisma Migrations

This project is built on Next.js 14 (App Router) and Prisma (MySQL). On Vercel, do NOT run migrations during the build. Instead, generate Prisma client at build time and run migrations before or after deploy via a job or locally.

## Scripts

- `npm run vercel-build`: Runs `prisma generate` then `next build` (safe for Vercel).
- `npm run prisma:generate`: Generates Prisma client.
- `npm run migrate:status`: Shows migration status for the target `DATABASE_URL`.
- `npm run migrate:deploy`: Applies pending migrations (production-safe; idempotent).
- `npm run db:push`: Pushes schema without migrations (use only for dev).

## Production Flow (Postgres on Neon recommended)

1. Set Vercel Environment Variables (Production):
   - `DATABASE_URL` (Neon Postgres connection with `sslmode=require`)
   - `JWT_SECRET`, `ADMIN_TOKEN`
   - Payment keys: `PAYDUNYA_*`, optional `STRIPE_*`, `WAVE_*`, `ORANGE_*`, `ECOBANK_*`

2. Prepare DB (once):
   - Create Neon project/database and a role with password.
   - Locally set `.env.production` with your `DATABASE_URL`.

3. Deploy migrations (run locally against production DB):

```bash
# Windows PowerShell
$env:DATABASE_URL = "postgresql://<user>:<pass>@<host>/senegal_livres?sslmode=require"
npm run migrate:status
npm run migrate:deploy
```

4. Trigger Vercel build/deploy:

```bash
npm run vercel-build
# Push your changes to the main branch, or trigger a redeploy in Vercel
```

## Notes

- Do NOT run `prisma migrate dev` in production.
- For Neon/Postgres, use `prisma migrate deploy` with committed migration files.
- Ensure all API routes export `runtime = "nodejs"` and use named handlers (`GET`, `POST`, etc.).
