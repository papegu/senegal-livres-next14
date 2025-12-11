// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../utils/fileDb";
import { v4 as uuid } from "uuid";
import { requireAdmin } from "../../../utils/AdminAuth";


/**
 * GET -> lister transactions (admin)
 * POST -> créer transaction (public: initier commande)
 * PUT -> update transaction status (admin)
 * DELETE -> supprimer transaction (admin)
 */

// GET -> admin only
export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const db = await readDB();
  return NextResponse.json(db.transactions || []);
}

// POST -> création d'une transaction / commande (publique)
export async function POST(req: Request) {
  const body = await req.json();
  const { userId, bookId, amount, paymentMethod } = body;
  if (!userId || !amount) {
    return NextResponse.json({ error: "userId and amount required" }, { status: 400 });
  }

  const db = await readDB();
  db.users = db.users || [];
  db.books = db.books || [];
  db.transactions = db.transactions || [];

  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });

  // If bookId provided, check book exists
  if (bookId) {
    const book = db.books.find((b: any) => b.id === bookId);
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const tx = {
    id: uuid(),
    orderId: uuid(),
    userId,
    bookId: bookId || null,
    amount,
    paymentMethod: paymentMethod || "unknown",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  db.transactions.push(tx);
  await writeDB(db);

  // Return transaction (client will call payment provider next)
  return NextResponse.json(tx, { status: 201 });
}

// PUT -> admin update (change status, providerTxId, rawPayload)
export async function PUT(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });

  const db = await readDB();
  db.transactions = db.transactions || [];
  const idx = db.transactions.findIndex((t: any) => t.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

  const updated = { ...db.transactions[idx], ...body, updatedAt: new Date().toISOString() };
  db.transactions[idx] = updated;

  // Optional: if status changed to paid and bookId present -> decrement stock
  if (updated.status === "paid" && updated.bookId) {
    db.books = db.books || [];
    const b = db.books.find((bk: any) => bk.id === updated.bookId);
    if (b && typeof b.stock === "number") {
      b.stock = Math.max(0, b.stock - 1);
    }
  }

  await writeDB(db);
  return NextResponse.json(updated);
}

// DELETE -> admin remove
export async function DELETE(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = await readDB();
  db.transactions = db.transactions || [];
  const idx = db.transactions.findIndex((t: any) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

  const removed = db.transactions.splice(idx, 1);
  await writeDB(db);
  return NextResponse.json({ ok: true, removed: removed[0] });
}
