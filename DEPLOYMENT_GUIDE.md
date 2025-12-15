# Deployment Guide - Sénégal Livres

This guide explains how to deploy the Sénégal Livres application to production (Vercel) with proper configuration for authentication and PDF management.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Authentication Configuration](#authentication-configuration)
- [PDF Storage with Supabase](#pdf-storage-with-supabase)
- [Vercel Deployment Steps](#vercel-deployment-steps)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com) for PDF storage
3. **Database**: PostgreSQL database (Supabase recommended)
4. **Payment Provider Accounts**: PayDunya, Stripe (optional)

## Environment Variables

### Critical Variables (Required)

These environment variables **must** be set in production for the application to work:

#### 1. Database Configuration

```bash
# PostgreSQL connection (Supabase or other provider)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"
```

**Important**: Use the connection pooler URL for `DATABASE_URL` and direct connection for `DIRECT_URL` (for migrations).

#### 2. Security Configuration

```bash
# JWT Secret for authentication tokens
# Generate with: openssl rand -base64 32
JWT_SECRET="<your-generated-secret-min-32-chars>"

# Admin token for admin access
# Generate with: openssl rand -base64 32
ADMIN_TOKEN="<your-generated-admin-token>"
```

⚠️ **Critical**: Never use default or weak secrets in production! Generate strong random secrets using the command above.

#### 3. Application Configuration

```bash
# Your production domain
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"

# Environment
NODE_ENV="production"
```

#### 4. Supabase Storage (for PDF files)

```bash
# Supabase project URL
SUPABASE_URL="https://your-project-id.supabase.co"

# Service role key (from Supabase project settings)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

**Where to find these**:
1. Go to your Supabase project
2. Click on "Settings" → "API"
3. Copy "Project URL" for `SUPABASE_URL`
4. Copy "service_role" key for `SUPABASE_SERVICE_ROLE_KEY`

### Optional Variables (Payment Providers)

```bash
# PayDunya
PAYDUNYA_MASTER_KEY="your-key"
PAYDUNYA_PUBLIC_KEY="your-key"
PAYDUNYA_PRIVATE_KEY="your-key"
PAYDUNYA_TOKEN="your-token"
PAYDUNYA_CALLBACK_URL="https://your-domain.vercel.app/api/paydunya/callback"

# Stripe
NEXT_PUBLIC_STRIPE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."

# Wave, Orange Money, Ecobank (as needed)
```

## Authentication Configuration

### How Authentication Works

1. **Login Process**:
   - User submits credentials to `/api/auth` with `action: "login"`
   - Server validates credentials and generates JWT token
   - Token is signed using `JWT_SECRET`
   - Token is stored in HTTP-only cookie named `auth_token`

2. **Cookie Settings** (already configured in code):
   ```javascript
   {
     httpOnly: true,      // Prevents XSS attacks
     secure: true,        // HTTPS only (required for production)
     sameSite: 'lax',     // CSRF protection
     maxAge: 604800,      // 7 days
     path: '/'            // Available across entire site
   }
   ```

3. **Token Verification**:
   - Protected routes read `auth_token` cookie
   - Token is verified using `JWT_SECRET`
   - User identity is extracted from token payload

### Common Authentication Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Login fails immediately | Missing or weak `JWT_SECRET` | Set strong `JWT_SECRET` (min 32 chars) |
| Login works but user logged out on refresh | Cookie not being sent | Verify `NEXT_PUBLIC_BASE_URL` matches actual domain |
| "Invalid token" errors | `JWT_SECRET` changed or mismatched | Ensure same secret across all instances |

## PDF Storage with Supabase

### Why Supabase?

- **Scalability**: No file size limits on Vercel
- **CDN**: Fast global delivery
- **Reliability**: Dedicated storage infrastructure
- **Flexibility**: Easy to migrate from local storage

### Setup Supabase Storage

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for provisioning to complete

2. **Create Storage Bucket**:
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('pdfs', 'pdfs', true);
   ```
   
   Or via Supabase Dashboard:
   - Go to "Storage"
   - Click "New bucket"
   - Name: `pdfs`
   - Public: ✓ (checked)
   - Create bucket

3. **Set Bucket Policies** (if needed):
   ```sql
   -- Allow public read access
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'pdfs');

   -- Allow authenticated writes (admin only, enforced in app)
   CREATE POLICY "Authenticated write access"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'pdfs');
   ```

4. **Configure CORS** (if needed):
   - Supabase Storage allows CORS by default
   - If issues, check Supabase Storage settings

### PDF Upload Flow

1. **Admin uploads PDF**:
   - Go to `/admin/books`
   - Select book and upload PDF
   - File is sent to `/api/books/upload-pdf`

2. **Server processes upload**:
   - Validates file (type, size)
   - Uploads to Supabase Storage bucket `pdfs`
   - Gets public URL from Supabase
   - Saves URL in `book.pdfFile` field

3. **User downloads PDF**:
   - User purchases book
   - Downloads via `/api/pdfs/download?bookId=X`
   - Server checks `book.pdfFile`:
     - If Supabase URL: redirects to Supabase
     - If local path: serves from `public/pdfs/` (fallback)

### Migration from Local PDFs

The application supports **both** local and Supabase PDFs:

- **New PDFs**: Upload via admin panel → saved to Supabase
- **Old PDFs**: Remain in `public/pdfs/` → still work (fallback)
- **Gradual migration**: Upload existing PDFs to Supabase over time

## Vercel Deployment Steps

### 1. Initial Setup

1. **Connect GitHub Repository**:
   ```bash
   # Push code to GitHub
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Click "Import"

### 2. Configure Environment Variables

In Vercel dashboard:

1. Go to "Settings" → "Environment Variables"
2. Add all required variables (see above)
3. Select environments: Production, Preview, Development
4. Click "Save"

**Important**: Add variables one by one or use Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add JWT_SECRET production
vercel env add NEXT_PUBLIC_BASE_URL production
vercel env add DATABASE_URL production
# ... etc
```

### 3. Configure Build Settings

Vercel auto-detects Next.js. Default settings should work:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy

1. Click "Deploy" in Vercel dashboard
2. Wait for build to complete
3. Check deployment logs for errors

### 5. Run Database Migrations

After first deployment:

```bash
# Using Vercel CLI
vercel env pull .env.production.local
npx prisma migrate deploy

# Or via Supabase SQL Editor
# Run migrations manually from prisma/migrations/
```

### 6. Verify Deployment

1. **Test Authentication**:
   - Visit `/auth/login`
   - Create account or login
   - Verify cookie is set (check browser DevTools)

2. **Test PDF Upload** (admin):
   - Login as admin
   - Go to `/admin/books`
   - Upload a PDF
   - Verify it appears in Supabase Storage

3. **Test PDF Download**:
   - Purchase a book (or create test purchase in DB)
   - Go to `/purchases`
   - Download PDF
   - Verify it downloads correctly

## Troubleshooting

### Build Failures

| Error | Solution |
|-------|----------|
| "DATABASE_URL is not defined" | Set in Vercel env vars or add `SKIP_ENV_VALIDATION=true` to build command |
| "Module not found" | Run `npm install` locally and commit `package-lock.json` |
| TypeScript errors | Fix errors locally with `npm run build` before deploying |

### Authentication Issues

| Issue | Solution |
|-------|----------|
| Login fails with 500 error | Check `JWT_SECRET` is set and at least 32 chars |
| Cookies not persisting | Verify `NEXT_PUBLIC_BASE_URL` matches deployment URL |
| CORS errors | Ensure requests are from same domain as `NEXT_PUBLIC_BASE_URL` |

### PDF Issues

| Issue | Solution |
|-------|----------|
| Upload fails | Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` |
| Download returns 404 | Verify `book.pdfFile` exists and is valid URL |
| "Access denied" error | User must have purchase record for that book |
| Supabase 403 error | Check bucket is public or policies allow access |

### Environment Variables

**Check if variables are set**:

```bash
# Via Vercel CLI
vercel env ls

# Or create test endpoint
# GET /api/debug/env (already exists in codebase)
```

**Redeploy after changing env vars**:
- Vercel doesn't auto-redeploy on env var changes
- Go to "Deployments" → click "..." → "Redeploy"

### Database Connection

**Error: "Can't reach database"**:
1. Check `DATABASE_URL` format
2. Verify database is accessible from Vercel
3. For Supabase: use connection pooler URL (port 5432)
4. For PlanetScale: use SSL mode in connection string

**Migration errors**:
1. Use `DIRECT_URL` for migrations (direct connection)
2. Run migrations separately: `npx prisma migrate deploy`
3. Check migration files in `prisma/migrations/`

## Production Checklist

Before going live:

- [ ] Strong `JWT_SECRET` and `ADMIN_TOKEN` set
- [ ] `NEXT_PUBLIC_BASE_URL` points to production domain
- [ ] Database configured with both `DATABASE_URL` and `DIRECT_URL`
- [ ] Supabase Storage bucket `pdfs` created and public
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Test user registration and login
- [ ] Test admin access
- [ ] Test PDF upload (admin)
- [ ] Test PDF download (user)
- [ ] Payment providers configured (if needed)
- [ ] Domain configured in Vercel
- [ ] SSL certificate active

## Support

For issues:
1. Check Vercel deployment logs
2. Check browser console for client errors
3. Review this guide's troubleshooting section
4. Verify all environment variables are set correctly

---

**Last Updated**: December 2024
