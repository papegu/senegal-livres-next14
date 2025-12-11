import { readDB } from "@/utils/fileDb";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

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

    // Check if user has purchased this book
    const db = await readDB();
    const purchases = (db.purchases || []).filter(
      (p: any) => p.userId === payload.sub && p.bookIds.includes(bookId)
    );

    if (purchases.length === 0) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    // Serve PDF file
    const pdfPath = join(process.cwd(), "public", "pdfs", `${bookId}.pdf`);

    if (!existsSync(pdfPath)) {
      return Response.json({ error: "PDF not found" }, { status: 404 });
    }

    const pdfData = await readFile(pdfPath);

    return new Response(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${bookId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/pdfs/download error:", error);
    return Response.json({ error: "Failed to download PDF" }, { status: 500 });
  }
}
