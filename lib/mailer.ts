import "server-only";
import nodemailer from "nodemailer";

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });
  return transporter;
}

/**
 * Provider-agnostic transactional email. Without SMTP_* configured (e.g. in
 * local development) this logs the email instead of sending it, so auth
 * flows like password reset stay usable without a mail server.
 */
export async function sendMail({ to, subject, html }: SendMailInput) {
  const client = getTransporter();

  if (!client) {
    console.info(`[mailer] SMTP not configured — would send "${subject}" to ${to}:\n${html}`);
    return { delivered: false };
  }

  await client.sendMail({ from: process.env.SMTP_FROM || "no-reply@renishcollections.com", to, subject, html });
  return { delivered: true };
}
