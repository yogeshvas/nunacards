import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const employee = await prisma.user.findFirst({ where: { id, orgId: session.user.orgId } });
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { searchParams } = req.nextUrl;
    const isExport = searchParams.get("export") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const where = { scannedEmpId: id };

    if (isExport) {
      const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: "desc" } });
      return NextResponse.json({ leads });
    }

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({ leads, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
