import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { getCookie } from "@/utils/cookieParser";

export const dynamic = "force-dynamic";

async function isAdmin(req: Request): Promise<boolean> {
  const adminToken = req.headers.get("x-admin-token");
  if (adminToken && adminToken === process.env.ADMIN_TOKEN) return true;

  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) {
    console.log("[isAdmin] No cookie header found");
    return false;
  }

  const token = getCookie(cookieHeader, 'auth_token');
  if (!token) {
    console.log("[isAdmin] No auth_token cookie found");
    return false;
  }

  const payload = await verifyJwt(token).catch(err => {
    console.log("[isAdmin] JWT verification failed:", err);
    return null;
  });
  
  const result = !!(payload && payload.role === 'admin');
  console.log("[isAdmin transactions] JWT role:", payload?.role, "Result:", result);
  return result;
}

export async function GET(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({ orderBy: { createdAt: "desc" } });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("GET /api/admin/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const whereClause = Number.isNaN(Number(id)) ? { uuid: id } : { id: Number(id) };
    const tx = await prisma.transaction.update({
      where: whereClause,
      data: { status },
    }).catch(() => null);

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, transaction: tx });
  } catch (error) {
    console.error("PUT /api/admin/transactions error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
    }

    const deleted = await prisma.transaction.delete({
      where: Number.isNaN(Number(id)) ? { uuid: id } : { id: Number(id) },
    }).catch(() => null);

    if (!deleted) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/transactions error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
