// utils/adminAuth.ts
import { NextResponse } from "next/server";

/**
 * Vérifie le header x-admin-token.
 * Retourne null si ok, sinon une NextResponse d'erreur.
 */
export function requireAdmin(req: Request) {
  const token = req.headers.get("x-admin-token") || "";
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_TOKEN not configured on server" }, { status: 500 });
  }
  if (token !== expected) {
    return NextResponse.json({ error: "Unauthorized (admin token)" }, { status: 401 });
  }
  return null;
}
