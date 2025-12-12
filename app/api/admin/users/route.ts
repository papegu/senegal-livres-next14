export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { getCookie } from "@/utils/cookieParser";

async function isAdmin(req: Request): Promise<boolean> {
  // First allow static admin token header
  const adminToken = req.headers.get("x-admin-token");
  if (adminToken && adminToken === process.env.ADMIN_TOKEN) return true;

  // Otherwise try to validate the auth cookie (JWT)
  const cookieHeader = req.headers.get("cookie");
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
  
  const userId = payload?.sub ? Number(payload.sub) : NaN;
  if (!payload || payload.role !== 'admin' || Number.isNaN(userId)) {
    console.log("[isAdmin] Invalid payload or role not admin", payload);
    return false;
  }

  // Confirm admin role in DB
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const result = !!(user && user.role === 'admin');
  console.log("[isAdmin] DB admin check result:", result);
  return result;
}

export async function GET(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        blocked: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || "",
        password: passwordHash,
        role: "client",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        blocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, email, name, password, role, blocked } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const userId = Number(id);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const data: any = {};
    if (email) data.email = email;
    if (name) data.name = name;
    if (role) data.role = role;
    if (typeof blocked === 'boolean') data.blocked = blocked;
    if (password) data.password = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        blocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const userId = Number(id);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const removed = await prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        blocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, removed });
  } catch (error) {
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
