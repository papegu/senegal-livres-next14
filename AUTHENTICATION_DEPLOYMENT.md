# Authentication & Deployment Guide for Vercel

This document explains the authentication implementation and deployment requirements for Senegal Livres on Vercel.

## Authentication System

### Overview

The application uses **JWT (JSON Web Token)** based authentication with **HTTP-only cookies** for secure session management.

### Components

1. **JWT Token Generation** (`/utils/jwt.ts`)
   - Uses `jose` library for JWT signing and verification
   - Tokens expire after 7 days
   - Includes user ID, email, and role in payload

2. **Cookie Storage**
   - Token stored in `auth_token` HTTP-only cookie
   - Settings for Vercel compatibility:
     - `httpOnly: true` - Prevents JavaScript access
     - `secure: true` - Works on HTTPS (and localhost with Next.js)
     - `sameSite: 'lax'` - Allows GET requests from external sites
     - `path: '/'` - Available across entire app
     - `maxAge: 7 days` - Auto-expiration

3. **Login Flow** (`/api/auth`)
   - Validates credentials against database
   - Generates JWT token
   - Sets HTTP-only cookie in response
   - Returns user info (id, role)

4. **Protected Routes**
   - All API routes verify `auth_token` cookie
   - Use `verifyJwt()` to decode and validate token
   - Check user role for admin-only endpoints

## Environment Variables Required

### Essential for Authentication

```bash
# JWT Secret - MUST be at least 16 characters, use strong random string in production
JWT_SECRET="your_secure_random_string_min_16_chars"

# Database Connection
DATABASE_URL="postgresql://user:pass@host:port/database"

# Optional: Direct database connection for migrations
DIRECT_URL="postgresql://user:pass@host:port/database"
```

### For PDF Storage (Optional but Recommended)

```bash
# Supabase Storage (see SUPABASE_SETUP.md)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

### For Admin Access

```bash
# Admin token for direct API access
ADMIN_TOKEN="your_admin_token_change_in_production"
```

### For Payment Processing

```bash
# PayDunya (if using)
PAYDUNYA_MASTER_KEY="..."
PAYDUNYA_PUBLIC_KEY="..."
PAYDUNYA_PRIVATE_KEY="..."
PAYDUNYA_TOKEN="..."
PAYDUNYA_CALLBACK_URL="https://your-domain.com/api/paydunya/callback"
```

## Vercel Deployment Checklist

### 1. Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

**Production Environment:**
- ✅ `JWT_SECRET` - Strong random string (min 16 chars)
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `DIRECT_URL` - Direct database connection
- ✅ `NEXT_PUBLIC_BASE_URL` - Your production domain (e.g., `https://senegal-livres.sn`)
- ✅ `SUPABASE_URL` - Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- ✅ `ADMIN_TOKEN` - Secure admin token

**Preview Environment (Optional):**
- Same variables but with staging/test credentials

### 2. Configure Build Settings

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

### 3. Domain Configuration

1. Add your custom domain in Vercel
2. Configure DNS records
3. Update `NEXT_PUBLIC_BASE_URL` to match your domain

### 4. Database Migration

Before first deployment:

```bash
# Run migrations locally or via Vercel CLI
npx prisma migrate deploy
```

Or set up automatic migrations in `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## Testing Authentication on Vercel

### 1. Test Login

```bash
curl -X POST https://your-domain.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"test@example.com","password":"password"}' \
  -c cookies.txt -v
```

Check response headers for `Set-Cookie: auth_token=...`

### 2. Test Protected Route

```bash
curl https://your-domain.com/api/auth/me \
  -b cookies.txt
```

Should return user information if authentication works.

### 3. Test Logout

```bash
curl https://your-domain.com/api/auth/logout \
  -b cookies.txt
```

## Common Issues & Solutions

### Issue: "Invalid token" on Vercel but works locally

**Causes:**
1. `JWT_SECRET` not set or different between environments
2. Cookie not being sent due to domain mismatch
3. HTTPS/secure cookie settings

**Solutions:**
1. ✅ Verify `JWT_SECRET` is set identically in Vercel
2. ✅ Check browser DevTools → Application → Cookies
3. ✅ Ensure domain doesn't have www/non-www mismatch
4. ✅ Check `sameSite` setting is `'lax'` not `'strict'`

### Issue: "auth_token cookie NOT present"

**Causes:**
1. Cookie not being set in login response
2. Browser blocking cookies (privacy settings)
3. Domain mismatch

**Solutions:**
1. ✅ Check network response headers in DevTools
2. ✅ Try in incognito/different browser
3. ✅ Verify no www redirect issues
4. ✅ Check middleware not interfering

### Issue: "Server configuration error: JWT secret missing"

**Cause:** `JWT_SECRET` environment variable not set

**Solution:**
1. Add `JWT_SECRET` in Vercel environment variables
2. Redeploy the application
3. Verify with: `curl https://your-domain.com/api/debug/env`

### Issue: PDFs not downloading

**Causes:**
1. Supabase not configured
2. PDF file doesn't exist
3. User doesn't have purchase record

**Solutions:**
1. ✅ Set Supabase env vars (see SUPABASE_SETUP.md)
2. ✅ Check `book.pdfFile` field in database
3. ✅ Verify purchase record exists for user
4. ✅ Check API logs for specific error

## Security Best Practices

### Production Checklist

- [ ] Strong `JWT_SECRET` (32+ random characters)
- [ ] Secure `ADMIN_TOKEN` (not same as JWT_SECRET)
- [ ] Database credentials stored only in Vercel env vars
- [ ] Supabase service role key kept secret
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Cookie httpOnly flag enabled ✅
- [ ] Cookie secure flag enabled ✅
- [ ] CORS properly configured
- [ ] Rate limiting on auth endpoints (recommended)
- [ ] Regular security audits

### JWT Security

✅ **Implemented:**
- HTTP-only cookies (prevents XSS)
- Short expiration (7 days)
- Secure flag for HTTPS
- Server-side verification on all protected routes

⚠️ **Consider Adding:**
- Refresh tokens for longer sessions
- Token rotation on sensitive actions
- IP address validation
- Rate limiting on login attempts

## Monitoring & Debugging

### Enable Detailed Logging

The application includes comprehensive logging:

**Authentication:**
```
[auth/login] Login successful for user: email@example.com Role: client
[JWT] WARNING: Using default JWT_SECRET
[/api/auth/me] auth_token cookie present/NOT present
```

**PDF Operations:**
```
[PDF Download] Redirecting to Supabase URL for book 123
[SendBook] Book 456 has Supabase URL
[Submit Book] Uploading to Supabase Storage...
```

### Check Logs in Vercel

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on your deployment
3. View "Functions" logs
4. Filter by specific API routes

### Test in Development

```bash
# Run locally with production-like settings
NODE_ENV=production npm run dev
```

## Performance Optimization

### Caching Strategy

API routes configured with:
```typescript
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
```

This ensures fresh data but may impact performance. Consider:
- Adding cache for static book listings
- Using ISR for book detail pages
- Implementing edge caching for public routes

### Database Connection

- Use connection pooling (Prisma with Supabase)
- Set appropriate connection limits
- Monitor query performance

## Support & Resources

- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Vercel Environment Variables:** https://vercel.com/docs/environment-variables
- **Prisma with Vercel:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **Supabase:** https://supabase.com/docs

## Quick Reference

### Generate Strong JWT Secret

```bash
# Linux/Mac
openssl rand -base64 32

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Test Environment Variables

```bash
# Check if variables are accessible
vercel env pull .env.local
cat .env.local | grep JWT_SECRET
```

### Emergency Reset

If authentication is completely broken:

1. Regenerate `JWT_SECRET`
2. All users will need to login again
3. Update in Vercel → Redeploy
4. Clear all sessions from database if needed
