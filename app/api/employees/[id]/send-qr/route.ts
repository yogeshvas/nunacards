import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { sendWhatsAppQr } from "@/lib/aisensy";
import { sendQrEmail } from "@/lib/mailer";
import { employeeWaLink } from "@/lib/wa";

function qrImageUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(data)}&bgcolor=09090b&color=ffffff&qzone=2&format=png`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const employee = await prisma.user.findFirst({
      where: { id, orgId: session.user.orgId },
      select: { name: true, email: true, phone: true, countryCode: true, employeeCode: true },
    });

    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { channel } = await req.json() as { channel: "whatsapp" | "email" | "both" };

    const waLink = employeeWaLink(employee.employeeCode);
    const imageUrl = qrImageUrl(waLink);

    const destination = `+${employee.countryCode.replace(/\D/g, "")}${employee.phone.replace(/\D/g, "")}`;

    console.log("[send-qr] phone debug", {
      raw_countryCode: employee.countryCode,
      raw_phone: employee.phone,
      destination,
    });

    const results: Record<string, string> = {};

    if (channel === "whatsapp" || channel === "both") {
      await sendWhatsAppQr({ phone: destination, name: employee.name, qrImageUrl: imageUrl });
      results.whatsapp = "sent";
    }

    if (channel === "email" || channel === "both") {
      if (!employee.email) {
        results.email = "skipped — no email on record";
      } else {
        await sendQrEmail({
          to: employee.email,
          name: employee.name,
          employeeCode: employee.employeeCode,
          qrImageUrl: imageUrl,
          waLink,
        });
        results.email = "sent";
      }
    }

    return NextResponse.json({ message: "QR delivered", results });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[POST /api/employees/[id]/send-qr]", err);
    return NextResponse.json({ error: err.message ?? "Failed to send QR" }, { status: 500 });
  }
}
