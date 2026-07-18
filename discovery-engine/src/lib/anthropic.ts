import Anthropic from "@anthropic-ai/sdk";
import { DiscoveryAnswers, StrategySummary } from "./types";

const SYSTEM_PROMPT = `You are a senior marketing strategist reviewing a client intake form.
Return ONLY a JSON object (no markdown fences, no prose outside the JSON) matching this shape:
{
  "headline": string,        // one sentence, specific to this business
  "diagnosis": string,       // 2-3 sentences, grounded strictly in what was submitted
  "recommendedFocus": string[],  // 3-5 short bullet points
  "quickWins": string[],         // 3-5 concrete, low-effort actions
  "ninetyDayPlan": string        // 2-3 sentences describing a realistic 90-day direction
}
Base everything strictly on the submitted answers. Do not invent statistics,
competitor names, or benchmarks that were not provided. If information is
missing, reason around the gap rather than guessing a number.`;

export async function generateStrategySummary(
  answers: DiscoveryAnswers
): Promise<StrategySummary> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is the client's submitted intake data as JSON:\n\n${JSON.stringify(
          answers,
          null,
          2
        )}\n\nReturn the strategy JSON now.`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as StrategySummary;
  return parsed;
}
