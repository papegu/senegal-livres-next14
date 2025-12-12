# Migration Strategy: Local vs Planetscale vs VPS

> **Current Status:** No migrations exist yet. Database must be created and populated BEFORE running the application.

---

## ⚡ Quick Decision Tree

```
Do you have a working local database already?
├─ NO → Choose deployment target FIRST (step 1 below)
└─ YES → Run migrations on that target

Which deployment target?
├─ Option A: Planetscale (Recommended) → Follow SECTION A
├─ Option B: Local VPS/Server → Follow SECTION B  
├─ Option C: Local MySQL (Development Only) → Follow SECTION C
```

---

## IMPORTANT: Order of Operations

**❌ WRONG ORDER (will fail):**
1. Deploy to Vercel
2. Try to create database
3. Run migrations
4. Test

**✅ CORRECT ORDER:**
1. Choose your database host (Planetscale OR VPS)
2. Create the database account/connection
3. Run Prisma migrations on that database
4. Verify data exists
5. Deploy to Vercel with DATABASE_URL pointing to that database

---

## SECTION A: Planetscale (RECOMMENDED ⭐)

### Why Planetscale?
- ✅ Zero infrastructure to manage
- ✅ Auto-scaling with Vitess
- ✅ Automated backups
- ✅ Free tier available
- ✅ Works perfectly with Vercel

### A1. Create Planetscale Database

1. **Go to:** https://planetscale.com (create free account)

2. **Create new database:**
   - Name: `senegal_livres`
   - Region: Choose closest to Senegal (Europe recommended)
   - Click "Create database"

3. **Wait for initialization** (~1-2 minutes)

### A2. Get Connection String

1. **In Planetscale Dashboard:**
   - Click your database name: `senegal_livres`
   - Go to "Connect" tab (top)
   - Choose "Node.js" from dropdown
   - Copy the connection string that looks like:
   ```
   mysql://xxxxxxxxx:pxxxxxxxxx@aws.connect.psdb.cloud/senegal_livres?sslaccept=strict
   ```

2. **Update `.env.local`:**
   ```bash
   DATABASE_URL="mysql://YOUR_USERNAME:YOUR_PASSWORD@aws.connect.psdb.cloud/senegal_livres?sslaccept=strict"
   ```

### A3. Run Migrations on Planetscale

```bash
# Make sure you're in the project directory
cd "c:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"

# Create migration (this generates the migration files)
npx prisma migrate dev --name init

# If you get a warning about production database, confirm "yes"
```

**What happens:**
- Prisma reads `prisma/schema.prisma`
- Creates all tables (User, Book, Transaction, Purchase, etc.) in Planetscale
- Generates migration files in `prisma/migrations/`
- Ready to deploy!

### A4. Verify Migration Success

```bash
# This will show you the database schema
npx prisma db push --skip-generate

# Check that you can read the database
npx prisma client generate
```

---

## SECTION B: VPS / External Server (if you have one)

### B1. Prerequisites

You need:
- ✅ VPS with MySQL 8.0+ installed
- ✅ Remote access credentials (host, username, password, port)
- ✅ Empty database created (or access to CREATE DATABASE)

### B2. Get Connection String for VPS

Format:
```
mysql://username:password@your-vps-ip:3306/senegal_livres
```

Example:
```
mysql://root:MyVPSPassword123@192.168.1.100:3306/senegal_livres
```

Update `.env.local`:
```bash
DATABASE_URL="mysql://root:MyVPSPassword123@192.168.1.100:3306/senegal_livres"
```

### B3. Run Migrations on VPS

```bash
cd "c:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"

# Migrate
npx prisma migrate dev --name init
```

**Issue:** If you get connection timeout:
- Verify MySQL is listening on that port (check `/etc/my.cnf` or MySQL config)
- Verify firewall allows port 3306 from your machine
- Verify username/password are correct

### B4: Production Deployment

When deploying to production (Vercel):
1. Add the same DATABASE_URL to Vercel environment variables
2. Vercel will use it for all deployments

---

## SECTION C: Local MySQL (Development Only)

⚠️ **WARNING:** This is for **local testing only**. Not suitable for production.

### C1. Setup Local MySQL

**If you have MySQL installed locally:**

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE senegal_livres;

# Create admin user
CREATE USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982';
GRANT ALL PRIVILEGES ON senegal_livres.* TO 'papeabdoulaye'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### C2. Update `.env.local`

```bash
DATABASE_URL="mysql://papeabdoulaye:pape1982@localhost:3306/senegal_livres"
```

### C3. Run Migrations Locally

```bash
cd "c:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"

npx prisma migrate dev --name init
```

### C4. Prepare for Production

Before deploying to Vercel:
1. Switch to Planetscale or VPS database
2. Run migrations there too
3. Update `.env.local` with production DATABASE_URL
4. Push to GitHub
5. Vercel will use that URL for production

---

## TROUBLESHOOTING

### ❌ "Can't reach database server"

**Check:**
```bash
# Test connection from Windows
# For Planetscale:
mysql -h aws.connect.psdb.cloud -u username -p

# For VPS:
mysql -h 192.168.1.100 -u root -p

# For Local:
mysql -u papeabdoulaye -p
```

### ❌ "Migrations already exist"

If `prisma/migrations/` folder already has migrations:
```bash
# Skip this, just push the existing schema
npx prisma db push
```

### ❌ "Foreign key constraint failed"

Planetscale uses `relationMode = "prisma"` in schema (already configured).
If on VPS, ensure your schema also has this line.

### ❌ "SSL certificate error" (Planetscale)

Make sure your `.env.local` includes:
```
?sslaccept=strict
```

---

## NEXT STEPS

**Choose your path:**

### If choosing Planetscale ⭐ (Recommended):
1. Go to https://planetscale.com
2. Create database `senegal_livres`
3. Get connection string
4. Update `.env.local`
5. Run: `npx prisma migrate dev --name init`
6. Then deploy to Vercel

**Time: ~15 minutes**

### If using VPS:
1. Get your VPS MySQL credentials
2. Ensure MySQL is accessible remotely
3. Update `.env.local`
4. Run: `npx prisma migrate dev --name init`
5. Then deploy to Vercel

**Time: ~10-20 minutes** (depends on VPS setup)

### If developing locally only:
1. Install MySQL locally
2. Create database and user
3. Update `.env.local` with local credentials
4. Run: `npx prisma migrate dev --name init`
5. When ready for production, switch to Planetscale/VPS

**Time: ~10 minutes**

---

## WHICH SHOULD YOU CHOOSE?

| Criteria | Planetscale | VPS | Local |
|----------|------------|-----|-------|
| **Cost** | Free tier + paid | $5-50/mo | Free |
| **Setup Time** | 5 min | 30 min | 10 min |
| **Maintenance** | Zero | High | None |
| **Scalability** | Excellent | Good | Poor |
| **Recommended For** | Production | Self-managed | Dev only |
| **Works with Vercel** | ✅ Native | ✅ Yes | ❌ No |

### **Recommendation for senegal-livres.sn:**
👉 **Use Planetscale** (Option A)
- Setup takes 15 minutes
- No infrastructure to manage
- Scales automatically
- Perfect for production
- Free tier to start

---

## COMMAND QUICK REFERENCE

```bash
# Once DATABASE_URL is set in .env.local:

# 1. Run migrations (creates tables)
npx prisma migrate dev --name init

# 2. Verify schema
npx prisma db push

# 3. Check client is ready
npx prisma client generate

# 4. Start development server
npm run dev

# 5. Start production
npm run build && npm run start
```

---

## IMPORTANT REMINDERS

- ✅ **Choose database host FIRST**
- ✅ **Get connection string SECOND**  
- ✅ **Update .env.local THIRD**
- ✅ **Run migrations FOURTH**
- ✅ **Deploy to Vercel FIFTH**

**Do NOT skip migrations.**

---

## NEXT MESSAGE

Once you choose your option (Planetscale/VPS/Local), tell me:
1. Which one you chose
2. Your connection string (if you have it)
3. Or I can help you get it step-by-step
