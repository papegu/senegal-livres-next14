import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../../utils/fileDb";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const body = await req.json();

  // Two usage modes for this endpoint:
  // 1) Create payment (frontend) -> payload contains { bookId, amount, method }
  // 2) Webhook from PayTech -> payload contains { orderId, status, signature }

  // Webhook status update from payment providers (Wave, Orange, etc.)
  // expected body: { orderId, status }
  const { orderId, status } = body as any;

  if (!orderId || !status) {
    return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
  }

  const db = await readDB();
  db.transactions = db.transactions || [];

  const tx = db.transactions.find((t: any) => t.orderId === orderId);
  if (!tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  tx.status = status;
  tx.updatedAt = new Date().toISOString();

  await writeDB(db);

  return NextResponse.json({ ok: true, transaction: tx });
}
