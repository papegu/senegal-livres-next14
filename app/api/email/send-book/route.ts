import { NextResponse } from 'next/server';
import { readDB } from '@/utils/fileDb';
import fs from 'fs';
import path from 'path';

// Configuration pour envoyer les PDFs par email
// Note: Pour production, utilisez Resend ou SendGrid
// npm install resend @sendgrid/mail

export async function POST(req: Request) {
  try {
    const { email, bookIds, userEmail, transactionId } = await req.json();

    if (!email || !bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json(
        { message: 'Missing email or bookIds' },
        { status: 400 }
      );
    }

    const db = await readDB();
    
    // Récupérer les livres demandés
    const books = (db.books || []).filter((b: any) => 
      bookIds.includes(b.id) && b.eBook && b.pdfFile
    );

    if (books.length === 0) {
      console.warn('[SendBook] No eBooks with PDF found for:', bookIds);
      // Retourner OK même s'il n'y a pas de PDF (paiement est validé)
      return NextResponse.json({ ok: true, message: 'No eBooks to send' });
    }

    console.log('[SendBook] Sending PDFs to:', email, 'Books:', books.length);

    // Pour développement: afficher les infos
    console.log('[SendBook] Email should be sent to:', email);
    console.log('[SendBook] Books to send:', books.map((b: any) => b.title));
    console.log('[SendBook] Transaction:', transactionId);
    
    // TODO: Implémenter avec Resend ou SendGrid en production
    // Pour l'instant, on log simplement que le paiement est confirmé
    
    return NextResponse.json({ 
      ok: true, 
      message: 'Payment confirmed - eBooks ready for download',
      sent: books.length,
      note: 'In production, implement email service (Resend/SendGrid)'
    });

  } catch (error) {
    console.error('[SendBook] Error:', error);
    // Retourner OK car l'email n'est pas critique pour le paiement
    return NextResponse.json({ 
      ok: true, 
      message: 'Error sending email, but payment confirmed',
      error: String(error)
    });
  }
}
