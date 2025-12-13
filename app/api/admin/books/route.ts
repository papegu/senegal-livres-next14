// app/api/admin/books/route.ts
import { NextResponse } from "next/server";

// ⚠️ OBLIGATOIRE : forcer Node.js (PayDunya, fs, crypto, etc.)
export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(
      { success: true, books: [] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 🔒 sécurité minimale
    if (!body?.title) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, book: body },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create book" },
      { status: 500 }
    );
  }
}

