export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const fetchCache = "force-no-store";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { cookies } from "next/headers";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(req: Request) {
  try {
    // Safety check for build time
    if (!prisma) {
      return Response.json({ error: "Database not available" }, { status: 503 });
    }

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

    // Serve PDF file
    const pdfPath = join(process.cwd(), "public", "pdfs", `${bookIdInt}.pdf`);

    if (!existsSync(pdfPath)) {
      return Response.json({ error: "PDF not found" }, { status: 404 });
    }

    const pdfData = await readFile(pdfPath);

    return new Response(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${bookIdInt}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/pdfs/download error:", error);
    return Response.json({ error: "Failed to download PDF" }, { status: 500 });
  }
}
