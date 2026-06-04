import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueSlug(text: string) {
  const base = slugify(text);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

function generateEmployeeCode(orgSlug: string) {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${orgSlug.slice(0, 4).toUpperCase()}-${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, orgName, phone, password, country, countryCode, designation } = body;

    if (!email || !orgName || !phone || !password || !country || !countryCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // confirm OTP was verified
    const token = await prisma.otpToken.findUnique({ where: { email } });
    if (!token?.verified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const orgSlug = uniqueSlug(orgName);
    const userSlug = uniqueSlug(token.name);

    const result = await prisma.$transaction(async (tx) => {
      const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const org = await tx.organization.create({
        data: { name: orgName, slug: orgSlug, plan: "PRO", planExpiresAt: trialEndsAt, trialEndsAt },
      });

      const user = await tx.user.create({
        data: {
          name: token.name,
          email,
          phone,
          password: hashedPassword,
          slug: userSlug,
          country,
          countryCode,
          designation: designation ?? null,
          employeeCode: generateEmployeeCode(orgSlug),
          role: "ADMIN",
          orgId: org.id,
        },
      });

      await tx.otpToken.delete({ where: { email } });

      return { org, user };
    });

    return NextResponse.json(
      { message: "Account created", orgId: result.org.id, userId: result.user.id },
      { status: 201 },
    );
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }
    console.error("[POST /api/signup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
