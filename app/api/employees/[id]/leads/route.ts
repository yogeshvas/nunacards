import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const employee = await prisma.user.findFirst({ where: { id, orgId: session.user.orgId } });
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const leads = await prisma.lead.findMany({
      where: { scannedEmpId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
