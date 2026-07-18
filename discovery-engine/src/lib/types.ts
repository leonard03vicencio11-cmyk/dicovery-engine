export type GoalPath =
  | "Brand Awareness"
  | "Lead Generation"
  | "Sales"
  | "Customer Retention"
  | "Community"
  | "Hiring"
  | "Authority"
  | "Product Launch";

export type Channel =
  | "Facebook"
  | "Instagram"
  | "TikTok"
  | "LinkedIn"
  | "YouTube"
  | "Pinterest"
  | "Google";

export interface DiscoveryAnswers {
  // Step 1 — business snapshot
  businessName: string;
  website: string;
  industry: string;
  location: string;
  contactEmail: string;
  contactName: string;

  // Step 2 — objective
  goalPath: GoalPath | "";

  // Step 3 — branch (fields used depend on goalPath)
  buyingChannels: string[]; // sales/leads
  monthlyInquiries: string;
  monthlySales: string;
  salesObstacle: string;
  hasSalesProcess: "Yes" | "No" | "";

  audienceFamiliarity: string; // awareness
  awarenessMetrics: string[];
  perceptionGoal: string;

  communityType: string; // community
  interactionFrequency: string;
  customersCreateContent: "Yes" | "No" | "";

  repeatPurchaseRate: string; // retention
  churnReason: string;
  hasLoyaltyProgram: "Yes" | "No" | "";

  otherGoalPriority: string; // hiring / authority / product launch
  otherGoalBaseline: string;
  otherGoalObstacle: string;

  // Step 4 — maturity
  maturity: string;
  hasWebsiteAsset: "Yes" | "No" | "";
  hasLogo: "Yes" | "No" | "";
  hasBrandGuidelines: "Yes" | "No" | "";
  hasCRM: "Yes" | "No" | "";
  hasEmailListAsset: "Yes" | "No" | "";
  monthlyBudgetExisting: string;
  hasAgency: "Yes" | "No" | "";
  hasKPIs: "Yes" | "No" | "";
  hasAnalytics: "Yes" | "No" | "";
  runningAds: "Yes" | "No" | "";
  usesCRM: "Yes" | "No" | "";

  // Step 5 — channels
  channels: Channel[];
  channelFrequency: Partial<Record<Channel, string>>;

  // Step 6 — paid ads
  runsPaidAds: "Yes" | "No" | "";
  adPlatforms: string[];
  adBudgetRange: string;
  adCampaignGoal: string;

  // Step 7 — website
  hasWebsite: "Yes" | "No" | "";
  monthlyTraffic: string;
  hasBookingSystem: "Yes" | "No" | "";
  hasGoogleAnalytics: "Yes" | "No" | "";
  hasSEOWork: "Yes" | "No" | "";

  // Step 8 — email
  hasEmailList: "Yes" | "No" | "";
  subscriberCount: string;
  openRate: string;
  hasAutomations: "Yes" | "No" | "";

  // Step 9 — budget
  monthlyInvestment: string;
  allocation: string[];

  // Step 10 — reflection
  oneProblem: string;
  sixMonthSuccess: string;
  whatToAvoid: string;
}

export const emptyAnswers: DiscoveryAnswers = {
  businessName: "",
  website: "",
  industry: "",
  location: "",
  contactEmail: "",
  contactName: "",
  goalPath: "",
  buyingChannels: [],
  monthlyInquiries: "",
  monthlySales: "",
  salesObstacle: "",
  hasSalesProcess: "",
  audienceFamiliarity: "",
  awarenessMetrics: [],
  perceptionGoal: "",
  communityType: "",
  interactionFrequency: "",
  customersCreateContent: "",
  repeatPurchaseRate: "",
  churnReason: "",
  hasLoyaltyProgram: "",
  otherGoalPriority: "",
  otherGoalBaseline: "",
  otherGoalObstacle: "",
  maturity: "",
  hasWebsiteAsset: "",
  hasLogo: "",
  hasBrandGuidelines: "",
  hasCRM: "",
  hasEmailListAsset: "",
  monthlyBudgetExisting: "",
  hasAgency: "",
  hasKPIs: "",
  hasAnalytics: "",
  runningAds: "",
  usesCRM: "",
  channels: [],
  channelFrequency: {},
  runsPaidAds: "",
  adPlatforms: [],
  adBudgetRange: "",
  adCampaignGoal: "",
  hasWebsite: "",
  monthlyTraffic: "",
  hasBookingSystem: "",
  hasGoogleAnalytics: "",
  hasSEOWork: "",
  hasEmailList: "",
  subscriberCount: "",
  openRate: "",
  hasAutomations: "",
  monthlyInvestment: "",
  allocation: [],
  oneProblem: "",
  sixMonthSuccess: "",
  whatToAvoid: "",
};

export interface StrategySummary {
  headline: string;
  diagnosis: string;
  recommendedFocus: string[];
  quickWins: string[];
  ninetyDayPlan: string;
}

export interface SubmitResponse {
  summary: StrategySummary | null;
  docLink: string | null;
  calendlyUrl: string;
  aiFailed?: boolean;
}
