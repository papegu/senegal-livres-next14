// Test CRUD Prisma sur Supabase
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // CREATE
    const created = await prisma.book.create({
      data: {
        uuid: 'test-uuid-' + Date.now(),
        title: 'Test CRUD',
        author: 'Copilot',
        description: 'Test insertion',
        price: 1234,
        coverImage: '',
        pdfFile: '',
        pdfFileName: '',
        stock: 1,
        category: 'Test',
        status: 'available',
        eBook: true,
        source: 'test',
      },
    });
    console.log('CREATE OK:', created);

    // READ
    const found = await prisma.book.findUnique({ where: { id: created.id } });
    console.log('READ OK:', found);

    // UPDATE
    const updated = await prisma.book.update({
      where: { id: created.id },
      data: { title: 'Test CRUD Updated' },
    });
    console.log('UPDATE OK:', updated);

    // DELETE
    await prisma.book.delete({ where: { id: created.id } });
    console.log('DELETE OK');
  } catch (e) {
    console.error('Erreur CRUD:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
