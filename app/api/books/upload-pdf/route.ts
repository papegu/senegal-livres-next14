export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/utils/jwt';
import { cookies } from 'next/headers';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Vérifier que l'utilisateur est admin
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const userId = Number(payload.sub);
    const user = Number.isNaN(userId) ? null : await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    // Récupérer le formulaire
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bookId = formData.get('bookId') as string;

    if (!file || !bookId) {
      return NextResponse.json({ message: 'Missing file or bookId' }, { status: 400 });
    }

    // Vérifier que c'est un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ message: 'File must be a PDF' }, { status: 400 });
    }

    // Vérifier la taille (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ message: 'File too large (max 50MB)' }, { status: 413 });
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ 
        message: 'Supabase Storage not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.' 
      }, { status: 500 });
    }

    // Upload PDF to Supabase Storage
    const fileName = `${bookId}_${Date.now()}.pdf`;
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const { data, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ message: 'Supabase upload failed', error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from('pdfs').getPublicUrl(fileName);

    // Mettre à jour la base de données
    const bookWhere = Number.isNaN(Number(bookId)) ? { uuid: bookId } : { id: Number(bookId) };
    const updated = await prisma.book.update({
      where: bookWhere,
      data: {
        pdfFile: publicUrl,
        pdfFileName: fileName,
      },
    }).catch(() => null);

    if (!updated) {
      return NextResponse.json({ message: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: 'PDF uploaded successfully to Supabase',
      book: updated,
      pdfUrl: publicUrl,
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}
