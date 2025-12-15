# Sénégal Livres - Next.js 14 Bookstore
Deployment note: Triggered redeploy on Vercel (Dec 14, 2025). This commit is a no-op to force a fresh build and help validate environment alignment and the updated health diagnostics.

A modern e-commerce platform for Senegalese books with integrated payment processing via Wave, Orange Money, and Ecobank card payments.

## Features

✅ **Book Catalog** - Browse and manage books with cover images
✅ **User Authentication** - Register and login with JWT tokens
✅ **Multi-Method Payment Processing**:
   - Wave (mobile money)
   - Orange Money (mobile money)
   - Ecobank Card (secure Stripe tokenization)
✅ **Admin Dashboard** - Manage books, transactions, and users
✅ **Transaction Management** - Track all payment transactions
✅ **Responsive Design** - Tailwind CSS styling

## Quick Start

### Installation
```bash
npm install
```

### Environment Setup

#### Development Environment
Create `.env.local`:
```env
# Database (choose one)
DATABASE_URL="postgresql://user:password@localhost:5432/senegal_livres"
# or MySQL: DATABASE_URL="mysql://root:password@localhost:3306/senegal_livres"

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# Security (CRITICAL - Generate strong secrets for production)
JWT_SECRET=your_jwt_secret_min_32_characters_recommended
ADMIN_TOKEN=your_admin_token_change_in_production

# Supabase (for PDF storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment providers (optional for development)
PAYDUNYA_MASTER_KEY=your_key
PAYDUNYA_PUBLIC_KEY=your_key
PAYDUNYA_PRIVATE_KEY=your_key
PAYDUNYA_TOKEN=your_token
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_key
```

#### Production Environment (Vercel)

**Required Environment Variables:**

1. **Database** (PostgreSQL recommended for Vercel):
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db
   DIRECT_URL=postgresql://user:pass@host:5432/db  # For migrations
   ```

2. **Security** (CRITICAL):
   ```
   JWT_SECRET=<generate-with-openssl-rand-base64-32>
   ADMIN_TOKEN=<generate-with-openssl-rand-base64-32>
   ```
   ⚠️ **Important**: Use strong, randomly generated secrets in production!

3. **Application**:
   ```
   NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
   NODE_ENV=production
   ```

4. **Supabase Storage** (for PDF files):
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<from-supabase-settings>
   ```

5. **Payment Providers** (as needed):
   - PayDunya, Stripe, Wave, Orange Money, Ecobank

See `.env.example` for complete list of environment variables.

### Run Development Server
```bash
npm run dev
```
Open http://localhost:3000 (or next available port)

## Usage

### 🛒 Browse Books
- Navigate to http://localhost:3003/books
- Click "Acheter" to proceed to checkout

### 💳 Make a Payment
1. **Wave**: Enter phone number → Redirected to Wave checkout
2. **Orange Money**: Enter phone number → Redirected to Orange checkout
3. **Ecobank Card**: Enter card details → Secure tokenization via Stripe

### 👤 Authentication
- **Register**: http://localhost:3003/auth/register
- **Login**: http://localhost:3003/auth/login

### 🛡️ Admin Panel
- Access: http://localhost:3003/admin
- Manage books, transactions, and users

## Tech Stack

- Next.js 14.2.33
- React 18
- TypeScript
- Tailwind CSS
- Stripe.js (secure payments)
- bcryptjs (password hashing)
- JWT (authentication)
- File-based database (data/market.json)

## Payment APIs

### Wave
```bash
POST /api/payments/wave
{
  "amount": 5000,
  "bookId": "1",
  "phone": "77xxxxxxxx"
}
```

### Orange Money
```bash
POST /api/payments/orange
{
  "amount": 5000,
  "bookId": "1",
  "phone": "77xxxxxxxx"
}
```

### Ecobank Card
```bash
POST /api/payments/ecobank
{
  "amount": 5000,
  "bookId": "1",
  "cardToken": "stripe-token"
}
```

## Project Structure

```
app/
├── api/
│   ├── auth/route.ts
│   ├── books/route.tsx
│   ├── payments/
│   │   ├── wave/route.ts
│   │   ├── orange/route.ts
│   │   ├── ecobank/route.ts
│   │   └── webhook/route.ts
│   ├── transactions/route.tsx
│   └── users/route.tsx
├── auth/
│   ├── login/page.tsx
│   └── register/page.tsx
├── books/
│   ├── page.tsx
│   └── [id]/page.tsx
├── admin/
│   ├── page.tsx
│   ├── books/page.tsx
│   ├── transactions/page.tsx
│   └── users/page.tsx
├── success/page.tsx
├── cancel/page.tsx
├── payment-sandbox/page.tsx
└── layout.tsx

components/
├── Header.tsx
├── Footer.tsx
├── BookCard.tsx
├── StripeProvider.tsx
└── StripeCardForm.tsx

utils/
├── fileDb.ts
├── jwt.ts
├── paytech.ts
├── AdminAuth.ts

data/
└── market.json
```

## Database

The application uses **PostgreSQL** (via Supabase or other providers) with Prisma ORM:
- **books**: Catalog of available books with PDF references
- **users**: Registered users with hashed passwords
- **transactions**: Payment transaction history
- **purchases**: User purchases and download tracking
- **submissions**: User-submitted books for review

### Database Schema
Key fields in the `book` model:
- `pdfFile`: URL to PDF file (Supabase Storage or external URL)
- `pdfFileName`: Original filename of the PDF
- `eBook`: Boolean indicating if it's an electronic book
- `coverImage`: Book cover image URL

## PDF Management & Storage

### Supabase Storage Integration

The application uses **Supabase Storage** for managing PDF files:

1. **Upload Process** (Admin only):
   - Upload PDFs via `/api/books/upload-pdf`
   - Files are stored in Supabase Storage bucket `pdfs`
   - Public URL is saved in `book.pdfFile` field

2. **Download Process**:
   - Authenticated users download via `/api/pdfs/download?bookId=X`
   - Priority 1: Redirect to Supabase URL if available (`book.pdfFile`)
   - Priority 2: Fallback to local files in `public/pdfs/` (legacy support)

3. **Email Delivery**:
   - `/api/email/send-book` generates download links
   - Uses `book.pdfFile` field from database
   - Supports both Supabase URLs and local fallback

### Setup Supabase Storage

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a storage bucket named `pdfs`
3. Set bucket to **public** for direct downloads
4. Add environment variables:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Migration from Local PDFs

For existing books with local PDFs:
- Local files in `public/pdfs/` are still supported (fallback)
- Gradually migrate to Supabase by uploading PDFs via admin panel
- The download endpoint automatically handles both sources

## Testing Payments (Sandbox Mode)

1. No API keys configured → Redirects to `/payment-sandbox`
2. Click "Simuler succès" to test success flow
3. Add real API keys to `.env.local` for production integration

## Stripe Test Card
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

## Production Deployment

### Vercel Deployment Checklist

1. **Database Setup**:
   - Use Supabase PostgreSQL (recommended) or PlanetScale
   - Set `DATABASE_URL` and `DIRECT_URL` in Vercel environment variables

2. **Environment Variables** (Critical):
   - `JWT_SECRET` - Generate: `openssl rand -base64 32`
   - `ADMIN_TOKEN` - Generate: `openssl rand -base64 32`
   - `NEXT_PUBLIC_BASE_URL` - Your production domain
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   - Payment provider keys (PayDunya, Stripe, etc.)

3. **Supabase Storage**:
   - Create `pdfs` bucket in Supabase Storage
   - Set bucket to public
   - Configure CORS if needed

4. **Build & Deploy**:
   ```bash
   npm run build
   npm start
   ```

### Authentication Configuration

The application uses:
- **JWT tokens** for authentication (requires `JWT_SECRET`)
- **HTTP-only cookies** for token storage (`auth_token`)
- Cookie settings for production:
  - `httpOnly: true` - Prevents XSS attacks
  - `secure: true` - HTTPS only
  - `sameSite: 'lax'` - CSRF protection
  - `path: '/'` - Available across entire domain

**Important**: Ensure `JWT_SECRET` is at least 32 characters for security!

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Next.js uses next available port |
| Stripe error | Check `NEXT_PUBLIC_STRIPE_KEY` in `.env.local` |
| Payment API 500 | Verify credentials in `.env.local` |
| Auth token issues | Check `JWT_SECRET` (min 32 chars) and `ADMIN_TOKEN` |
| Login fails on Vercel | Verify `JWT_SECRET` and `NEXT_PUBLIC_BASE_URL` are set |
| PDF download fails | Check `SUPABASE_URL` and bucket permissions |
| "PDF not found" error | Verify `book.pdfFile` field or local file exists |

## Support

For issues or questions, please refer to the documentation files or contact support.

---

**Built with ❤️ for Senegal's literary community**
