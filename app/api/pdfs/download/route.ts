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

    // Verify user has purchased this book
    const purchase = await prisma.purchase.findFirst({
      where: { userId, bookId: bookIdInt },
    });

    if (!purchase) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    // Get book to check for pdfFile (Supabase URL)
    const book = await prisma.book.findUnique({
      where: { id: bookIdInt },
      select: { pdfFile: true, title: true },
    });

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    // Priority 1: Use Supabase pdfFile URL if available
    if (book.pdfFile && book.pdfFile.trim() !== '') {
      // If pdfFile is a full URL (Supabase Storage), redirect to it
      if (book.pdfFile.startsWith('http://') || book.pdfFile.startsWith('https://')) {
        console.log(`[PDF Download] Redirecting to Supabase URL for book ${bookIdInt}`);
        
        // Fetch the PDF from Supabase and stream it
        try {
          const pdfResponse = await fetch(book.pdfFile);
          if (!pdfResponse.ok) {
            throw new Error(`Failed to fetch PDF from Supabase: ${pdfResponse.status}`);
          }
          
          const pdfData = await pdfResponse.arrayBuffer();
          // Sanitize filename to prevent header injection
          const safeFilename = (book.title || String(bookIdInt))
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '_')      // Replace spaces with underscores
            .substring(0, 100);        // Limit length
          
          return new Response(pdfData, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${safeFilename}.pdf"`,
            },
          });
        } catch (fetchError) {
          console.error(`[PDF Download] Error fetching from Supabase:`, fetchError);
          // Fall through to local storage fallback
        }
      }
    }

    // Priority 2: Fallback to local file storage
    console.log(`[PDF Download] Using local storage for book ${bookIdInt}`);
    const pdfPath = join(process.cwd(), "public", "pdfs", `${bookIdInt}.pdf`);

    if (!existsSync(pdfPath)) {
      return Response.json({ error: "PDF not found" }, { status: 404 });
    }

    const pdfData = await readFile(pdfPath);
    
    // Sanitize filename to prevent header injection
    const safeFilename = (book.title || String(bookIdInt))
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '_')      // Replace spaces with underscores
      .substring(0, 100);        // Limit length

    return new Response(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/pdfs/download error:", error);
    return Response.json({ error: "Failed to download PDF" }, { status: 500 });
  }
}
