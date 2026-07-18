"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DiscoveryAnswers, emptyAnswers, Channel } from "@/lib/types";
import { getActiveStepIds, GOAL_PATHS, CHANNELS } from "@/lib/flow";
import {
  FieldGroup,
  TextInput,
  TextArea,
  SingleSelect,
  MultiSelect,
  YesNo,
} from "@/components/fields/Field";

const INDUSTRIES = [
  "Retail / E-commerce",
  "Food & Beverage",
  "Health & Wellness",
  "Real Estate",
  "Professional Services",
  "Education",
  "Technology / SaaS",
  "Creative / Agency",
  "Other",
];

const OTHER_GOAL_COPY: Record<string, { priority: string; baseline: string; obstacle: string }> = {
  Hiring: {
    priority: "What roles are hardest to fill right now?",
    baseline: "How many qualified applicants do you get per opening?",
    obstacle: "What's the biggest obstacle to attracting the right candidates?",
  },
  Authority: {
    priority: "Who do you want to be seen as the go-to expert for?",
    baseline: "Where does your authority currently show up (press, speaking, content)?",
    obstacle: "What's stopping people from recognizing that expertise today?",
  },
  "Product Launch": {
    priority: "What's the single most important outcome for this launch?",
    baseline: "What audience size do you already have to launch to?",
    obstacle: "What's the biggest risk to this launch underperforming?",
  },
};

export default function DiscoveryPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<DiscoveryAnswers>(emptyAnswers);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const stepIds = useMemo(() => getActiveStepIds(answers), [answers]);
  const currentId = stepIds[stepIndex];
  const progress = ((stepIndex + 1) / stepIds.length) * 100;

  function update<K extends keyof DiscoveryAnswers>(key: K, value: DiscoveryAnswers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  function canAdvance(): boolean {
    switch (currentId) {
      case "snapshot":
        return Boolean(
          answers.businessName && answers.industry && answers.location &&
          answers.contactEmail && /\S+@\S+\.\S+/.test(answers.contactEmail) && answers.contactName
        );
      case "objective":
        return Boolean(answers.goalPath);
      case "maturity":
        return Boolean(answers.maturity);
      case "channels":
        return true; // optional
      case "paid_ads":
        return Boolean(answers.runsPaidAds);
      case "website":
        return Boolean(answers.hasWebsite);
      case "email":
        return Boolean(answers.hasEmailList);
      case "budget":
        return Boolean(answers.monthlyInvestment);
      case "reflection":
        return Boolean(answers.oneProblem && answers.sixMonthSuccess);
      default:
        return true;
    }
  }

  function goNext() {
    if (!canAdvance()) return;
    if (stepIndex === stepIds.length - 1) {
      handleSubmit();
      return;
    }
    setDirection(1);
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex === 0) return;
    setDirection(-1);
    setStepIndex((i) => i - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Submission failed");
      sessionStorage.setItem("discovery_result", JSON.stringify(data));
      sessionStorage.setItem("discovery_email", answers.contactEmail);
      router.push("/discovery/results");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong submitting your answers. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col dot-grid">
      {/* Progress bar */}
      <div className="h-1 w-full bg-[var(--dossier-line)]">
        <div
          className="h-1 bg-[var(--dossier-red)] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10 md:py-16">
        <div className="mb-10 flex items-center justify-between file-label">
          <span>FILE_11 // DISCOVERY_ENGINE</span>
          <span>
            {String(stepIndex + 1).padStart(2, "0")} / {String(stepIds.length).padStart(2, "0")}
          </span>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentId}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 24 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex-1"
          >
            {renderStep(currentId, answers, update)}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p className="mb-4 border border-[var(--dossier-red)] px-4 py-3 text-sm text-[var(--dossier-red)]">
            {error}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-10">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0 || submitting}
            className="file-label text-[var(--dossier-text-dim)] transition-opacity hover:text-[var(--dossier-text)] disabled:opacity-30"
          >
            ← BACK
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance() || submitting}
            className="border border-[var(--dossier-red)] bg-[var(--dossier-red)] px-6 py-3 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-widest text-[#0a0a0a] transition-colors hover:bg-transparent hover:text-[var(--dossier-red)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--dossier-red)] disabled:hover:text-[#0a0a0a]"
          >
            {submitting
              ? "Building your strategy…"
              : stepIndex === stepIds.length - 1
              ? "Submit"
              : "Next →"}
          </button>
        </div>
      </div>
    </main>
  );
}

function renderStep(
  id: string,
  a: DiscoveryAnswers,
  update: <K extends keyof DiscoveryAnswers>(key: K, value: DiscoveryAnswers[K]) => void
) {
  switch (id) {
    case "snapshot":
      return (
        <div>
          <FieldGroup label="Let's start with the basics.">
            <TextInput value={a.businessName} onChange={(v) => update("businessName", v)} placeholder="Business name" required />
          </FieldGroup>
          <FieldGroup label="Website (optional)">
            <TextInput value={a.website} onChange={(v) => update("website", v)} placeholder="https://" />
          </FieldGroup>
          <FieldGroup label="Industry">
            <SingleSelect value={a.industry} onChange={(v) => update("industry", v)} options={INDUSTRIES} />
          </FieldGroup>
          <FieldGroup label="Location">
            <TextInput value={a.location} onChange={(v) => update("location", v)} placeholder="City, Country" />
          </FieldGroup>
          <FieldGroup label="Your name">
            <TextInput value={a.contactName} onChange={(v) => update("contactName", v)} placeholder="Full name" />
          </FieldGroup>
          <FieldGroup label="Your email" hint="Required — this is where your strategy and doc link go.">
            <TextInput type="email" value={a.contactEmail} onChange={(v) => update("contactEmail", v)} placeholder="you@business.com" required />
          </FieldGroup>
        </div>
      );

    case "objective":
      return (
        <FieldGroup label="What's your top priority right now?">
          <SingleSelect value={a.goalPath} onChange={(v) => update("goalPath", v as DiscoveryAnswers["goalPath"])} options={GOAL_PATHS} />
        </FieldGroup>
      );

    case "branch":
      return renderBranch(a, update);

    case "maturity":
      return (
        <FieldGroup label="Which best describes your business today?">
          <SingleSelect
            value={a.maturity}
            onChange={(v) => update("maturity", v)}
            options={[
              "Just starting",
              "Posting occasionally",
              "Posting consistently",
              "We have a strategy",
              "We have a full marketing team",
            ]}
          />
        </FieldGroup>
      );

    case "maturity_followup":
      if (a.maturity === "Just starting") {
        return (
          <div>
            <FieldGroup label="Do you already have a website?"><YesNo value={a.hasWebsiteAsset} onChange={(v) => update("hasWebsiteAsset", v)} /></FieldGroup>
            <FieldGroup label="Do you have a logo?"><YesNo value={a.hasLogo} onChange={(v) => update("hasLogo", v)} /></FieldGroup>
            <FieldGroup label="Brand guidelines?"><YesNo value={a.hasBrandGuidelines} onChange={(v) => update("hasBrandGuidelines", v)} /></FieldGroup>
            <FieldGroup label="A CRM?"><YesNo value={a.hasCRM} onChange={(v) => update("hasCRM", v)} /></FieldGroup>
            <FieldGroup label="An email list?"><YesNo value={a.hasEmailListAsset} onChange={(v) => update("hasEmailListAsset", v)} /></FieldGroup>
          </div>
        );
      }
      return (
        <div>
          <FieldGroup label="Monthly marketing budget?">
            <SingleSelect value={a.monthlyBudgetExisting} onChange={(v) => update("monthlyBudgetExisting", v)} options={["< $500", "$500–1k", "$1k–3k", "$3k–5k", "$5k+"]} />
          </FieldGroup>
          <FieldGroup label="Working with an agency?"><YesNo value={a.hasAgency} onChange={(v) => update("hasAgency", v)} /></FieldGroup>
          <FieldGroup label="Tracking KPIs?"><YesNo value={a.hasKPIs} onChange={(v) => update("hasKPIs", v)} /></FieldGroup>
          <FieldGroup label="Analytics in place?"><YesNo value={a.hasAnalytics} onChange={(v) => update("hasAnalytics", v)} /></FieldGroup>
          <FieldGroup label="Running paid ads already?"><YesNo value={a.runningAds} onChange={(v) => update("runningAds", v)} /></FieldGroup>
          <FieldGroup label="Using a CRM day-to-day?"><YesNo value={a.usesCRM} onChange={(v) => update("usesCRM", v)} /></FieldGroup>
        </div>
      );

    case "channels":
      return (
        <FieldGroup label="Which platforms do you actively use?" hint="Select all that apply.">
          <MultiSelect value={a.channels} onChange={(v) => update("channels", v as Channel[])} options={CHANNELS} />
        </FieldGroup>
      );

    case "channel_frequency":
      return (
        <div>
          <p className="mb-6 font-[family-name:var(--font-space-grotesk)] text-lg font-bold md:text-xl">
            How often do you post on each?
          </p>
          {a.channels.map((c) => (
            <FieldGroup key={c} label={c}>
              <SingleSelect
                value={a.channelFrequency[c] || ""}
                onChange={(v) => update("channelFrequency", { ...a.channelFrequency, [c]: v })}
                options={["Daily", "Weekly", "Rarely"]}
              />
            </FieldGroup>
          ))}
        </div>
      );

    case "paid_ads":
      return (
        <FieldGroup label="Do you currently run paid advertising?">
          <YesNo value={a.runsPaidAds} onChange={(v) => update("runsPaidAds", v)} />
        </FieldGroup>
      );

    case "paid_ads_followup":
      return (
        <div>
          <FieldGroup label="Which platforms?">
            <MultiSelect value={a.adPlatforms} onChange={(v) => update("adPlatforms", v)} options={["Meta", "Google", "TikTok", "LinkedIn", "Other"]} />
          </FieldGroup>
          <FieldGroup label="Monthly ad budget?">
            <SingleSelect value={a.adBudgetRange} onChange={(v) => update("adBudgetRange", v)} options={["< $500", "$500–1k", "$1k–3k", "$3k–5k", "$5k+"]} />
          </FieldGroup>
          <FieldGroup label="What's the campaign goal?">
            <TextInput value={a.adCampaignGoal} onChange={(v) => update("adCampaignGoal", v)} placeholder="e.g. leads, sales, awareness" />
          </FieldGroup>
        </div>
      );

    case "website":
      return (
        <FieldGroup label="Do you have a website?">
          <YesNo value={a.hasWebsite} onChange={(v) => update("hasWebsite", v)} />
        </FieldGroup>
      );

    case "website_followup":
      return (
        <div>
          <FieldGroup label="Monthly traffic?">
            <SingleSelect value={a.monthlyTraffic} onChange={(v) => update("monthlyTraffic", v)} options={["< 500", "500–2k", "2k–10k", "10k+", "Not sure"]} />
          </FieldGroup>
          <FieldGroup label="Booking system in place?"><YesNo value={a.hasBookingSystem} onChange={(v) => update("hasBookingSystem", v)} /></FieldGroup>
          <FieldGroup label="Google Analytics installed?"><YesNo value={a.hasGoogleAnalytics} onChange={(v) => update("hasGoogleAnalytics", v)} /></FieldGroup>
          <FieldGroup label="Any SEO work done?"><YesNo value={a.hasSEOWork} onChange={(v) => update("hasSEOWork", v)} /></FieldGroup>
        </div>
      );

    case "email":
      return (
        <FieldGroup label="Do you have an email list?">
          <YesNo value={a.hasEmailList} onChange={(v) => update("hasEmailList", v)} />
        </FieldGroup>
      );

    case "email_followup":
      return (
        <div>
          <FieldGroup label="Roughly how many subscribers?">
            <SingleSelect value={a.subscriberCount} onChange={(v) => update("subscriberCount", v)} options={["< 500", "500–2k", "2k–10k", "10k+"]} />
          </FieldGroup>
          <FieldGroup label="Open rate, if known">
            <TextInput value={a.openRate} onChange={(v) => update("openRate", v)} placeholder="e.g. 22%" />
          </FieldGroup>
          <FieldGroup label="Automations set up?"><YesNo value={a.hasAutomations} onChange={(v) => update("hasAutomations", v)} /></FieldGroup>
        </div>
      );

    case "budget":
      return (
        <div>
          <FieldGroup label="Monthly marketing investment">
            <SingleSelect value={a.monthlyInvestment} onChange={(v) => update("monthlyInvestment", v)} options={["< $500", "$500–1k", "$1k–3k", "$3k–5k", "$5k+"]} />
          </FieldGroup>
          <FieldGroup label="How is it allocated?" hint="Select all that apply.">
            <MultiSelect value={a.allocation} onChange={(v) => update("allocation", v)} options={["Social", "Paid Ads", "SEO", "Website", "Video", "Photo", "Email", "Influencers"]} />
          </FieldGroup>
        </div>
      );

    case "reflection":
      return (
        <div>
          <FieldGroup label="If I could solve ONE problem for your business, what should it be?">
            <TextArea value={a.oneProblem} onChange={(v) => update("oneProblem", v)} placeholder="Be specific — this shapes your strategy." />
          </FieldGroup>
          <FieldGroup label="What would success look like in 6 months?">
            <TextArea value={a.sixMonthSuccess} onChange={(v) => update("sixMonthSuccess", v)} />
          </FieldGroup>
          <FieldGroup label="What should I absolutely avoid doing with your brand?" hint="Optional.">
            <TextArea value={a.whatToAvoid} onChange={(v) => update("whatToAvoid", v)} />
          </FieldGroup>
        </div>
      );

    default:
      return null;
  }
}

function renderBranch(
  a: DiscoveryAnswers,
  update: <K extends keyof DiscoveryAnswers>(key: K, value: DiscoveryAnswers[K]) => void
) {
  if (a.goalPath === "Sales" || a.goalPath === "Lead Generation") {
    return (
      <div>
        <FieldGroup label="How do customers currently buy?" hint="Select all that apply.">
          <MultiSelect value={a.buyingChannels} onChange={(v) => update("buyingChannels", v)} options={["Website", "Messenger", "Phone", "Walk-in", "Email"]} />
        </FieldGroup>
        <FieldGroup label="Average monthly inquiries?">
          <TextInput value={a.monthlyInquiries} onChange={(v) => update("monthlyInquiries", v)} placeholder="e.g. 40" />
        </FieldGroup>
        <FieldGroup label="Average monthly sales?">
          <TextInput value={a.monthlySales} onChange={(v) => update("monthlySales", v)} placeholder="e.g. 12" />
        </FieldGroup>
        <FieldGroup label="Biggest obstacle to more sales?">
          <TextArea value={a.salesObstacle} onChange={(v) => update("salesObstacle", v)} />
        </FieldGroup>
        <FieldGroup label="Do you have a defined sales process?">
          <YesNo value={a.hasSalesProcess} onChange={(v) => update("hasSalesProcess", v)} />
        </FieldGroup>
      </div>
    );
  }

  if (a.goalPath === "Brand Awareness") {
    return (
      <div>
        <FieldGroup label="How familiar is your audience with your brand?">
          <SingleSelect value={a.audienceFamiliarity} onChange={(v) => update("audienceFamiliarity", v)} options={["Nobody knows us", "Some know us", "Fairly known", "Industry leader"]} />
        </FieldGroup>
        <FieldGroup label="Which metrics matter most?" hint="Select all that apply.">
          <MultiSelect value={a.awarenessMetrics} onChange={(v) => update("awarenessMetrics", v)} options={["Reach", "Impressions", "Followers", "Video Views", "Website Visits"]} />
        </FieldGroup>
        <FieldGroup label="What do you want people to think when they see your business?">
          <TextArea value={a.perceptionGoal} onChange={(v) => update("perceptionGoal", v)} />
        </FieldGroup>
      </div>
    );
  }

  if (a.goalPath === "Community") {
    return (
      <div>
        <FieldGroup label="Which community do you want to build?">
          <SingleSelect value={a.communityType} onChange={(v) => update("communityType", v)} options={["Customers", "Professionals", "Parents", "Students", "Businesses"]} />
        </FieldGroup>
        <FieldGroup label="How often do followers interact currently?">
          <SingleSelect value={a.interactionFrequency} onChange={(v) => update("interactionFrequency", v)} options={["Rarely", "Sometimes", "Often", "Constantly"]} />
        </FieldGroup>
        <FieldGroup label="Do customers create content about you organically?">
          <YesNo value={a.customersCreateContent} onChange={(v) => update("customersCreateContent", v)} />
        </FieldGroup>
      </div>
    );
  }

  if (a.goalPath === "Customer Retention") {
    return (
      <div>
        <FieldGroup label="Current repeat-purchase rate, if known" hint="Optional.">
          <TextInput value={a.repeatPurchaseRate} onChange={(v) => update("repeatPurchaseRate", v)} placeholder="e.g. 30%" />
        </FieldGroup>
        <FieldGroup label="What causes customers to leave or stop buying?">
          <TextArea value={a.churnReason} onChange={(v) => update("churnReason", v)} />
        </FieldGroup>
        <FieldGroup label="Do you have a loyalty or retention program?">
          <YesNo value={a.hasLoyaltyProgram} onChange={(v) => update("hasLoyaltyProgram", v)} />
        </FieldGroup>
      </div>
    );
  }

  // Hiring / Authority / Product Launch
  const copy = OTHER_GOAL_COPY[a.goalPath] || OTHER_GOAL_COPY["Product Launch"];
  return (
    <div>
      <FieldGroup label={copy.priority}>
        <TextArea value={a.otherGoalPriority} onChange={(v) => update("otherGoalPriority", v)} />
      </FieldGroup>
      <FieldGroup label={copy.baseline}>
        <TextArea value={a.otherGoalBaseline} onChange={(v) => update("otherGoalBaseline", v)} />
      </FieldGroup>
      <FieldGroup label={copy.obstacle}>
        <TextArea value={a.otherGoalObstacle} onChange={(v) => update("otherGoalObstacle", v)} />
      </FieldGroup>
    </div>
  );
}
