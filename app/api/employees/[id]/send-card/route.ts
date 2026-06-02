import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { sendWhatsAppCard } from "@/lib/aisensy";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const employee = await prisma.user.findFirst({
      where: { id, orgId: session.user.orgId },
      select: {
        name: true,
        designation: true,
        phone: true,
        countryCode: true,
        profileImage: true,
        slug: true,
      },
    });

    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // destination = employee's own number (strip leading +)
    const destination = `${employee.countryCode.replace(/^\+/, "")}${employee.phone}`;

    await sendWhatsAppCard({
      visitorPhone: destination,
      visitorName: employee.name,       // {{1}} — "Hi Yogesh"
      employeeName: employee.name,      // {{2}}
      employeeDesignation: employee.designation ?? "",  // {{3}}
      employeeSlug: employee.slug,
      profileImageUrl: employee.profileImage,
    });

    return NextResponse.json({ message: "Card sent" });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[POST /api/employees/[id]/send-card]", err);
    return NextResponse.json({ error: err.message ?? "Failed to send card" }, { status: 500 });
  }
}
