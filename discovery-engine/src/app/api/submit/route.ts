import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DiscoveryAnswers, SubmitResponse } from "@/lib/types";
import { generateStrategySummary } from "@/lib/gemini";
import { createStrategyDoc } from "@/lib/drive";
import { upsertLead } from "@/lib/sheets";
import { sendEmail } from "@/lib/gmail";

// Only the fields that gate a valid submission are strictly validated;
// the rest of the (large, branching) answer object is trusted as-is since
// it was produced by our own client, not free-form user JSON.
const RequiredFieldsSchema = z.object({
  businessName: z.string().min(1),
  industry: z.string().min(1),
  location: z.string().min(1),
  contactEmail: z.string().email(),
  contactName: z.string().min(1),
  goalPath: z.string().min(1),
});

// --- naive in-memory per-IP rate limit (resets on cold start; fine for
// an MVP — swap for Vercel Edge Config / Upstash if you need it durable) ---
const submissionLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionLog.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  submissionLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  let body: DiscoveryAnswers;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const check = RequiredFieldsSchema.safeParse(body);
  if (!check.success) {
    return NextResponse.json(
      { error: "Missing required fields", details: check.error.flatten() },
      { status: 400 }
    );
  }

  const calendlyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/your-handle";

  // 1. AI strategy summary — non-fatal on failure
  let summary = null;
  let aiFailed = false;
  try {
    summary = await generateStrategySummary(body);
  } catch (err) {
    console.error("Anthropic summary generation failed:", err);
    aiFailed = true;
  }

  // 2. Google Doc — non-fatal on failure
  let docLink: string | null = null;
  try {
    docLink = await createStrategyDoc(body, summary);
  } catch (err) {
    console.error("Google Doc creation failed:", err);
  }

  // 3. Lead tracking sheet — non-fatal on failure
  try {
    await upsertLead({
      email: body.contactEmail,
      name: body.contactName,
      business: body.businessName,
      goal_path: body.goalPath,
      status: aiFailed ? "AI_SUMMARY_FAILED" : "NOT_BOOKED",
      reminder_count: 0,
      last_reminder_date: new Date().toISOString().slice(0, 10),
      doc_link: docLink || "",
      submitted_at: new Date().toISOString(),
      unsubscribed: false,
    });
  } catch (err) {
    console.error("Sheet upsert failed:", err);
  }

  // 4. Confirmation email — non-fatal on failure
  try {
    const unsubscribeUrl = `${req.nextUrl.origin}/api/unsubscribe?email=${encodeURIComponent(
      body.contactEmail
    )}&token=${Buffer.from(body.contactEmail).toString("base64url")}`;

    await sendEmail(
      body.contactEmail,
      `Your Discovery Summary — ${body.businessName}`,
      [
        summary ? summary.headline : "Your discovery answers are in.",
        "",
        docLink ? `Full report: ${docLink}` : "",
        `Book a strategy call: ${calendlyUrl}`,
        "",
        `Don't want weekly check-ins? Unsubscribe: ${unsubscribeUrl}`,
      ]
        .filter(Boolean)
        .join("\n")
    );
  } catch (err) {
    console.error("Confirmation email failed:", err);
  }

    // 5. Formspree copy - non-fatal on failure, sends a copy of every submission to Formspree
    try {
          await fetch("https://formspree.io/f/xrenqgwe", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Accept: "application/json" },
                  body: JSON.stringify({
                            name: body.contactName,
                            email: body.contactEmail,
                            business: body.businessName,
                            industry: body.industry,
                            location: body.location,
                            goalPath: body.goalPath,
                            docLink: docLink || "",
                  }),
          });
    } catch (err) {
          console.error("Formspree notification failed:", err);
    }

  const response: SubmitResponse = { summary, docLink, calendlyUrl, aiFailed };
  return NextResponse.json(response);
}
