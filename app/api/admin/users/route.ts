import { readDB, writeDB } from "@/utils/fileDb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { verifyJwt } from "@/utils/jwt";
import { getCookie } from "@/utils/cookieParser";

export const dynamic = "force-dynamic";

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
  
  const result = !!(payload && payload.role === 'admin');
  console.log("[isAdmin] JWT payload role:", payload?.role, "Result:", result);
  return result;
}

export async function GET(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await readDB();
    
    // Remove sensitive data from response, include all users so admins can manage roles
    const users = (db.users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name || "",
      role: user.role || "client",
      createdAt: user.createdAt,
    }));

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

    const db = await readDB();
    db.users = db.users || [];
    if (db.users.some((u: any) => u.email === email)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: uuid(),
      email,
      name: name || "",
      passwordHash,
      role: "client",
      createdAt: new Date().toISOString(),
    };

    db.users.push(user);
    await writeDB(db);

    const safe = { ...user };
    delete (safe as any).passwordHash;
    return NextResponse.json(safe, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, email, name, password, role, blocked } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const db = await readDB();
    db.users = db.users || [];
    const idx = db.users.findIndex((u: any) => u.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (email) db.users[idx].email = email;
    if (name) db.users[idx].name = name;
    if (password) db.users[idx].passwordHash = await bcrypt.hash(password, 10);
    if (role) db.users[idx].role = role;
    if (typeof blocked === 'boolean') db.users[idx].blocked = blocked;
    db.users[idx].updatedAt = new Date().toISOString();

    await writeDB(db);

    const safe = { ...db.users[idx] };
    delete (safe as any).passwordHash;
    return NextResponse.json(safe);
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

    const db = await readDB();
    db.users = db.users || [];
    const idx = db.users.findIndex((u: any) => u.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const removed = db.users.splice(idx, 1);
    await writeDB(db);

    return NextResponse.json({ ok: true, removed: removed[0] });
  } catch (error) {
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
