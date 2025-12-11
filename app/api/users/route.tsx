// app/api/users/route.ts
import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../utils/fileDb";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../../../utils/AdminAuth";

/**
 * GET -> lister utilisateurs (admin)
 * POST -> créer utilisateur (open or admin) : ici on autorise création publique (register)
 * PUT -> update user (admin)
 * DELETE -> delete user (admin)
 */

// GET (admin)
export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const db = await readDB();
  return NextResponse.json(db.users || []);
}

// POST -> création utilisateur (inscription publique)
export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, role } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const db = await readDB();
  db.users = db.users || [];

  const exists = db.users.find((u: any) => u.email === email);
  if (exists) {
    return NextResponse.json({ error: "Email already used" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  const user = {
    id: uuid(),
    name: name || "",
    email,
    passwordHash,
    role: role || "client",
    createdAt: now,
    updatedAt: now,
  };

  db.users.push(user);
  await writeDB(db);

  // Do not return passwordHash to client
  const safe = { ...user };
  delete (safe as any).passwordHash;
  return NextResponse.json(safe, { status: 201 });
}

// PUT -> update user (admin)
export async function PUT(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const db = await readDB();
  db.users = db.users || [];
  const idx = db.users.findIndex((u: any) => u.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // If password provided, hash it
  if (body.password) {
    body.passwordHash = await bcrypt.hash(body.password, 10);
    delete body.password;
  }

  const updated = { ...db.users[idx], ...body, updatedAt: new Date().toISOString() };
  db.users[idx] = updated;
  await writeDB(db);

  const safe = { ...updated };
  delete (safe as any).passwordHash;
  return NextResponse.json(safe);
}

// DELETE -> delete user (admin)
export async function DELETE(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = await readDB();
  db.users = db.users || [];
  const idx = db.users.findIndex((u: any) => u.id === id);
  if (idx === -1) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const removed = db.users.splice(idx, 1);
  await writeDB(db);

  return NextResponse.json({ ok: true, removed: removed[0] });
}
