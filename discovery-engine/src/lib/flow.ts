import { DiscoveryAnswers } from "./types";

/**
 * Returns the ordered list of step ids that should be shown given the
 * current answers. Recomputed on every change so that editing an earlier
 * answer (e.g. going back and switching the goal path) correctly re-shapes
 * the rest of the flow.
 */
export function getActiveStepIds(answers: DiscoveryAnswers): string[] {
  const steps: string[] = ["snapshot", "objective"];

  if (answers.goalPath) {
    steps.push("branch");
  }

  steps.push("maturity");
  if (
    answers.maturity === "Just starting" ||
    answers.maturity === "We have a strategy" ||
    answers.maturity === "We have a full marketing team"
  ) {
    steps.push("maturity_followup");
  }

  steps.push("channels");
  if (answers.channels.length > 0) {
    steps.push("channel_frequency");
  }

  steps.push("paid_ads");
  if (answers.runsPaidAds === "Yes") {
    steps.push("paid_ads_followup");
  }

  steps.push("website");
  if (answers.hasWebsite === "Yes") {
    steps.push("website_followup");
  }

  steps.push("email");
  if (answers.hasEmailList === "Yes") {
    steps.push("email_followup");
  }

  steps.push("budget", "reflection");

  return steps;
}

export const GOAL_PATHS = [
  "Brand Awareness",
  "Lead Generation",
  "Sales",
  "Customer Retention",
  "Community",
  "Hiring",
  "Authority",
  "Product Launch",
] as const;

export const CHANNELS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "LinkedIn",
  "YouTube",
  "Pinterest",
  "Google",
] as const;
