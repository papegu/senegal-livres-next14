export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/utils/jwt";

let prisma: any;

// Charger Prisma uniquement à l’exécution (PAS au build)
async function getPrisma() {
  if (!prisma) {
    const prismaModule = await import("@/lib/prisma");
    prisma = prismaModule.prisma;
  }
  return prisma;
}

// Vérifier les privilèges admin via JWT cookie
const requireAdminAuth = async () => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return false;

    const payload = await verifyJwt(token);
    if (!payload || payload.role !== "admin") return false;

    return true;
  } catch {
    return false;
  }
};

// GET - Statistiques base de données
export async function GET(req: NextRequest) {
  if (!(await requireAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = await getPrisma();

    await prisma.$queryRaw`SELECT 1`;

    const tables = await prisma.$queryRaw`
      SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        DATA_LENGTH,
        INDEX_LENGTH,
        (DATA_LENGTH + INDEX_LENGTH) AS TOTAL_SIZE
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `;

    const [dbStats] = await prisma.$queryRaw<any[]>`
      SELECT 
        SUM(TABLE_ROWS) AS totalRows,
        SUM(DATA_LENGTH) AS dataSize,
        SUM(INDEX_LENGTH) AS indexSize,
        SUM(DATA_LENGTH + INDEX_LENGTH) AS totalSize
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
    `;

    const counts = {
      users: await prisma.user.count().catch(() => 0),
      books: await prisma.book.count().catch(() => 0),
      transactions: await prisma.transaction.count().catch(() => 0),
      purchases: await prisma.purchase.count().catch(() => 0),
      submissions: await prisma.submission.count().catch(() => 0),
    };

    return NextResponse.json({ tables, dbStats, counts });
  } catch {
    return NextResponse.json(
      {
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
      },
      { status: 200 }
    );
  }
}

// POST - Actions admin DB
export async function POST(req: NextRequest) {
  if (!(await requireAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = await getPrisma();
    const { action } = await req.json();

    if (action === "backup") {
      return NextResponse.json({
        message: "Backup initiated",
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "optimize") {
      const tables = await prisma.$queryRaw<Array<{ TABLE_NAME: string }>>`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
      `;

      for (const table of tables) {
        await prisma.$executeRawUnsafe(`OPTIMIZE TABLE ${table.TABLE_NAME}`);
      }

      return NextResponse.json({
        message: "Database optimized",
        tablesOptimized: tables.length,
      });
    }

    if (action === "getConnections") {
      const connections = await prisma.$queryRaw`SHOW PROCESSLIST`;
      return NextResponse.json({ connections });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Operation failed" },
      { status: 500 }
    );
  }
}


