import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildVCard } from "@/lib/vcard";

// Serves the employee's contact as a downloadable .vcf. This is the document
// URL handed to AiSensy for the "visitingcard" campaign — WhatsApp fetches it,
// and the visitor taps it to save the contact directly.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const employee = await prisma.user.findFirst({
    where: { slug, archived: false },
    select: {
      name: true,
      designation: true,
      email: true,
      phone: true,
      countryCode: true,
      profileImage: true,
      organization: { select: { name: true } },
    },
  });

  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const vcf = buildVCard(employee);
  const filename = `${employee.name.replace(/\s+/g, "_")}.vcf`;

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard;charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
