export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Simple connectivity check: fetch 1 user count
    const count = await prisma.user.count();
    return NextResponse.json({ ok: true, db: "connected", userCount: count }, { status: 200 });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({ ok: false, error: "DB connection failed" }, { status: 500 });
  }
}
