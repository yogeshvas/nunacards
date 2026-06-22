const BASE_URL = "https://backend.api-wa.co/campaign";

function log(level: "info" | "error", msg: string, data?: unknown) {
  const ts = new Date().toISOString();
  if (level === "error") {
    console.error(`[WhatsApp][${ts}] ${msg}`, data ?? "");
  } else {
    console.log(`[WhatsApp][${ts}] ${msg}`, data ?? "");
  }
}

// AiSensy's webhook payloads (and some callers) hand us digits-only numbers
// (e.g. "918700923340"). Every outbound message must carry a leading "+" —
// normalize here so no call site can accidentally skip it.
function withPlus(phone: string): string {
  const trimmed = phone.trim();
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

async function aiSensyPost(payload: Record<string, unknown>) {
  const destination = withPlus(String(payload.destination ?? ""));
  payload = { ...payload, destination };

  const { campaignName, templateParams } = payload as {
    campaignName: string;
    templateParams: string[];
  };

  const body = JSON.stringify({ apiKey: process.env.AISENSY_API_KEY, ...payload });
  log("info", `Sending → campaign=${campaignName} destination=${destination}`, { templateParams });
  console.log("[AiSensy] full payload →", body);

  const res = await fetch(`${BASE_URL}/${process.env.AISENSY_USERNAME}/api/v2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const responseText = await res.text();

  if (!res.ok) {
    log("error", `Failed → campaign=${campaignName} destination=${destination} status=${res.status}`, responseText);
    throw new Error(`AiSensy ${res.status}: ${responseText}`);
  }

  const json = JSON.parse(responseText);
  log("info", `Sent   → campaign=${campaignName} destination=${destination}`, json);
  return json;
}

export async function sendWhatsAppQr({
  phone,
  name,
  qrImageUrl,
}: {
  phone: string;       // e.g. "918700923340" or "+918700923340" — "+" added automatically if missing
  name: string;
  qrImageUrl: string;
}) {
  const firstName = name.split(" ")[0];

  return aiSensyPost({
    campaignName: process.env.AISENSY_CAMPAIGN_QR ?? "employee_qr",
    destination: phone,
    userName: "ConnectCard",
    templateParams: [firstName],
    source: "nunacards-dashboard",
    media: { url: qrImageUrl, filename: "your_digital_card_qr" },
    buttons: [],
    carouselCards: [],
    location: {},
    attributes: {},
    paramsFallbackValue: { FirstName: firstName },
  });
}

// Notifies the employee that their card was just scanned.
// {{1}} = employee first name, {{2}} = who scanned it (name or phone).
export async function sendWhatsAppScanNotification({
  employeePhone,   // destination — the owner of the card that was scanned
  employeeName,    // {{1}}
  scannedBy,       // {{2}} — visitor's name or phone number
}: {
  employeePhone: string;
  employeeName: string;
  scannedBy: string;
}) {
  const employeeFirstName = employeeName.split(" ")[0] || "there";

  return aiSensyPost({
    campaignName: process.env.AISENSY_CAMPAIGN_SCAN ?? "scanned_reply",
    destination: employeePhone,
    userName: "ConnectCard",
    templateParams: [employeeFirstName, scannedBy],
    source: "nunacards-webhook",
    media: {},
    buttons: [],
    carouselCards: [],
    location: {},
    attributes: {},
    paramsFallbackValue: { FirstName: employeeFirstName },
  });
}

export async function sendWhatsAppCard({
  visitorPhone,       // destination — who scanned the QR
  visitorName,        // {{1}} — visitor's first name
  employeeName,       // {{2}} — Visiting Card Guy Name
  employeeDesignation, // {{3}} — Position
  cardDocumentUrl,    // media — the visiting-card document (PDF/vCard) the visitor downloads
}: {
  visitorPhone: string;
  visitorName: string;
  employeeName: string;
  employeeDesignation: string;
  cardDocumentUrl?: string | null;
}) {
  const visitorFirstName = visitorName.split(" ")[0] || "there";

  // fallback document if the employee has no generated visiting card yet
  const mediaUrl = cardDocumentUrl
    ?? "https://d3jt6ku4g6z5l8.cloudfront.net/FILE/6353da2e153a147b991dd812/4079142_dummy.pdf";

  return aiSensyPost({
    campaignName: process.env.AISENSY_CAMPAIGN_CARD ?? "visitingcard",
    destination: visitorPhone,
    userName: "ConnectCard",
    templateParams: [visitorFirstName, employeeName, employeeDesignation],
    source: "nunacards-webhook",
    media: {
      url: mediaUrl,
      filename: "visiting_card.vcf",
    },
    buttons: [],
    carouselCards: [],
    location: {},
    attributes: {},
    paramsFallbackValue: { FirstName: visitorFirstName },
  });
}
