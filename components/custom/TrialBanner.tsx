"use client";

import Link from "next/link";
import { Zap, Clock } from "lucide-react";
import { usePlan } from "@/components/providers/PlanProvider";

export default function TrialBanner() {
  const { isTrial, trialEndsAt } = usePlan();
  if (!isTrial || !trialEndsAt) return null;

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <div className="w-full border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 md:px-6">
        <div className="flex items-center gap-2.5 text-sm text-amber-300">
          <Clock className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            You&apos;re on a <span className="font-semibold">free trial</span> —{" "}
            <span className="font-semibold">{daysLeft} day{daysLeft !== 1 ? "s" : ""}</span> remaining.
          </span>
        </div>
        <Link
          href="/settings"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-black hover:bg-amber-400 transition-colors"
        >
          <Zap className="h-3 w-3" />
          Upgrade now
        </Link>
      </div>
    </div>
  );
}
