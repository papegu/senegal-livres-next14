export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "../../../utils/AdminAuth";

export async function GET(req: Request) {
  try {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const transactions = await prisma.transaction.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, bookId, amount, paymentMethod, bookIds } = body as any;
    if (!amount) {
      return NextResponse.json({ error: "amount required" }, { status: 400 });
    }

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

    return NextResponse.json({ orderId, transactionId: tx.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const body = await req.json();
    const { id, status } = body as any;
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

    const updated = await prisma.transaction.update({ where: { id: Number(id) }, data: { status } });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });

    await prisma.transaction.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}