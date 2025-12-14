export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Validate required envs
    const env = {
      databaseUrl: process.env.DATABASE_URL,
      directUrl: process.env.DIRECT_URL,
      jwtSecret: process.env.JWT_SECRET,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    };

    // Quick checks: missing envs
    const missing: string[] = [];
    if (!env.databaseUrl) missing.push("DATABASE_URL");
    if (!env.directUrl) missing.push("DIRECT_URL");
    if (!env.jwtSecret) missing.push("JWT_SECRET");
    if (!env.baseUrl) missing.push("NEXT_PUBLIC_BASE_URL");

    // Simple connectivity check: fetch user count
    const count = await prisma.user.count();
    return NextResponse.json({ ok: true, db: "connected", userCount: count, missingEnv: missing }, { status: 200 });
  } catch (error) {
    console.error("[health] error:", error);
    const isPrismaErr = typeof error === 'object' && error !== null;
    return NextResponse.json({ ok: false, error: "Health check failed", details: isPrismaErr ? String((error as any).message || error) : String(error) }, { status: 500 });
  }
}
