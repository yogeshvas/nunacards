import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, role } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    // Role mismatch — tell the user which login to use
    if (role === "owner" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You're not an owner. Please log in as an Employee." },
        { status: 403 },
      );
    }
    if (role === "employee" && user.role !== "EMPLOYEE") {
      return NextResponse.json(
        { error: "You're not an employee. Please log in as an Owner." },
        { status: 403 },
      );
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpToken.upsert({
      where: { email },
      create: { email, name: user.name, otp, expiresAt },
      update: { name: user.name, otp, expiresAt, verified: false },
    });

    await sendOtpEmail(email, user.name, otp);

    return NextResponse.json({ message: "OTP sent" });
  } catch (err) {
    console.error("[POST /api/auth/otp/send-login]", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
