import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { setLeadStatusByEmail } from "@/lib/sheets";

/**
 * Calendly webhook receiver. Register this URL (yourdomain.com/api/
 * calendly-webhook) as a webhook subscription in your Calendly account for
 * the `invitee.created` event, and set CALENDLY_WEBHOOK_SIGNING_KEY to the
 * signing secret Calendly gives you.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("calendly-webhook-signature");
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  const rawBody = await req.text();

  if (signingKey && signature) {
    const valid = verifySignature(rawBody, signature, signingKey);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const payload = JSON.parse(rawBody);

  if (payload.event === "invitee.created") {
    const email: string | undefined = payload.payload?.email;
    if (email) {
      await setLeadStatusByEmail(email, "BOOKED");
    }
  }

  return NextResponse.json({ received: true });
}

function verifySignature(rawBody: string, header: string, signingKey: string): boolean {
  // Calendly sends: t=<timestamp>,v1=<signature>
  const parts = Object.fromEntries(
    header.split(",").map((p) => p.split("=") as [string, string])
  );
  const { t, v1 } = parts;
  if (!t || !v1) return false;

  const signedPayload = `${t}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", signingKey)
    .update(signedPayload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}
