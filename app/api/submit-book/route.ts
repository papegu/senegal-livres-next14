export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File;
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const priceRaw = formData.get('price') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const eBook = formData.get('eBook') === 'true';
    // Nouveaux champs optionnels
    const slug = (formData.get('slug') as string) || '';
    const cover_image_url = (formData.get('cover_image_url') as string) || '';
    const pdf_r2_key = (formData.get('pdf_r2_key') as string) || '';
    const pdf_r2_url = (formData.get('pdf_r2_url') as string) || '';
    const has_ebook = formData.get('has_ebook') === 'true';
    const authorEmail = (formData.get('authorEmail') as string) || '';
    const authorPhone = (formData.get('authorPhone') as string) || '';
    const address = (formData.get('address') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (!title || !author || !priceRaw || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    // Normalize & validate price (allow comma)
    const priceStr = String(priceRaw).replace(/\s/g, '').replace(',', '.');
    const price = parseFloat(priceStr);
    if (!Number.isFinite(price)) {
      return NextResponse.json({ error: 'Invalid price format' }, { status: 400 });
    }
    if (price < 0 || price > 1500) {
      return NextResponse.json({ error: 'Price must be between 0 and 1500 euros' }, { status: 400 });
    }

    // Upload PDF to Supabase Storage (avoid filesystem writes in serverless)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `submission_${uuidv4()}_${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filename, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
    const publicUrl = supabase.storage.from('pdfs').getPublicUrl(filename).data.publicUrl;

    // Create submission record in database
    // Encapsuler les champs additionnels dans reviewNotes au format JSON
    const extra = {
      price,
      eBook,
      slug,
      cover_image_url,
      pdf_r2_key,
      pdf_r2_url,
      has_ebook,
      authorEmail,
      authorPhone,
      address,
    };

    const submission = await prisma.submission.create({
      data: {
        uuid: uuidv4(),
        userId: 0, // anonymous submitter placeholder
        title,
        author,
        description,
        category,
        pdfFile: publicUrl,
        pdfFileName: filename,
        status: 'pending',
        reviewNotes: JSON.stringify(extra),
      },
    });

    return NextResponse.json(
      { ok: true, submission, message: 'Book submitted successfully for review' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/submit-book error:', error);
    return NextResponse.json(
      { error: 'Failed to submit book' },
      { status: 500 }
    );
  }
}
