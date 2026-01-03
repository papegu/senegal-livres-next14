export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

function checkAdmin(req: Request) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return true;
  const header = req.headers.get("x-admin-token");
  return header === token;
}

export async function DELETE(request: Request) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawId = searchParams.get("id");
    if (!rawId) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const numericId = Number(rawId);
    let prismaOk = false;
    if (!Number.isNaN(numericId)) {
      try { await prisma.book.delete({ where: { id: numericId } }); prismaOk = true; } catch {}
    }
    if (!prismaOk) {
      try { await prisma.book.delete({ where: { uuid: rawId } }); prismaOk = true; } catch {}
    }

    let sbError: any = null;
    if (!Number.isNaN(numericId)) {
      const { error } = await supabase.from("book").delete().eq("id", numericId);
      if (error) sbError = error;
    } else {
      const { error } = await supabase.from("book").delete().eq("uuid", rawId);
      if (error) sbError = error;
    }

    if (!prismaOk && sbError) {
      return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/books error:", error);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  try {
    let formData, body;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = await request.json();
    }

    // Sécurité minimale
    if (!body?.bookId) {
      return NextResponse.json(
        { success: false, message: "bookId is required" },
        { status: 400 }
      );
    }

    let pdfFile = body.pdfFile || '';
    let pdfFileName = body.pdfFileName || '';
    if (formData && formData.get('pdfFile')) {
      const file = formData.get('pdfFile');
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        pdfFileName = `${body.bookId}_${Date.now()}.pdf`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(pdfFileName, buffer, {
            contentType: 'application/pdf',
            upsert: true,
          });
        if (uploadError) {
          return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
        }
        pdfFile = supabase.storage.from('pdfs').getPublicUrl(pdfFileName).data.publicUrl;
      }
    }

    // Construire un payload propre sans le champ bookId (colonne inexistante)
    const {
      bookId,
      title,
      author,
      price,
      description,
      coverImage,
      status,
      eBook,
      // Cloudflare / SEO optionnels
      slug,
      cover_image_url,
      pdf_r2_key,
      pdf_r2_url,
      has_ebook,
    } = body;

    const updatePayload: Record<string, any> = {
      ...(title !== undefined ? { title: String(title) } : {}),
      ...(author !== undefined ? { author: String(author) } : {}),
      ...(description !== undefined ? { description: String(description) } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(coverImage !== undefined ? { coverImage: String(coverImage) } : {}),
      ...(status !== undefined ? { status: String(status) } : {}),
      // Sync legacy + new ebook flags
      ...(has_ebook !== undefined ? { has_ebook: !!(has_ebook === 'true' ? true : has_ebook) } : {}),
      ...(eBook !== undefined ? { eBook: !!(eBook === 'true' ? true : eBook) } : {}),
      // Cloudflare fields
      ...(slug !== undefined ? { slug: String(slug) } : {}),
      ...(cover_image_url !== undefined ? { cover_image_url: String(cover_image_url) } : {}),
      ...(pdf_r2_key !== undefined ? { pdf_r2_key: String(pdf_r2_key) } : {}),
      ...(pdf_r2_url !== undefined ? { pdf_r2_url: String(pdf_r2_url), pdfFile: String(pdf_r2_url) } : {}),
      // Uploaded PDF fields
      ...(pdfFile ? { pdfFile } : {}),
      ...(pdfFileName ? { pdfFileName } : {}),
      // Timestamps
      updated_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mise à jour du livre dans Supabase (par id)
    const { data: book, error } = await supabase
      .from('book')
      .update(updatePayload)
      .eq('id', bookId)
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
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update book" },
      { status: 500 }
    );
  }
}
// app/api/admin/books/route.ts

// ⚠️ OBLIGATOIRE : forcer Node.js (PayDunya, fs, crypto, etc.)

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let counter = 0;
  while (true) {
    const { data, error } = await supabase
      .from('book')
      .select('id, slug')
      .eq('slug', candidate)
      .limit(1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return candidate;
    }
    counter += 1;
    candidate = `${base}-${counter}`;
    if (counter > 50) throw new Error('Too many slug conflicts');
  }
}

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
    // Supporte formData pour upload PDF
    let formData, body;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = await request.json();
    }

    // 🔒 sécurité minimale
    if (!body?.title) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    // Générer un uuid côté serveur
    const uuid = uuidv4();
    let pdfFile = '';
    let pdfFileName = '';

    // Si un fichier PDF est uploadé
    if (formData && formData.get('pdfFile')) {
      const file = formData.get('pdfFile');
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        pdfFileName = `${uuid}_${Date.now()}.pdf`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(pdfFileName, buffer, {
            contentType: 'application/pdf',
            upsert: true,
          });
        if (uploadError) {
          return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
        }
        pdfFile = supabase.storage.from('pdfs').getPublicUrl(pdfFileName).data.publicUrl;
      }
    } else {
      pdfFile = body.pdfFile || '';
      pdfFileName = body.pdfFileName || '';
    }

    // Slug unique: partir de body.slug ou du titre
    const title = String(body.title || '').trim();
    const rawSlug = (body.slug ?? '').toString().trim();
    let newSlugBase = rawSlug || slugify(title);
    if (!newSlugBase) newSlugBase = `book-${Date.now()}`;
    const uniqueSlug = await ensureUniqueSlug(newSlugBase);

    // Insertion dans Supabase avec slug unique
    const insertPayload = { ...body, uuid, pdfFile, pdfFileName, slug: uniqueSlug };
    const { data: book, error } = await supabase
      .from('book')
      .insert([insertPayload])
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


