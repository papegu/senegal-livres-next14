# Authentication & Cookie Setup Guide

This document explains the authentication system and how to troubleshoot common issues.

## Authentication Overview

The application uses JWT (JSON Web Tokens) for authentication with HTTP-only cookies for secure session management.

### Key Components

1. **JWT Tokens**: Generated on login and stored in HTTP-only cookies
2. **Cookie-based Sessions**: `auth_token` cookie is set with `httpOnly`, `secure`, and `sameSite: 'lax'` flags
3. **API Authentication**: All authenticated API routes verify the JWT token from cookies

## Required Environment Variables

The following environment variables are **REQUIRED** for authentication to work:

### 1. JWT_SECRET
- **Purpose**: Secret key for signing and verifying JWT tokens
- **Required**: YES
- **Minimum Length**: 16 characters (32+ recommended for production)
- **Example**: `JWT_SECRET=your_strong_random_secret_here`
- **Generate**: `openssl rand -base64 32`

### 2. NEXT_PUBLIC_BASE_URL
- **Purpose**: Base URL for the application (used for callbacks, redirects, and CORS)
- **Required**: YES
- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`
- **Example**: `NEXT_PUBLIC_BASE_URL=http://localhost:3000`

### 3. SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY
- **Purpose**: For PDF storage and retrieval in Supabase Storage
- **Required**: YES (for PDF functionality)
- **Get from**: https://supabase.com/dashboard/project/_/settings/api
- **Example**: 
  ```
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
  ```

## Frontend Requirements

### Using `credentials: 'include'` in Fetch Calls

All fetch calls to authenticated API endpoints **MUST** include `credentials: 'include'` to send cookies:

```typescript
// ✅ CORRECT
const response = await fetch('/api/purchases', {
  credentials: 'include'
});

// ❌ WRONG (cookies won't be sent)
const response = await fetch('/api/purchases');
```

### Currently Implemented

The following pages already use `credentials: 'include'`:
- `/app/purchases/page.tsx` - User purchases
- `/app/admin/**/*.tsx` - All admin pages
- `/app/logout/page.tsx` - Logout functionality

### Pages That May Need Updates

Check these pages if you add new authenticated features:
- `/app/books/page.tsx` - Book catalog (if adding user-specific features)
- `/app/cart/page.tsx` - Shopping cart (already fetches cart with default settings)
- Any new pages that call authenticated APIs

## Troubleshooting

### Issue: "Unauthorized" errors after login

**Possible Causes:**
1. Missing `credentials: 'include'` in fetch calls
2. `JWT_SECRET` not set or changed between login and API call
3. Cookie not being set due to CORS issues

**Solutions:**
1. Add `credentials: 'include'` to all authenticated fetch calls
2. Verify `JWT_SECRET` is set and consistent in your `.env` file
3. Check browser DevTools → Application → Cookies to verify `auth_token` is set
4. Ensure `NEXT_PUBLIC_BASE_URL` matches your actual URL

### Issue: Cookie not being set in browser

**Possible Causes:**
1. HTTPS required in production (cookies with `secure: true` won't work on HTTP)
2. SameSite cookie restrictions
3. Browser blocking third-party cookies

**Solutions:**
1. In development: Use `http://localhost:3000` (localhost is exempt from secure requirement)
2. In production: Use HTTPS
3. Check browser console for cookie warnings
4. Disable third-party cookie blocking for localhost during development

### Issue: "Server configuration error: JWT secret missing"

**Cause:** `JWT_SECRET` environment variable is not set or is too short (< 16 characters)

**Solution:**
1. Set `JWT_SECRET` in your `.env` file
2. Ensure it's at least 16 characters long
3. Generate a strong secret: `openssl rand -base64 32`
4. Restart your development server after changing `.env`

### Issue: PDF downloads fail with 401/403 errors

**Possible Causes:**
1. User not logged in (no `auth_token` cookie)
2. User hasn't purchased the book
3. `credentials: 'include'` missing from download request

**Solutions:**
1. Ensure user is logged in before attempting download
2. Verify purchase exists in database
3. For Supabase URLs: PDFs are public-read, but API still checks purchase
4. For local PDFs: API requires authentication and purchase verification

### Issue: Supabase PDF upload fails

**Possible Causes:**
1. `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` not set
2. Supabase bucket 'pdfs' doesn't exist
3. Incorrect permissions on Supabase bucket

**Solutions:**
1. Verify Supabase environment variables are set correctly
2. Create 'pdfs' bucket in Supabase dashboard: Storage → New bucket
3. Set bucket permissions to allow public reads:
   - Go to Storage → pdfs → Policies
   - Create policy: `SELECT` operations, no restrictions (or restrict to authenticated users)
4. Ensure service role key has write permissions

## Testing Authentication

### 1. Test Login
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"test@example.com","password":"password"}' \
  -c cookies.txt
```

### 2. Test Authenticated Endpoint
```bash
curl http://localhost:3000/api/purchases \
  -b cookies.txt
```

### 3. Verify Cookie in Browser
1. Open DevTools (F12)
2. Go to Application → Cookies → http://localhost:3000
3. Look for `auth_token` cookie
4. Verify it has `HttpOnly` and `Secure` flags

## PDF Download Flow

### Using Supabase URLs (Recommended)
1. Book has `pdfFile` field with Supabase URL
2. Frontend downloads directly from Supabase URL (public-read)
3. No API authentication needed for download
4. Purchase verification happens before showing download link

### Using API Endpoint (Backward Compatibility)
1. Book has no `pdfFile` (old records)
2. Frontend calls `/api/pdfs/download?bookId=X` with `credentials: 'include'`
3. API verifies JWT token and purchase
4. API returns PDF from local storage or redirects to Supabase

### Email Links After Purchase
- Email contains direct Supabase URLs for PDFs when available
- For old records, email contains `/api/pdfs/download` links
- Users must be logged in to use API endpoint links

## Security Notes

1. **Never** commit `.env` files to version control
2. Use strong, random secrets for `JWT_SECRET` in production
3. Always use HTTPS in production
4. Cookies are HTTP-only to prevent XSS attacks
5. Cookies use `sameSite: 'lax'` to prevent CSRF attacks
6. Service role keys should never be exposed to the frontend
7. PDF downloads verify purchase before allowing access

## Additional Resources

- [Next.js Cookies Documentation](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
