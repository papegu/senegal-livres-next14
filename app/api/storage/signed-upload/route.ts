export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const contentType = (body?.contentType as string) || 'application/pdf';
    const originalName = (body?.filename as string) || 'upload.pdf';

    // Generate a unique storage path
    const ext = originalName.toLowerCase().endsWith('.pdf') ? '.pdf' : '';
    const path = `submissions/${uuidv4()}_${Date.now()}${ext || '.pdf'}`;

    const { data, error } = await supabase.storage
      .from('pdfs')
      .createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to create signed upload URL' }, { status: 500 });
    }

    const { token, signedUrl } = data as any;
    const publicUrl = supabase.storage.from('pdfs').getPublicUrl(path).data.publicUrl;

    return NextResponse.json({ path, token, signedUrl, publicUrl, contentType });
  } catch (err) {
    console.error('POST /api/storage/signed-upload error:', err);
    return NextResponse.json({ error: 'Failed to create signed upload URL' }, { status: 500 });
  }
}
