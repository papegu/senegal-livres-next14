export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { existsSync } from 'fs';
import { join } from 'path';

// Configuration pour envoyer les PDFs par email
// Note: Pour production, utilisez Resend ou SendGrid
// npm install resend @sendgrid/mail

export async function POST(req: Request) {
  try {
    const { email, bookIds, userEmail, transactionId, location } = await req.json();

    if (!email || !bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json(
        { message: 'Missing email or bookIds' },
        { status: 400 }
      );
    }

    const numericIds = bookIds.map((b: any) => Number(b)).filter((n: number) => !Number.isNaN(n));
    const books = await prisma.book.findMany({ where: { id: { in: numericIds } } });

    if (books.length === 0) {
      console.warn('[SendBook] No eBooks with PDF found for:', bookIds);
      // Retourner OK même s'il n'y a pas de PDF (paiement est validé)
      return NextResponse.json({ ok: true, message: 'No eBooks to send' });
    }

    console.log('[SendBook] Preparing delivery to:', email, 'Books:', books.length);

    // Pour développement: afficher les infos
    console.log('[SendBook] Email should be sent to:', email);
    console.log('[SendBook] Books to deliver:', books.map((b: any) => b.title));
    console.log('[SendBook] Transaction:', transactionId);
    if (location?.lat && location?.lon) {
      console.log('[SendBook] Client location:', location);
    }
    // Construire les liens de téléchargement en utilisant pdfFile (Supabase) si disponible
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const deliveries = books.map((b: any) => {
      // Priority 1: Use Supabase pdfFile URL if available
      const hasPdf = !!(b.pdfFile && b.pdfFile.trim() !== '');
      let downloadUrl = null;
      
      if (hasPdf) {
        // Use Supabase URL directly for authenticated download
        downloadUrl = b.pdfFile;
      } else {
        // Priority 2: Check local storage for backward compatibility
        const pdfPath = join(process.cwd(), 'public', 'pdfs', `${b.id}.pdf`);
        const hasLocalPdf = existsSync(pdfPath);
        if (hasLocalPdf) {
          downloadUrl = `${baseUrl}/api/pdfs/download?bookId=${encodeURIComponent(b.id)}`;
        }
      }
      
      return {
        bookId: b.id,
        title: b.title,
        hasPdf: hasPdf || downloadUrl !== null,
        downloadUrl,
      };
    });

    // Calculer une ETA basique (si localisation fournie et pas de PDF)
    let etaMinutes: number | null = null;
    const anyPhysical = deliveries.some((d: any) => !d.hasPdf);
    if (anyPhysical) {
      // Heuristique simple: 30 min intra-ville, 120 min hors-ville
      const { lat, lon } = location || {};
      // Coordonnées approximatives de Dakar centre
      const dakar = { lat: 14.6937, lon: -17.4441 };
      if (typeof lat === 'number' && typeof lon === 'number') {
        // Distance approximative via formule haversine simplifiée
        const toRad = (v: number) => (v * Math.PI) / 180;
        const R = 6371; // km
        const dLat = toRad((lat as number) - dakar.lat);
        const dLon = toRad((lon as number) - dakar.lon);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(dakar.lat)) * Math.cos(toRad(lat as number)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distKm = R * c;
        etaMinutes = distKm <= 10 ? 30 : distKm <= 50 ? 90 : 180;
      } else {
        etaMinutes = 120;
      }
    }

    // TODO: Intégrer un service email (Resend/SendGrid) en PROD
    // Réponse avec liens pour que le frontend envoie l'email ou affiche
    return NextResponse.json({
      ok: true,
      message: anyPhysical
        ? 'Payment confirmed - delivery ETA provided'
        : 'Payment confirmed - eBooks ready for download',
      deliveries,
      etaMinutes,
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
