export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

function checkAdmin(req: Request) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return true;
  const header = req.headers.get("x-admin-token");
  return header === token;
}

export async function POST(req: Request) {
  try {
    if (!checkAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalBooks = await prisma.book.count();
    const payload = {
      total_books: totalBooks,
      last_update: new Date().toISOString(),
    } as any;

    const { data, error } = await supabase
      .from("adminstats")
      .upsert({ id: 1, ...payload }, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, row: data });
  } catch (e: any) {
    console.error("POST /api/admin/stats/update error:", e);
    return NextResponse.json({ error: e?.message || "Failed to update adminstats" }, { status: 500 });
  }
}
