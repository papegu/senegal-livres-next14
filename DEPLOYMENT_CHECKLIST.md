# DEPLOYMENT CHECKLIST - Senegal Livres PayDunya

## BEFORE DEPLOYMENT (Day-1)
- [ ] Code Review - All changes validated
- [x] Build Test - npm run build SUCCESS
- [x] Unit Tests - All endpoints tested
- [x] Full Flow - E2E test passed

## PREPARE PRODUCTION SERVER (Day-1 evening)
- [ ] Domain - https://www.senegallivres.sn configured
- [ ] Hosting - Server ready and connected
- [ ] Node.js - LTS version installed
- [ ] Database - data/market.json accessible

## PAYDUNYA CONFIGURATION (Day-1 evening)
- [ ] KYC Validation - Documents submitted and approved
- [ ] Production Keys - MASTER_KEY obtained
- [ ] Production Keys - PUBLIC_KEY obtained
- [ ] Production Keys - PRIVATE_KEY obtained
- [ ] Production Keys - TOKEN obtained
- [ ] Callback URL - https://senegallivres.sn/api/paydunya/callback configured

## DEPLOYMENT DAY (Morning)
- [ ] Backup - .env.local backed up
- [ ] .env.local - PAYDUNYA_MASTER_KEY = production key
- [ ] .env.local - PAYDUNYA_PUBLIC_KEY = production key
- [ ] .env.local - PAYDUNYA_PRIVATE_KEY = production key
- [ ] .env.local - PAYDUNYA_TOKEN = production token
- [ ] .env.local - PAYDUNYA_USE_MOCK = false
- [ ] .env.local - NEXT_PUBLIC_BASE_URL = https://www.senegallivres.sn
- [ ] Build - npm run build → SUCCESS
- [ ] Start - npm start → Server running

## POST-DEPLOYMENT TESTS
- [ ] Health Check - GET https://www.senegallivres.sn → 200 OK
- [ ] Auth Test - Login/Register working
- [ ] Cart Test - Add book to cart
- [ ] Checkout Test - Checkout page displays
- [ ] PayDunya Test - Select PayDunya → Pay Now button
- [ ] Payment Test - Click Pay Now → Redirect to PayDunya
- [ ] Wave Test - Test with Wave Money
- [ ] Orange Test - Test with Orange Money
- [ ] Card Test - Test with Visa Card
- [ ] Success Page - See 'Payment Successful' after payment
- [ ] DB Check - Transaction in data/market.json with status='validated'
- [ ] Books Access - User can download purchased books

## FINAL VERIFICATION
- [ ] Logs - No errors in server logs
- [ ] PayDunya Dashboard - Payment visible in transactions
- [ ] Performance - Pages load quickly (< 3s)
- [ ] Mobile - Test on mobile/tablet
- [ ] Errors - No error messages displayed

## DEPLOYMENT COMPLETE!
Congratulations! Your PayDunya payment system is now in PRODUCTION.
Users can purchase books with Wave, Orange Money, or Visa Card.

Support:
- PayDunya Support: support@paydunya.com
- PayDunya Docs: https://paydunya.com/docs
- Code Docs: See DEPLOYMENT.md and QUICK_START.md

Regular checks:
- Monitor server logs for errors
- Check PayDunya Dashboard for transactions
- Verify transactions in data/market.json
