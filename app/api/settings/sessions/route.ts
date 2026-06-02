import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "Unknown"
  );
}

// POST — record a new login session (called from client after sign-in)
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const userAgent = req.headers.get("user-agent") ?? "Unknown";
    const ip = getIp(req);

    await prisma.loginSession.create({
      data: { userId: session.user.id, ip, userAgent },
    });

    return NextResponse.json({ recorded: true });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[POST /api/settings/sessions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — list all sessions for current user
export async function GET() {
  try {
    const session = await requireSession();

    const sessions = await prisma.loginSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ sessions });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[GET /api/settings/sessions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — sign out all devices (clear sessions + increment tokenVersion)
export async function DELETE() {
  try {
    const session = await requireSession();

    await Promise.all([
      prisma.loginSession.deleteMany({ where: { userId: session.user.id } }),
      prisma.user.update({ where: { id: session.user.id }, data: { tokenVersion: { increment: 1 } } }),
    ]);

    return NextResponse.json({ signedOut: true });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
