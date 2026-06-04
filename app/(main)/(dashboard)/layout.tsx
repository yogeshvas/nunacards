import Header from "@/components/custom/Header";
import TrialBanner from "@/components/custom/TrialBanner";
import { PlanProvider } from "@/components/providers/PlanProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  let plan = "BASIC";
  let planExpiresAt: string | null = null;
  let trialEndsAt: string | null = null;

  if (session?.user?.orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: session.user.orgId },
      select: { plan: true, planExpiresAt: true, trialEndsAt: true },
    });
    plan = org?.plan ?? "BASIC";
    planExpiresAt = org?.planExpiresAt?.toISOString() ?? null;
    trialEndsAt = org?.trialEndsAt?.toISOString() ?? null;
  }

  return (
    <PlanProvider plan={plan} planExpiresAt={planExpiresAt} trialEndsAt={trialEndsAt}>
      <div className="min-h-screen bg-zinc-900 text-white">
        <Header />
        <TrialBanner />
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</main>
      </div>
    </PlanProvider>
  );
}
