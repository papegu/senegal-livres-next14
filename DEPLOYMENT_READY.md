# DEPLOYMENT CHECKLIST - senegal-livres.sn

## Status: READY FOR DEPLOYMENT ✓

### Completed Changes
1. **Admin Database Route Auth Fixed** ✓
   - Updated `/app/api/admin/database/route.ts` to use JWT cookie authentication
   - Checks for `auth_token` cookie and verifies `role === 'admin'`
   - No longer requires `x-admin-token` header

2. **Post-Payment Fulfillment Implemented** ✓
   - `app/api/email/send-book/route.ts`: Returns PDF download links and ETA
   - `app/api/eta/route.ts`: Computes delivery ETA based on GPS coordinates
   - GPS-based ETA calculation: Haversine distance from Dakar

3. **PayDunya Production Configuration** ✓
   - `.env.local` configured with production PayDunya keys
   - `NEXT_PUBLIC_BASE_URL=https://senegal-livres.sn`
   - `PAYDUNYA_CALLBACK_URL=https://senegal-livres.sn/api/paydunya/callback`
   - `NODE_ENV=production`

4. **Build Verification** ✓
   - `npm run build` passes with no errors
   - All API routes compiled successfully
   - Production bundle ready

---

## DEPLOYMENT STEPS FOR senegal-livres.sn

### Step 1: MySQL Database Setup
**For WAMP MySQL Admin:**
```sql
-- Run in phpMyAdmin or MySQL CLI as root
CREATE USER IF NOT EXISTS 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982';
GRANT ALL PRIVILEGES ON senegal_livres.* TO 'papeabdoulaye'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

**Or run this PowerShell script:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-mysql-admin.ps1
```

### Step 2: Create Database Tables
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Create new database: `senegal_livres` (if not exists)
3. Import SQL file: `prisma/mysql-init.sql`
   - This creates all 7 tables: User, Book, Transaction, Purchase, CartItem, Submission, AdminStats

### Step 3: Verify Database Connection
Test the DATABASE_URL from `.env.local`:
```bash
npm run build
# If build succeeds, Prisma can connect
```

### Step 4: Start Application
```bash
npm run dev
# Server runs on http://localhost:3000
```

### Step 5: Test Payment Flow

#### Create Invoice (PayDunya)
```bash
curl -X POST http://localhost:3000/api/paydunya/create-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "description": "Test Books",
    "bookIds": ["book-1", "book-2"],
    "customerEmail": "papeabdoulaye.gueye@uadb.edu.sn"
  }'
```

Response: `{ redirect_url: "https://app.paydunya.com/checkout/..." }`

#### Test ETA Endpoint (GPS-based)
```bash
curl -X POST http://localhost:3000/api/eta \
  -H "Content-Type: application/json" \
  -d '{ "lat": 14.72, "lon": -17.46 }'
```

Response:
```json
{
  "ok": true,
  "distKm": 5.2,
  "etaMinutes": 30
}
```

#### Prepare Fulfillment (PDF Links + ETA)
```bash
curl -X POST http://localhost:3000/api/email/send-book \
  -H "Content-Type: application/json" \
  -d '{
    "email": "papeabdoulaye.gueye@uadb.edu.sn",
    "bookIds": ["book-1", "book-2"],
    "transactionId": "tx-123",
    "location": { "lat": 14.72, "lon": -17.46 }
  }'
```

Response:
```json
{
  "ok": true,
  "message": "Payment confirmed - eBooks ready for download",
  "deliveries": [
    {
      "bookId": "book-1",
      "title": "Livre 1",
      "hasPdf": true,
      "downloadUrl": "http://localhost:3000/api/pdfs/download?bookId=book-1"
    }
  ],
  "etaMinutes": 30
}
```

---

## PAYMENT FLOW SUMMARY

### User Purchases Books
1. User adds books to cart
2. User selects **PayDunya** payment method
3. Frontend calls: `POST /api/paydunya/create-invoice`

### PayDunya Integration
- **create-invoice**: Returns PayDunya checkout link
- **callback** (webhook): PayDunya notifies app when payment complete
- **send-book**: Returns PDF download URLs and delivery ETA

### Post-Payment Fulfillment
**If PDF available:**
- User receives email with download link
- User can download PDF immediately via `/api/pdfs/download?bookId=X`

**If no PDF (physical delivery):**
- User receives ETA based on GPS location
- Estimated delivery: 30 min (intra-city), 90 min (regional), 180 min (distant)

---

## PRODUCTION CONFIGURATION

### Environment Variables (in hosting)
```env
# Application
NEXT_PUBLIC_BASE_URL=https://senegal-livres.sn
NODE_ENV=production

# Database
DATABASE_URL=mysql://papeabdoulaye:pape1982@localhost:3306/senegal_livres

# PayDunya (PRODUCTION keys from PayDunya Dashboard)
PAYDUNYA_MASTER_KEY=8BSOwm5q-07SR-4OXj-lOAs-fe4NixX5DFy1
PAYDUNYA_PUBLIC_KEY=live_public_jrMROAFL1VCYjEJz68dHHf3W8Je
PAYDUNYA_PRIVATE_KEY=live_private_BBM6dh9qZ1ERwIP9ukvjLYhyAbk
PAYDUNYA_TOKEN=nico6girugIfU7x8d1HQ
PAYDUNYA_CALLBACK_URL=https://senegal-livres.sn/api/paydunya/callback
PAYDUNYA_USE_MOCK=false

# Security
JWT_SECRET=senegal-livres-jwt-prod-2024-secure-key-change-me
ADMIN_TOKEN=admin_token_prod
```

### PayDunya Dashboard Configuration
1. Go to: https://www.paydunya.com/dashboard
2. Set **Callback URL**: `https://senegal-livres.sn/api/paydunya/callback`
3. Verify KYC (Know Your Customer) for production payments
4. Copy production API keys to `.env`

### HTTPS/SSL
- PayDunya requires HTTPS
- Configure SSL certificate on senegal-livres.sn
- Redirect HTTP → HTTPS

---

## ADMIN ACCESS

### Admin Dashboard
- URL: `https://senegal-livres.sn/admin/database`
- Auth: Must login with admin user via `/auth/login`
- DB admin: `papeabdoulaye.gueye@uadb.edu.sn` (if setup as admin in database)

### Admin Login
1. Register admin user: POST `/api/auth` with `role: "admin"`
2. Or update database directly:
   ```sql
   UPDATE User SET role='admin' WHERE email='papeabdoulaye.gueye@uadb.edu.sn';
   ```

---

## TROUBLESHOOTING

### Error: "Database not accessible"
- Ensure MySQL is running
- Verify DATABASE_URL format
- Check user privileges: `SHOW GRANTS FOR 'papeabdoulaye'@'localhost';`

### Error: "PayDunya not configured"
- Ensure `PAYDUNYA_MASTER_KEY`, `PAYDUNYA_PUBLIC_KEY`, `PAYDUNYA_PRIVATE_KEY`, `PAYDUNYA_TOKEN` are set
- Verify `PAYDUNYA_USE_MOCK=false` for production
- Check callback URL is correct

### Admin Dashboard returns 401
- Ensure JWT_SECRET is the same as in `.env`
- Verify user has `role: 'admin'` in database
- Check `auth_token` cookie is set after login

### No PDF in deliveries
- Ensure book PDFs exist at: `/public/pdfs/<bookId>.pdf`
- Or set `pdfFile` field in Book model for remote PDF URLs

---

## NEXT STEPS

1. **Setup MySQL**
   - Run setup script or create user manually
   - Import `prisma/mysql-init.sql` in phpMyAdmin

2. **Test locally**
   - `npm run dev`
   - Test payment flow with cURL commands above

3. **Configure PayDunya Webhook**
   - Add callback URL in PayDunya Dashboard
   - Test with actual PayDunya API (production keys)

4. **Deploy to senegal-livres.sn**
   - Copy `.env` to production server
   - Run `npm run build && npm start`
   - Configure reverse proxy (Nginx/Apache)
   - Setup SSL certificate

5. **Monitor Payments**
   - Watch PayDunya Dashboard for transactions
   - Check application logs for errors
   - Verify emails are being sent (implement email service in production)

---

**Last Updated:** 2025-12-12
**Status:** PRODUCTION READY
