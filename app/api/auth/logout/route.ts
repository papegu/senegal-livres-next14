export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { isProduction } from "@/utils/environment";

export async function POST() {
  try {
    const response = NextResponse.json(
      { ok: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the auth_token cookie with same settings as login
    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax",
      maxAge: 0,
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
