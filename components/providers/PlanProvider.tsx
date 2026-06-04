"use client";

import { createContext, useContext } from "react";

type PlanContextValue = {
  plan: "BASIC" | "PRO";
  planExpiresAt: string | null;
  trialEndsAt: string | null;
  isPro: boolean;
  isTrial: boolean;
};

const PlanContext = createContext<PlanContextValue>({
  plan: "BASIC",
  planExpiresAt: null,
  trialEndsAt: null,
  isPro: false,
  isTrial: false,
});

export function PlanProvider({
  children,
  plan,
  planExpiresAt,
  trialEndsAt,
}: {
  children: React.ReactNode;
  plan: string;
  planExpiresAt: string | null;
  trialEndsAt: string | null;
}) {
  const now = new Date();
  const isPro =
    plan === "PRO" &&
    !!planExpiresAt &&
    new Date(planExpiresAt) > now;

  const isTrial =
    isPro &&
    !!trialEndsAt &&
    new Date(trialEndsAt) > now;

  return (
    <PlanContext.Provider value={{ plan: plan as "BASIC" | "PRO", planExpiresAt, trialEndsAt, isPro, isTrial }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  return useContext(PlanContext);
}
