import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import type { Session } from "next-auth";
import { prisma } from "./db";

export async function requireSession(): Promise<Session> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) throw new Error("UNAUTHORIZED");

  // Verify token version to support session revocation
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tokenVersion: true },
  });
  if (!user || user.tokenVersion !== (session.user as any).tokenVersion) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}

export async function requirePro(): Promise<Session> {
  const session = await requireAdmin();
  const org = await prisma.organization.findUnique({
    where: { id: session.user.orgId },
    select: { plan: true, planExpiresAt: true },
  });
  const isPro =
    org?.plan === "PRO" &&
    !!org.planExpiresAt &&
    new Date(org.planExpiresAt) > new Date();
  if (!isPro) throw new Error("UPGRADE_REQUIRED");
  return session;
}

export async function getOrgPlan(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true, planExpiresAt: true },
  });
  const isPro =
    org?.plan === "PRO" &&
    !!org?.planExpiresAt &&
    new Date(org.planExpiresAt) > new Date();
  return { plan: (org?.plan ?? "BASIC") as "BASIC" | "PRO", isPro };
}
