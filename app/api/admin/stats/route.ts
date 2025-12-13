export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const fetchCache = "force-no-store";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { getCookie } from "@/utils/cookieParser";

async function isAdmin(req: Request): Promise<boolean> {
  const adminToken = req.headers.get("x-admin-token");
  if (adminToken && adminToken === process.env.ADMIN_TOKEN) return true;

  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) {
    console.log("[isAdmin stats] No cookie header found");
    return false;
  }

  const token = getCookie(cookieHeader, 'auth_token');
  if (!token) {
    console.log("[isAdmin stats] No auth_token cookie found");
    return false;
  }

  const payload = await verifyJwt(token).catch(err => {
    console.log("[isAdmin stats] JWT verification failed:", err);
    return null;
  });
  
  const result = !!(payload && payload.role === 'admin');
  console.log("[isAdmin stats] JWT role:", payload?.role, "Result:", result);
  return result;
}

export async function GET(req: Request) {
  try {
    // Safety check for build time
    if (!prisma) {
      return Response.json({ error: "Database not available" }, { status: 503 });
    }

    if (!(await isAdmin(req))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [transactions, booksCount] = await Promise.all([
      prisma.transaction.findMany(),
      prisma.book.count(),
    ]);

    const stats = {
      successTransactions: transactions.filter((t: any) => t.status === "validated").length,
      pendingTransactions: transactions.filter((t: any) => t.status === "pending").length,
      cancelledTransactions: transactions.filter((t: any) => t.status === "cancelled").length,
      totalRevenue: transactions
        .filter((t: any) => t.status === "validated")
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0),
      totalBooks: booksCount,
    };

    return Response.json(stats);
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
