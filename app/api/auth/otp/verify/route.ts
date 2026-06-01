import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const token = await prisma.otpToken.findUnique({ where: { email } });

    if (!token) {
      return NextResponse.json({ error: "OTP not found. Please request a new one." }, { status: 404 });
    }

    if (token.verified) {
      return NextResponse.json({ error: "OTP already used" }, { status: 400 });
    }

    if (new Date() > token.expiresAt) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (token.otp !== otp) {
      return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 });
    }

    await prisma.otpToken.update({
      where: { email },
      data: { verified: true },
    });

    return NextResponse.json({ message: "Email verified", name: token.name }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/auth/otp/verify]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
