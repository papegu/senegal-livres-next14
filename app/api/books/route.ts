export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const fetchCache = "force-no-store";
export const dynamicParams = true;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import { requireAdmin } from "../../../utils/AdminAuth";

export async function GET() {
  try {
    // Safety check for build time
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const books = await prisma.book.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ books });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Safety check for build time
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const { title, author, description, price, coverImage, pdfFile, pdfFileName } = body as any;
    if (!title || !author || !description || !price) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newBook = await prisma.book.create({
      data: {
        uuid: uuid(),
        title,
        author,
        description,
        price: Number(price),
        coverImage: coverImage || "",
        pdfFile: pdfFile || "",
        pdfFileName: pdfFileName || "",
      },
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // Safety check for build time
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const { id, ...data } = body as any;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updated = await prisma.book.update({ where: { id: Number(id) }, data });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  // Safety check for build time
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });

    await prisma.book.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}