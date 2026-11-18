import { useState, useMemo } from 'react';
import { AlertTriangle, Calculator, FileWarning, RotateCcw, Sliders } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ScenarioId, VentureProject } from '../types/venture';
import {
  computeScenarioFinancials,
  formatCurrencyValue,
  formatNumber,
  formatPercent,
  ScenarioOverrides,
} from '../utils/financialCalculations';

interface FinancialAnalysisViewProps {
  project: VentureProject;
  onInspectPage: (page: number) => void;
}

export function FinancialAnalysisView({ project, onInspectPage }: FinancialAnalysisViewProps) {
  const scenarios = project.financials.scenarios;
  const defaultId: ScenarioId = scenarios.some((s) => s.id === 'base')
    ? 'base'
    : (scenarios[0]?.id as ScenarioId) || 'base';

  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>(defaultId);
  const [overridesByScenario, setOverridesByScenario] = useState<
    Record<string, ScenarioOverrides>
  >({});

  const activeScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const activeOverrides = activeScenario ? overridesByScenario[activeScenario.id] : undefined;
  const isModified = Boolean(
    activeOverrides && Object.keys(activeOverrides).length > 0
  );

  const computed = useMemo(
    () => (activeScenario ? computeScenarioFinancials(activeScenario, activeOverrides) : null),
    [activeScenario, activeOverrides]
  );

  const updateOverride = (field: keyof ScenarioOverrides, rawValue: string) => {
    if (!activeScenario) return;
    const numeric = Number(rawValue);
    if (Number.isNaN(numeric) || numeric < 0) return;
    setOverridesByScenario((prev) => ({
      ...prev,
      [activeScenario.id]: {
        ...(prev[activeScenario.id] || {}),
        [field]: numeric,
      },
    }));
  };

  const resetScenarioOverrides = () => {
    if (!activeScenario) return;
    setOverridesByScenario((prev) => {
      const next = { ...prev };
      delete next[activeScenario.id];
      return next;
    });
  };

  // Break-even curve points from 0 to max(units * 2, breakEven * 1.8)
  const breakEvenChartData = useMemo(() => {
    if (!computed || !computed.hasCompleteInputs) return [];
    const price = computed.sellingPrice || 0;
    const varCost = computed.variableCostPerUnit || 0;
    const fixed = computed.monthlyFixedCost || 0;
    const currentUnits = computed.unitsPerMonth || 0;
    const beUnits = computed.breakEvenUnits || currentUnits || 500;
    const maxUnits = Math.max(beUnits * 1.8, currentUnits * 1.5, 100);
    const steps = 8;
    const stepSize = Math.max(1, Math.round(maxUnits / steps));

    const pts: { units: number; Revenue: number; TotalCost: number }[] = [];
    for (let u = 0; u <= maxUnits; u += stepSize) {
      pts.push({
        units: u,
        Revenue: Math.round((u * price) / 1e5),
        TotalCost: Math.round((fixed + u * varCost) / 1e5),
      });
    }
    return pts;
  }, [computed]);

  const comparisonData = useMemo(
    () =>
      scenarios.map((sc) => {
        const c = computeScenarioFinancials(sc, overridesByScenario[sc.id]);
        const totalCost =
          c.totalVariableCost !== null && c.monthlyFixedCost !== null
            ? c.totalVariableCost + c.monthlyFixedCost
            : 0;
        return {
          name: sc.label,
          Revenue: c.monthlyRevenue ? Math.round(c.monthlyRevenue / 1e5) : 0,
          TotalCost: Math.round(totalCost / 1e5),
          Surplus: c.operatingSurplus ? Math.round(c.operatingSurplus / 1e5) : 0,
        };
      }),
    [scenarios, overridesByScenario]
  );

  if (!activeScenario || !computed) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-slate-900">
          No financial scenario tables were found in this document.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-teal-700">
            Financial Intelligence · {project.financials.currencyCode}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            Scenario Analysis, Break-Even &amp; Sensitivity Simulator
          </h1>
          <p className="mt-1 text-xs text-slate-500">{project.financials.secondaryPriceNote}</p>
        </div>

        {/* Scenario Segmented Selector */}
        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1 self-start">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => setSelectedScenarioId(sc.id as ScenarioId)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                sc.id === activeScenario.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {sc.label}
              {overridesByScenario[sc.id] ? ' *' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Document Integrity & Audit Issues */}
      {project.financials.auditIssues.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FileWarning className="h-5 w-5 text-amber-700" />
              <h2 className="font-display text-sm font-bold text-slate-900">
                Document Financial Audit &amp; Missing/Inconsistent Data Flags
              </h2>
            </div>
            <span className="text-xs font-medium text-amber-800">
              Never silently auto-corrected
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {project.financials.auditIssues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-lg border border-amber-200/80 bg-white p-3.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold uppercase tracking-wide text-amber-800">
                    {issue.severity}
                  </span>
                  {issue.sourcePage && (
                    <button
                      type="button"
                      onClick={() => onInspectPage(issue.sourcePage!)}
                      className="font-mono text-teal-700 hover:underline"
                    >
                      Page {issue.sourcePage}
                    </button>
                  )}
                </div>
                <p className="mt-1 font-semibold text-slate-900">{issue.title}</p>
                <p className="mt-1 leading-relaxed text-slate-600">{issue.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Scenario Discrepancy Notice + Quick Audit Test Buttons */}
      {activeScenario.discrepancies.length > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50/50 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-2.5 text-xs text-red-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
            <div>
              <p className="font-semibold">
                {activeScenario.label} Scenario Input Discrepancy (Page{' '}
                {activeScenario.sourcePage ?? 'N/A'})
              </p>
              <p className="mt-0.5 text-red-800">{activeScenario.discrepancies[0]}</p>
            </div>
          </div>

          {activeScenario.id === 'base' && (
            <button
              type="button"
              onClick={() => updateOverride('variableCost', '50000')}
              className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-red-50 whitespace-nowrap"
            >
              Simulate 50,000 Var Cost (60% GM)
            </button>
          )}
          {activeScenario.id === 'ambitious' && (
            <button
              type="button"
              onClick={() => updateOverride('expectedCustomers', '2500')}
              className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-red-50 whitespace-nowrap"
            >
              Simulate 2,500 Units (From Notes)
            </button>
          )}
        </div>
      )}

      {/* Provenance Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-900">Data Provenance Key:</span>
          <span>
            <strong className="text-slate-900">Doc</strong> = Extracted verbatim from PDF
          </span>
          <span>
            <strong className="text-teal-700">Calc</strong> = Derived mathematically from inputs
          </span>
          <span>
            <strong className="text-amber-700">Sim</strong> = Interactive assumption override
          </span>
        </div>
        {activeScenario.sourcePage && (
          <button
            type="button"
            onClick={() => onInspectPage(activeScenario.sourcePage!)}
            className="font-mono font-medium text-teal-700 hover:underline"
          >
            Inspect Source Page {activeScenario.sourcePage}
          </button>
        )}
      </div>

      {/* Main Grid: Interactive Assumptions Simulator + Calculated Unit Economics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Interactive Simulator */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-teal-700" />
              <h2 className="font-display text-base font-bold text-slate-900">
                Interactive Assumption Simulator
              </h2>
            </div>
            {isModified && (
              <button
                type="button"
                onClick={resetScenarioOverrides}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="sim-price" className="font-medium text-slate-700">
                  Selling Price per Unit ({project.financials.currencyCode})
                </label>
                <span className="font-mono text-[11px] text-slate-500">
                  {activeOverrides?.sellingPrice !== undefined ? 'Sim' : 'Doc'}
                </span>
              </div>
              <input
                id="sim-price"
                type="number"
                min={0}
                step={1000}
                value={computed.sellingPrice ?? ''}
                placeholder="Not provided"
                onChange={(e) => updateOverride('sellingPrice', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="sim-customers" className="font-medium text-slate-700">
                  Expected Customers / Month
                </label>
                <span className="font-mono text-[11px] text-slate-500">
                  {activeOverrides?.expectedCustomers !== undefined ? 'Sim' : 'Doc'}
                </span>
              </div>
              <input
                id="sim-customers"
                type="number"
                min={0}
                step={50}
                value={activeOverrides?.expectedCustomers ?? activeScenario.expectedCustomers ?? ''}
                placeholder="Not provided"
                onChange={(e) => updateOverride('expectedCustomers', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="sim-varcost" className="font-medium text-slate-700">
                  Variable Cost per Unit ({project.financials.currencyCode})
                </label>
                <span className="font-mono text-[11px] text-slate-500">
                  {activeOverrides?.variableCost !== undefined ? 'Sim' : 'Doc'}
                </span>
              </div>
              <input
                id="sim-varcost"
                type="number"
                min={0}
                step={1000}
                value={computed.variableCostPerUnit ?? ''}
                placeholder="Not provided"
                onChange={(e) => updateOverride('variableCost', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="sim-fixed" className="font-medium text-slate-700">
                  Monthly Fixed Operating Cost ({project.financials.currencyCode})
                </label>
                <span className="font-mono text-[11px] text-slate-500">
                  {activeOverrides?.monthlyFixedCost !== undefined ? 'Sim' : 'Doc'}
                </span>
              </div>
              <input
                id="sim-fixed"
                type="number"
                min={0}
                step={500000}
                value={computed.monthlyFixedCost ?? ''}
                placeholder="Not provided"
                onChange={(e) => updateOverride('monthlyFixedCost', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="sim-purchases" className="font-medium text-slate-700">
                  Purchases per Customer
                </label>
                <span className="font-mono text-[11px] text-slate-500">
                  {activeOverrides?.purchasesPerCustomer !== undefined ? 'Sim' : 'Doc'}
                </span>
              </div>
              <input
                id="sim-purchases"
                type="number"
                min={1}
                step={1}
                value={computed.purchasesPerCustomer}
                onChange={(e) => updateOverride('purchasesPerCustomer', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-800">Scenario Notes:</span>{' '}
            {activeScenario.notes}
          </p>
        </div>

        {/* Unit Economics & Margin Ledger */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-teal-700" />
              <h2 className="font-display text-base font-bold text-slate-900">
                {activeScenario.label} Financial Output Ledger
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {isModified ? 'Interactive Simulation Active' : 'Document Baseline'}
            </span>
          </div>

          {!computed.hasCompleteInputs && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              Missing document inputs: {computed.missingFields.join(', ')}. Missing metrics are
              marked &ldquo;Not Provided&rdquo; rather than estimated.
            </div>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-semibold">Metric</th>
                  <th className="py-2 pr-4 font-semibold">Origin</th>
                  <th className="py-2 text-right font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">Monthly Unit Volume</td>
                  <td className="py-2.5 pr-4 text-slate-500">
                    {isModified ? 'Simulated' : 'Document'}
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {formatNumber(computed.unitsPerMonth)} units
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">Monthly Gross Revenue</td>
                  <td className="py-2.5 pr-4 text-teal-700">Calculated</td>
                  <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {formatCurrencyValue(computed.monthlyRevenue, project.financials.currencyCode)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">Total Variable Cost</td>
                  <td className="py-2.5 pr-4 text-teal-700">Calculated</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                    {formatCurrencyValue(computed.totalVariableCost, project.financials.currencyCode)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">
                    Contribution Margin per Unit
                  </td>
                  <td className="py-2.5 pr-4 text-teal-700">Calculated</td>
                  <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {formatCurrencyValue(
                      computed.contributionPerUnit,
                      project.financials.currencyCode
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">Gross Margin (%)</td>
                  <td className="py-2.5 pr-4 text-teal-700">Calculated</td>
                  <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-teal-700">
                    {formatPercent(computed.grossMarginPct)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">
                    Total Contribution Margin
                  </td>
                  <td className="py-2.5 pr-4 text-teal-700">Calculated</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-900">
                    {formatCurrencyValue(computed.totalContribution, project.financials.currencyCode)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">Monthly Fixed Cost</td>
                  <td className="py-2.5 pr-4 text-slate-500">
                    {activeOverrides?.monthlyFixedCost !== undefined ? 'Simulated' : 'Document'}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                    {formatCurrencyValue(computed.monthlyFixedCost, project.financials.currencyCode)}
                  </td>
                </tr>
                <tr className="bg-slate-50/70">
                  <td className="py-3 pr-4 font-bold text-slate-900">Monthly Operating Surplus</td>
                  <td className="py-3 pr-4 text-teal-700">Calculated</td>
                  <td
                    className={`py-3 text-right font-mono font-bold tabular-nums ${
                      (computed.operatingSurplus ?? 0) >= 0 ? 'text-teal-700' : 'text-red-700'
                    }`}
                  >
                    {formatCurrencyValue(computed.operatingSurplus, project.financials.currencyCode)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">
                    Break-Even Volume (Units/Mo)
                  </td>
                  <td className="py-2.5 pr-4 text-teal-700">Calculated</td>
                  <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {computed.breakEvenUnits !== null
                      ? `${formatNumber(computed.breakEvenUnits)} units`
                      : 'Not Achievable'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">
                    Break-Even Monthly Revenue
                  </td>
                  <td className="py-2.5 pr-4 text-teal-700">Calculated</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                    {formatCurrencyValue(computed.breakEvenRevenue, project.financials.currencyCode)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">Margin of Safety (%)</td>
                  <td className="py-2.5 pr-4 text-teal-700">Calculated</td>
                  <td
                    className={`py-2.5 text-right font-mono font-semibold tabular-nums ${
                      (computed.marginOfSafetyPct ?? 0) >= 0 ? 'text-teal-700' : 'text-red-700'
                    }`}
                  >
                    {formatPercent(computed.marginOfSafetyPct)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-slate-800">
                    Annualized Revenue (12-Mo Run Rate)
                  </td>
                  <td className="py-2.5 pr-4 text-teal-700">Calculated</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                    {formatCurrencyValue(
                      computed.annualizedRevenue,
                      project.financials.currencyCode,
                      true
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {activeScenario.documentReported && !isModified && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">
                Document-Printed Summary (Page {activeScenario.sourcePage ?? 'N/A'}):
              </p>
              <p className="mt-1 font-mono tabular-nums">
                Contribution/Sale:{' '}
                {formatCurrencyValue(
                  activeScenario.documentReported.contributionPerSale,
                  project.financials.currencyCode
                )}{' '}
                · Monthly Revenue:{' '}
                {formatCurrencyValue(
                  activeScenario.documentReported.monthlyRevenue,
                  project.financials.currencyCode
                )}{' '}
                · Operating Surplus:{' '}
                {formatCurrencyValue(
                  activeScenario.documentReported.operatingSurplus,
                  project.financials.currencyCode
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row: Break-Even Curve & Cross-Scenario Comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            Break-Even Analysis ({activeScenario.label})
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Revenue vs. Total Cost in {project.financials.currencyCode} Lakhs · Break-even at{' '}
            <span className="font-mono font-semibold text-slate-900">
              {formatNumber(computed.breakEvenUnits)} units/month
            </span>
          </p>

          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={breakEvenChartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="units"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{ value: 'Units / Month', position: 'insideBottom', offset: -2, fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString('en-IN')} L`, '']}
                  labelFormatter={(label) => `${label} units/month`}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                {computed.breakEvenUnits !== null && (
                  <ReferenceLine
                    x={computed.breakEvenUnits}
                    stroke="#0d9488"
                    strokeDasharray="4 4"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  name="Total Revenue (Lakhs)"
                  stroke="#0f1e36"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="TotalCost"
                  name="Total Cost (Lakhs)"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            Conservative vs. Base vs. Ambitious Comparison
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Monthly figures in {project.financials.currencyCode} Lakhs reflecting current simulator
            state
          </p>

          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString('en-IN')} L`, '']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Revenue" name="Revenue" fill="#0f1e36" radius={[4, 4, 0, 0]} />
                <Bar dataKey="TotalCost" name="Total Cost" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Surplus" name="Operating Surplus" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cost & Price Evidence */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-slate-500">Price Evidence Source</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">
            {project.financials.priceEvidenceSource}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">Cost Evidence Source</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">
            {project.financials.costEvidenceSource}
          </p>
        </div>
      </div>
    </div>
  );
}
