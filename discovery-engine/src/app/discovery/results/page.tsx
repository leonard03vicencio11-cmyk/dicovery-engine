"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SubmitResponse } from "@/lib/types";

export default function ResultsPage() {
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [email, setEmail] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("discovery_result");
    const storedEmail = sessionStorage.getItem("discovery_email");
    if (!raw) {
      setNotFound(true);
      return;
    }
    setResult(JSON.parse(raw));
    setEmail(storedEmail || "");
  }, []);

  if (notFound) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="file-label mb-4">FILE_11 // NO_ACTIVE_SUBMISSION</p>
        <h1 className="mb-6 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold">
          We don&rsquo;t have a result to show yet.
        </h1>
        <Link href="/discovery" className="border border-[var(--dossier-red)] px-6 py-3 text-sm uppercase tracking-widest text-[var(--dossier-red)]">
          Start Discovery
        </Link>
      </main>
    );
  }

  if (!result) return null;

  const { summary, docLink, calendlyUrl, aiFailed } = result;

  return (
    <main className="min-h-screen dot-grid">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="file-label mb-4">
          <span className="text-[var(--dossier-red)]">●</span> FILE_11 // STRATEGY_GENERATED
        </p>

        {aiFailed || !summary ? (
          <div className="mb-10 border border-[var(--dossier-line-strong)] p-6">
            <h1 className="mb-3 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold">
              Your answers are saved.
            </h1>
            <p className="text-[var(--dossier-text-dim)]">
              Your strategist will follow up personally with your custom
              breakdown — no need to do anything else here.
            </p>
          </div>
        ) : (
          <div className="relative mb-10 border border-[var(--dossier-line-strong)] p-6 md:p-10">
            <span className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-[var(--dossier-red)]" />
            <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[var(--dossier-red)]" />
            <h1 className="mb-6 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold leading-tight md:text-4xl">
              {summary.headline}
            </h1>

            <Section title="Diagnosis" body={summary.diagnosis} />
            <ListSection title="Recommended Focus" items={summary.recommendedFocus} />
            <ListSection title="Quick Wins" items={summary.quickWins} />
            <Section title="90-Day Direction" body={summary.ninetyDayPlan} />
          </div>
        )}

        {docLink && (
          <a
            href={docLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-10 inline-flex items-center gap-2 border-b border-[var(--dossier-red)] pb-1 text-sm text-[var(--dossier-red)]"
          >
            View your full strategy document →
          </a>
        )}

        <div className="border-t border-[var(--dossier-line)] pt-10">
          <p className="file-label mb-4">FILE_11 // NEXT_STEP</p>
          <h2 className="mb-4 font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
            Want help putting this into motion?
          </h2>
          <div className="overflow-hidden border border-[var(--dossier-line-strong)]">
            <iframe
              src={calendlyUrl}
              title="Book a strategy call"
              className="h-[640px] w-full"
              loading="lazy"
            />
          </div>
          <p className="mt-4 text-sm text-[var(--dossier-text-faint)]">
            Prefer email? We&rsquo;ve also sent this to {email || "your inbox"},
            along with a weekly check-in until we connect.
          </p>
        </div>
      </div>
    </main>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-6">
      <p className="file-label mb-2 text-[var(--dossier-red)]">{title}</p>
      <p className="leading-relaxed text-[var(--dossier-text-dim)]">{body}</p>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-6">
      <p className="file-label mb-2 text-[var(--dossier-red)]">{title}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 leading-relaxed text-[var(--dossier-text-dim)]">
            <span className="text-[var(--dossier-text-faint)]">{String(i + 1).padStart(2, "0")}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
