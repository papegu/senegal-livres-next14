# Sénégal Livres - Next.js 14 Bookstore

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
npm install @stripe/react-stripe-js @stripe/stripe-js bcryptjs uuid jose
```

### Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
WAVE_API_KEY=your_wave_key
ORANGE_API_KEY=your_orange_key
ECOBANK_API_KEY=your_ecobank_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your_secret
ADMIN_TOKEN=your_admin_token
NODE_ENV=development
```

### Run Development Server
```bash
npm run dev
```
Open http://localhost:3003 (or next available port)

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

Single JSON file (`data/market.json`) with:
- **books**: Catalog of available books
- **users**: Registered users with hashed passwords
- **transactions**: Payment transaction history

## Testing Payments (Sandbox Mode)

1. No API keys configured → Redirects to `/payment-sandbox`
2. Click "Simuler succès" to test success flow
3. Add real API keys to `.env.local` for production integration

## Stripe Test Card
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

## Production Deployment

1. Obtain real API keys from providers
2. Update `.env.local` with production credentials
3. Set `NODE_ENV=production`
4. Use HTTPS URLs
5. Deploy to Vercel or your server

```bash
npm run build
npm start
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Next.js uses next available port |
| Stripe error | Check `NEXT_PUBLIC_STRIPE_KEY` in `.env.local` |
| Payment API 500 | Verify credentials in `.env.local` |
| Auth token issues | Check `JWT_SECRET` and `ADMIN_TOKEN` |

## Support

For issues or questions, please refer to the documentation files or contact support.

---

**Built with ❤️ for Senegal's literary community**
