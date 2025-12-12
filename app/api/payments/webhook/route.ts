import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const tx = await prisma.transaction.findFirst({ where: { orderId } });
  if (!tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const updated = await prisma.transaction.update({
    where: { id: tx.id },
    data: { status },
  });

  return NextResponse.json({ ok: true, transaction: updated });
}
