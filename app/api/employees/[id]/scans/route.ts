import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    if (session.user.role !== "ADMIN" && session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const employee = await prisma.user.findFirst({ where: { id, orgId: session.user.orgId } });
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { searchParams } = req.nextUrl;
    const defaultEnd = new Date();
    const defaultStart = new Date(defaultEnd);
    defaultStart.setDate(defaultStart.getDate() - 13);

    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")! + "T00:00:00.000Z")
      : defaultStart;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")! + "T23:59:59.999Z")
      : defaultEnd;

    const dateFilter = { gte: startDate, lte: endDate };

    const [scans, views] = await Promise.all([
      prisma.scanLog.findMany({
        where: { employeeId: id, createdAt: dateFilter },
        orderBy: { createdAt: "desc" },
      }),
      prisma.cardView.findMany({
        where: { employeeId: id, createdAt: dateFilter },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // scans grouped by date
    const scansByDate: Record<string, number> = {};
    for (const s of scans) {
      const d = s.createdAt.toISOString().slice(0, 10);
      scansByDate[d] = (scansByDate[d] ?? 0) + 1;
    }

    // views grouped by date (all views)
    const viewsByDate: Record<string, number> = {};
    for (const v of views) {
      const d = v.createdAt.toISOString().slice(0, 10);
      viewsByDate[d] = (viewsByDate[d] ?? 0) + 1;
    }

    const totalViews = views.length;
    const uniqueViews = views.filter(v => v.isUnique).length;
    const repeatViews = totalViews - uniqueViews;

    return NextResponse.json({
      // scans (QR scans via WhatsApp)
      totalScans: scans.length,
      scansByDate,
      // card page views
      totalViews,
      uniqueViews,
      repeatViews,
      viewsByDate,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
