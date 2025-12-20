// app/api/admin/books/route.ts
import { NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';

// ⚠️ OBLIGATOIRE : forcer Node.js (PayDunya, fs, crypto, etc.)
export const runtime = "nodejs";

export async function GET() {
  try {
    // Récupérer tous les livres depuis Supabase
    const { data: books, error } = await supabase
      .from('book')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    // Mapper les champs pour compatibilité front (id string, etc.)
    const mappedBooks = (books || []).map((b) => ({
      ...b,
      id: b.id?.toString?.() ?? b.uuid ?? '',
      price: typeof b.price === 'number' ? b.price : Number(b.price) || 0,
      eBook: b.eBook ?? false,
      status: b.status ?? 'available',
    }));
    return NextResponse.json(
      { success: true, books: mappedBooks },
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

    // Insertion dans Supabase
    const { data: book, error } = await supabase
      .from('book')
      .insert([{ ...body }])
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: true, book },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create book" },
      { status: 500 }
    );
  }
}

