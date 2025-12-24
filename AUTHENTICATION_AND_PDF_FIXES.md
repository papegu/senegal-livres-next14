# Authentication & PDF Management Fixes

This document describes the fixes implemented for authentication cookie issues and PDF management migration to Supabase.

## Part 1: Authentication Cookie Configuration

### Problem
The login authentication was not working correctly on Vercel because the `auth_token` cookie was set with `secure: true` always, which prevented it from working in development environments and potentially caused issues in certain production configurations.

### Solution
1. **Environment Detection Utility** (`/utils/environment.ts`):
   - Created helper functions to detect production vs development environments
   - `isProduction()`: Returns true if `NODE_ENV === 'production'`
   - `isDevelopment()`: Returns true if `NODE_ENV === 'development'`
   - `getBaseUrl()`: Returns the base URL from `NEXT_PUBLIC_BASE_URL` or defaults to localhost
   - `isVercel()`: Detects if running on Vercel platform

2. **Fixed Cookie Settings** (`/app/api/auth/route.ts`):
   - Changed `secure: true` to `secure: isProduction()`
   - This ensures cookies work in development (HTTP) and production (HTTPS)
   - Maintained `sameSite: "lax"` for CSRF protection while allowing top-level navigation
   - Kept `httpOnly: true` for security
   - Set `path: "/"` to ensure cookie is available across the entire site

3. **Logout Consistency** (`/app/api/auth/logout/route.ts`):
   - Updated logout to use the same cookie settings as login
   - Ensures cookies are properly cleared with matching attributes

### Required Environment Variables

#### Development (.env.local)
```env
NODE_ENV="development"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
JWT_SECRET="your_strong_secret_minimum_16_chars"
```

#### Production (Vercel)
```env
NODE_ENV="production"
NEXT_PUBLIC_BASE_URL="https://senegal-livres.sn"
JWT_SECRET="<strong-random-secret>"
```

**Important**: The `JWT_SECRET` must be at least 16 characters long. Generate a secure secret:
```bash
openssl rand -base64 32
```

## Part 2: PDF Management (Supabase Migration)

### Problem
The application was partially migrated to use Supabase for PDF storage, but several endpoints and frontend components were still using legacy `/public/pdfs/` paths. This created inconsistencies where:
- Database had `pdfFile` field with Supabase URLs
- API routes were looking for local files
- Frontend was using `/api/pdfs/download` but not leveraging Supabase URLs directly

### Solution

#### 1. API Routes Updated

**`/app/api/pdfs/download/route.ts`**:
- Now checks the `pdfFile` field from the database first
- If `pdfFile` is a full URL (Supabase), redirects to it directly
- Falls back to legacy local file system if no Supabase URL exists
- Provides better error messages and uses book title for filename

**`/app/api/email/send-book/route.ts`**:
- Uses `pdfFile` URL from database for delivery links
- Prioritizes Supabase URLs over legacy API endpoints
- Falls back to local file check only if no Supabase URL exists
- Constructs download URLs intelligently based on PDF location

#### 2. Frontend Components Updated

**`/app/purchases/page.tsx`**:
- Enhanced download handler to check if `pdfFile` is a Supabase URL
- If Supabase URL exists, downloads directly from there
- Falls back to API endpoint for legacy PDFs
- Provides better user experience with direct downloads

**`/app/books/page.tsx`**:
- Already had proper `pdfFile` checking logic
- No changes needed - validates PDF availability before cart add

**`/app/cart/page.tsx`**:
- Already displays PDF availability status correctly
- No changes needed - shows ✓ or ❌ based on `pdfFile` existence

#### 3. Upload Process

**`/app/api/books/upload-pdf/route.ts`** (already implemented):
- Uploads PDFs to Supabase storage
- Stores public URL in `pdfFile` database field
- Sets `pdfFileName` for reference

### Required Environment Variables

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
```

### Migration Path

The implementation supports a gradual migration:

1. **New PDFs**: Uploaded via admin interface → stored in Supabase → `pdfFile` field set
2. **Legacy PDFs**: Still work via fallback to `/public/pdfs/<id>.pdf`
3. **Hybrid State**: System works with both old and new PDFs simultaneously

### Testing Checklist

#### Authentication
- [ ] Login works in development (HTTP)
- [ ] Login works in production (HTTPS/Vercel)
- [ ] Cookie persists across page reloads
- [ ] Protected routes verify cookie correctly
- [ ] Logout clears cookie properly

#### PDF Management
- [ ] New PDF uploads go to Supabase
- [ ] PDFs with Supabase URLs download correctly
- [ ] Legacy PDFs (local files) still download
- [ ] Email delivery links use correct URLs
- [ ] Purchase page downloads work for both types
- [ ] Admin can see PDF status correctly

## Database Schema

The `book` table has the following PDF-related fields:

```prisma
model book {
  id          Int      @id @default(autoincrement())
  // ... other fields
  pdfFile     String   @default("")  // URL to Supabase storage or empty
  pdfFileName String   @default("")  // Original filename
  eBook       Boolean  @default(true)
  // ... other fields
}
```

## Notes

1. **Cookie Security**: In production, cookies are sent over HTTPS only. In development, they work over HTTP.

2. **Backward Compatibility**: The system maintains backward compatibility with PDFs stored in `/public/pdfs/`. This ensures no service interruption during migration.

3. **Direct Downloads**: For Supabase-hosted PDFs, users get direct download links, which is faster and doesn't consume server resources.

4. **Environment Variables**: Ensure all required environment variables are set in Vercel project settings for production deployment.

5. **JWT Secret**: Must be strong and consistent across deployments. Never commit it to version control.
