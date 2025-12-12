import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Vérifier les privilèges admin
const requireAdminAuth = (req: NextRequest) => {
  const adminToken = req.headers.get('x-admin-token');
  const expectedToken = process.env.ADMIN_TOKEN;
  
  if (!adminToken || adminToken !== expectedToken) {
    return false;
  }
  return true;
};

// GET - Récupérer les stats de la base de données
export async function GET(req: NextRequest) {
  try {
    if (!requireAdminAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tables = await prisma.$queryRaw`
      SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        DATA_LENGTH,
        INDEX_LENGTH,
        (DATA_LENGTH + INDEX_LENGTH) as TOTAL_SIZE
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `;

    const dbStats = await prisma.$queryRaw`
      SELECT 
        SUM(TABLE_ROWS) as totalRows,
        SUM(DATA_LENGTH) as dataSize,
        SUM(INDEX_LENGTH) as indexSize,
        SUM(DATA_LENGTH + INDEX_LENGTH) as totalSize
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
    `;

    // Stats des utilisateurs
    const userCount = await prisma.user.count();
    const bookCount = await prisma.book.count();
    const transactionCount = await prisma.transaction.count();
    const purchaseCount = await prisma.purchase.count();
    const submissionCount = await prisma.submission.count();

    return NextResponse.json({
      tables,
      dbStats: dbStats[0],
      counts: {
        users: userCount,
        books: bookCount,
        transactions: transactionCount,
        purchases: purchaseCount,
        submissions: submissionCount,
      },
    });
  } catch (error) {
    console.error('Database stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database stats' },
      { status: 500 }
    );
  }
}

// POST - Exécuter des opérations d'administration (backup, optimisation, etc.)
export async function POST(req: NextRequest) {
  try {
    if (!requireAdminAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();

    switch (action) {
      case 'backup':
        // Trigger backup (dans un environnement de production, utiliser un vrai système de backup)
        return NextResponse.json({
          message: 'Backup initiated',
          timestamp: new Date().toISOString(),
          database: process.env.DATABASE_URL?.split('/').pop(),
        });

      case 'optimize':
        // Optimiser les tables
        const tables = await prisma.$queryRaw`
          SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_SCHEMA = DATABASE()
        `;
        
        for (const table of tables as any[]) {
          await prisma.$executeRawUnsafe(`OPTIMIZE TABLE ${table.TABLE_NAME}`);
        }

        return NextResponse.json({
          message: 'Database optimized successfully',
          tablesOptimized: tables.length,
        });

      case 'createUser':
        // Créer un utilisateur administrateur (simulated - dans une vraie impl, créer via script MySQL)
        const { email, password, role } = data;
        
        if (!email || !password) {
          return NextResponse.json(
            { error: 'Email and password required' },
            { status: 400 }
          );
        }

        // Pour une vraie implémentation, il faudrait exécuter:
        // CREATE USER 'email'@'localhost' IDENTIFIED BY 'password';
        // GRANT ... PRIVILEGES ...
        // Mais c'est limité dans un environnement Node.js

        return NextResponse.json({
          message: 'User creation requires direct MySQL access',
          info: 'Please run: CREATE USER "' + email + '"@"localhost" IDENTIFIED BY "' + password + '"; GRANT ALL PRIVILEGES ON *.* TO "' + email + '"@"localhost" WITH GRANT OPTION;',
          status: 'info',
        });

      case 'getConnections':
        // Afficher les connexions actives
        const connections = await prisma.$queryRaw`
          SHOW PROCESSLIST
        `;
        return NextResponse.json({ connections });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Database operation error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
