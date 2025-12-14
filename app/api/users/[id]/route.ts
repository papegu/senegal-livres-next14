export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/utils/AdminAuth';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET - Récupère un utilisateur par ID
 */
export async function GET(req: Request, { params }: RouteParams) {
  // Safety check for build time
  if (!prisma) {
    console.log("[User Detail API] Prisma client not available");
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[User GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Met à jour un utilisateur par ID (admin uniquement)
 */
export async function PUT(req: Request, { params }: RouteParams) {
  // Safety check for build time
  if (!prisma) {
    console.log("[User Detail API] Prisma client not available");
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  try {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, password } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('[User PUT] Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprime un utilisateur par ID (admin uniquement)
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  // Safety check for build time
  if (!prisma) {
    console.log("[User Detail API] Prisma client not available");
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  try {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur
    const user = await prisma.user.delete({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: 'User deleted successfully', user },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[User DELETE] Error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
