import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { isUnique } = await req.json() as { isUnique: boolean };

    const employee = await prisma.user.findFirst({
      where: { slug, archived: false },
      select: { id: true },
    });

    if (!employee) return NextResponse.json({ ok: false }, { status: 404 });

    await prisma.cardView.create({
      data: { employeeId: employee.id, isUnique: Boolean(isUnique) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
