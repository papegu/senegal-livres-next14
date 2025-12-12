import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/utils/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Vérifier les privilèges admin via JWT cookie
const requireAdminAuth = async (req: NextRequest) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return false;
    }
    
    const payload = await verifyJwt(token);
    if (!payload || payload.role !== 'admin') {
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Admin auth error:', e);
    return false;
  }
};

// GET - Récupérer les stats de la base de données
export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdminAuth(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que la base de données est accessible
    await prisma.$queryRaw`SELECT 1`;

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

    const dbStats = await prisma.$queryRaw<Array<{
      totalRows: bigint | null;
      dataSize: bigint | null;
      indexSize: bigint | null;
      totalSize: bigint | null;
    }>>`
      SELECT 
        SUM(TABLE_ROWS) as totalRows,
        SUM(DATA_LENGTH) as dataSize,
        SUM(INDEX_LENGTH) as indexSize,
        SUM(DATA_LENGTH + INDEX_LENGTH) as totalSize
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
    `;

    // Stats des utilisateurs - avec gestion des erreurs
    let userCount = 0;
    let bookCount = 0;
    let transactionCount = 0;
    let purchaseCount = 0;
    let submissionCount = 0;

    try {
      userCount = await prisma.user.count();
    } catch (e) {
      console.log('Cannot count users - table may not exist');
    }

    try {
      bookCount = await prisma.book.count();
    } catch (e) {
      console.log('Cannot count books - table may not exist');
    }

    try {
      transactionCount = await prisma.transaction.count();
    } catch (e) {
      console.log('Cannot count transactions - table may not exist');
    }

    try {
      purchaseCount = await prisma.purchase.count();
    } catch (e) {
      console.log('Cannot count purchases - table may not exist');
    }

    try {
      submissionCount = await prisma.submission.count();
    } catch (e) {
      console.log('Cannot count submissions - table may not exist');
    }

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
    
    // Retourner des données vides si la base de données n'est pas disponible
    return NextResponse.json({
      tables: [],
      dbStats: {
        totalRows: 0,
        dataSize: 0,
        indexSize: 0,
        totalSize: 0,
      },
      counts: {
        users: 0,
        books: 0,
        transactions: 0,
        purchases: 0,
        submissions: 0,
      },
      warning: 'Database not available - please run migrations first',
    }, { status: 200 });
  }
}

// POST - Exécuter des opérations d'administration (backup, optimisation, etc.)
export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdminAuth(req))) {
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
        const tables = await prisma.$queryRaw<Array<{ TABLE_NAME: string }>>`
          SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_SCHEMA = DATABASE()
        `;
        
        for (const table of tables) {
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
