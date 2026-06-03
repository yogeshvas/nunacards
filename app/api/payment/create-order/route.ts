import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { requireAdmin } from "@/lib/session";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ₹85/month ≈ $1. Override via RAZORPAY_PLAN_AMOUNT_PAISE env var.
const PLAN_AMOUNT_PAISE = parseInt(process.env.RAZORPAY_PLAN_AMOUNT_PAISE ?? "8500");

export async function POST() {
  try {
    const session = await requireAdmin();

    const order = await razorpay.orders.create({
      amount: PLAN_AMOUNT_PAISE,
      currency: "INR",
      receipt: `pay_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[POST /api/payment/create-order]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
