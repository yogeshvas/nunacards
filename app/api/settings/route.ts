import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    const session = await requireAdmin();

    const [admin, org] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true, name: true, email: true, designation: true,
          phone: true, countryCode: true, country: true,
          employeeCode: true, profileImage: true, labels: true, slug: true,
        },
      }),
      prisma.organization.findUnique({
        where: { id: session.user.orgId },
        select: { id: true, name: true, slug: true, logo: true, plan: true, planExpiresAt: true },
      }),
    ]);

    return NextResponse.json({ admin, org });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[GET /api/settings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
