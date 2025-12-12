import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/fileDb';
import { verifyJwt } from '@/utils/jwt';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

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
    const db = await readDB();
    const user = (db.users || []).find((u: any) => u.id === payload.sub);
    
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

    // Créer le dossier pdfs s'il n'existe pas
    const pdfDir = path.join(process.cwd(), 'public', 'pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Sauvegarder le fichier
    const fileName = `${bookId}_${Date.now()}.pdf`;
    const filePath = path.join(pdfDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Mettre à jour la base de données
    const bookIndex = (db.books || []).findIndex((b: any) => b.id === bookId);
    
    if (bookIndex === -1) {
      return NextResponse.json({ message: 'Book not found' }, { status: 404 });
    }

    // Mettre à jour le livre avec le chemin du PDF
    db.books[bookIndex].pdfFile = `/pdfs/${fileName}`;
    db.books[bookIndex].pdfFileName = fileName;

    await writeDB(db);

    return NextResponse.json({
      ok: true,
      message: 'PDF uploaded successfully',
      book: db.books[bookIndex],
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}
