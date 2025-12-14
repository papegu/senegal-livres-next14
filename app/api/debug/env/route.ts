export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader.split(/;\s*/).find(kv => kv.startsWith("auth_token="))?.split("=")[1];
    if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const present = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
      COOKIE_SAMESITE: process.env.COOKIE_SAMESITE || "(default:lax)",
    };

    return NextResponse.json({ ok: true, envPresent: present }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Env debug failed" }, { status: 500 });
  }
}
