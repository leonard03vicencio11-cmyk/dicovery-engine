import { NextRequest, NextResponse } from "next/server";
import { getRemindableLeads, recordReminderSent } from "@/lib/sheets";
import { sendEmail } from "@/lib/gmail";

/**
 * Triggered weekly by Vercel Cron (see vercel.json). Protected by
 * CRON_SECRET so it can't be hit publicly and used to spam your list.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const remindable = await getRemindableLeads();
  const calendlyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/your-handle";
  const origin = req.nextUrl.origin;

  let sent = 0;
  for (const { rowNumber, lead } of remindable) {
    const unsubscribeUrl = `${origin}/api/unsubscribe?email=${encodeURIComponent(
      lead.email
    )}&token=${Buffer.from(lead.email).toString("base64url")}`;

    try {
      await sendEmail(
        lead.email,
        `Still thinking it over, ${lead.name.split(" ")[0]}?`,
        [
          `Your strategy for ${lead.business} is ready whenever you are.`,
          `Book a quick call: ${calendlyUrl}`,
          "",
          `Not interested right now? Unsubscribe: ${unsubscribeUrl}`,
        ].join("\n")
      );
      await recordReminderSent(rowNumber, lead);
      sent += 1;
    } catch (err) {
      console.error(`Reminder failed for ${lead.email}:`, err);
    }
  }

  return NextResponse.json({ checked: remindable.length, sent });
}
