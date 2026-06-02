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
  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: "Your NunaCards verification code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#09090b;border-radius:16px;color:#fafafa;">
        <div style="font-size:13px;color:#71717a;margin-bottom:24px;">NunaCards</div>
        <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Hi ${name},</h2>
        <p style="color:#a1a1aa;font-size:14px;margin:0 0 32px;">
          Use the code below to verify your email address. It expires in <strong style="color:#fafafa;">10 minutes</strong>.
        </p>
        <div style="text-align:center;letter-spacing:12px;font-size:36px;font-weight:800;padding:24px;background:#18181b;border-radius:12px;border:1px solid #27272a;">
          ${otp}
        </div>
        <p style="color:#52525b;font-size:12px;margin-top:32px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
