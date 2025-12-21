export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
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
    const price = formData.get('price') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const eBook = formData.get('eBook') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (!title || !author || !price || !category) {
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

    const filename = `submission_${uuidv4()}.pdf`;
    let pdfUrl = '';

    // Try to upload to Supabase if configured
    if (supabase) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { data, error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(filename, buffer, {
            contentType: 'application/pdf',
            upsert: false,
          });
        
        if (!uploadError && data) {
          pdfUrl = supabase.storage.from('pdfs').getPublicUrl(filename).data.publicUrl;
          console.log('[SubmitBook] Uploaded to Supabase:', pdfUrl);
        } else {
          console.warn('[SubmitBook] Supabase upload failed, falling back to local:', uploadError?.message);
        }
      } catch (err) {
        console.warn('[SubmitBook] Supabase error, falling back to local:', err);
      }
    }

    // Fallback to local storage if Supabase failed or not configured
    if (!pdfUrl) {
      const submissionsDir = join(process.cwd(), 'public', 'submissions');
      try {
        await mkdir(submissionsDir, { recursive: true });
      } catch (err) {
        console.error('Error creating submissions directory:', err);
      }

      const filepath = join(submissionsDir, filename);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
      pdfUrl = `/submissions/${filename}`;
      console.log('[SubmitBook] Saved locally:', pdfUrl);
    }

    // Create submission record in database
    const submission = await prisma.submission.create({
      data: {
        uuid: uuidv4(),
        userId: 0, // anonymous submitter placeholder
        title,
        author,
        description,
        category,
        pdfFile: pdfUrl,
        pdfFileName: filename,
        status: 'pending',
        reviewNotes: `price=${price || ''}; ebook=${eBook}`,
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
