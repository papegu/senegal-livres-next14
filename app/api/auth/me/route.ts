import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { getCookie } from "@/utils/cookieParser";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";

    const token = getCookie(cookieHeader, 'auth_token');
    if (!token) {
      console.log("[/api/auth/me] No auth_token found");
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      console.log("[/api/auth/me] JWT verification failed");
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const userId = Number(payload.sub);
    if (Number.isNaN(userId)) {
      console.log("[/api/auth/me] Invalid user id in token:", payload.sub);
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.log("[/api/auth/me] User not found with id:", payload.sub);
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const safe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      blocked: user.blocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({ ok: true, user: safe });
  } catch (err) {
    console.log("[/api/auth/me] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
