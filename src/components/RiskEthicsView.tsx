import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { RiskCategory, RiskItem, VentureProject } from '../types/venture';

interface RiskEthicsViewProps {
  project: VentureProject;
  onInspectPage: (page: number) => void;
}

const ALL_CATEGORIES: RiskCategory[] = [
  'Financial',
  'Market Adoption',
  'Technological Reliability',
  'Regulatory & Compliance',
  'Customer Trust',
  'Ethical Implications',
  'Data Privacy',
  'Product Safety',
];

function getSeverityStyle(score: number): { label: string; cellBg: string; textClass: string } {
  if (score >= 15) {
    return { label: 'Critical', cellBg: 'bg-red-100 hover:bg-red-200 border-red-200', textClass: 'text-red-800' };
  }
  if (score >= 9) {
    return { label: 'High', cellBg: 'bg-amber-100 hover:bg-amber-200 border-amber-200', textClass: 'text-amber-800' };
  }
  if (score >= 5) {
    return { label: 'Moderate', cellBg: 'bg-teal-50 hover:bg-teal-100 border-teal-200', textClass: 'text-teal-800' };
  }
  return { label: 'Low', cellBg: 'bg-slate-100 hover:bg-slate-200 border-slate-200', textClass: 'text-slate-700' };
}

export function RiskEthicsView({ project, onInspectPage }: RiskEthicsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | RiskCategory>('All');
  const [selectedRiskId, setSelectedRiskId] = useState<string>(project.risks[0]?.id || '');

  const filteredRisks =
    selectedCategory === 'All'
      ? project.risks
      : project.risks.filter((r) => r.category === selectedCategory);

  const activeRisk: RiskItem | undefined =
    filteredRisks.find((r) => r.id === selectedRiskId) || filteredRisks[0];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-medium text-teal-700">Governance, Safety &amp; Compliance</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
          Risk Matrix &amp; Ethical Assessment
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Evaluates financial, market adoption, technical reliability, regulatory, trust, data
          privacy, product safety, and ethical dimensions.
        </p>
      </div>

      {/* Regulated Product Academic Governance Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-900 px-5 py-4 text-slate-100">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-white">Academic &amp; Ethical Assessment Scope</p>
          <p className="mt-0.5 text-slate-300">
            For ventures involving regulated or safety-sensitive products, analysis is restricted
            strictly to high-level academic, ethical, regulatory compliance, and business-risk
            assessment—with zero technical design, manufacturing, or operational weapon details.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Domains ({project.risks.length})
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const count = project.risks.filter((r) => r.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* 5x5 Matrix + Active Risk Detail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">
              5×5 Likelihood vs. Impact Risk Matrix
            </h2>
            <span className="text-xs text-slate-500">Click any populated cell to inspect</span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[460px]">
              <div className="mb-2 grid grid-cols-6 gap-1.5 text-center text-[11px] font-semibold text-slate-500">
                <div className="text-left">L \ Impact</div>
                <div>1 · Minor</div>
                <div>2 · Low</div>
                <div>3 · Moderate</div>
                <div>4 · Major</div>
                <div>5 · Severe</div>
              </div>

              {[5, 4, 3, 2, 1].map((likelihood) => (
                <div key={likelihood} className="mb-1.5 grid grid-cols-6 gap-1.5">
                  <div className="flex items-center text-[11px] font-semibold text-slate-600">
                    L{likelihood}
                  </div>
                  {[1, 2, 3, 4, 5].map((impact) => {
                    const cellRisks = filteredRisks.filter(
                      (r) => r.likelihood === likelihood && r.impact === impact
                    );
                    const score = likelihood * impact;
                    const style = getSeverityStyle(score);
                    const isSelectedCell = cellRisks.some((r) => r.id === activeRisk?.id);

                    return (
                      <button
                        key={`${likelihood}-${impact}`}
                        type="button"
                        disabled={cellRisks.length === 0}
                        onClick={() => cellRisks[0] && setSelectedRiskId(cellRisks[0].id)}
                        className={`flex min-h-[54px] flex-col items-center justify-center rounded-lg border p-1.5 text-center transition-colors ${
                          cellRisks.length > 0
                            ? `${style.cellBg} cursor-pointer ${
                                isSelectedCell ? 'ring-2 ring-slate-900' : ''
                              }`
                            : 'border-slate-100 bg-slate-50/60 text-slate-300 cursor-default'
                        }`}
                      >
                        <span className="font-mono text-[10px] tabular-nums text-slate-500">
                          {score}
                        </span>
                        {cellRisks.length > 0 && (
                          <span className={`mt-0.5 text-[11px] font-bold ${style.textClass}`}>
                            {cellRisks.length} risk{cellRisks.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Risk Inspector */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          {activeRisk ? (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-teal-700">{activeRisk.category}</span>
                <span>
                  {activeRisk.isDocumentFact ? 'Document Grounded' : 'AI Risk Assessment'}
                </span>
              </div>
              <h2 className="mt-2 font-display text-lg font-bold text-slate-900">
                {activeRisk.title}
              </h2>

              <div className="mt-4 grid grid-cols-3 gap-3 border-y border-slate-100 py-3 text-center">
                <div>
                  <p className="text-[11px] text-slate-500">Likelihood</p>
                  <p className="mt-0.5 font-mono text-base font-bold tabular-nums text-slate-900">
                    {activeRisk.likelihood}/5
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Impact</p>
                  <p className="mt-0.5 font-mono text-base font-bold tabular-nums text-slate-900">
                    {activeRisk.impact}/5
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Severity</p>
                  <p
                    className={`mt-0.5 font-mono text-base font-bold tabular-nums ${
                      getSeverityStyle(activeRisk.likelihood * activeRisk.impact).textClass
                    }`}
                  >
                    {getSeverityStyle(activeRisk.likelihood * activeRisk.impact).label} (
                    {activeRisk.likelihood * activeRisk.impact})
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">Risk Description</p>
                  <p className="mt-1">{activeRisk.description}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Mitigation &amp; Governance</p>
                  <p className="mt-1">{activeRisk.mitigation}</p>
                </div>
              </div>

              {activeRisk.sourcePage && (
                <button
                  type="button"
                  onClick={() => onInspectPage(activeRisk.sourcePage!)}
                  className="mt-4 font-mono text-xs font-medium text-teal-700 hover:underline"
                >
                  Inspect Reference Page {activeRisk.sourcePage} →
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a risk category or cell to inspect.</p>
          )}
        </div>
      </div>

      {/* Complete Risk Register Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-bold text-slate-900">
          8-Domain Risk &amp; Ethics Register
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 pr-4 font-semibold">Domain</th>
                <th className="py-2.5 pr-4 font-semibold">Risk Event</th>
                <th className="py-2.5 pr-4 font-semibold">L × I</th>
                <th className="py-2.5 pr-4 font-semibold">Level</th>
                <th className="py-2.5 pr-4 font-semibold">Mitigation</th>
                <th className="py-2.5 text-right font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRisks.map((r) => {
                const score = r.likelihood * r.impact;
                const sev = getSeverityStyle(score);
                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRiskId(r.id)}
                    className={`cursor-pointer align-top transition-colors ${
                      r.id === activeRisk?.id ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 pr-4 font-medium text-slate-700 whitespace-nowrap">
                      {r.category}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-900">{r.title}</td>
                    <td className="py-3 pr-4 font-mono tabular-nums text-slate-800 whitespace-nowrap">
                      {r.likelihood} × {r.impact} ({score})
                    </td>
                    <td className={`py-3 pr-4 font-semibold whitespace-nowrap ${sev.textClass}`}>
                      {sev.label}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{r.mitigation}</td>
                    <td className="py-3 text-right">
                      {r.sourcePage ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectPage(r.sourcePage!);
                          }}
                          className="font-mono text-teal-700 hover:underline"
                        >
                          P.{r.sourcePage}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
