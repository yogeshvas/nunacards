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
        slug: true,
      },
    });

    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Public .vcf URL — WhatsApp fetches this so the visitor can tap to save the contact
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://yourdomain.com";
    const cardDocumentUrl = `${baseUrl}/api/card/${employee.slug}/vcard`;

    const destination = `+${employee.countryCode.replace(/\D/g, "")}${employee.phone.replace(/\D/g, "")}`;

    const masked = `****${destination.slice(-4)}`;
    console.log("[send-card] phone debug", {
      raw_countryCode: employee.countryCode,
      raw_phone: masked,
      destination: masked,
    });

    await sendWhatsAppCard({
      visitorPhone: destination,
      visitorName: employee.name,
      employeeName: employee.name,
      employeeDesignation: employee.designation ?? "",
      cardDocumentUrl,
    });

    return NextResponse.json({ message: "Card sent" });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[POST /api/employees/[id]/send-card]", err);
    return NextResponse.json({ error: "Failed to send card." }, { status: 500 });
  }
}
