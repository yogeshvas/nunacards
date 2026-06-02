import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import type { Session } from "next-auth";

export async function requireSession(): Promise<Session> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}
