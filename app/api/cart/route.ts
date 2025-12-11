import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/utils/fileDb";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";

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

    const db = await readDB();
    const user = (db.users || []).find((u: any) => u.id === payload.sub);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cart = user.cart || [];
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

    const db = await readDB();
    const user = (db.users || []).find((u: any) => u.id === payload.sub);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.cart) user.cart = [];

    if (action === "add") {
      if (!user.cart.includes(bookId)) {
        user.cart.push(bookId);
      }
    } else if (action === "remove") {
      user.cart = user.cart.filter((id: string) => id !== bookId);
    }

    await writeDB(db);

    return NextResponse.json({
      ok: true,
      cart: user.cart,
      message: `Book ${action}ed to cart`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}
