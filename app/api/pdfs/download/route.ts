export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

    // Get book to check for Supabase pdfFile URL
    const book = await prisma.book.findUnique({
      where: { id: bookIdInt },
      select: { pdfFile: true, title: true },
    });

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    // Priority 1: If Supabase URL exists, redirect to it
    if (book.pdfFile && book.pdfFile.trim() !== "") {
      return Response.redirect(book.pdfFile, 302);
    }

    // Priority 2: Fallback to local storage for backward compatibility
    const pdfPath = join(process.cwd(), "public", "pdfs", `${bookIdInt}.pdf`);

    if (!existsSync(pdfPath)) {
      return Response.json({ error: "PDF not found" }, { status: 404 });
    }

    const pdfData = await readFile(pdfPath);

    // Sanitize book title for use in filename
    const sanitizedTitle = book.title
      ? book.title.replace(/[/\\:*?"<>|]/g, '_')
      : String(bookIdInt);

    return new Response(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${sanitizedTitle}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/pdfs/download error:", error);
    return Response.json({ error: "Failed to download PDF" }, { status: 500 });
  }
}
