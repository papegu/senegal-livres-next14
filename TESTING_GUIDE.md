# PDF Download & Supabase Integration - Testing Guide

## Changes Summary

This PR implements a comprehensive fix for PDF handling to prioritize Supabase Storage URLs while maintaining backward compatibility with local storage.

### Files Changed

1. **API Routes**
   - `/app/api/pdfs/download/route.ts` - Added Supabase URL redirect with local storage fallback
   - `/app/api/email/send-book/route.ts` - Updated to use Supabase URLs in email links
   - `/app/api/auth/route.ts` - Added documentation about JWT_SECRET requirement
   - `/app/api/books/route.ts` - Added `eBook` and `status` to response

2. **Frontend Pages**
   - `/app/purchases/page.tsx` - Direct download from Supabase URLs when available
   - `/app/cart/page.tsx` - Added `credentials: 'include'` to all fetch calls
   - `/app/books/page.tsx` - Added `credentials: 'include'` to cart operations

3. **Documentation**
   - `AUTHENTICATION_GUIDE.md` - Comprehensive authentication and troubleshooting guide
   - `.env.example` - Documented required environment variables
   - `.env.local.example` - Added Supabase configuration

## Testing Instructions

### Prerequisites

1. Set up environment variables in `.env`:
```env
# Required
JWT_SECRET=your_strong_secret_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=your_database_url

# For PDF functionality
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. Set up Supabase Storage:
   - Create a bucket named `pdfs`
   - Set bucket to public-read (or authenticated-read)
   - Upload some test PDFs

3. Install dependencies:
```bash
npm install
```

### Test Scenarios

#### 1. Test PDF Upload (Admin)

```bash
# Start the dev server
npm run dev

# Login as admin
# Navigate to /admin/books or /books
# For an eBook without PDF, click "Ajouter PDF"
# Upload a PDF file
# Verify pdfFile field is updated with Supabase URL in database
```

**Expected Result:**
- PDF uploads to Supabase Storage
- Book's `pdfFile` field contains Supabase URL (e.g., `https://xxx.supabase.co/storage/v1/object/public/pdfs/...`)
- Success message displayed
- "✓ PDF disponible" shown on book card

#### 2. Test PDF Download via Purchases Page

```bash
# Login as a user who has purchased books
# Navigate to /purchases
# Click "⬇️ Download PDF" on a purchased book
```

**Test Cases:**

A. **Book with Supabase URL (new behavior)**
   - Book has `pdfFile` field with Supabase URL
   - Expected: Opens PDF in new tab directly from Supabase
   - Network: Single request to Supabase, no API call to `/api/pdfs/download`

B. **Book without Supabase URL (backward compatibility)**
   - Book has empty `pdfFile` field but PDF exists in `public/pdfs/`
   - Expected: Downloads via `/api/pdfs/download` endpoint
   - Network: Request to `/api/pdfs/download?bookId=X` with cookie authentication

#### 3. Test Email API After Purchase

```bash
# Make a test purchase
# Check server logs for email delivery info
# Verify deliveries array in response
```

**Expected Result:**
- Books with `pdfFile` show `downloadUrl` pointing to Supabase URL
- Books without `pdfFile` but with local PDF show `downloadUrl` pointing to `/api/pdfs/download`
- Books with no PDF show `downloadUrl: null`

Example response:
```json
{
  "ok": true,
  "deliveries": [
    {
      "bookId": 1,
      "title": "Test Book",
      "hasPdf": true,
      "downloadUrl": "https://xxx.supabase.co/storage/v1/object/public/pdfs/1_xxx.pdf"
    }
  ]
}
```

#### 4. Test Authentication Cookie Flow

```bash
# Clear browser cookies
# Try to access /purchases directly
# Expected: Redirect to /auth/login

# Login with credentials
# Check DevTools > Application > Cookies
# Verify auth_token cookie exists with HttpOnly flag

# Navigate to /purchases
# Expected: Purchases load successfully
```

**Verify in Browser DevTools:**
- Cookie `auth_token` is present
- Cookie has `HttpOnly` flag ✓
- Cookie has `Secure` flag ✓
- Cookie has `SameSite=Lax` ✓

#### 5. Test Cart Operations with Authentication

```bash
# Clear cookies and go to /books
# Click "Add to Cart" on any book
# Expected: Redirect to /auth/login

# After login, try adding to cart again
# Expected: Success message "✓ [Book Title] added to cart"

# Navigate to /cart
# Expected: Cart items display correctly
# Remove an item
# Expected: Item removed successfully
```

#### 6. Test Admin Book Management

```bash
# Login as admin (role = 'admin' in database)
# Navigate to /admin/books
# Create a new book
# Upload a PDF for the book
# Edit the book details
# Verify book appears in /books catalog
```

### API Endpoint Tests

#### Test `/api/pdfs/download` with Supabase URL

```bash
# Create a test book with Supabase pdfFile URL
curl -X GET 'http://localhost:3000/api/pdfs/download?bookId=1' \
  -H 'Cookie: auth_token=YOUR_TOKEN' \
  -L

# Expected: 302 redirect to Supabase URL
```

#### Test `/api/pdfs/download` with Local Storage

```bash
# Create a test book without pdfFile, but with local PDF
curl -X GET 'http://localhost:3000/api/pdfs/download?bookId=2' \
  -H 'Cookie: auth_token=YOUR_TOKEN'

# Expected: PDF file returned directly
```

#### Test `/api/email/send-book`

```bash
curl -X POST 'http://localhost:3000/api/email/send-book' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "bookIds": [1, 2],
    "transactionId": "test123"
  }'

# Expected: Deliveries array with downloadUrl pointing to Supabase or API endpoint
```

### Troubleshooting

If tests fail, check:

1. **Environment Variables**
   - Verify `JWT_SECRET` is set and >= 16 characters
   - Verify `NEXT_PUBLIC_BASE_URL` matches your dev server
   - Verify Supabase credentials are correct

2. **Database**
   - Run `npx prisma generate` after schema changes
   - Verify book records have correct data

3. **Supabase Storage**
   - Verify bucket 'pdfs' exists
   - Verify bucket permissions allow public read
   - Verify service role key has write permissions

4. **Browser Issues**
   - Clear cookies and try again
   - Check browser console for errors
   - Check Network tab for failed requests
   - Verify cookies are being set (Application > Cookies)

See `AUTHENTICATION_GUIDE.md` for detailed troubleshooting steps.

## Migration Path

### For Existing Deployments

1. **Add Supabase Environment Variables**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

2. **Create Supabase Storage Bucket**
   - Name: `pdfs`
   - Public access: Yes (for public-read)

3. **Migrate Existing PDFs (Optional)**
   - Old books with local PDFs will continue to work
   - New uploads automatically go to Supabase
   - To migrate: Upload existing PDFs via admin interface

4. **No Database Migration Required**
   - `pdfFile` field already exists in schema
   - Empty `pdfFile` triggers fallback to local storage

### Backward Compatibility

- ✅ Books without `pdfFile` still download from local storage
- ✅ Old purchase records work without changes
- ✅ API endpoint `/api/pdfs/download` handles both cases
- ✅ Email API checks both Supabase and local storage

## Security Improvements

1. **Filename Sanitization**
   - Book titles sanitized before use in filenames
   - Prevents directory traversal attacks

2. **Authentication Enforcement**
   - All cart/purchase operations require `credentials: 'include'`
   - JWT validation on all protected endpoints
   - HTTP-only cookies prevent XSS attacks

3. **CodeQL Security Scan**
   - No vulnerabilities detected
   - All code paths validated

## Performance Impact

- **Positive**: Direct Supabase downloads reduce server load
- **Positive**: No file I/O on server for Supabase URLs
- **Neutral**: Backward compatibility maintains existing performance for old records
- **Minimal**: Additional database query in `/api/pdfs/download` to check `pdfFile`

## Next Steps

After testing and validation:

1. Deploy to staging/production
2. Update production environment variables
3. Set up Supabase Storage in production
4. Consider migrating existing PDFs to Supabase
5. Monitor server logs for any issues
6. Update user documentation if needed
