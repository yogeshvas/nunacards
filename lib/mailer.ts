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
