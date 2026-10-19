import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, generateAuthToken, AUTH_COOKIE_NAME, getAdminEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email ID and Password are required." },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Admin ID or Password. Access denied." },
        { status: 401 }
      );
    }

    const token = generateAuthToken(email);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      user: {
        email: getAdminEmail(),
        role: "admin",
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Authentication failed." },
      { status: 500 }
    );
  }
}
