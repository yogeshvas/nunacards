const BASE_URL = "https://backend.api-wa.co/campaign";

async function aiSensyPost(payload: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/${process.env.AISENSY_USERNAME}/api/v2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: process.env.AISENSY_API_KEY, ...payload }),
  });
  if (!res.ok) throw new Error(`AiSensy ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function sendWhatsAppQr({
  phone,
  name,
  qrImageUrl,
}: {
  phone: string;       // e.g. "918700923340" — digits only, no +
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

export async function sendWhatsAppCard({
  visitorPhone,       // destination — who scanned the QR
  visitorName,        // {{1}} — visitor's first name
  employeeName,       // {{2}}
  employeeDesignation, // {{3}}
  employeeSlug,       // button URL param — card page path
  profileImageUrl,    // media header image
}: {
  visitorPhone: string;
  visitorName: string;
  employeeName: string;
  employeeDesignation: string;
  employeeSlug: string;
  profileImageUrl?: string | null;
}) {
  const visitorFirstName = visitorName.split(" ")[0] || "there";
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://yourdomain.com";
  const cardUrl = `${baseUrl}/card/${employeeSlug}`;

  // fallback image if employee has no profile photo
  const mediaUrl = profileImageUrl
    ?? "https://d3jt6ku4g6z5l8.cloudfront.net/IMAGE/6353da2e153a147b991dd812/4958901_highanglekidcheatingschooltestmin.jpg";

  return aiSensyPost({
    campaignName: process.env.AISENSY_CAMPAIGN_CARD ?? "employee_card_clrq0",
    destination: visitorPhone,
    userName: "ConnectCard",
    templateParams: [visitorFirstName, employeeName, employeeDesignation],
    source: "nunacards-webhook",
    media: {
      url: mediaUrl,
      filename: "digital_card",
    },
    buttons: [
      {
        type: "button",
        sub_type: "URL",
        index: 0,
        parameters: [{ type: "text", text: cardUrl }],
      },
    ],
    carouselCards: [],
    location: {},
    attributes: {},
    paramsFallbackValue: { FirstName: visitorFirstName },
  });
}
