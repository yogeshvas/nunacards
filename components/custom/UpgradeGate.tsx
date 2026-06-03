"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

interface UpgradeGateProps {
  children?: React.ReactNode;
  className?: string;
  label?: string;
}

async function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.body.appendChild(s);
  });
}

export function UpgradeGate({ children, className = "", label }: UpgradeGateProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create-order", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed"); return; }

      await loadRazorpay();

      new (window as any).Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "NunaCards",
        description: "PRO Plan · 1 Month",
        order_id: data.orderId,
        handler: async (response: any) => {
          const tid = toast.loading("Activating…");
          try {
            const vRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const vData = await vRes.json();
            if (!vRes.ok) { toast.error(vData.error ?? "Verification failed", { id: tid }); return; }
            toast.success("You're on PRO!", { id: tid });
            window.location.reload();
          } catch { toast.error("Verification failed", { id: tid }); }
        },
        theme: { color: "#6366f1" },
      }).open();
    } catch {
      toast.error("Failed to load payment. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* blurred content */}
      {children && (
        <div
          className="pointer-events-none select-none"
          style={{ filter: "blur(6px)", opacity: 0.35 }}
        >
          {children}
        </div>
      )}

      {/* overlay */}
      <div className={`${children ? "absolute inset-0" : "py-12"} flex flex-col items-center justify-center gap-3`}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700">
          <Lock className="h-3.5 w-3.5 text-zinc-400" />
        </div>
        {label && (
          <p className="text-sm font-medium text-zinc-300">{label}</p>
        )}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="h-8 rounded-md bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Upgrade to Pro"}
        </button>
        <span className="text-[11px] text-zinc-600">$1 / month</span>
      </div>
    </div>
  );
}
