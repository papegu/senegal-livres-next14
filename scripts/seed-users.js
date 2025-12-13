// Seed specified users with given passwords into Postgres (Supabase)
// Usage: node scripts/seed-users.js

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ log: ['error', 'warn'] });

async function upsertUser(email, password, name) {
  const hash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { password: hash, name: name || existing.name || email.split('@')[0] } });
    console.log(`✓ Updated user ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hash,
        role: 'client',
        blocked: false,
      },
    });
    console.log(`✓ Created user ${email}`);
  }
}

async function main() {
  await upsertUser('papeabdoulaye.gueye@senegal-livres.sn', 'pape1982', 'Pape Abdoulaye Gueye');
  await upsertUser('serignebabacar.gueye@senegal-livres.sn', 'babskiller', 'Serigne Babacar Gueye');
}

main()
  .catch((e) => {
    console.error('[seed-users] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
