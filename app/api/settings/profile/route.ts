import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { saveUpload } from "@/lib/upload";
import { invalidateCardImage } from "@/lib/cardImage";

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const formData   = await req.formData();
    const name        = formData.get("name") as string | null;
    const email       = formData.get("email") as string | null;
    const designation = formData.get("designation") as string | null;
    const countryCode = formData.get("countryCode") as string | null;
    const country     = formData.get("country") as string | null;
    const phone       = formData.get("phone") as string | null;
    const labelsRaw   = formData.get("labels") as string | null;
    const imageFile   = formData.get("profileImage") as File | null;

    const existing = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let profileImage = existing.profileImage;
    if (imageFile && imageFile.size > 0) {
      profileImage = await saveUpload(imageFile);
    }

    const cardFieldChanged =
      (name && name !== existing.name) ||
      (designation !== null && (designation || null) !== existing.designation) ||
      (phone && phone !== existing.phone) ||
      (imageFile && imageFile.size > 0);

    if (cardFieldChanged) await invalidateCardImage(session.user.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedLabels: any[] | undefined;
    if (labelsRaw) {
      try { parsedLabels = JSON.parse(labelsRaw); }
      catch { return NextResponse.json({ error: "Invalid labels format" }, { status: 400 }); }
    }

    const admin = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name?.trim()        && { name: name.trim() }),
        ...(email !== null      && { email: email || null }),
        ...(designation !== null && { designation: designation || null }),
        ...(countryCode         && { countryCode }),
        ...(country             && { country }),
        ...(phone?.trim()       && { phone: phone.trim() }),
        ...(parsedLabels !== undefined && { labels: parsedLabels }),
        profileImage,
      },
      select: {
        id: true, name: true, email: true, designation: true,
        phone: true, countryCode: true, country: true,
        employeeCode: true, profileImage: true, labels: true, slug: true,
      },
    });

    return NextResponse.json({ admin });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (err?.code === "P2002")          return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    console.error("[PATCH /api/settings/profile]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
