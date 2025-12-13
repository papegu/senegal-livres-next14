# Build Check

This is a no-op file to trigger a redeploy on Vercel and confirm that environment variables and postinstall Prisma generation are working in Production.

Actions to verify:
- Prisma client generated during build (`postinstall`) ✅
- `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `NEXT_PUBLIC_BASE_URL` set in Production ✅
- API health returns `{ ok: true }` at `/api/health` ✅
