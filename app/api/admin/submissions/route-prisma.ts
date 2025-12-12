import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/utils/jwt';
import { requireAdmin } from '@/utils/AdminAuth';

export const dynamic = 'force-dynamic';

/**
 * GET - Liste les soumissions
 * - Utilisateur: voir ses propres soumissions
 * - Admin: voir toutes les soumissions
 */
export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    // Vérifier si admin
    const adminErr = requireAdmin(req);
    if (!adminErr) {
      // C'est un admin, retourner toutes les soumissions
      const submissions = await prisma.submission.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      return NextResponse.json(submissions);
    }

    // Sinon, retourner les soumissions de l'utilisateur
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyJWT(token);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = parseInt(payload.sub);

    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('[Submissions GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crée une nouvelle soumission (utilisateur connecté)
 */
export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyJWT(token);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, author, description, category } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: 'title and author are required' },
        { status: 400 }
      );
    }

    const userId = parseInt(payload.sub);

    const submission = await prisma.submission.create({
      data: {
        userId,
        title,
        author,
        description: description || '',
        category: category || '',
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('[Submissions POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Met à jour une soumission (admin uniquement)
 */
export async function PUT(req: Request) {
  try {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Si status change à "approved", marquer comme reviewedAt
    if (updateData.status === 'approved' || updateData.status === 'rejected') {
      updateData.reviewedAt = new Date();
    }

    const submission = await prisma.submission.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(submission);
  } catch (error: any) {
    console.error('[Submissions PUT] Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprime une soumission (admin)
 */
export async function DELETE(req: Request) {
  try {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      message: 'Submission deleted successfully',
      submission,
    });
  } catch (error: any) {
    console.error('[Submissions DELETE] Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
