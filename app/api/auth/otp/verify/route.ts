import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 min

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

    // Check lockout
    if (token.lockedUntil && new Date() < token.lockedUntil) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    if (token.otp !== otp) {
      const newAttempts = token.attempts + 1;
      const locked = newAttempts >= MAX_ATTEMPTS;
      await prisma.otpToken.update({
        where: { email },
        data: {
          attempts: newAttempts,
          lockedUntil: locked ? new Date(Date.now() + LOCKOUT_MS) : null,
        },
      });
      if (locked) {
        return NextResponse.json(
          { error: "Too many failed attempts. Your OTP has been locked for 15 minutes." },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 });
    }

    await prisma.otpToken.update({
      where: { email },
      data: { verified: true, attempts: 0, lockedUntil: null },
    });

    return NextResponse.json({ message: "Email verified", name: token.name }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/auth/otp/verify]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
