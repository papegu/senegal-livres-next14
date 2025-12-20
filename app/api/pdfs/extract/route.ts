export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { readFile, writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { PDFDocument } from "pdf-lib";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    if (!bookId) {
      return Response.json({ error: "bookId required" }, { status: 400 });
    }

    // On suppose que le PDF est stocké dans public/pdfs/{bookId}.pdf
    const pdfPath = join(process.cwd(), "public", "pdfs", `${bookId}.pdf`);
    if (!existsSync(pdfPath)) {
      return Response.json({ error: "PDF not found" }, { status: 404 });
    }

    // Lire le PDF original
    const pdfBytes = await readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();
    const extractPages = Math.min(2, totalPages); // 2 pages max

    // Créer un nouveau PDF avec les premières pages
    const newPdf = await PDFDocument.create();
    for (let i = 0; i < extractPages; i++) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
    }
    const newPdfBytes = await newPdf.save();

    return new Response(newPdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="extrait_${bookId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/pdfs/extract error:", error);
    return Response.json({ error: "Failed to extract PDF" }, { status: 500 });
  }
}
