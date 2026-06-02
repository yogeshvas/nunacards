import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireSession } from "@/lib/session";
import { saveUpload } from "@/lib/upload";
import { randomUUID } from "crypto";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── GET /api/employees ────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const showArchived = req.nextUrl.searchParams.get("archived") === "true";

    const cardSelect = {
      id: true,
      name: true,
      email: true,
      designation: true,
      phone: true,
      countryCode: true,
      country: true,
      employeeCode: true,
      profileImage: true,
      labels: true,
      slug: true,
      createdAt: true,
    };

    const employees = await prisma.user.findMany({
      where: { orgId: session.user.orgId, role: "EMPLOYEE", archived: showArchived },
      select: cardSelect,
      orderBy: { createdAt: "desc" },
    });

    // Include the admin's own card so they can send it to themselves
    const adminCard = showArchived
      ? null
      : await prisma.user.findFirst({
          where: { id: session.user.id, orgId: session.user.orgId },
          select: cardSelect,
        });

    return NextResponse.json({ employees, adminCard });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[GET /api/employees]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST /api/employees ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const formData = await req.formData();
    const name        = formData.get("name") as string;
    const email       = (formData.get("email") as string | null) || null;
    const designation = (formData.get("designation") as string | null) || null;
    const countryCode = formData.get("countryCode") as string;
    const country     = formData.get("country") as string;
    const phone       = formData.get("phone") as string;
    const employeeCode = formData.get("employeeCode") as string;
    const labelsRaw   = formData.get("labels") as string | null;
    const imageFile   = formData.get("profileImage") as File | null;

    if (!name || !phone || !countryCode || !country || !employeeCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // unique employee code within org
    const existing = await prisma.user.findUnique({ where: { employeeCode } });
    if (existing) {
      return NextResponse.json({ error: "Employee code already in use" }, { status: 409 });
    }

    let profileImage: string | null = null;
    if (imageFile && imageFile.size > 0) {
      profileImage = await saveUpload(imageFile);
    }

    const labels = labelsRaw ? JSON.parse(labelsRaw) : [];
    const slug = `${slugify(name)}-${randomUUID().slice(0, 6)}`;

    const employee = await prisma.user.create({
      data: {
        name,
        email,
        designation,
        phone,
        countryCode,
        country,
        employeeCode,
        profileImage,
        labels,
        slug,
        role: "EMPLOYEE",
        orgId: session.user.orgId,
      },
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (err?.code === "P2002")          return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    console.error("[POST /api/employees]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
