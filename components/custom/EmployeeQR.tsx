"use client";

import QRCode from "react-qr-code";
import { employeeWaLink } from "@/lib/wa";
export { employeeWaLink } from "@/lib/wa";

/**
 * A real QR code that, when scanned, opens WhatsApp with the employee
 * code pre-filled in a chat to the lead-capture number.
 */
export function EmployeeQR({
  employeeCode,
  size = 120,
  bg = "#09090b",
  fg = "#ffffff",
}: {
  employeeCode: string;
  size?: number;
  bg?: string;
  fg?: string;
}) {
  const value = employeeWaLink(employeeCode);

  return (
    <div
      style={{ background: bg, padding: 10, borderRadius: 12, display: "inline-flex" }}
    >
      <QRCode
        value={value}
        size={size}
        bgColor={bg}
        fgColor={fg}
        level="M"
      />
    </div>
  );
}
