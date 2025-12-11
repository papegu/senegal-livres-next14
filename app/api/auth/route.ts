import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../utils/fileDb";
import { v4 as uuid } from "uuid";
import bcryptjs from "bcryptjs";
import { signJwt } from "../../../utils/jwt";

// POST /api/auth
// Body: { action: "login" | "register", email, password, name? }
export async function POST(req: Request) {
  const body = await req.json();
  const { action, email, password, name } = body;

  if (!action || !email || !password) {
    return NextResponse.json(
      { error: "Missing required fields: action, email, password" },
      { status: 400 }
    );
  }

  const db = await readDB();
  db.users = db.users || [];

  // LOGIN
  if (action === "login") {
    const user = db.users.find((u: any) => u.email === email);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcryptjs.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signJwt({
      sub: user.id,
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
    if (db.users.some((u: any) => u.email === email)) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    const newUser = {
      id: uuid(),
      name,
      email,
      passwordHash,
      role: "client",
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    await writeDB(db);

    return NextResponse.json(
      { ok: true, userId: newUser.id, message: "User registered successfully" },
      { status: 201 }
    );
  }

  return NextResponse.json(
    { error: "Invalid action" },
    { status: 400 }
  );
}

// Optional: GET for testing/verification
export async function GET(req: Request) {
  return NextResponse.json(
    { message: "Auth endpoint. POST with action: 'login' or 'register'" },
    { status: 200 }
  );
}
