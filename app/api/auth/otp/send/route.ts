import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";

const OTP_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 8 alphanumeric (no ambiguous chars)
const SEND_LIMIT = 3;       // max sends per hour
const SEND_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function generateOtp(): string {
  let otp = "";
  for (let i = 0; i < 8; i++) {
    otp += OTP_CHARS[Math.floor(Math.random() * OTP_CHARS.length)];
  }
  return otp;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // Rate limit: max 3 sends per email per hour
    const existing = await prisma.otpToken.findUnique({ where: { email } });
    if (existing) {
      const now = new Date();
      const windowStart = existing.sendWindowStart;
      const inWindow = windowStart && now.getTime() - windowStart.getTime() < SEND_WINDOW_MS;
      if (inWindow && existing.sendCount >= SEND_LIMIT) {
        return NextResponse.json(
          { error: "Too many OTP requests. Please wait before trying again." },
          { status: 429 }
        );
      }
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    const now = new Date();

    const resetWindow = !existing?.sendWindowStart ||
      now.getTime() - existing.sendWindowStart.getTime() >= SEND_WINDOW_MS;

    await prisma.otpToken.upsert({
      where: { email },
      create: {
        email, name, otp, expiresAt,
        attempts: 0, lockedUntil: null,
        sendCount: 1, sendWindowStart: now,
      },
      update: {
        name, otp, expiresAt, verified: false,
        attempts: 0, lockedUntil: null,
        sendCount: resetWindow ? 1 : { increment: 1 },
        sendWindowStart: resetWindow ? now : undefined,
      },
    });

    await sendOtpEmail(email, name, otp);

    return NextResponse.json({ message: "OTP sent" }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/auth/otp/send]", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
