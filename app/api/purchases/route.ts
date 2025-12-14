export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";

interface Purchase {
  id: string;
  userId: string;
  bookIds: string[];
  transactionId: string;
  amount: number;
  date: string;
}

export async function GET(req: Request) {
  // Safety check for build time
  if (!prisma) {
    console.log("[Purchases API] Prisma client not available");
    return Response.json({ error: "Database not available" }, { status: 503 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = Number(payload.sub);
    if (Number.isNaN(userId)) {
      return Response.json({ error: "Invalid user" }, { status: 400 });
    }

    const purchases = await prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ purchases });
  } catch (error) {
    console.error("GET /api/purchases error:", error);
    return Response.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Safety check for build time
  if (!prisma) {
    console.log("[Purchases API] Prisma client not available");
    return Response.json({ error: "Database not available" }, { status: 503 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const { bookIds, transactionId, amount } = await req.json();

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return Response.json({ error: "Invalid bookIds" }, { status: 400 });
    }

    if (!transactionId || !amount) {
      return Response.json({ error: "Missing transactionId or amount" }, { status: 400 });
    }

    const userId = Number(payload.sub);
    if (Number.isNaN(userId)) {
      return Response.json({ error: "Invalid user" }, { status: 400 });
    }

    const txId = transactionId ? Number(transactionId) : null;

    // Create one row per book
    const db = prisma; // Capture reference for use in transaction callback
    const created = await db.$transaction(async () => {
      // clear cart
      await db.cartitem.deleteMany({ where: { userId } }).catch(() => null);

      const results: { id: number }[] = [];
      for (const bId of bookIds) {
        const bookIdInt = Number(bId);
        if (Number.isNaN(bookIdInt)) continue;

        const p = await db.purchase.create({
          data: {
            uuid: `purchase_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
            userId,
            bookId: bookIdInt,
            transactionId: txId || undefined,
            amount: Math.round(Number(amount) || 0),
            lastDownload: null,
          },
        });
        results.push(p);
      }
      return results;
    });

    return Response.json({ ok: true, purchases: created });
  } catch (error) {
    console.error("POST /api/purchases error:", error);
    return Response.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}
