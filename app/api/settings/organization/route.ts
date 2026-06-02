import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { saveUpload } from "@/lib/upload";

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const formData = await req.formData();
    const name      = formData.get("name") as string | null;
    const logoFile  = formData.get("logo") as File | null;

    const existing = await prisma.organization.findUnique({ where: { id: session.user.orgId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let logo = existing.logo;
    if (logoFile && logoFile.size > 0) {
      logo = await saveUpload(logoFile, "nunacards/logos");
    }

    const org = await prisma.organization.update({
      where: { id: session.user.orgId },
      data: {
        ...(name?.trim() && { name: name.trim() }),
        logo,
      },
      select: { id: true, name: true, slug: true, logo: true, plan: true, planExpiresAt: true },
    });

    return NextResponse.json({ org });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[PATCH /api/settings/organization]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
