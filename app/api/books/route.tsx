// app/api/books/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import { requireAdmin } from "../../../utils/AdminAuth";

// GET /api/books -> liste publique des livres
export async function GET() {
  const books = await prisma.book.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ books });
}

// POST /api/books -> créer un livre (admin)
export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const body = await req.json();
  const newBook = await prisma.book.create({
    data: {
      uuid: uuid(),
      title: body.title || "Untitled",
      author: body.author || "",
      description: body.description || "",
      price: typeof body.price === "number" ? body.price : 0,
      coverImage: body.coverImage || "/covers/default.jpg",
      stock: typeof body.stock === "number" ? body.stock : 0,
      category: body.category || "",
      status: body.status || "available",
      eBook: typeof body.eBook === "boolean" ? body.eBook : true,
      source: body.source || "admin",
      pdfFile: body.pdfFile || "",
      pdfFileName: body.pdfFileName || "",
    },
  });

  return NextResponse.json(newBook, { status: 201 });
}

// PUT /api/books -> mise à jour (admin)
// attend body { id: "...", ...fields }
export async function PUT(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Missing book id" }, { status: 400 });

  // Allow referencing by numeric id or uuid
  const whereClause = Number.isNaN(Number(body.id))
    ? { uuid: String(body.id) }
    : { id: Number(body.id) };

  const updated = await prisma.book.update({
    where: whereClause,
    data: {
      title: body.title,
      author: body.author,
      description: body.description,
      price: typeof body.price === "number" ? body.price : undefined,
      coverImage: body.coverImage,
      stock: typeof body.stock === "number" ? body.stock : undefined,
      category: body.category,
      status: body.status,
      eBook: typeof body.eBook === "boolean" ? body.eBook : undefined,
      source: body.source,
      pdfFile: body.pdfFile,
      pdfFileName: body.pdfFileName,
    },
  }).catch(() => null);

  if (!updated) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  return NextResponse.json(updated);
}

// DELETE /api/books?id=... -> suppression (admin)
export async function DELETE(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const whereClause = Number.isNaN(Number(id)) ? { uuid: id } : { id: Number(id) };
  const removed = await prisma.book.delete({ where: whereClause }).catch(() => null);
  if (!removed) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  return NextResponse.json({ ok: true, removed });
}
