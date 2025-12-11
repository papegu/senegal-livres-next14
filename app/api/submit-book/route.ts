import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readDB, writeDB } from '@/utils/fileDb';

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

    // Create submissions directory if it doesn't exist
    const submissionsDir = join(process.cwd(), 'public', 'submissions');
    try {
      await mkdir(submissionsDir, { recursive: true });
    } catch (err) {
      console.error('Error creating submissions directory:', err);
    }

    // Generate unique filename
    const filename = `${uuidv4()}.pdf`;
    const filepath = join(submissionsDir, filename);

    // Save the PDF file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create submission record in database
    const db = await readDB();
    db.submissions = db.submissions || [];

    const submission = {
      id: uuidv4(),
      title,
      author,
      price: Number(price),
      description,
      category,
      eBook,
      filename,
      pdfPath: `/submissions/${filename}`,
      status: 'pending', // pending, approved, rejected
      submittedAt: new Date().toISOString(),
      submitterEmail: 'anonymous', // Could add user email if authenticated
    };

    db.submissions.push(submission);
    await writeDB(db);

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
