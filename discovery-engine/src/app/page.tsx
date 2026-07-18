import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 dot-grid relative overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-6 py-10 md:px-10">
        {/* Header row */}
        <header className="flex items-center justify-between file-label">
          <span>DOSSIER_OPEN // 2026</span>
          <span>FILE_11 — DISCOVERY_ENGINE</span>
        </header>

        {/* Hero */}
        <section className="flex flex-1 flex-col justify-center py-20 md:py-0">
          <p className="file-label mb-6">
            <span className="text-[var(--dossier-red)]">●</span> INTAKE_STATUS: OPEN
          </p>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            This isn&rsquo;t a form.
            <br />
            It&rsquo;s a{" "}
            <span className="text-[var(--dossier-red)]">read</span> on your
            business.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-[var(--dossier-text-dim)] md:text-lg">
            Answer a branching set of questions — only the ones that apply to
            your goal, your channels, your maturity level. In return: a
            personalized digital strategy summary, a full report saved to
            your inbox, and a direct line to book a call.
          </p>

          <div className="mt-12 flex flex-col items-start gap-4 md:flex-row md:items-center">
            <Link
              href="/discovery"
              className="group inline-flex items-center gap-3 border border-[var(--dossier-red)] bg-[var(--dossier-red)] px-7 py-4 font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase tracking-widest text-[#0a0a0a] transition-colors hover:bg-transparent hover:text-[var(--dossier-red)]"
            >
              Start Discovery
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <span className="file-label text-[var(--dossier-text-faint)]">
              ~4 MIN · NO ACCOUNT REQUIRED
            </span>
          </div>
        </section>

        {/* Footer strip */}
        <footer className="grid grid-cols-1 gap-6 border-t border-[var(--dossier-line)] pt-6 file-label md:grid-cols-3">
          <div>
            <p className="text-[var(--dossier-text-faint)]">01</p>
            <p className="mt-1 text-[var(--dossier-text)]">
              Branching intake — only relevant questions
            </p>
          </div>
          <div>
            <p className="text-[var(--dossier-text-faint)]">02</p>
            <p className="mt-1 text-[var(--dossier-text)]">
              AI-generated strategy, on screen instantly
            </p>
          </div>
          <div>
            <p className="text-[var(--dossier-text-faint)]">03</p>
            <p className="mt-1 text-[var(--dossier-text)]">
              Full report + booking link, sent to your inbox
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
