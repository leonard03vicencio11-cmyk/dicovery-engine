import { GoogleGenerativeAI } from "@google/generative-ai";
import { DiscoveryAnswers, StrategySummary } from "./types";

const SYSTEM_PROMPT = `You are a senior marketing strategist reviewing a client intake form. Return ONLY a JSON object (no markdown fences, no prose outside the JSON) matching this shape:
{
  "headline": string, // one sentence, specific to this business
    "diagnosis": string, // 2-3 sentences, grounded strictly in what was submitted
      "recommendedFocus": string[], // 3-5 short bullet points
        "quickWins": string[], // 3-5 concrete, low-effort actions
          "ninetyDayPlan": string // 2-3 sentences describing a realistic 90-day direction
          }
          Base everything strictly on the submitted answers. Do not invent statistics, competitor names, or benchmarks that were not provided. If information is missing, reason around the gap rather than guessing a number.`;

/**
 * Uses Gemini (free tier via Google AI Studio) instead of a paid model —
 * same JSON-in-JSON-out contract as before, so nothing downstream
 * (drive.ts, the results page) needs to change if you ever swap providers
 * again later.
 */
export async function generateStrategySummary(
    answers: DiscoveryAnswers
  ): Promise<StrategySummary> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
          throw new Error("GEMINI_API_KEY is not configured");
    }

  const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          systemInstruction: SYSTEM_PROMPT,
          generationConfig: {
                  responseMimeType: "application/json",
          },
    });

  const result = await model.generateContent(
        `Here is the client's submitted intake data as JSON:\n\n${JSON.stringify(
                answers,
                null,
                2
              )}\n\nReturn the strategy JSON now.`
      );

  const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as StrategySummary;
}
