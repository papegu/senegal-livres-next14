# Quick Start Guide - Deployment to Vercel

This is a quick reference for deploying Senegal Livres to Vercel with all fixes applied.

## ✅ What's Been Fixed

1. **Authentication** - JWT + HTTP-only cookies work correctly on Vercel
2. **PDF Storage** - Prioritizes Supabase Storage with local fallback
3. **PDF Downloads** - Smart priority system for serving PDFs
4. **Security** - Filename sanitization, proper status codes, JWT validation

## 🚀 Quick Deployment Steps

### 1. Prepare Environment Variables

Copy these to Vercel Environment Variables:

```bash
# Required - Database
DATABASE_URL="postgresql://user:pass@host:port/database"
DIRECT_URL="postgresql://user:pass@host:port/database"

# Required - Security (MUST change from defaults!)
JWT_SECRET="GENERATE_STRONG_32+_CHARACTER_SECRET"
ADMIN_TOKEN="your_secure_admin_token"

# Required - Application
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
NODE_ENV="production"

# Optional but Recommended - Supabase Storage
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Optional - Payment (if using PayDunya)
PAYDUNYA_MASTER_KEY="..."
PAYDUNYA_PUBLIC_KEY="..."
PAYDUNYA_PRIVATE_KEY="..."
PAYDUNYA_TOKEN="..."
PAYDUNYA_CALLBACK_URL="https://your-domain.com/api/paydunya/callback"
```

**Generate Strong JWT_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Set Up Supabase (Optional but Recommended)

If you want PDF uploads to go to cloud storage:

1. Create Supabase project at https://supabase.com
2. Go to **Storage** → Create bucket named `pdfs`
3. Make it **Public**
4. Copy **Project URL** and **Service Role Key** to environment variables

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

### 3. Deploy to Vercel

1. Connect GitHub repository to Vercel
2. Set all environment variables in project settings
3. Deploy!

### 4. Post-Deployment Verification

#### Test Authentication
```bash
# Should set auth_token cookie
curl -X POST https://your-domain.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"user@example.com","password":"pass"}' \
  -c cookies.txt -v

# Should return user info
curl https://your-domain.com/api/auth/me -b cookies.txt
```

#### Test PDF System
1. Login as admin
2. Go to `/admin/books`
3. Try uploading a PDF
4. Check Supabase Storage dashboard for the file

#### Check Logs
- Vercel Dashboard → Your Project → Deployments → Functions
- Look for:
  - `[auth/login]` messages
  - `[PDF Download]` messages
  - `[Submit Book]` messages

## 📖 Full Documentation

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase configuration
- **[AUTHENTICATION_DEPLOYMENT.md](./AUTHENTICATION_DEPLOYMENT.md)** - Detailed deployment guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - All changes explained

## ⚡ How It Works

### Authentication Flow
1. User logs in → JWT token generated
2. Token stored in HTTP-only cookie (`auth_token`)
3. Cookie sent with all subsequent requests
4. Server validates JWT on protected routes
5. User info extracted from valid tokens

### PDF Storage & Delivery Flow
1. **Upload:** PDFs go to Supabase → Public URL saved in `book.pdfFile`
2. **Download:** System checks `pdfFile` first → Falls back to local storage
3. **Authentication:** All downloads require valid purchase + login

## 🔧 Troubleshooting

### "Invalid token" errors
- ✅ Check `JWT_SECRET` is set in Vercel
- ✅ Ensure secret is same across all deployments
- ✅ Check browser DevTools → Application → Cookies

### "auth_token cookie NOT present"
- ✅ Check login response headers for Set-Cookie
- ✅ Verify no domain mismatch (www vs non-www)
- ✅ Try in incognito mode

### "Supabase Storage not configured"
- ✅ Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Redeploy after adding variables
- ✅ Or ignore - app works with local storage

### PDFs not downloading
- ✅ Check `book.pdfFile` field in database
- ✅ Verify user has purchase record
- ✅ Check Vercel function logs for errors
- ✅ Ensure PDF exists (Supabase or local)

## 🎯 Key Features

✅ **Works without Supabase** - Local storage fallback  
✅ **Secure authentication** - JWT + HTTP-only cookies  
✅ **Smart PDF routing** - Supabase first, local fallback  
✅ **Production ready** - Security hardened, documented  
✅ **No breaking changes** - Backward compatible  

## 🛡️ Security Checklist

Before going live:

- [ ] Changed `JWT_SECRET` to strong 32+ char random string
- [ ] Changed `ADMIN_TOKEN` to secure value
- [ ] Using HTTPS (automatic on Vercel)
- [ ] Database credentials in Vercel env vars only
- [ ] Supabase service key kept secret
- [ ] Tested login flow works
- [ ] Tested PDF downloads require authentication

## 📊 Monitoring

Watch these logs in Vercel:

```
[auth/login] Login successful for user: email@example.com Role: client
[JWT] WARNING: JWT_SECRET is weak or default
[PDF Download] Redirecting to Supabase URL for book 123
[SendBook] Book 456 has Supabase URL
[Submit Book] Uploading to Supabase Storage...
```

## ✨ What You Get

1. **Reliable authentication** that works on Vercel
2. **Cloud PDF storage** with Supabase
3. **Automatic fallback** to local storage
4. **Security hardening** (sanitization, validation)
5. **Complete documentation** for future reference

## 🆘 Need Help?

1. Check the detailed docs (links above)
2. Review Vercel function logs
3. Check Supabase Storage dashboard
4. Verify all environment variables set

## 🎉 You're Ready!

Your application is production-ready with:
- ✅ Secure authentication
- ✅ Cloud PDF storage
- ✅ Graceful fallbacks
- ✅ Comprehensive documentation

Deploy with confidence! 🚀
