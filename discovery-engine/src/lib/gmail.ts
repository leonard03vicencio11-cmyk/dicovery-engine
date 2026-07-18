import nodemailer from "nodemailer";

/**
 * Sends via Gmail SMTP using an App Password (simplest reliable path for a
 * single-sender freelancer setup — no Workspace domain-wide delegation
 * needed). Requires 2FA enabled on the Gmail account and an App Password
 * generated at myaccount.google.com/apppasswords.
 *
 * For higher volume, swap this for Resend or Postmark — same function
 * signature, just change what's inside sendEmail().
 */
function getTransport() {
  const user = process.env.GMAIL_SENDER_ADDRESS;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export function isGmailConfigured() {
  return Boolean(process.env.GMAIL_SENDER_ADDRESS && process.env.GMAIL_APP_PASSWORD);
}

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const transport = getTransport();
  if (!transport) return { sent: false, reason: "Gmail not configured" };

  await transport.sendMail({
    from: process.env.GMAIL_SENDER_ADDRESS,
    to,
    subject,
    text,
    html,
  });
  return { sent: true };
}
