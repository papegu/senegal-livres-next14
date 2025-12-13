export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signJwt } from "@/utils/jwt";

// POST /api/auth
// Body: { action: "login" | "register", email, password, name? }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, name } = body;

    if (!action || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: action, email, password" },
        { status: 400 }
      );
    }

    // LOGIN
    if (action === "login") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 401 }
        );
      }

      const isValidPassword = await bcryptjs.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = await signJwt({
        sub: String(user.id),
        email: user.email,
        role: user.role,
      });

      const response = NextResponse.json(
        { ok: true, userId: user.id, role: user.role },
        { status: 200 }
      );

      // Set token in HTTP-only cookie
      response.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    // REGISTER
    if (action === "register") {
      if (!name) {
        return NextResponse.json(
          { error: "Name is required for registration" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 }
        );
      }

      // Hash password
      const passwordHash = await bcryptjs.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          role: "client",
        },
      });

      return NextResponse.json(
        { ok: true, userId: newUser.id, message: "User registered successfully" },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// Optional: GET for testing/verification
export async function GET(req: Request) {
  try {
    return NextResponse.json(
      { message: "Auth endpoint. POST with action: 'login' or 'register'" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json(
      { error: "Failed to get auth info" },
      { status: 500 }
    );
  }
}
