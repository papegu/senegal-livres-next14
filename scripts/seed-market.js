// Seed books and basic users from data/market.json into Postgres (Supabase)
// Usage: node scripts/seed-market.js

const fs = require('fs');
const path = require('path');
const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient({ log: ['error', 'warn'] });

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'market.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw);

  const books = data.books || [];
  console.log(`Seeding ${books.length} books...`);
  for (const b of books) {
    try {
      await prisma.book.upsert({
        where: { uuid: b.id },
        update: {
          title: b.title || 'Untitled',
          author: b.author || 'Unknown',
          description: b.description || '',
          price: b.price || 0,
          coverImage: b.coverImage || '',
          stock: b.stock || 0,
          category: b.category || '',
          status: b.status || 'available',
          eBook: b.eBook ?? true,
          source: b.source || 'admin',
        },
        create: {
          uuid: b.id,
          title: b.title || 'Untitled',
          author: b.author || 'Unknown',
          description: b.description || '',
          price: b.price || 0,
          coverImage: b.coverImage || '',
          stock: b.stock || 0,
          category: b.category || '',
          status: b.status || 'available',
          eBook: b.eBook ?? true,
          source: b.source || 'admin',
        },
      });
      console.log(`  ✓ ${b.title}`);
    } catch (e) {
      console.error(`  ✗ ${b.title}:`, e.message);
    }
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
