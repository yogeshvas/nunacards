import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.otpToken.upsert({
      where: { email },
      create: { email, name, otp, expiresAt },
      update: { name, otp, expiresAt, verified: false },
    });

    await sendOtpEmail(email, name, otp);

    return NextResponse.json({ message: "OTP sent" }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/auth/otp/send]", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
