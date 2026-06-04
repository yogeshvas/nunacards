import nodemailer from "nodemailer";
import { env } from "@/config/env";

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

export async function sendQrEmail({
  to,
  name,
  employeeCode,
  qrImageUrl,
  waLink,
}: {
  to: string;
  name: string;
  employeeCode: string;
  qrImageUrl: string;
  waLink: string;
}) {
  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: `${name}, your NunaCards QR code is here!`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#09090b;border-radius:16px;color:#fafafa;">
        <div style="font-size:13px;color:#71717a;margin-bottom:24px;">NunaCards</div>
        <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Hi ${name},</h2>
        <p style="color:#a1a1aa;font-size:14px;margin:0 0 28px;">
          Here's your personal digital business card QR code.<br/>
          Share it anywhere — when someone scans it, their WhatsApp opens with your card details.
        </p>
        <div style="text-align:center;padding:24px;background:#18181b;border-radius:16px;border:1px solid #27272a;margin-bottom:24px;">
          <img src="${qrImageUrl}" alt="Your QR Code" width="200" height="200"
            style="border-radius:12px;display:block;margin:0 auto 16px;" />
          <p style="font-size:13px;color:#71717a;margin:0 0 4px;">Your card code</p>
          <p style="font-size:20px;font-weight:800;letter-spacing:4px;color:#fafafa;margin:0;">${employeeCode}</p>
        </div>
        <a href="${waLink}"
          style="display:block;text-align:center;padding:14px 24px;background:#25D366;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;margin-bottom:24px;">
          Open on WhatsApp
        </a>
        <p style="color:#52525b;font-size:12px;">
          If you didn't expect this email, you can safely ignore it.
        </p>
      </div>
    `,
  });
}

export async function sendOtpEmail(to: string, name: string, otp: string) {
  const otpChars = otp.split("").map(
    (c) => `<td style="padding:0 3px;"><div style="width:38px;height:46px;background:#f4f4f5;border:1.5px solid #e4e4e7;border-radius:8px;font-size:20px;font-weight:800;font-family:'Courier New',Courier,monospace;color:#09090b;text-align:center;line-height:46px;vertical-align:middle;">${c}</div></td>`
  ).join("");

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: `${otp} is your NunaCards verification code`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify your email</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

        <!-- Logo row -->
        <tr><td align="center" style="padding-bottom:24px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#09090b;border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
              <span style="font-size:13px;font-weight:900;color:#ffffff;line-height:36px;">N</span>
            </td>
            <td style="padding-left:10px;font-size:16px;font-weight:700;color:#09090b;vertical-align:middle;">NunaCards</td>
          </tr></table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:16px;box-shadow:0 2px 16px rgba(0,0,0,0.06);overflow:hidden;">

          <!-- Top accent -->
          <tr><td style="height:4px;background:linear-gradient(90deg,#4f46e5,#7c3aed,#a855f7);font-size:0;line-height:0;">&nbsp;</td></tr>

          <!-- Body -->
          <tr><td style="padding:40px 40px 32px;">

            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Email Verification</p>
            <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#09090b;line-height:1.2;">Verify your email address</h1>
            <p style="margin:0 0 32px;font-size:15px;color:#52525b;line-height:1.6;">
              Hi <strong style="color:#09090b;">${name}</strong>, enter the code below to verify your email and activate your <strong style="color:#09090b;">30-day free trial</strong>.
            </p>

            <!-- OTP boxes -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
              <tr>${otpChars}</tr>
            </table>
            <p style="text-align:center;margin:0 0 32px;font-size:12px;color:#a1a1aa;">This code expires in <strong style="color:#09090b;">10 minutes</strong></p>

            <!-- Divider -->
            <div style="height:1px;background:#f4f4f5;margin:0 0 24px;"></div>

            <!-- Security note -->
            <table cellpadding="0" cellspacing="0" width="100%"><tr>
              <td style="background:#fafafa;border:1px solid #e4e4e7;border-radius:10px;padding:14px 16px;">
                <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
                  🔒 <strong style="color:#09090b;">Never share this code.</strong> NunaCards will never ask for your verification code via phone, email, or chat.
                </p>
              </td>
            </tr></table>

          </td></tr>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0 0;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#a1a1aa;">If you didn't request this, you can safely ignore this email.</p>
          <p style="margin:0;font-size:12px;color:#d4d4d8;">© 2026 NunaCards · Digital business cards for modern teams</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
