import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireSession } from "@/lib/session";
import { saveUpload } from "@/lib/upload";
import { regenerateCardImage } from "@/lib/cardImage";

// ── GET /api/employees/[id] ───────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const employee = await prisma.user.findFirst({
      where: { id, orgId: session.user.orgId },
      select: {
        id: true, name: true, email: true, designation: true,
        phone: true, countryCode: true, country: true,
        employeeCode: true, profileImage: true, labels: true,
        slug: true, createdAt: true, updatedAt: true,
      },
    });

    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ employee });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PATCH /api/employees/[id] ─────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.user.findFirst({ where: { id, orgId: session.user.orgId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // simple JSON body for archive/unarchive toggle
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (typeof body.archived === "boolean") {
        const employee = await prisma.user.update({ where: { id }, data: { archived: body.archived } });
        return NextResponse.json({ employee });
      }
    }

    const formData = await req.formData();
    const name        = formData.get("name") as string | null;
    const email       = formData.get("email") as string | null;
    const designation = formData.get("designation") as string | null;
    const countryCode = formData.get("countryCode") as string | null;
    const country     = formData.get("country") as string | null;
    const phone       = formData.get("phone") as string | null;
    const labelsRaw   = formData.get("labels") as string | null;
    const imageFile   = formData.get("profileImage") as File | null;

    let profileImage = existing.profileImage;
    if (imageFile && imageFile.size > 0) {
      profileImage = await saveUpload(imageFile);
    }

    const cardFieldChanged =
      (name && name !== existing.name) ||
      (designation !== null && (designation || null) !== existing.designation) ||
      (phone && phone !== existing.phone) ||
      (countryCode && countryCode !== existing.countryCode) ||
      (email !== null && (email || null) !== existing.email) ||
      (imageFile && imageFile.size > 0);

    const oldCardImageUrl = existing.cardImageUrl;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedLabels: any[] | undefined;
    if (labelsRaw) {
      try { parsedLabels = JSON.parse(labelsRaw); }
      catch { return NextResponse.json({ error: "Invalid labels format" }, { status: 400 }); }
    }

    const employee = await prisma.user.update({
      where: { id },
      data: {
        ...(name        && { name }),
        ...(email !== null && { email: email || null }),
        ...(designation !== null && { designation: designation || null }),
        ...(countryCode && { countryCode }),
        ...(country     && { country }),
        ...(phone       && { phone }),
        ...(parsedLabels !== undefined && { labels: parsedLabels }),
        profileImage,
        ...(cardFieldChanged && { cardImageUrl: null }),
      },
    });

    if (cardFieldChanged) {
      after(() => regenerateCardImage(employee.id, oldCardImageUrl));
    }

    return NextResponse.json({ employee });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (err?.code === "P2002")          return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    console.error("[PATCH /api/employees/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE /api/employees/[id]  →  archive ────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.user.findFirst({ where: { id, orgId: session.user.orgId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.user.update({ where: { id }, data: { archived: true } });
    return NextResponse.json({ message: "Archived" });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[DELETE /api/employees/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
