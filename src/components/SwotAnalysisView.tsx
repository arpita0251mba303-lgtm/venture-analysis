import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { SwotAnalysisData, SwotItem, VentureProject } from '../types/venture';

interface SwotAnalysisViewProps {
  project: VentureProject;
  onUpdateSwot: (swot: SwotAnalysisData) => void;
  onInspectPage: (page: number) => void;
}

type FactFilter = 'all' | 'fact' | 'ai';

export function SwotAnalysisView({
  project,
  onUpdateSwot,
  onInspectPage,
}: SwotAnalysisViewProps) {
  const [filter, setFilter] = useState<FactFilter>('all');
  const [focusPrompt, setFocusPrompt] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetch('/api/swot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            fileName: project.fileName,
            pages: project.pages,
          },
          focusPrompt: focusPrompt.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to regenerate SWOT analysis.');
      }
      onUpdateSwot(data.swot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SWOT regeneration failed.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterItems = (items: SwotItem[]) => {
    if (filter === 'fact') return items.filter((i) => i.isDocumentFact);
    if (filter === 'ai') return items.filter((i) => !i.isDocumentFact);
    return items;
  };

  const quadrants: {
    key: keyof Omit<SwotAnalysisData, 'generatedAt'>;
    title: string;
    subtitle: string;
    accentClass: string;
  }[] = [
    {
      key: 'strengths',
      title: 'Strengths',
      subtitle: 'Internal capabilities & defensible advantages',
      accentClass: 'text-teal-700',
    },
    {
      key: 'weaknesses',
      title: 'Weaknesses',
      subtitle: 'Internal vulnerabilities & structural gaps',
      accentClass: 'text-amber-700',
    },
    {
      key: 'opportunities',
      title: 'Opportunities',
      subtitle: 'External demand drivers & expansion vectors',
      accentClass: 'text-slate-900',
    },
    {
      key: 'threats',
      title: 'Threats',
      subtitle: 'External competitive, technical & regulatory risks',
      accentClass: 'text-red-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium text-teal-700">Academic Strategic Evaluation</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            AI-Assisted SWOT Analysis
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Explicitly separates verbatim document facts from analytical AI interpretations.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1 self-start">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            All Points
          </button>
          <button
            type="button"
            onClick={() => setFilter('fact')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'fact' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Document Facts
          </button>
          <button
            type="button"
            onClick={() => setFilter('ai')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'ai' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            AI Interpretations
          </button>
        </div>
      </div>

      {/* Gemini Deepen / Regenerate Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <input
          type="text"
          value={focusPrompt}
          onChange={(e) => setFocusPrompt(e.target.value)}
          placeholder="Optional analytical focus (e.g., unit economics resilience, regulatory readiness)..."
          className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
        />
        <button
          type="button"
          disabled={isRefreshing}
          onClick={handleRegenerate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap shrink-0"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analyzing with Gemini...
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate SWOT via Gemini
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          {error}
        </div>
      )}

      {/* 4 Quadrants */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {quadrants.map((q) => {
          const items = filterItems(project.swot[q.key]);
          return (
            <div key={q.key} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className={`font-display text-lg font-bold ${q.accentClass}`}>{q.title}</h2>
                <p className="text-xs text-slate-500">{q.subtitle}</p>
              </div>

              {items.length === 0 ? (
                <p className="py-6 text-xs text-slate-500">
                  No items match the current filter in this quadrant.
                </p>
              ) : (
                <div className="mt-4 space-y-5">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span
                          className={`font-semibold ${
                            item.isDocumentFact ? 'text-teal-700' : 'text-slate-700'
                          }`}
                        >
                          {item.isDocumentFact ? 'Document Fact' : 'AI Interpretation'}
                        </span>
                        {item.sourcePage && (
                          <button
                            type="button"
                            onClick={() => onInspectPage(item.sourcePage!)}
                            className="font-mono text-teal-700 hover:underline"
                          >
                            Source Page {item.sourcePage}
                          </button>
                        )}
                      </div>

                      <h3 className="mt-1.5 text-sm font-bold text-slate-900">
                        {item.observation}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        <span className="font-semibold text-slate-800">Supporting Evidence:</span>{' '}
                        {item.supportingEvidence}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        <span className="font-semibold text-slate-800">Business Implication:</span>{' '}
                        {item.businessImplication}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        <span className="font-semibold text-teal-800">
                          Academic Research Recommendation:
                        </span>{' '}
                        {item.academicResearchRecommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
