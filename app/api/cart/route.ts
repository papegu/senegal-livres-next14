export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = Number(payload.sub);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cartItems = await prisma.cartitem.findMany({ where: { userId } });
    const cart = cartItems.map((c: { bookId: number }) => c.bookId);

    return NextResponse.json({ cart, userId: user.id });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { bookId, action } = await req.json();
    // action: "add" or "remove"

    if (!bookId || !action) {
      return NextResponse.json(
        { error: "Missing bookId or action" },
        { status: 400 }
      );
    }

    const userId = Number(payload.sub);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bookIdInt = Number(bookId);
    if (Number.isNaN(bookIdInt)) {
      return NextResponse.json({ error: "Invalid bookId" }, { status: 400 });
    }

    if (action === "add") {
      await prisma.cartitem.upsert({
        where: { userId_bookId: { userId, bookId: bookIdInt } },
        update: { quantity: 1 },
        create: { userId, bookId: bookIdInt, quantity: 1 },
      });
    } else if (action === "remove") {
      await prisma.cartitem.delete({
        where: { userId_bookId: { userId, bookId: bookIdInt } },
      }).catch(() => null);
    }

    const cartItems = await prisma.cartitem.findMany({ where: { userId } });
    const cart = cartItems.map((c: { bookId: number }) => c.bookId);

    return NextResponse.json({
      ok: true,
      cart,
      message: `Book ${action}ed to cart`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}
