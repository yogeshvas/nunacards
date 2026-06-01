import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/db";
import { sendWhatsAppCard } from "@/lib/aisensy";

// ── signature verification ────────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.AISENSY_WEBHOOK_SECRET;
  if (!secret) return true; // skip if not configured yet
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}

// ── extract text from AiSensy message_content ─────────────────────────────────
// WhatsApp Cloud API nests text as: { text: { body: "..." } }
// AiSensy may simplify to: { text: "..." } or just a string

function extractMessageText(messageContent: unknown): string {
  if (!messageContent) return "";
  if (typeof messageContent === "string") return messageContent;

  const mc = messageContent as Record<string, unknown>;

  // { text: { body: "..." } }
  if (mc.text && typeof mc.text === "object") {
    return String((mc.text as Record<string, unknown>).body ?? "");
  }
  // { text: "..." }
  if (typeof mc.text === "string") return mc.text;
  // { body: "..." }
  if (typeof mc.body === "string") return mc.body;

  return "";
}

// ── employee code regex ───────────────────────────────────────────────────────

const CODE_RE = /\bEMP-[A-Z0-9]{3,10}\b/i;

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Read raw body BEFORE any parsing — required for signature check
  const rawBody = await req.text();

  // Verify AiSensy signature
  const signature = req.headers.get("x-aisensy-signature") ?? "";
  if (!verifySignature(rawBody, signature)) {
    console.warn("[webhook/whatsapp] signature mismatch");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse notification envelope
  let notification: {
    id?: string;
    topic?: string;
    delivery_attempt?: number;
    data?: Record<string, unknown>;
  };

  try {
    notification = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topic, data = {} } = notification;

  // We only care about user-sent messages
  if (topic !== "message.sender.user") {
    return NextResponse.json({ received: true });
  }

  const message = (data.message ?? {}) as Record<string, unknown>;
  const messageType = String(message.message_type ?? "").toUpperCase();
  const senderPhone = String(message.phone_number ?? "");

  if (!senderPhone || messageType !== "TEXT") {
    return NextResponse.json({ received: true });
  }

  const text = extractMessageText(message.message_content).trim();
  const match = text.match(CODE_RE);

  if (!match) {
    return NextResponse.json({ received: true });
  }

  const employeeCode = match[0].toUpperCase();

  // Visitor name comes from the contact object (present in some topics)
  const contact = (data.contact ?? {}) as Record<string, unknown>;
  const visitorName = String(contact.name ?? "there");

  // Look up employee
  const employee = await prisma.user.findFirst({
    where: { employeeCode, archived: false },
    select: { id: true, name: true, designation: true, profileImage: true, slug: true },
  });

  if (!employee) {
    console.warn(`[webhook/whatsapp] unknown employee code: ${employeeCode}`);
    return NextResponse.json({ received: true });
  }

  // Respond 200 immediately — then fire async tasks
  sendWhatsAppCard({
    visitorPhone: senderPhone,
    visitorName,
    employeeName: employee.name,
    employeeDesignation: employee.designation ?? "",
    employeeSlug: employee.slug,
    profileImageUrl: employee.profileImage,
  }).catch(err => console.error("[webhook/whatsapp] sendWhatsAppCard error:", err));

  prisma.scanLog
    .create({ data: { employeeId: employee.id } })
    .catch(() => {});

  return NextResponse.json({ received: true });
}

// AiSensy sends a GET for subscription verification
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  if (challenge) return new NextResponse(challenge, { status: 200 });
  return NextResponse.json({ status: "webhook active" });
}
