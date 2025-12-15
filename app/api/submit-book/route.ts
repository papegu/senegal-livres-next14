export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${uuidv4()}.pdf`;
    
    let pdfFileUrl = '';
    let pdfFileName = filename;

    // Priority 1: Upload to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        console.log('[Submit Book] Uploading to Supabase Storage...');
        const { data, error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(`submissions/${filename}`, buffer, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (uploadError) {
          console.error('[Submit Book] Supabase upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('pdfs')
          .getPublicUrl(`submissions/${filename}`);

        pdfFileUrl = publicUrl;
        console.log('[Submit Book] Successfully uploaded to Supabase:', publicUrl);
      } catch (supabaseError) {
        console.error('[Submit Book] Failed to upload to Supabase, falling back to local storage:', supabaseError);
        // Fall through to local storage
      }
    }

    // Priority 2: Fallback to local storage if Supabase failed or not configured
    if (!pdfFileUrl) {
      console.log('[Submit Book] Using local file storage...');
      const submissionsDir = join(process.cwd(), 'public', 'submissions');
      try {
        await mkdir(submissionsDir, { recursive: true });
      } catch (err) {
        console.error('Error creating submissions directory:', err);
      }

      const filepath = join(submissionsDir, filename);
      await writeFile(filepath, buffer);
      pdfFileUrl = `/submissions/${filename}`;
      console.log('[Submit Book] Saved to local storage:', pdfFileUrl);
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
        pdfFile: pdfFileUrl,
        pdfFileName: pdfFileName,
        status: 'pending',
        reviewNotes: `price=${price || ''}; ebook=${eBook}`,
      },
    });

    return NextResponse.json(
      { ok: true, submission, message: 'Book submitted successfully for review' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Submit Book] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit book' },
      { status: 500 }
    );
  }
}
