import { readDB, writeDB } from "@/utils/fileDb";
import { NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { getCookie } from "@/utils/cookieParser";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

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

    const db = await readDB();
    const submissions = (db.submissions || []).sort((a: any, b: any) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

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

    const db = await readDB();
    db.submissions = db.submissions || [];
    db.books = db.books || [];

    const submissionIdx = db.submissions.findIndex((s: any) => s.id === submissionId);
    if (submissionIdx === -1) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submission = db.submissions[submissionIdx];

    if (action === 'approve') {
      if (!coverImage) {
        return NextResponse.json({ error: "Cover image URL required" }, { status: 400 });
      }

      // Add book to catalog
      const newBook = {
        id: uuidv4(),
        title: submission.title,
        author: submission.author,
        price: submission.price,
        description: submission.description,
        coverImage,
        category: submission.category,
        status: 'available',
        eBook: submission.eBook || false,
        source: 'submission', // Track that this came from a submission
      };

      db.books.push(newBook);
      submission.status = 'approved';
    } else if (action === 'reject') {
      submission.status = 'rejected';
    }

    await writeDB(db);

    return NextResponse.json({
      ok: true,
      message: action === 'approve' ? 'Book added to catalog' : 'Submission rejected',
    });
  } catch (error) {
    console.error("PUT /api/admin/submissions error:", error);
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 });
  }
}
