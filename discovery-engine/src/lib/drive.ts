import { google } from "googleapis";
import { getGoogleAuth } from "./google";
import { DiscoveryAnswers, StrategySummary } from "./types";

/**
 * Creates a Google Doc with the full raw Q&A plus the AI summary, inside
 * the configured Drive folder. Returns the doc's shareable webViewLink,
 * or null if Google isn't configured / the call fails — callers should
 * treat that as non-fatal (see /api/submit error handling).
 */
export async function createStrategyDoc(
  answers: DiscoveryAnswers,
  summary: StrategySummary | null
): Promise<string | null> {
  const auth = getGoogleAuth();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!auth || !folderId) return null;

  const drive = google.drive({ version: "v3", auth });

  const body = buildDocText(answers, summary);

  const file = await drive.files.create({
    requestBody: {
      name: `Discovery — ${answers.businessName} — ${new Date()
        .toISOString()
        .slice(0, 10)}`,
      mimeType: "application/vnd.google-apps.document",
      parents: [folderId],
    },
    media: {
      mimeType: "text/plain",
      body,
    },
    fields: "id, webViewLink",
  });

  return file.data.webViewLink ?? null;
}

function buildDocText(
  answers: DiscoveryAnswers,
  summary: StrategySummary | null
): string {
  const lines: string[] = [];
  lines.push(`DISCOVERY REPORT — ${answers.businessName}`);
  lines.push(`Submitted: ${new Date().toISOString()}`);
  lines.push("");

  if (summary) {
    lines.push("=== AI STRATEGY SUMMARY ===");
    lines.push(summary.headline);
    lines.push("");
    lines.push("Diagnosis:");
    lines.push(summary.diagnosis);
    lines.push("");
    lines.push("Recommended Focus:");
    summary.recommendedFocus.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
    lines.push("Quick Wins:");
    summary.quickWins.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
    lines.push("90-Day Direction:");
    lines.push(summary.ninetyDayPlan);
    lines.push("");
  }

  lines.push("=== RAW SUBMISSION ===");
  Object.entries(answers).forEach(([key, value]) => {
    const printable = Array.isArray(value)
      ? value.join(", ")
      : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
    if (printable) lines.push(`${key}: ${printable}`);
  });

  return lines.join("\n");
}
