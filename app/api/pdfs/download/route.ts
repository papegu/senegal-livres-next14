export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { NextResponse } from "next/server";
import { isValidHttpUrl } from "@/utils/url";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return Response.json({ error: "bookId required" }, { status: 400 });
    }

    const userId = Number(payload.sub);
    if (Number.isNaN(userId)) {
      return Response.json({ error: "Invalid user" }, { status: 400 });
    }

    const bookIdInt = Number(bookId);
    if (Number.isNaN(bookIdInt)) {
      return Response.json({ error: "Invalid bookId" }, { status: 400 });
    }

    const purchase = await prisma.purchase.findFirst({
      where: { userId, bookId: bookIdInt },
    });

    if (!purchase) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch book to get pdfFile URL (Supabase) or fallback to legacy path
    const book = await prisma.book.findUnique({
      where: { id: bookIdInt },
      select: { pdfFile: true, title: true },
    });

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    // If pdfFile exists (Supabase URL), redirect to it
    if (isValidHttpUrl(book.pdfFile)) {
      return NextResponse.redirect(book.pdfFile);
    }

    // Fallback: serve from local public/pdfs directory (legacy)
    const pdfPath = join(process.cwd(), "public", "pdfs", `${bookIdInt}.pdf`);

    if (!existsSync(pdfPath)) {
      return Response.json({ error: "PDF not found" }, { status: 404 });
    }

    const pdfData = await readFile(pdfPath);
    const fileName = book.title ? `${book.title}.pdf` : `${bookIdInt}.pdf`;

    return new Response(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/pdfs/download error:", error);
    return Response.json({ error: "Failed to download PDF" }, { status: 500 });
  }
}
