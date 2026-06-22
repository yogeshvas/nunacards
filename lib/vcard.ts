// Builds a VCARD 3.0 string for an employee. Mirrors the client-side vCard in
// app/public/cards/[slug]/CardView.tsx so the downloaded contact is identical
// whether the visitor taps "Download" on the web card or receives it on WhatsApp.

export type VCardEmployee = {
  name: string;
  designation: string | null;
  email: string | null;
  phone: string;
  countryCode: string;
  profileImage: string | null;
  organization: { name: string };
};

export function buildVCard(emp: VCardEmployee): string {
  const phone = `${emp.countryCode}${emp.phone}`;
  const [firstName, ...rest] = emp.name.split(" ");

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${emp.name}`,
    `N:${rest.join(" ")};${firstName};;;`,
    `ORG:${emp.organization.name}`,
    emp.designation ? `TITLE:${emp.designation}` : null,
    `TEL;TYPE=WORK,VOICE:${phone}`,
    emp.email ? `EMAIL;TYPE=WORK:${emp.email}` : null,
    emp.profileImage ? `PHOTO;VALUE=URL:${emp.profileImage}` : null,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
}
