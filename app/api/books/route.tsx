// app/api/books/route.ts
import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../utils/fileDb";
import { v4 as uuid } from "uuid";
import { requireAdmin } from "../../../utils/AdminAuth";

// GET /api/books -> liste publique des livres
export async function GET() {
  const db = await readDB();
  return NextResponse.json({ books: db.books || [] });
}

// POST /api/books -> créer un livre (admin)
export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const body = await req.json();
  const db = await readDB();

  const now = new Date().toISOString();
  const newBook = {
    id: uuid(),
    title: body.title || "Untitled",
    author: body.author || "",
    description: body.description || "",
    price: typeof body.price === "number" ? body.price : 0,
    coverImage: body.coverImage || "/covers/default.jpg",
    stock: typeof body.stock === "number" ? body.stock : 0,
    category: body.category || "",
    createdAt: now,
    updatedAt: now,
  };

  db.books = db.books || [];
  db.books.push(newBook);
  await writeDB(db);

  return NextResponse.json(newBook, { status: 201 });
}

// PUT /api/books -> mise à jour (admin)
// attend body { id: "...", ...fields }
export async function PUT(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Missing book id" }, { status: 400 });

  const db = await readDB();
  db.books = db.books || [];
  const idx = db.books.findIndex((b: any) => b.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const updated = { ...db.books[idx], ...body, updatedAt: new Date().toISOString() };
  db.books[idx] = updated;
  await writeDB(db);

  return NextResponse.json(updated);
}

// DELETE /api/books?id=... -> suppression (admin)
export async function DELETE(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = await readDB();
  db.books = db.books || [];
  const idx = db.books.findIndex((b: any) => b.id === id);
  if (idx === -1) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const removed = db.books.splice(idx, 1);
  await writeDB(db);

  return NextResponse.json({ ok: true, removed: removed[0] });
}
