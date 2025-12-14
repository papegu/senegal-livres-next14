export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";

export async function GET() {
  try {
    // ✅ lire le cookie via Next.js
    const token = cookies().get("auth_token")?.value;

    if (!token) {
      console.log("[/api/auth/me] No auth_token cookie");
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // ✅ vérifier le JWT
    const payload = await verifyJwt(token);
    if (!payload || !payload.email) {
      console.log("[/api/auth/me] Invalid JWT payload:", payload);
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // ✅ retrouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      console.log("[/api/auth/me] User not found:", payload.email);
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    // ✅ réponse sécurisée
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        blocked: user.blocked,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("[/api/auth/me] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
