import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const orgId = session.user.orgId;

    const { searchParams } = req.nextUrl;
    const now = new Date();

    // default: first day of current month → today
    const defaultStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")! + "T00:00:00.000Z")
      : defaultStart;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")! + "T23:59:59.999Z")
      : now;

    // previous period — same duration immediately before
    const duration = endDate.getTime() - startDate.getTime();
    const prevStart = new Date(startDate.getTime() - duration - 1000);
    const prevEnd   = new Date(startDate.getTime() - 1);

    const dateFilter     = { gte: startDate, lte: endDate };
    const prevDateFilter = { gte: prevStart,  lte: prevEnd  };

    // ── employees ────────────────────────────────────────────────────────────
    const allEmployees = await prisma.user.findMany({
      where: { orgId },
      select: {
        id: true, name: true, designation: true,
        profileImage: true, archived: true, createdAt: true,
      },
    });

    const empIds       = allEmployees.map(e => e.id);
    const totalEmp     = allEmployees.length;
    const activeEmp    = allEmployees.filter(e => !e.archived).length;
    const archivedEmp  = allEmployees.filter(e => e.archived).length;
    const newEmp       = allEmployees.filter(e => e.createdAt >= startDate && e.createdAt <= endDate).length;

    if (empIds.length === 0) {
      return NextResponse.json({
        employees: { total: 0, active: 0, archived: 0, new: 0 },
        leads:  { total: 0, byDate: {}, prevTotal: 0 },
        views:  { total: 0, unique: 0, repeat: 0, byDate: {}, prevTotal: 0 },
        scans:  { total: 0, byDate: {}, prevTotal: 0 },
        topByScans: [],
        topByLeads: [],
      });
    }

    const empFilter     = { in: empIds };

    // ── parallel data fetch ───────────────────────────────────────────────────
    const [leads, prevLeads, scans, prevScans, views, prevViews] = await Promise.all([
      prisma.lead.findMany({
        where: { scannedEmpId: empFilter, createdAt: dateFilter },
        select: { scannedEmpId: true, createdAt: true },
      }),
      prisma.lead.count({ where: { scannedEmpId: empFilter, createdAt: prevDateFilter } }),
      prisma.scanLog.findMany({
        where: { employeeId: empFilter, createdAt: dateFilter },
        select: { employeeId: true, createdAt: true },
      }),
      prisma.scanLog.count({ where: { employeeId: empFilter, createdAt: prevDateFilter } }),
      prisma.cardView.findMany({
        where: { employeeId: empFilter, createdAt: dateFilter },
        select: { employeeId: true, isUnique: true, createdAt: true },
      }),
      prisma.cardView.count({ where: { employeeId: empFilter, createdAt: prevDateFilter } }),
    ]);

    // ── group by date ─────────────────────────────────────────────────────────
    const leadsByDate:  Record<string, number> = {};
    const scansByDate:  Record<string, number> = {};
    const viewsByDate:  Record<string, number> = {};
    const scansByEmp:   Record<string, number> = {};
    const leadsByEmp:   Record<string, number> = {};

    for (const l of leads) {
      const d = toDateStr(l.createdAt);
      leadsByDate[d] = (leadsByDate[d] ?? 0) + 1;
      leadsByEmp[l.scannedEmpId] = (leadsByEmp[l.scannedEmpId] ?? 0) + 1;
    }

    for (const s of scans) {
      const d = toDateStr(s.createdAt);
      scansByDate[d] = (scansByDate[d] ?? 0) + 1;
      scansByEmp[s.employeeId] = (scansByEmp[s.employeeId] ?? 0) + 1;
    }

    for (const v of views) {
      const d = toDateStr(v.createdAt);
      viewsByDate[d] = (viewsByDate[d] ?? 0) + 1;
    }

    const totalLeads  = leads.length;
    const totalScans  = scans.length;
    const totalViews  = views.length;
    const uniqueViews = views.filter(v => v.isUnique).length;
    const repeatViews = totalViews - uniqueViews;

    // ── top 5 ─────────────────────────────────────────────────────────────────
    const topByScans = Object.entries(scansByEmp)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, count]) => {
        const e = allEmployees.find(x => x.id === id)!;
        return { id, name: e.name, designation: e.designation ?? "", profileImage: e.profileImage, count };
      });

    const topByLeads = Object.entries(leadsByEmp)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, count]) => {
        const e = allEmployees.find(x => x.id === id)!;
        return { id, name: e.name, designation: e.designation ?? "", profileImage: e.profileImage, count };
      });

    return NextResponse.json({
      employees: { total: totalEmp, active: activeEmp, archived: archivedEmp, new: newEmp },
      leads:  { total: totalLeads,  byDate: leadsByDate,  prevTotal: prevLeads  },
      views:  { total: totalViews,  unique: uniqueViews, repeat: repeatViews, byDate: viewsByDate, prevTotal: prevViews  },
      scans:  { total: totalScans,  byDate: scansByDate,  prevTotal: prevScans  },
      topByScans,
      topByLeads,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[GET /api/dashboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
