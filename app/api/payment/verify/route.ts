import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";

const PLAN_AMOUNT_PAISE = parseInt(process.env.RAZORPAY_PLAN_AMOUNT_PAISE ?? "8500");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Verify the payment actually captured the correct amount with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.status !== "captured" || Number(payment.amount) !== PLAN_AMOUNT_PAISE) {
      console.error("[POST /api/payment/verify] payment validation failed", {
        status: payment.status,
        amount: payment.amount,
        expected: PLAN_AMOUNT_PAISE,
      });
      return NextResponse.json({ error: "Payment not valid" }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const org = await prisma.organization.update({
      where: { id: session.user.orgId },
      data: { plan: "PRO", planExpiresAt: expiresAt },
      select: { id: true, name: true, slug: true, logo: true, plan: true, planExpiresAt: true },
    });

    return NextResponse.json({ org });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.message === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[POST /api/payment/verify]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
