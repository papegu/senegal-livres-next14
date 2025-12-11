import { NextResponse } from "next/server";
import { readDB } from "../../../../utils/fileDb";
import { verifyJwt } from "../../../../utils/jwt";
import { getCookie } from "../../../../utils/cookieParser";

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

    const db = await readDB();
    const user = (db.users || []).find((u: any) => u.id === payload.sub);
    if (!user) {
      console.log("[/api/auth/me] User not found with id:", payload.sub);
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const safe = { ...user };
    delete (safe as any).passwordHash;

    return NextResponse.json({ ok: true, user: safe });
  } catch (err) {
    console.log("[/api/auth/me] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
