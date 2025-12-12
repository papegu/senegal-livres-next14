// Seed or promote an admin user.
// Usage: node scripts/seed-admin.js
// Optional env vars: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME

// CommonJS to avoid ESM resolver issues and optional dotenv load.
let dotenvLoaded = false;
try {
  const dotenv = require('dotenv');
  dotenv.config();
  dotenvLoaded = true;
} catch (err) {
  console.warn('[seed-admin] dotenv not found, continuing without .env load');
}

const bcrypt = require('bcryptjs');
const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@senegal-livres.sn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@#$%';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

async function main() {
  console.log(`[seed-admin] Using email=${ADMIN_EMAIL} (dotenv loaded: ${dotenvLoaded})`);
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  // Hash password upfront
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (!existing) {
    const created = await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: passwordHash,
        role: Role.admin,
        blocked: false,
      },
      select: { id: true, email: true, role: true },
    });
    console.log('[seed-admin] Admin created:', created);
    return;
  }

  if (existing.role !== Role.admin) {
    const updated = await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: Role.admin, password: passwordHash, blocked: false },
      select: { id: true, email: true, role: true },
    });
    console.log('[seed-admin] User promoted to admin:', updated);
    return;
  }

  console.log('[seed-admin] Admin already exists, updating password...');
  await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: { password: passwordHash, blocked: false },
  });
  console.log('[seed-admin] Password updated for existing admin.');
}

main()
  .catch((e) => {
    console.error('[seed-admin] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
