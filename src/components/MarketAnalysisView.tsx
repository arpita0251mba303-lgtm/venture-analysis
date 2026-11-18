import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { VentureProject } from '../types/venture';
import { formatCurrencyValue, formatNumber } from '../utils/financialCalculations';

interface MarketAnalysisViewProps {
  project: VentureProject;
  onInspectPage: (page: number) => void;
}

export function MarketAnalysisView({ project, onInspectPage }: MarketAnalysisViewProps) {
  const m = project.market;

  const funnelData = [
    {
      tier: 'TAM (Total Addressable)',
      customers: m.tamCustomers || 0,
      value: m.tamValue || 0,
      fill: '#0f1e36',
    },
    {
      tier: 'SAM (Serviceable Available)',
      customers: m.samCustomers || 0,
      value: m.samValue || 0,
      fill: '#1e3a5f',
    },
    {
      tier: 'SOM (Serviceable Obtainable)',
      customers: m.somCustomers || 0,
      value: m.somValue || 0,
      fill: '#0d9488',
    },
  ];

  const scatterPoints = m.competitors
    .filter((c) => c.axisXScore !== null && c.axisYScore !== null)
    .map((c) => ({
      name: c.name,
      x: c.axisXScore as number,
      y: c.axisYScore as number,
      type: c.type,
      price: c.priceRange,
      isVenture: c.name.toLowerCase().includes('biofire') || c.evidenceStrength === 'Document Baseline',
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-teal-700">Market Sizing &amp; Competitive Landscape</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            TAM / SAM / SOM &amp; Competitor Battlefield
          </h1>
        </div>
        {m.sourcePage && (
          <button
            type="button"
            onClick={() => onInspectPage(m.sourcePage!)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            Inspect Market Source (Page {m.sourcePage})
          </button>
        )}
      </div>

      {/* TAM / SAM / SOM Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-900">TAM · Total Addressable Market</span>
            <button
              type="button"
              onClick={() => onInspectPage(7)}
              className="font-mono text-teal-700 hover:underline"
            >
              Page 7
            </button>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {formatCurrencyValue(m.tamValue, project.financials.currencyCode, true)}
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-slate-600">
            {formatNumber(m.tamCustomers)} potential customers
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-600">{m.tamEvidence}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-900">SAM · Serviceable Available Market</span>
            <button
              type="button"
              onClick={() => onInspectPage(7)}
              className="font-mono text-teal-700 hover:underline"
            >
              Page 7
            </button>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {formatCurrencyValue(m.samValue, project.financials.currencyCode, true)}
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-slate-600">
            {formatNumber(m.samCustomers)} serviceable customers
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-600">{m.samEvidence}</p>
        </div>

        <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-teal-800">SOM · Serviceable Obtainable Market</span>
            <button
              type="button"
              onClick={() => onInspectPage(8)}
              className="font-mono text-teal-700 hover:underline"
            >
              Page 8
            </button>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {formatCurrencyValue(m.somValue, project.financials.currencyCode, true)}
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-slate-600">
            {formatNumber(m.somCustomers)} obtainable Year 1–2 customers
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-600">{m.somEvidence}</p>
        </div>
      </div>

      {/* Charts Row: Market Customer Funnel + 2D Competitor Positioning Scatter */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <h2 className="font-display text-base font-bold text-slate-900">
            Addressable Customer Funnel (Log Scale)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Annual Spend Basis:{' '}
            {formatCurrencyValue(m.annualSpendPerCustomer, project.financials.currencyCode)}/customer
          </p>

          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  scale="log"
                  domain={[1000, 'dataMax']}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickFormatter={(v) =>
                    v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : v
                  }
                />
                <YAxis type="category" dataKey="tier" width={140} tick={{ fontSize: 11, fill: '#334155' }} />
                <Tooltip
                  formatter={(val) => [`${Number(val).toLocaleString('en-IN')} customers`, 'Count']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="customers" radius={[0, 6, 6, 0]}>
                  {funnelData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-500">{m.spendEvidence}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <h2 className="font-display text-base font-bold text-slate-900">
            Competitor Positioning Map
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            X: {m.axisXLabel} · Y: {m.axisYLabel}
          </p>

          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 24, bottom: 16, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0, 11]}
                  name="Security"
                  tick={{ fontSize: 11, fill: '#475569' }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, 11]}
                  name="Readiness"
                  tick={{ fontSize: 11, fill: '#475569' }}
                />
                <ZAxis range={[120, 180]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const pt = payload[0].payload as (typeof scatterPoints)[0];
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-md">
                        <p className="font-bold text-slate-900">{pt.name}</p>
                        <p className="text-slate-500">
                          {pt.type} · {pt.price}
                        </p>
                        <p className="mt-1 font-mono text-teal-700">
                          Axis X: {pt.x}/10 · Axis Y: {pt.y}/10
                        </p>
                      </div>
                    );
                  }}
                />
                <Scatter name="Market Players" data={scatterPoints}>
                  {scatterPoints.map((pt, idx) => (
                    <Cell key={idx} fill={pt.isVenture ? '#0d9488' : '#0f1e36'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            {scatterPoints.map((pt, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-xs ${
                    pt.isVenture ? 'bg-teal-600' : 'bg-slate-900'
                  }`}
                />
                {pt.name} ({pt.x}, {pt.y})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Target Customer Segments */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-bold text-slate-900">
          Target Customer Segments &amp; Positioning
        </h2>
        <p className="mt-2 rounded-lg bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-900">Positioning Statement: </span>
          {m.positioningStatement}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {m.targetSegments.map((seg, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{seg.name}</h3>
                {seg.sourcePage && (
                  <button
                    type="button"
                    onClick={() => onInspectPage(seg.sourcePage!)}
                    className="font-mono text-xs text-teal-700 hover:underline"
                  >
                    Page {seg.sourcePage}
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{seg.description}</p>
              <p className="mt-2 text-xs text-slate-700">
                <span className="font-semibold">Demographics:</span> {seg.demographics}
              </p>
              <p className="mt-1 text-xs text-slate-700">
                <span className="font-semibold">Willingness to Pay:</span> {seg.willingnessToPay}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Assumptions, Opportunities, Challenges */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-sm font-bold text-slate-900">Market Assumptions</h3>
          <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-700">
            {m.marketAssumptions.map((item, i) => (
              <li key={i} className="flex items-start justify-between gap-2">
                <span>• {item.text}</span>
                {item.sourcePage && (
                  <button
                    type="button"
                    onClick={() => onInspectPage(item.sourcePage!)}
                    className="shrink-0 font-mono text-teal-700 hover:underline"
                  >
                    P.{item.sourcePage}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-sm font-bold text-slate-900">Market Opportunities</h3>
          <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-700">
            {m.marketOpportunities.map((item, i) => (
              <li key={i} className="flex items-start justify-between gap-2">
                <span>• {item.text}</span>
                {item.sourcePage && (
                  <button
                    type="button"
                    onClick={() => onInspectPage(item.sourcePage!)}
                    className="shrink-0 font-mono text-teal-700 hover:underline"
                  >
                    P.{item.sourcePage}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-sm font-bold text-slate-900">Industry Challenges</h3>
          <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-700">
            {m.industryChallenges.map((item, i) => (
              <li key={i} className="flex items-start justify-between gap-2">
                <span>• {item.text}</span>
                {item.sourcePage && (
                  <button
                    type="button"
                    onClick={() => onInspectPage(item.sourcePage!)}
                    className="shrink-0 font-mono text-teal-700 hover:underline"
                  >
                    P.{item.sourcePage}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Competitor Comparison Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-bold text-slate-900">
          Competitor Comparison Matrix
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 pr-4 font-semibold">Competitor</th>
                <th className="py-2.5 pr-4 font-semibold">Category</th>
                <th className="py-2.5 pr-4 font-semibold">Price Range</th>
                <th className="py-2.5 pr-4 font-semibold">Main Strength</th>
                <th className="py-2.5 pr-4 font-semibold">Main Weakness</th>
                <th className="py-2.5 text-right font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {m.competitors.map((c, idx) => (
                <tr key={idx} className="align-top">
                  <td className="py-3 pr-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3 pr-4 text-slate-600">{c.type}</td>
                  <td className="py-3 pr-4 font-mono tabular-nums text-slate-800 whitespace-nowrap">
                    {c.priceRange}
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{c.mainStrength}</td>
                  <td className="py-3 pr-4 text-slate-700">{c.mainWeakness}</td>
                  <td className="py-3 text-right">
                    {c.sourcePage ? (
                      <button
                        type="button"
                        onClick={() => onInspectPage(c.sourcePage!)}
                        className="font-mono text-teal-700 hover:underline"
                      >
                        P.{c.sourcePage}
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
