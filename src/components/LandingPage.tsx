import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileSpreadsheet,
  FileUp,
  Presentation,
  ShieldAlert,
} from 'lucide-react';

interface LandingPageProps {
  onEnterWorkspace: (initialTab?: 'dashboard' | 'upload') => void;
  savedProjectCount: number;
}

export function LandingPage({ onEnterWorkspace, savedProjectCount }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          <a
            href="#top"
            className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            VENTURE IQ
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a
              href="#capabilities"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Capabilities
            </a>
            <a
              href="#methodology"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Methodology
            </a>
            <a
              href="#demo-dataset"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Biofire Demo
            </a>
            <a
              href="#deliverables"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Deliverables
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onEnterWorkspace('dashboard')}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-teal-600"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-12 px-6 py-16 lg:grid-cols-12 lg:py-20">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-xs font-semibold tracking-wide text-teal-700">
              AI Business Analyst · MBA &amp; Entrepreneurship Intelligence
            </p>
            <h1 className="mt-3 text-balance font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Turn Business Ideas into Business Intelligence.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
              Upload any venture plan PDF and transform dense multi-page proposals into a structured
              Business Model Canvas, interactive break-even financials, TAM/SAM/SOM sizing,
              evidence-cited SWOT, 8-domain risk matrix, and exportable executive reports.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onEnterWorkspace('dashboard')}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                Explore Biofire Demo Workspace
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onEnterWorkspace('upload')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                <FileUp className="h-4 w-4 text-teal-700" />
                Upload Venture Plan PDF
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span>Page-cited PDF extraction</span>
              <span aria-hidden="true">·</span>
              <span>Zero invented financial figures</span>
              <span aria-hidden="true">·</span>
              <span>{savedProjectCount} active workspace project{savedProjectCount === 1 ? '' : 's'}</span>
            </div>
          </div>

          {/* Interactive BI Preview Panel */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-900 p-6 text-white lg:col-span-6">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <p className="text-xs font-medium text-teal-400">Loaded Academic Demonstration</p>
                  <h2 className="mt-1 font-display text-lg font-bold text-white">
                    Biofire Technologies (Biofire Inc.)
                  </h2>
                </div>
                <span className="font-mono text-xs tabular-nums text-slate-300">11 Pages · DGU MBA</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs text-slate-400">Base Monthly Revenue</p>
                  <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-white">
                    INR 12.50 Cr
                  </p>
                  <p className="mt-1 text-xs text-slate-400">1,000 units · Page 7</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs text-slate-400">Break-Even Threshold</p>
                  <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-teal-400">
                    554 units/mo
                  </p>
                  <p className="mt-1 text-xs text-slate-400">60% gross margin · Calculated</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs text-slate-400">Serviceable Market (SAM)</p>
                  <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-white">
                    15.0M Buyers
                  </p>
                  <p className="mt-1 text-xs text-slate-400">INR 1,87,500 Cr · Page 7</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs text-slate-400">Document Audit Alerts</p>
                  <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-amber-400">
                    4 Findings
                  </p>
                  <p className="mt-1 text-xs text-slate-400">2 input typos flagged · Pages 6–7</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-300">
              <span>Includes Venture Assistant AI &amp; PDF/DOCX Reports</span>
              <button
                type="button"
                onClick={() => onEnterWorkspace('dashboard')}
                className="font-semibold text-teal-400 transition-colors hover:text-teal-300"
              >
                Inspect Full Analysis →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Proof / Methodology Strip */}
      <section id="methodology" className="border-b border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-900">10 Modules</p>
            <p className="mt-1 text-sm text-slate-600">
              Unified BI suite from PDF extraction to viva presentation slides.
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-900">Page-Cited</p>
            <p className="mt-1 text-sm text-slate-600">
              Every extracted claim links directly to its exact source PDF page.
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-900">Audit-First</p>
            <p className="mt-1 text-sm text-slate-600">
              Highlights missing financials and conflicting inputs rather than inventing data.
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-900">PDF &amp; DOCX</p>
            <p className="mt-1 text-sm text-slate-600">
              Export 7 structured report formats and multi-theme academic slide decks.
            </p>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="capabilities" className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Built for Rigorous Venture Evaluation
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Designed for MBA entrepreneurship courses, startup evaluators, and business analysts
              who require transparent provenance between source documents and derived intelligence.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <FileUp className="h-5 w-5 text-teal-700" />
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                01. Structured PDF Extraction
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Parses multi-page business plans to isolate customer friction, target segments,
                value proposition, MVP scope, and 30-day go-to-market experiments with page citations.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <BarChart3 className="h-5 w-5 text-teal-700" />
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                02. Interactive Financial Intelligence
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Models Conservative, Base, and Ambitious scenarios with live assumption sliders,
                break-even curves, and automated discrepancy flagging.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <FileSpreadsheet className="h-5 w-5 text-teal-700" />
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                03. Business Model &amp; Market Matrix
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Visualizes all 9 Business Model Canvas blocks alongside TAM/SAM/SOM sizing and
                2D competitor positioning scatter plots.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <ShieldAlert className="h-5 w-5 text-teal-700" />
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                04. SWOT &amp; 8-Domain Risk Matrix
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Separates document facts from AI interpretations and scores financial, adoption,
                technical, regulatory, privacy, safety, and ethical risks on a 5×5 heatmap.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <BookOpen className="h-5 w-5 text-teal-700" />
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                05. Grounded Venture Assistant
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Ask questions about assumptions, viva defense preparation, or unit economics—answers
                are grounded in the uploaded PDF and flag unstated information honestly.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <Presentation className="h-5 w-5 text-teal-700" />
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                06. Reports &amp; Presentation Studio
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Generate 7 academic and executive report formats in PDF and DOCX, or build a
                6, 10, or 12-slide presentation deck ready for MBA defense.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Biofire Demonstration Dataset Section */}
      <section id="demo-dataset" className="border-b border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold text-teal-700">Pre-Loaded Academic Case Study</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">
              Biofire Technologies (DGU Venture Quest Plan)
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              The initial workspace comes pre-populated with the 11-page Biofire Technologies MBA
              venture plan—demonstrating how VENTURE IQ extracts structured claims, detects numeric
              inconsistencies in financial tables, maps competitors on a 2D strategic matrix, and
              maintains strict academic safety governance for regulated products.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                <span>
                  Flags the Base scenario Variable Cost typo (INR 5,000 vs. INR 50,000 implied by
                  60% margin) and Ambitious customer count discrepancy (250 vs. 2,500 in notes).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                <span>
                  Maps Lodestar LNK9, biometric safes, and unlocked handguns against Biofire on
                  Smart Security vs. Emergency Readiness axes (Pages 4–5).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                <span>
                  Evaluates regulatory, FFL compliance, biometric privacy, and product safety at a
                  strictly high-level academic and ethical risk standard.
                </span>
              </li>
            </ul>
          </div>

          <div id="deliverables" className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
            <h3 className="font-display text-base font-bold text-slate-900">
              Ready to Evaluate a Venture Plan?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Inspect the Biofire Technologies intelligence dashboard immediately or upload your own
              business plan PDF for real-time Gemini extraction.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => onEnterWorkspace('dashboard')}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Launch Biofire BI Dashboard
              </button>
              <button
                type="button"
                onClick={() => onEnterWorkspace('upload')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                Upload New Business Plan PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <span className="font-semibold text-slate-800">VENTURE IQ · AI Business Analyst</span>
          <span>Turn Business Ideas into Business Intelligence · Academic &amp; MBA Analytics</span>
        </div>
      </footer>
    </div>
  );
}
