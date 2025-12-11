import { readDB, writeDB } from "@/utils/fileDb";
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

    const db = await readDB();

    const purchases = (db.purchases || []).filter(
      (p: Purchase) => p.userId === payload.sub
    );

    return Response.json({ purchases });
  } catch (error) {
    console.error("GET /api/purchases error:", error);
    return Response.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const db = await readDB();
    const purchaseId = `purchase_${Date.now()}`;

    const purchase: Purchase = {
      id: purchaseId,
      userId: payload.sub,
      bookIds,
      transactionId,
      amount,
      date: new Date().toISOString(),
    };

    if (!db.purchases) {
      db.purchases = [];
    }

    db.purchases.push(purchase);

    // Clear user's cart after successful purchase
    if (payload.sub) {
      const user = (db.users || []).find((u: any) => u.id === payload.sub);
      if (user) {
        user.cart = [];
      }
    }

    await writeDB(db);

    return Response.json({ ok: true, purchase });
  } catch (error) {
    console.error("POST /api/purchases error:", error);
    return Response.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}
