import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession, getOrgPlan } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const orgId = session.user.orgId;

    const { isPro } = await getOrgPlan(orgId);
    if (!isPro) {
      return NextResponse.json(
        { error: "UPGRADE_REQUIRED", message: "Upgrade to PRO to access leads." },
        { status: 403 }
      );
    }
    const { searchParams } = req.nextUrl;

    const isExport   = searchParams.get("export") === "true";
    const page       = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit      = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));
    const search     = searchParams.get("search")?.trim() ?? "";
    const employeeId = searchParams.get("employeeId") ?? "";
    const startDate  = searchParams.get("startDate");
    const endDate    = searchParams.get("endDate");

    let dateFilter: { gte: Date; lte: Date } | undefined;
    if (startDate && endDate) {
      const gte = new Date(startDate + "T00:00:00.000Z");
      const lte = new Date(endDate   + "T23:59:59.999Z");
      if (isNaN(gte.getTime()) || isNaN(lte.getTime())) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
      }
      dateFilter = { gte, lte };
    }

    const where = {
      scannedEmp: { orgId },
      ...(employeeId ? { scannedEmpId: employeeId } : {}),
      ...(dateFilter  ? { createdAt: dateFilter }   : {}),
      ...(search ? {
        OR: [
          { name:        { contains: search, mode: "insensitive" as const } },
          { phoneNumber: { contains: search } },
        ],
      } : {}),
    };

    const empSelect = {
      id: true, name: true, designation: true,
      profileImage: true, employeeCode: true,
    };

    // ── export: return all rows ───────────────────────────────────────────────
    if (isExport) {
      const rows = await prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { scannedEmp: { select: empSelect } },
      });
      return NextResponse.json({ leads: rows });
    }

    // ── stats (org-wide, no date filter) ─────────────────────────────────────
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [total, totalAllTime, totalThisMonth, employees] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.count({ where: { scannedEmp: { orgId } } }),
      prisma.lead.count({ where: { scannedEmp: { orgId }, createdAt: { gte: monthStart } } }),
      prisma.user.findMany({
        where: { orgId, archived: false },
        select: empSelect,
        orderBy: { name: "asc" },
      }),
    ]);

    // ── paginated leads ───────────────────────────────────────────────────────
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { scannedEmp: { select: empSelect } },
    });

    return NextResponse.json({
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: { totalAllTime, totalThisMonth },
      employees,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[GET /api/leads]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
