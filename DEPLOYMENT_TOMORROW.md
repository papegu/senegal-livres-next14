# 🚀 DÉPLOIEMENT PRODUCTION - DEMAIN 12 DÉCEMBRE

## ⏰ TIMELINE

**22h (Activation domaine):** Domain becomes active  
**22h-23h:** Deploy application  
**23h-00h:** Configure PayDunya webhook  
**00h:** Application LIVE with payments!

---

## 📋 BEFORE 22H (TODAY - December 11)

- [x] Update .env.local with production keys
- [x] Update domaine to senegal-livres.sn
- [x] Set PAYDUNYA_USE_MOCK=false
- [x] Verify build: npm run build → SUCCESS
- [ ] Prepare server for deployment

---

## 🎯 AT 22H (TOMORROW - December 12)

### Step 1: Verify Domain Activation (5 min)

Test that domain is active:

```bash
# In terminal or browser:
https://senegal-livres.sn
# Should load your application
```

If not responding:
- Wait a few more minutes (DNS propagation)
- Clear browser cache
- Try from different browser

### Step 2: Deploy Application (10 min)

```bash
cd /path/to/senegal-livres-next14

# Build for production
npm run build

# Start production server
npm start
```

**Expected output:**
```
> senegal-livres-next14@1.0.0 start
> next start
▲ Next.js 14.x.x production server

> Local: http://localhost:3000
```

Server is now running on your host!

### Step 3: Verify Application Works (5 min)

Test key pages:

```
1. Home page:
   https://senegal-livres.sn/
   → Should load without errors

2. Books page:
   https://senegal-livres.sn/books
   → Should show book list

3. Checkout page:
   https://senegal-livres.sn/checkout
   → Should show "💳 PayDunya" option
```

### Step 4: Configure PayDunya Webhook (5 min)

**Go to PayDunya Dashboard:**
1. Login: https://www.paydunya.com/dashboard
2. Navigate: Settings → API Configuration
3. Find: "Callback URL" or "Webhook URL"
4. Enter this URL:

```
https://senegal-livres.sn/api/paydunya/callback
```

5. Click: Save / Update
6. Test webhook (if available)

**Important:**
- Use HTTPS (not HTTP)
- Use full domain: senegal-livres.sn
- Include /api/paydunya/callback path
- No trailing slash

---

## ✅ AFTER CONFIGURATION

### Test Payment Flow:

1. Open: https://senegal-livres.sn/checkout
2. Add a book to cart
3. Click: "💳 PayDunya"
4. Click: "Pay Now"
5. PayDunya payment form appears
6. Choose payment method: Wave / Orange / Card
7. Complete payment
8. Redirected to: "✅ Payment Successful"

---

## 📊 WHAT TO VERIFY

### In Application:

```
✅ Checkout page loads
✅ PayDunya option shows
✅ "Pay Now" button works
✅ Redirects to PayDunya correctly
✅ Payment form shows (Wave/Orange/Card)
✅ Success page appears after payment
```

### In PayDunya Dashboard:

```
✅ Transaction appears
✅ Payment status: "completed"
✅ Amount is correct
✅ Time is recent
```

### In Server Logs:

```
✅ No errors in npm start output
✅ [PayDunya] Creating invoice...
✅ [PayDunya Callback] Payment validated
```

### In Database:

Check `data/market.json`:
```json
{
  "transactions": [
    {
      "status": "validated",  ← Should be "validated"
      "paymentMethod": "paydunya",
      "amount": 5000
    }
  ]
}
```

---

## 🆘 IF SOMETHING GOES WRONG

### Domain not loading:

```
Error: Cannot connect to senegal-livres.sn
→ DNS not yet active, wait 5-10 more minutes
→ Try: ipconfig /flushdns (Windows)
→ Try: sudo dscacheutil -flushcache (Mac)
```

### Build fails:

```
Error: npm run build
→ Check: Node.js version (need v18+)
→ Check: npm install completed
→ Check: .env.local syntax is correct
```

### PayDunya not receiving payments:

```
Error: Payment created but webhook not called
→ Verify: Callback URL is correct in dashboard
→ Verify: Domain is accessible from internet
→ Verify: HTTPS is working
→ Check: PayDunya webhook logs
```

### Transaction not saved:

```
Error: Payment successful but no transaction
→ Check: data/market.json is writable
→ Check: Server logs for errors
→ Verify: Webhook URL responding
```

---

## 🔐 SECURITY REMINDERS

Before going live:

- [x] API keys in .env.local (not in code)
- [x] PAYDUNYA_USE_MOCK=false (production mode)
- [x] HTTPS enabled (senegal-livres.sn)
- [x] Callback URL updated in PayDunya
- [ ] Test with real payment
- [ ] Monitor logs for errors
- [ ] Check PayDunya dashboard regularly

---

## 📞 CONTACT INFO

**If you need help tomorrow:**

1. **PayDunya Issues:**
   - Email: support@paydunya.com
   - Dashboard: https://www.paydunya.com/dashboard

2. **Application Issues:**
   - Check: Server logs (npm start output)
   - Check: Browser console (F12)
   - Check: data/market.json content

3. **Domain Issues:**
   - Contact: Your domain registrar
   - Email: Support for your hosting

---

## 📈 MONITORING CHECKLIST

After deployment, monitor:

```
Every hour for first 24h:
  ☐ Check PayDunya dashboard for transactions
  ☐ Verify data/market.json updated
  ☐ Monitor server logs
  ☐ Test payment works

Daily:
  ☐ Review PayDunya transactions
  ☐ Check server performance
  ☐ Verify all payments received
```

---

## 🎉 DEPLOYMENT COMPLETE!

Once you see:

```
✅ Domain active at senegal-livres.sn
✅ Application running (npm start)
✅ PayDunya webhook configured
✅ Payment test successful
✅ Money received in email
```

**🎊 You're LIVE with real payments!**

Users can now:
- Add books to cart
- Pay with Wave Money
- Pay with Orange Money
- Pay with Visa Card
- Access purchased books immediately

---

**Good luck tomorrow! You've got this! 🚀**

---

**Key Files Updated:**
- ✅ .env.local (with production keys)
- ✅ Build verified (0 errors)
- ✅ Configuration ready

**Next Step:** Deploy at 22h tomorrow!
