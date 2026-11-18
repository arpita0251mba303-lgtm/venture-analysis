import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { PresentationSlide, VentureProject } from '../types/venture';
import {
  computeScenarioFinancials,
  formatCurrencyValue,
  formatNumber,
} from '../utils/financialCalculations';
import { exportPresentationToPDF } from '../utils/exportGenerators';

interface PresentationGeneratorViewProps {
  project: VentureProject;
  onSaveSlides: (slides: PresentationSlide[]) => void;
}

type DeckLength = 6 | 10 | 12;
type DeckTheme = 'navy' | 'academic' | 'teal';

function buildDefaultSlides(project: VentureProject, count: DeckLength): PresentationSlide[] {
  const base =
    project.financials.scenarios.find((s) => s.id === 'base') || project.financials.scenarios[0];
  const baseCalc = base ? computeScenarioFinancials(base) : null;

  const full12: PresentationSlide[] = [
    {
      slideNumber: 1,
      sectionTitle: 'Introduction',
      headline: `${project.extraction.businessName}: Venture Intelligence Overview`,
      bullets: [
        `Category: ${project.extraction.businessCategory}`,
        `Target Geography: ${project.extraction.geography}`,
        `Academic Context: ${project.extraction.authorContext}`,
      ],
      keyMetric: {
        label: 'Document Scope',
        value: `${project.pageCount} Pages`,
      },
      speakerNotes:
        'Introduce the venture name, academic context, and core mission to eliminate the home-defense safety vs. access latency tradeoff.',
      sourcePage: 1,
    },
    {
      slideNumber: 2,
      sectionTitle: 'Business Idea',
      headline: 'Integrated Dual-Biometric Smart Defense Architecture',
      bullets: [
        project.extraction.mvpScope.coreFeature,
        'Operates offline with zero Wi-Fi, Bluetooth, cloud telemetry, or smartphone app dependencies.',
        'Instantly locks when leaving an authorized owner’s hand.',
      ],
      keyMetric: {
        label: 'Unlock Target',
        value: '<100ms · 99.99%',
      },
      speakerNotes:
        'Explain the Guardian Biometric Engine concept at a high level without unnecessary engineering clutter.',
      sourcePage: 3,
    },
    {
      slideNumber: 3,
      sectionTitle: 'Problem Identification',
      headline: 'Eliminating the Safety vs. Emergency Readiness Tradeoff',
      bullets: project.extraction.customerPainPoints.map((p) => p.text),
      keyMetric: {
        label: 'Evidence Strength',
        value: 'CDC / Pew / JHU',
      },
      speakerNotes:
        'Highlight the two unsatisfactory current workarounds: slow nightstand safes or dangerous unlocked storage.',
      sourcePage: 1,
    },
    {
      slideNumber: 4,
      sectionTitle: 'Target Customers',
      headline: 'Beachhead: Tech-Forward Parents & Safety-Conscious Homeowners',
      bullets: project.market.targetSegments.map(
        (seg) => `${seg.name}: ${seg.demographics} (${seg.willingnessToPay})`
      ),
      keyMetric: {
        label: 'Target MSRP',
        value: '$1,499–$1,800',
      },
      speakerNotes:
        'Focus on ages 30–55 suburban homeowners with children as the high-willingness-to-pay beachhead.',
      sourcePage: 3,
    },
    {
      slideNumber: 5,
      sectionTitle: 'Value Proposition',
      headline: 'Instant Authorized Access With 100% Unauthorized Lockout',
      bullets: [
        project.extraction.valueProposition.text,
        'Solid-state encrypted electronics prevent hot-wiring or mechanical bypass.',
      ],
      speakerNotes:
        'Contrast Biofire against doing nothing or using traditional lockboxes.',
      sourcePage: 3,
    },
    {
      slideNumber: 6,
      sectionTitle: 'Business Model',
      headline: 'Direct-to-Consumer Hardware Model Fulfilled via Licensed FFLs',
      bullets: [
        project.extraction.revenueModel.text,
        'Zero mandatory recurring software subscription fees.',
        '30-day validation funnel backed by INR 8,000 ($100) refundable deposits.',
      ],
      keyMetric: {
        label: 'Unit Price Modeled',
        value: formatCurrencyValue(base?.sellingPrice, project.financials.currencyCode),
      },
      speakerNotes:
        'Walk through the 9 Business Model Canvas blocks and high fixed-cost operating leverage.',
      sourcePage: 6,
    },
    {
      slideNumber: 7,
      sectionTitle: 'Market Analysis',
      headline: '15M Serviceable U.S. Households Anchor a 0.08% SOM Capture Plan',
      bullets: [
        `TAM: ${formatNumber(project.market.tamCustomers)} U.S. gun owners (${formatCurrencyValue(project.market.tamValue, project.financials.currencyCode, true)})`,
        `SAM: ${formatNumber(project.market.samCustomers)} safety-conscious parents (${formatCurrencyValue(project.market.samValue, project.financials.currencyCode, true)})`,
        `SOM: ${formatNumber(project.market.somCustomers)} Year 1–2 units (${formatCurrencyValue(project.market.somValue, project.financials.currencyCode, true)})`,
      ],
      keyMetric: {
        label: 'Year 1–2 SOM',
        value: formatCurrencyValue(project.market.somValue, project.financials.currencyCode, true),
      },
      speakerNotes:
        'Explain how 12,000 annual units equals 1,000 units/month in the Base commercial scenario.',
      sourcePage: 7,
    },
    {
      slideNumber: 8,
      sectionTitle: 'Competitor Analysis',
      headline: 'Leading Quadrant Position on Smart Security & Access Speed',
      bullets: project.market.competitors.map(
        (c) => `${c.name} (${c.priceRange}): X=${c.axisXScore ?? '-'}, Y=${c.axisYScore ?? '-'} — ${c.mainWeakness}`
      ),
      keyMetric: {
        label: 'Biofire Score',
        value: `X:${project.market.ventureAxisXScore ?? 10} · Y:${project.market.ventureAxisYScore ?? 9}`,
      },
      speakerNotes:
        'Compare Biofire against Lodestar LNK9, biometric safes, and unlocked mechanical handguns.',
      sourcePage: 4,
    },
    {
      slideNumber: 9,
      sectionTitle: 'Financial Analysis',
      headline: '60% Target Unit Margin With 554-Unit Monthly Break-Even',
      bullets: [
        `Base Document Output: ${formatCurrencyValue(base?.documentReported?.monthlyRevenue ?? baseCalc?.monthlyRevenue, project.financials.currencyCode, true)} monthly revenue, ${formatCurrencyValue(base?.documentReported?.operatingSurplus ?? baseCalc?.operatingSurplus, project.financials.currencyCode, true)} surplus`,
        'Conservative (450 units/mo) yields an operating loss of INR 77.5L below break-even.',
        'Audit Note: Flags Base variable cost typo (5,000 vs 50,000) and Ambitious units typo (250 vs 2,500).',
      ],
      keyMetric: {
        label: 'Break-Even',
        value: '554 units/mo',
      },
      speakerNotes:
        'Demonstrate academic rigor by transparently surfacing the document typos and missing multi-year cash flows.',
      sourcePage: 7,
    },
    {
      slideNumber: 10,
      sectionTitle: 'SWOT Analysis',
      headline: 'Air-Gapped Differentiation vs. High Fixed Overhead & Skepticism',
      bullets: [
        `Strength: ${project.swot.strengths[0]?.observation}`,
        `Weakness: ${project.swot.weaknesses[0]?.observation}`,
        `Opportunity: ${project.swot.opportunities[0]?.observation}`,
        `Threat: ${project.swot.threats[0]?.observation}`,
      ],
      speakerNotes:
        'Distinguish facts extracted directly from the venture plan from strategic MBA interpretations.',
      sourcePage: 10,
    },
    {
      slideNumber: 11,
      sectionTitle: 'Risks and Challenges',
      headline: 'Reliability, Regulatory Compliance & Ethical Governance Priorities',
      bullets: project.risks
        .slice(0, 4)
        .map((r) => `[${r.category}] ${r.title} (Score ${r.likelihood * r.impact}/25)`),
      speakerNotes:
        'Address electronic reliability skepticism, state-by-state FFL compliance, and product safety ethics.',
      sourcePage: 11,
    },
    {
      slideNumber: 12,
      sectionTitle: 'Conclusion',
      headline: 'Four Immediate Validation Milestones Before Mass Scaling',
      bullets: project.extraction.immediateActions.map((a) => a.text),
      speakerNotes:
        'Conclude with actionable validation milestones: third-party live-fire trials, FFL batch fulfillment, feedback loop, and compliance scaling.',
      sourcePage: 11,
    },
  ];

  if (count === 12) return full12;
  if (count === 6) {
    return [full12[0], full12[2], full12[5], full12[6], full12[8], full12[11]].map((s, idx) => ({
      ...s,
      slideNumber: idx + 1,
    }));
  }
  return [
    full12[0],
    full12[2],
    full12[3],
    full12[4],
    full12[5],
    full12[6],
    full12[7],
    full12[8],
    full12[10],
    full12[11],
  ].map((s, idx) => ({
    ...s,
    slideNumber: idx + 1,
  }));
}

export function PresentationGeneratorView({
  project,
  onSaveSlides,
}: PresentationGeneratorViewProps) {
  const [deckLength, setDeckLength] = useState<DeckLength>(12);
  const [theme, setTheme] = useState<DeckTheme>('navy');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slides = useMemo(() => {
    if (project.savedSlides && project.savedSlides.length === deckLength) {
      return project.savedSlides;
    }
    return buildDefaultSlides(project, deckLength);
  }, [project, deckLength]);

  const currentSlide = slides[activeIndex] || slides[0];

  const handleGenerateSlides = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            fileName: project.fileName,
            pages: project.pages,
          },
          slideCount: deckLength,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate slides.');
      }
      onSaveSlides(data.slides);
      setActiveIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Presentation generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const themeClasses = {
    navy: {
      canvas: 'bg-slate-900 text-white border-slate-800',
      kicker: 'text-teal-400',
      bullet: 'text-slate-200',
      metricBox: 'border-slate-700 bg-slate-950/70 text-white',
      footer: 'border-slate-800 text-slate-400',
    },
    academic: {
      canvas: 'bg-white text-slate-900 border-slate-300',
      kicker: 'text-teal-700',
      bullet: 'text-slate-700',
      metricBox: 'border-slate-200 bg-slate-50 text-slate-900',
      footer: 'border-slate-200 text-slate-500',
    },
    teal: {
      canvas: 'bg-teal-950 text-white border-teal-900',
      kicker: 'text-teal-300',
      bullet: 'text-teal-50',
      metricBox: 'border-teal-800 bg-teal-900/50 text-white',
      footer: 'border-teal-900 text-teal-300',
    },
  }[theme];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-medium text-teal-700">Academic Defense Deck</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            Presentation Studio
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Length Selector */}
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
            {([6, 10, 12] as DeckLength[]).map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => {
                  setDeckLength(len);
                  setActiveIndex(0);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  deckLength === len
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {len} Slides
              </button>
            ))}
          </div>

          {/* Theme Selector */}
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
            {(
              [
                ['navy', 'Executive Navy'],
                ['academic', 'Clean Academic'],
                ['teal', 'Teal Strategy'],
              ] as [DeckTheme, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  theme === id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateSlides}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-700" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
            )}
            AI Regenerate Deck
          </button>

          <button
            type="button"
            onClick={() => exportPresentationToPDF(project, slides, theme)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            Export Slides PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          {error}
        </div>
      )}

      {/* Main Slide Canvas */}
      <div
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 p-6 sm:p-10'
            : 'space-y-4'
        }
      >
        <div
          className={`relative flex min-h-[420px] flex-col justify-between rounded-2xl border p-8 sm:p-10 shadow-sm ${
            themeClasses.canvas
          } ${isFullscreen ? 'mx-auto flex-1 w-full max-w-6xl' : ''}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${themeClasses.kicker}`}>
                Slide {currentSlide.slideNumber} · {currentSlide.sectionTitle}
              </p>
              <h2 className="mt-2 max-w-3xl font-display text-2xl font-bold leading-tight sm:text-3xl">
                {currentSlide.headline}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen((f) => !f)}
              className="rounded-lg border border-current/20 p-2 opacity-75 transition-opacity hover:opacity-100"
              aria-label={isFullscreen ? 'Exit fullscreen presentation' : 'Enter fullscreen presentation'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="my-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <ul
              className={`space-y-3.5 text-sm sm:text-base ${
                currentSlide.keyMetric ? 'lg:col-span-8' : 'lg:col-span-12'
              } ${themeClasses.bullet}`}
            >
              {currentSlide.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70`} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {currentSlide.keyMetric && (
              <div className={`rounded-xl border p-6 lg:col-span-4 ${themeClasses.metricBox}`}>
                <p className="text-xs font-medium opacity-75">{currentSlide.keyMetric.label}</p>
                <p className="mt-2 font-mono text-2xl font-bold tabular-nums">
                  {currentSlide.keyMetric.value}
                </p>
              </div>
            )}
          </div>

          <div
            className={`flex items-center justify-between border-t pt-4 text-xs ${themeClasses.footer}`}
          >
            <span>
              VENTURE IQ · {project.extraction.businessName}
            </span>
            <span className="font-mono tabular-nums">
              {currentSlide.slideNumber} / {slides.length}
              {currentSlide.sourcePage ? ` · Source Page ${currentSlide.sourcePage}` : ''}
            </span>
          </div>
        </div>

        {/* Navigation Controls + Speaker Notes */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeIndex <= 0}
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              disabled={activeIndex >= slides.length - 1}
              onClick={() => setActiveIndex((i) => Math.min(slides.length - 1, i + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <p className="flex-1 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Speaker Notes: </span>
            {currentSlide.speakerNotes}
          </p>
        </div>
      </div>

      {/* Slide Thumbnail Rail */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {slides.map((s, idx) => (
          <button
            key={s.slideNumber}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              idx === activeIndex
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
            }`}
          >
            <p className="font-mono text-[10px] opacity-75">Slide {s.slideNumber}</p>
            <p className="mt-1 truncate text-xs font-semibold">{s.sectionTitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
