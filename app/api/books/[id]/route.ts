export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function slugify(input: string): string {
  const s = (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return s || '';
}

async function ensureUniqueSlug(base: string, id: number): Promise<string> {
  let candidate = base;
  let counter = 1;
  while (true) {
    const { data, error } = await supabase
      .from('book')
      .select('id, slug')
      .eq('slug', candidate)
      .neq('id', id)
      .limit(1);
    if (error) throw error;
    if (!data || data.length === 0) return candidate;
    counter += 1;
    candidate = `${base}-${counter - 1}`; // -1, -2, ...
    if (counter > 50) throw new Error('Too many slug conflicts');
  }
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const idParam = context?.params?.id;
    const id = Number(idParam);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await req.json();

    // Read existing book to support default title for slug
    const existingRes = await supabase
      .from('book')
      .select('id, title, slug')
      .eq('id', id)
      .limit(1)
      .single();
    if (existingRes.error) {
      return NextResponse.json({ error: existingRes.error.message }, { status: 404 });
    }
    const existing = existingRes.data;

    // Slug handling: use provided slug or derive from title
    const rawSlug = (body.slug ?? '').toString().trim();
    const title = (body.title ?? existing.title ?? '').toString();
    let newSlugBase = rawSlug || slugify(title);
    if (!newSlugBase) newSlugBase = `book-${id}`;
    const uniqueSlug = await ensureUniqueSlug(newSlugBase, id);

    // Cloudflare / SEO fields
    const cover_image_url = body.cover_image_url ?? null;
    const pdf_r2_key = body.pdf_r2_key ?? null;
    const pdf_r2_url = body.pdf_r2_url ?? null;

    // Ebook flags
    const has_ebook = !!pdf_r2_url;

    // Backward compatibility
    const eBook = has_ebook;
    const pdfFile = pdf_r2_url ?? null;

    // Build update payload (only provided fields + derived)
    const updatePayload: Record<string, any> = {
      // identifiers
      slug: uniqueSlug,
      // core fields (optional: use undefined to skip if not provided)
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.author !== undefined ? { author: String(body.author) } : {}),
      ...(body.description !== undefined ? { description: String(body.description) } : {}),
      ...(body.price !== undefined ? { price: Number(body.price) } : {}),
      ...(body.status !== undefined ? { status: String(body.status) } : {}),
      ...(body.stock !== undefined ? { stock: Number(body.stock) } : {}),
      ...(body.category !== undefined ? { category: String(body.category) } : {}),

      // Cloudflare fields
      cover_image_url,
      pdf_r2_key,
      pdf_r2_url,

      // ebook flags (new + legacy)
      has_ebook,
      eBook,
      pdfFile,

      // timestamps
      updated_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Perform update
    const { data, error } = await supabase
      .from('book')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, book: data });
  } catch (err: any) {
    console.error('[Books PATCH] Error:', err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
