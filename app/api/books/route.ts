export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"
import { requireAdmin } from "../../../utils/AdminAuth"

/* ---------------------------------------------------
   GET /api/books
--------------------------------------------------- */
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        uuid: true,
        title: true,
        author: true,
        description: true,
        price: true,
        coverImage: true,
        pdfFile: true,
        pdfFileName: true,
        eBook: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ books })
  } catch (error: any) {
    console.error("❌ GET /api/books failed:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch books",
        details: error?.message,
      },
      { status: 500 }
    )
  }
}

/* ---------------------------------------------------
   POST /api/books (ADMIN)
--------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const authErr = await requireAdmin(req)
    if (authErr) return authErr

    const body = await req.json()
    const {
      title,
      author,
      description,
      price,
      coverImage = "",
      pdfFile = "",
      pdfFileName = "",
    } = body ?? {}

    if (!title || !author || !description || price == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const numericPrice = Number(price)
    if (Number.isNaN(numericPrice)) {
      return NextResponse.json(
        { error: "Invalid price" },
        { status: 400 }
      )
    }

    const newBook = await prisma.book.create({
      data: {
        uuid: uuidv4(),
        title,
        author,
        description,
        price: numericPrice,
        coverImage,
        pdfFile,
        pdfFileName,
      },
    })

    return NextResponse.json(newBook, { status: 201 })
  } catch (error: any) {
    console.error("❌ POST /api/books failed:", error)

    return NextResponse.json(
      {
        error: "Failed to create book",
        details: error?.message,
      },
      { status: 500 }
    )
  }
}

/* ---------------------------------------------------
   PUT /api/books (ADMIN)
--------------------------------------------------- */
export async function PUT(req: Request) {
  try {
    const authErr = await requireAdmin(req)
    if (authErr) return authErr

    const body = await req.json()
    const { id, ...data } = body ?? {}

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Valid id is required" },
        { status: 400 }
      )
    }

    const updated = await prisma.book.update({
      where: { id: Number(id) },
      data,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("❌ PUT /api/books failed:", error)

    return NextResponse.json(
      {
        error: "Failed to update book",
        details: error?.message,
      },
      { status: 500 }
    )
  }
}

/* ---------------------------------------------------
   DELETE /api/books (ADMIN)
--------------------------------------------------- */
export async function DELETE(req: Request) {
  try {
    const authErr = await requireAdmin(req)
    if (authErr) return authErr

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Valid id query parameter required" },
        { status: 400 }
      )
    }

    await prisma.book.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("❌ DELETE /api/books failed:", error)

    return NextResponse.json(
      {
        error: "Failed to delete book",
        details: error?.message,
      },
      { status: 500 }
    )
  }
}
