// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { prisma } from "@/lib/prisma";
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

  const transactions = await prisma.transaction.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(transactions);
}

// POST -> création d'une transaction / commande (publique)
export async function POST(req: Request) {
  const body = await req.json();
  const { userId, bookId, amount, paymentMethod, bookIds } = body as any;
  if (!amount) {
    return NextResponse.json({ error: "amount required" }, { status: 400 });
  }

  // Validate user exists if provided
  let userIdInt: number | null = null;
  if (userId !== undefined && userId !== null) {
    const parsed = Number(userId);
    if (Number.isNaN(parsed)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    userIdInt = parsed;
    const userExists = await prisma.user.findUnique({ where: { id: userIdInt } });
    if (!userExists) return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  // Optional single book check
  let bookIdInt: number | null = null;
  if (bookId !== undefined && bookId !== null) {
    const parsed = Number(bookId);
    if (Number.isNaN(parsed)) {
      return NextResponse.json({ error: "Invalid bookId" }, { status: 400 });
    }
    bookIdInt = parsed;
    const bookExists = await prisma.book.findUnique({ where: { id: bookIdInt } });
    if (!bookExists) return NextResponse.json({ error: "Book not found" }, { status: 400 });
  }

  const orderId = uuid();
  const txUuid = uuid();
  const tx = await prisma.transaction.create({
    data: {
      uuid: txUuid,
      orderId,
      userId: userIdInt,
      amount: Math.round(Number(amount)),
      paymentMethod: paymentMethod || "unknown",
      status: "pending",
      bookIds: Array.isArray(bookIds)
        ? JSON.stringify(bookIds)
        : bookIdInt !== null
          ? String(bookIdInt)
          : "",
    },
  });

  return NextResponse.json(tx, { status: 201 });
}

// PUT -> admin update (change status, providerTxId, rawPayload)
export async function PUT(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });

  const idNumeric = Number(body.id);
  const whereClause = Number.isNaN(idNumeric)
    ? { uuid: String(body.id) }
    : { id: idNumeric };

  const updated = await prisma.transaction.update({
    where: whereClause,
    data: {
      status: body.status,
      paymentMethod: body.paymentMethod,
      paydunyaInvoiceToken: body.paydunyaInvoiceToken,
      paydunyaResponseCode: body.paydunyaResponseCode,
      paydunyaStatus: body.paydunyaStatus,
      providerTxId: body.providerTxId,
      bookIds: body.bookIds ? JSON.stringify(body.bookIds) : undefined,
      description: body.description,
      customerEmail: body.customerEmail,
      rawPayload: body.rawPayload,
      amount: typeof body.amount === "number" ? body.amount : undefined,
      paymentConfirmedAt: body.paymentConfirmedAt ? new Date(body.paymentConfirmedAt) : undefined,
    },
  }).catch(() => null);

  if (!updated) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

  return NextResponse.json(updated);
}

// DELETE -> admin remove
export async function DELETE(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const idNumeric = Number(id);
  const whereClause = Number.isNaN(idNumeric) ? { uuid: id } : { id: idNumeric };
  const removed = await prisma.transaction.delete({ where: whereClause }).catch(() => null);
  if (!removed) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  return NextResponse.json({ ok: true, removed });
}
