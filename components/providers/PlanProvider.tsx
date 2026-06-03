"use client";

import { createContext, useContext } from "react";

type PlanContextValue = {
  plan: "BASIC" | "PRO";
  planExpiresAt: string | null;
  isPro: boolean;
};

const PlanContext = createContext<PlanContextValue>({
  plan: "BASIC",
  planExpiresAt: null,
  isPro: false,
});

export function PlanProvider({
  children,
  plan,
  planExpiresAt,
}: {
  children: React.ReactNode;
  plan: string;
  planExpiresAt: string | null;
}) {
  const isPro =
    plan === "PRO" &&
    !!planExpiresAt &&
    new Date(planExpiresAt) > new Date();

  return (
    <PlanContext.Provider value={{ plan: plan as "BASIC" | "PRO", planExpiresAt, isPro }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  return useContext(PlanContext);
}
