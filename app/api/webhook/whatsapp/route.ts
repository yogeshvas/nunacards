import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/db";
import { sendWhatsAppCard } from "@/lib/aisensy";
import { getOrGenerateCardImage } from "@/lib/cardImage";

// ── signature verification ────────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.AISENSY_WEBHOOK_SECRET;
  if (!secret) return true;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}

// ── text extraction ───────────────────────────────────────────────────────────

function extractMessageText(messageContent: unknown): string {
  if (!messageContent) return "";
  if (typeof messageContent === "string") return messageContent;
  const mc = messageContent as Record<string, unknown>;
  if (mc.text && typeof mc.text === "object")
    return String((mc.text as Record<string, unknown>).body ?? "");
  if (typeof mc.text === "string") return mc.text;
  if (typeof mc.body === "string") return mc.body;
  return "";
}

// ── name extraction — tries every known field AiSensy might send ──────────────

function extractName(
  message: Record<string, unknown>,
  contact: Record<string, unknown>,
): string {
  // contact object (present in contact.created + sometimes message.sender.user)
  const contactName = String(contact.name ?? "").trim();
  if (contactName) return contactName;

  // WhatsApp pushName — sometimes nested in message
  const push =
    String(message.pushName ?? message.push_name ?? "").trim();
  if (push) return push;

  // Some AiSensy versions embed it here
  const msgContact = (message.contact ?? {}) as Record<string, unknown>;
  const fromName = String(msgContact.name ?? "").trim();
  if (fromName) return fromName;

  return "";
}

const CODE_RE = /\b[A-Z0-9]{2,6}-[A-Z0-9]{3,10}\b/i;

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-aisensy-signature") ?? "";
  if (!verifySignature(rawBody, signature)) {
    console.warn("[webhook/whatsapp] signature mismatch");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let notification: { id?: string; topic?: string; data?: Record<string, unknown> };
  try {
    notification = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topic, data = {} } = notification;

  // ── contact.created / contact.attribute.revised ───────────────────────────
  // Fires when a new WhatsApp contact messages the number for the first time.
  // We use it to backfill "Unknown" lead names with their real display name.

  if (topic === "contact.created" || topic === "contact.attribute.revised") {
    const contact = (data.contact ?? {}) as Record<string, unknown>;
    const name = String(contact.name ?? "").trim();
    const fullPhone = String(contact.phone_number ?? "").trim();
    const countryCode = String(contact.country_code ?? "").trim();

    if (name && fullPhone && name.toLowerCase() !== "unknown") {
      // Strip country code to get local number (same format stored on Lead)
      const localPhone = countryCode && fullPhone.startsWith(countryCode)
        ? fullPhone.slice(countryCode.length)
        : fullPhone;

      // Update any leads saved with "Unknown" for this phone number
      prisma.lead.updateMany({
        where: {
          name: "Unknown",
          OR: [
            { phoneNumber: fullPhone },
            { phoneNumber: localPhone },
          ],
        },
        data: { name },
      }).catch(() => {});
    }

    return NextResponse.json({ received: true });
  }

  // ── message.sender.user ───────────────────────────────────────────────────

  if (topic !== "message.sender.user") {
    return NextResponse.json({ received: true });
  }

  const message = (data.message ?? {}) as Record<string, unknown>;
  const contact = (data.contact ?? {}) as Record<string, unknown>;
  const messageType = String(message.message_type ?? "").toUpperCase();
  const senderPhone = String(message.phone_number ?? "");

  if (!senderPhone || messageType !== "TEXT") {
    return NextResponse.json({ received: true });
  }

  const text = extractMessageText(message.message_content).trim();
  const match = text.match(CODE_RE);
  if (!match) return NextResponse.json({ received: true });

  const employeeCode = match[0].toUpperCase();

  // Best-effort name — may be empty if AiSensy doesn't include it here
  const visitorName = extractName(message, contact);
  const contactCountryCode = String(contact.country_code ?? "");

  // Parse into separate countryCode + localPhone for Lead record
  let leadPhone = senderPhone;
  let leadCountryCode = contactCountryCode ? `+${contactCountryCode}` : "";
  if (contactCountryCode && senderPhone.startsWith(contactCountryCode)) {
    leadPhone = senderPhone.slice(contactCountryCode.length);
  }

  const employee = await prisma.user.findFirst({
    where: { employeeCode, archived: false },
    select: { id: true, name: true, designation: true, slug: true },
  });

  if (!employee) {
    console.warn(`[webhook/whatsapp] unknown code: ${employeeCode}`);
    return NextResponse.json({ received: true });
  }

  // Fire card + log async — respond 200 immediately
  (async () => {
    try {
      const cardImageUrl = await getOrGenerateCardImage(employee.id);
      await sendWhatsAppCard({
        visitorPhone: senderPhone,
        visitorName: visitorName || "there",
        employeeName: employee.name,
        employeeDesignation: employee.designation ?? "",
        employeeSlug: employee.slug,
        profileImageUrl: cardImageUrl,
      });
    } catch (err) {
      console.error("[webhook/whatsapp] sendWhatsAppCard error:", err);
    }
  })();

  prisma.lead.create({
    data: {
      name: visitorName || "Unknown",
      phoneNumber: leadPhone,
      countryCode: leadCountryCode || "+",
      scannedEmpId: employee.id,
    },
  }).catch(() => {});

  prisma.scanLog
    .create({ data: { employeeId: employee.id } })
    .catch(() => {});

  return NextResponse.json({ received: true });
}

// AiSensy GET for subscription verification
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  if (challenge) return new NextResponse(challenge, { status: 200 });
  return NextResponse.json({ status: "webhook active" });
}
