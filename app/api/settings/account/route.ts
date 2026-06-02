import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import bcrypt from "bcrypt";

// DELETE — delete entire organization and all data
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { password, confirmation } = await req.json();

    const org = await prisma.organization.findUnique({ where: { id: session.user.orgId } });
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    if (confirmation !== org.name) {
      return NextResponse.json({ error: "Organization name does not match" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    }

    // Delete all users in the org first (their relations cascade), then the org
    const users = await prisma.user.findMany({ where: { orgId: session.user.orgId }, select: { id: true } });
    for (const u of users) {
      await prisma.loginSession.deleteMany({ where: { userId: u.id } });
      await prisma.lead.deleteMany({ where: { scannedEmpId: u.id } });
      await prisma.scanLog.deleteMany({ where: { employeeId: u.id } });
      await prisma.cardView.deleteMany({ where: { employeeId: u.id } });
    }
    await prisma.user.deleteMany({ where: { orgId: session.user.orgId } });
    await prisma.organization.delete({ where: { id: session.user.orgId } });

    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[DELETE /api/settings/account]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
