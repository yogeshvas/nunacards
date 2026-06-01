import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const employee = await prisma.user.findFirst({ where: { id, orgId: session.user.orgId } });
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const scans = await prisma.scanLog.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // group by date for chart data
    const byDate: Record<string, number> = {};
    for (const s of scans) {
      const d = s.createdAt.toISOString().slice(0, 10);
      byDate[d] = (byDate[d] ?? 0) + 1;
    }

    return NextResponse.json({ total: scans.length, byDate, scans });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
