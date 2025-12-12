export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { ok: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the auth_token cookie
    response.cookies.set({
      name: "auth_token",
      value: "",
      maxAge: 0,
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
