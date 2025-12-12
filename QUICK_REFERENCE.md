# SENEGAL LIVRES - QUICK REFERENCE CARD

## 🟢 PRODUCTION STATUS: READY TO DEPLOY

---

## 📱 PAYMENT FLOW

```
User → Cart → Checkout
         ↓
Select "💳 PayDunya"
         ↓
POST /api/paydunya/create-invoice
         ↓
Redirect to PayDunya Payment Page
         ↓
User Completes Payment
         ↓
PayDunya Webhook → POST /api/paydunya/callback
         ↓
POST /api/email/send-book (Fulfillment)
         ↓
If PDF exists: Return /api/pdfs/download?bookId=X
If No PDF: Return ETA (30-180 minutes) based on GPS
```

---

## 🔑 KEY ENDPOINTS

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/paydunya/create-invoice` | POST | Create payment invoice | None |
| `/api/paydunya/callback` | POST | Payment webhook | PayDunya |
| `/api/eta` | POST | Calculate delivery ETA | None |
| `/api/email/send-book` | POST | Prepare fulfillment | None |
| `/api/pdfs/download` | GET | Download purchased PDF | JWT |
| `/admin/database` | GET | Admin dashboard | JWT + admin |

---

## 🗂️ ENVIRONMENT VARIABLES

```env
NEXT_PUBLIC_BASE_URL=https://senegal-livres.sn
DATABASE_URL=mysql://papeabdoulaye:pape1982@localhost:3306/senegal_livres
PAYDUNYA_MASTER_KEY=8BSOwm5q-07SR-4OXj-lOAs-fe4NixX5DFy1
PAYDUNYA_PUBLIC_KEY=live_public_jrMROAFL1VCYjEJz68dHHf3W8Je
PAYDUNYA_PRIVATE_KEY=live_private_BBM6dh9qZ1ERwIP9ukvjLYhyAbk
PAYDUNYA_TOKEN=nico6girugIfU7x8d1HQ
PAYDUNYA_CALLBACK_URL=https://senegal-livres.sn/api/paydunya/callback
PAYDUNYA_USE_MOCK=false
NODE_ENV=production
```

---

## 📊 DATABASE ADMIN

| Field | Value |
|-------|-------|
| **MySQL User** | `papeabdoulaye` |
| **Password** | `pape1982` |
| **Database** | `senegal_livres` |
| **Email** | papeabdoulaye.gueye@uadb.edu.sn |
| **Role** | admin |

**Setup:**
```bash
powershell -ExecutionPolicy Bypass -File scripts/setup-mysql-admin.ps1
# Then import: prisma/mysql-init.sql in phpMyAdmin
```

---

## 🧪 TEST PAYMENT (Local)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Create invoice
curl -X POST http://localhost:3000/api/paydunya/create-invoice \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "bookIds": ["test"], "customerEmail": "test@example.com"}'
# Expect: redirect_url to PayDunya

# Simulate webhook
curl -X POST http://localhost:3000/api/paydunya/callback \
  -H "Content-Type: application/json" \
  -d '{
    "response_code": "00",
    "status": "completed",
    "token": "test-token",
    "orderId": "order-123"
  }'
# Expect: 200 OK
```

---

## 📦 DEPLOYMENT STEPS

1. **Setup Database**
   ```bash
   powershell -ExecutionPolicy Bypass -File scripts/setup-mysql-admin.ps1
   # Import prisma/mysql-init.sql in phpMyAdmin
   ```

2. **Build App**
   ```bash
   npm run build
   ```

3. **Configure PayDunya**
   - Dashboard: https://www.paydunya.com/dashboard
   - Set Callback URL: `https://senegal-livres.sn/api/paydunya/callback`
   - Verify KYC
   - Copy prod keys to `.env`

4. **Configure SSL**
   - Install certificate on senegal-livres.sn
   - Redirect HTTP → HTTPS

5. **Start Server**
   ```bash
   npm start
   # Or: pm2 start "npm start" --name "senegal-livres"
   ```

---

## 🎯 FEATURES IMPLEMENTED

✓ PayDunya payment integration (production-ready)
✓ PDF download for e-books
✓ GPS-based delivery ETA
✓ Admin dashboard (JWT auth)
✓ Post-payment fulfillment automation
✓ Webhook callback handler
✓ Mock payment fallback (dev mode)
✓ Email fulfillment preparation
✓ MySQL admin setup automation

---

## 🐛 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Database not accessible" | Run MySQL setup script; verify DATABASE_URL |
| "PayDunya not configured" | Check PAYDUNYA_* env vars are set and non-empty |
| Admin returns 401 | Ensure JWT_SECRET matches; user has role='admin' |
| No PDF download link | Ensure `/public/pdfs/<bookId>.pdf` exists |
| Webhook not called | Verify callback URL in PayDunya Dashboard |

---

## 📚 DOCUMENTATION

- `IMPLEMENTATION_COMPLETE.md` - Full technical summary
- `DEPLOYMENT_READY.md` - Step-by-step deployment guide
- `QUICK_START.md` - Development quick start
- `README_PAYDUNYA.md` - PayDunya integration details

---

## 🚀 READY TO DEPLOY

All components tested and production-ready for deployment to:

**Domain:** senegal-livres.sn  
**Protocol:** HTTPS (required by PayDunya)  
**Admin Email:** papeabdoulaye.gueye@uadb.edu.sn

---

**Last Updated:** December 12, 2025
