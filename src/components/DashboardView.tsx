import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { NavigationTab, VentureProject } from '../types/venture';
import {
  computeScenarioFinancials,
  formatCurrencyValue,
  formatNumber,
  formatPercent,
} from '../utils/financialCalculations';

interface DashboardViewProps {
  project: VentureProject;
  totalProjects: number;
  onNavigate: (tab: NavigationTab) => void;
  onInspectPage: (page: number) => void;
}

export function DashboardView({
  project,
  totalProjects,
  onNavigate,
  onInspectPage,
}: DashboardViewProps) {
  const baseScenario =
    project.financials.scenarios.find((s) => s.id === 'base') || project.financials.scenarios[0];

  // For Base chart display when document has a confirmed typo (e.g. Biofire Base VarCost 5000 vs 50000),
  // we use the raw scenario computation AND display audit notice clearly.
  const baseComputed = baseScenario ? computeScenarioFinancials(baseScenario) : null;

  const scenarioChartData = project.financials.scenarios.map((sc) => {
    const c = computeScenarioFinancials(sc);
    const totalCost =
      c.totalVariableCost !== null && c.monthlyFixedCost !== null
        ? c.totalVariableCost + c.monthlyFixedCost
        : null;
    return {
      name: sc.label,
      Revenue: c.monthlyRevenue ? Math.round(c.monthlyRevenue / 1e5) : 0,
      OperatingCost: totalCost ? Math.round(totalCost / 1e5) : 0,
      Surplus: c.operatingSurplus ? Math.round(c.operatingSurplus / 1e5) : 0,
    };
  });

  const topRisks = [...project.risks]
    .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {project.extraction.businessCategory} · {project.extraction.geography}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            {project.extraction.businessName}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onInspectPage(1)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
          >
            Inspect Source ({project.pageCount} pages)
          </button>
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Document Integrity Alert if discrepancies exist */}
      {project.financials.auditIssues.length > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {project.financials.auditIssues.length} Financial Audit Observations Flagged
              </p>
              <p className="mt-0.5 text-xs text-slate-700">
                {project.financials.auditIssues[0].title}: {project.financials.auditIssues[0].detail}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('financials')}
            className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-amber-100/50 whitespace-nowrap"
          >
            Review Audit &amp; Simulate →
          </button>
        </div>
      )}

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Venture Plans Analysed</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {totalProjects}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Active: {project.fileName}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Estimated Market Size (SAM)</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {formatCurrencyValue(project.market.samValue, project.financials.currencyCode, true)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            {formatNumber(project.market.samCustomers)} serviceable buyers ·{' '}
            <button
              type="button"
              onClick={() => onInspectPage(project.market.sourcePage || 7)}
              className="font-medium text-teal-700 hover:underline"
            >
              Page {project.market.sourcePage || 7}
            </button>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Base Monthly Revenue (Doc)
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {formatCurrencyValue(
              baseScenario?.documentReported?.monthlyRevenue ?? baseComputed?.monthlyRevenue,
              project.financials.currencyCode,
              true
            )}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            {formatNumber(baseScenario?.expectedCustomers)} customers/mo ·{' '}
            <button
              type="button"
              onClick={() => onInspectPage(baseScenario?.sourcePage || 7)}
              className="font-medium text-teal-700 hover:underline"
            >
              Page {baseScenario?.sourcePage || 7}
            </button>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Monthly Fixed Operating Cost</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {formatCurrencyValue(
              baseComputed?.monthlyFixedCost,
              project.financials.currencyCode,
              true
            )}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Base Scenario ·{' '}
            <button
              type="button"
              onClick={() => onInspectPage(baseScenario?.sourcePage || 7)}
              className="font-medium text-teal-700 hover:underline"
            >
              Page {baseScenario?.sourcePage || 7}
            </button>
          </p>
        </div>
      </div>

      {/* Financial Projections Chart + Financial Performance Indicators */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Monthly Revenue vs. Operating Cost by Scenario
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Values in {project.financials.currencyCode} Lakhs (100K) computed strictly from
                document scenario inputs
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('financials')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap"
            >
              Interactive Model <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString('en-IN')} L`, '']}
                  contentStyle={{
                    borderRadius: '8px',
                    borderColor: '#cbd5e1',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Revenue" name="Monthly Revenue" fill="#0f1e36" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="OperatingCost"
                  name="Total Operating Cost"
                  fill="#64748b"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Surplus"
                  name="Operating Surplus"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Performance Indicators & Business Model Overview */}
        <div className="flex flex-col justify-between gap-6 lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900">
                Financial Performance Indicators
              </h2>
              <BarChart3 className="h-4 w-4 text-teal-700" />
            </div>

            <div className="mt-4 divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-600">Document Contribution / Unit (Base)</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900">
                  {formatCurrencyValue(
                    baseScenario?.documentReported?.contributionPerSale ??
                      baseComputed?.contributionPerUnit,
                    project.financials.currencyCode
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-600">Document Operating Surplus (Base)</span>
                <span className="font-mono font-semibold tabular-nums text-teal-700">
                  {formatCurrencyValue(
                    baseScenario?.documentReported?.operatingSurplus ??
                      baseComputed?.operatingSurplus,
                    project.financials.currencyCode,
                    true
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-600">Calculated Gross Margin (Literal Input)</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900">
                  {formatPercent(baseComputed?.grossMarginPct)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-600">Obtainable Annual Target (SOM)</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900">
                  {formatCurrencyValue(
                    project.market.somValue,
                    project.financials.currencyCode,
                    true
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900">
                Business Model Overview
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('business-model')}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Open Canvas →
              </button>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              {project.extraction.revenueModel.text}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Primary Segment: {project.businessModel.customerSegments[0]?.point}
            </p>
          </div>
        </div>
      </div>

      {/* Latest AI Insights + Key Assumptions + Major Risks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Latest AI Insights */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">
              Latest AI-Generated Insights
            </h2>
            <TrendingUp className="h-4 w-4 text-teal-700" />
          </div>
          <div className="mt-4 space-y-4">
            {project.latestInsights.map((ins, i) => (
              <div key={i} className="border-b border-slate-100 pb-3.5 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-teal-700">{ins.category}</span>
                  {ins.sourcePage && (
                    <button
                      type="button"
                      onClick={() => onInspectPage(ins.sourcePage!)}
                      className="font-mono hover:text-slate-900 hover:underline"
                    >
                      Page {ins.sourcePage}
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900">{ins.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{ins.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Business Assumptions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">
              Key Business Assumptions
            </h2>
            <BookOpen className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-4 space-y-3.5">
            {project.businessModel.keyAssumptions.map((item, idx) => (
              <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <p className="text-xs leading-relaxed text-slate-700">{item.point}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{item.isDocumentFact ? 'Document Stated' : 'Analytical'}</span>
                  {item.sourcePage && (
                    <>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => onInspectPage(item.sourcePage!)}
                        className="font-mono text-teal-700 hover:underline"
                      >
                        Page {item.sourcePage}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Major Business Risks */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">Major Business Risks</h2>
            <button
              type="button"
              onClick={() => onNavigate('risks')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
            >
              Risk Matrix <ShieldAlert className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-4 space-y-3.5">
            {topRisks.map((r) => {
              const score = r.likelihood * r.impact;
              return (
                <div key={r.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">{r.category}</span>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        score >= 15 ? 'text-red-700' : 'text-amber-700'
                      }`}
                    >
                      Score {score}/25
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{r.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{r.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
