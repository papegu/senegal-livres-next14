export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/utils/jwt";
import { getCookie } from "@/utils/cookieParser";
import { v4 as uuidv4 } from "uuid";

async function isAdmin(req: Request): Promise<boolean> {
  const adminToken = req.headers.get("x-admin-token");
  if (adminToken && adminToken === process.env.ADMIN_TOKEN) return true;

  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) {
    console.log("[isAdmin] No cookie header found");
    return false;
  }

  const token = getCookie(cookieHeader, 'auth_token');
  if (!token) {
    console.log("[isAdmin] No auth_token cookie found");
    return false;
  }

  const payload = await verifyJwt(token).catch(err => {
    console.log("[isAdmin] JWT verification failed:", err);
    return null;
  });
  
  const result = !!(payload && payload.role === 'admin');
  console.log("[isAdmin submissions] JWT role:", payload?.role, "Result:", result);
  return result;
}

export async function GET(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.submission.findMany({ orderBy: { submittedAt: "desc" } });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("GET /api/admin/submissions error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId, action, coverImage } = await req.json();

    if (!submissionId || !action) {
      return NextResponse.json({ error: "Missing submissionId or action" }, { status: 400 });
    }

    const numericId = Number(submissionId);
    const sub = await prisma.submission.findFirst({
      where: {
        OR: [
          Number.isNaN(numericId) ? undefined : { id: numericId },
          { uuid: String(submissionId) },
        ].filter(Boolean) as any,
      },
    });
    if (!sub) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (action === 'approve') {
      if (!coverImage) {
        return NextResponse.json({ error: "Cover image URL required" }, { status: 400 });
      }

      await prisma.$transaction(async () => {
        await prisma.submission.update({
          where: { id: sub.id },
          data: { status: 'approved', reviewedAt: new Date() },
        });

        await prisma.book.create({
          data: {
            uuid: uuidv4(),
            title: sub.title,
            author: sub.author,
            price: (sub as any).price ? Number((sub as any).price) : 0,
            description: sub.description,
            coverImage,
            category: sub.category,
            status: 'available',
            eBook: (sub as any).eBook ?? true,
            source: 'submission',
            pdfFile: sub.pdfFile || '',
            pdfFileName: sub.pdfFileName || '',
          },
        });
      });
    } else if (action === 'reject') {
      await prisma.submission.update({
        where: { id: sub.id },
        data: { status: 'rejected', reviewedAt: new Date() },
      });
    }

    return NextResponse.json({
      ok: true,
      message: action === 'approve' ? 'Book added to catalog' : 'Submission rejected',
    });
  } catch (error) {
    console.error("PUT /api/admin/submissions error:", error);
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 });
  }
}
