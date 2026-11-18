import { useState } from 'react';
import { Download, FileText, Loader2, Printer, Sparkles } from 'lucide-react';
import { VentureProject } from '../types/venture';
import {
  computeScenarioFinancials,
  formatCurrencyValue,
  formatNumber,
  formatPercent,
} from '../utils/financialCalculations';
import {
  exportReportToDOCX,
  exportReportToPDF,
  REPORT_TYPES,
  ReportTypeId,
} from '../utils/exportGenerators';

interface ReportGeneratorViewProps {
  project: VentureProject;
}

export function ReportGeneratorView({ project }: ReportGeneratorViewProps) {
  const [selectedReport, setSelectedReport] = useState<ReportTypeId>('complete-venture');
  const [aiNarratives, setAiNarratives] = useState<Partial<Record<ReportTypeId, string>>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportMeta = REPORT_TYPES.find((r) => r.id === selectedReport) || REPORT_TYPES[0];
  const currentNarrative = aiNarratives[selectedReport];

  const handleGenerateSynthesis = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            fileName: project.fileName,
            pages: project.pages,
          },
          reportType: selectedReport,
          reportTitle: reportMeta.title,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report synthesis.');
      }
      setAiNarratives((prev) => ({ ...prev, [selectedReport]: data.narrative }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    exportReportToPDF(project, selectedReport, currentNarrative);
  };

  const handleDownloadDOCX = async () => {
    setIsExportingDocx(true);
    try {
      await exportReportToDOCX(project, selectedReport, currentNarrative);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const includeAll =
    selectedReport === 'complete-venture' || selectedReport === 'academic-project';

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium text-teal-700">Executive &amp; Academic Deliverables</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            Report Generator (PDF &amp; DOCX)
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateSynthesis}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-700" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
            )}
            AI Narrative Synthesis
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </button>

          <button
            type="button"
            disabled={isExportingDocx}
            onClick={handleDownloadDOCX}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50 whitespace-nowrap"
          >
            <FileText className="h-3.5 w-3.5" />
            {isExportingDocx ? 'Building DOCX...' : 'Export DOCX'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>

      {error && (
        <div className="no-print rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Report Template Selector */}
        <div className="no-print space-y-2 lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Select Report Format
          </p>
          {REPORT_TYPES.map((rep) => {
            const active = rep.id === selectedReport;
            return (
              <button
                key={rep.id}
                type="button"
                onClick={() => setSelectedReport(rep.id)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                }`}
              >
                <p className="font-display text-sm font-bold">{rep.title}</p>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    active ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {rep.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Live Formatted Report Document */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 lg:col-span-8">
          <div className="border-b-2 border-slate-900 pb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              VENTURE IQ · {reportMeta.title}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">
              {project.extraction.businessName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {project.extraction.businessCategory} · Source: {project.fileName} ({project.pageCount}{' '}
              pages) · Generated {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="mt-6 space-y-8 text-sm leading-relaxed text-slate-700">
            {currentNarrative && (
              <section>
                <h3 className="font-display text-base font-bold text-slate-900">
                  AI Analytical Narrative
                </h3>
                <div className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
                  {currentNarrative}
                </div>
              </section>
            )}

            {(selectedReport === 'executive-summary' || includeAll) && (
              <section>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Executive Overview &amp; Value Proposition
                </h3>
                <p className="mt-2">{project.executiveSummary}</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-3.5 text-xs">
                    <p className="font-semibold text-slate-900">
                      Core Problem (Page {project.extraction.problemStatement.sourcePage ?? 'N/A'})
                    </p>
                    <p className="mt-1 text-slate-600">{project.extraction.problemStatement.text}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3.5 text-xs">
                    <p className="font-semibold text-slate-900">
                      Target Beachhead (Page {project.extraction.targetCustomers.sourcePage ?? 'N/A'})
                    </p>
                    <p className="mt-1 text-slate-600">{project.extraction.targetCustomers.text}</p>
                  </div>
                </div>
              </section>
            )}

            {(selectedReport === 'financial-analysis' ||
              selectedReport === 'executive-summary' ||
              includeAll) && (
              <section>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Financial Scenario Table ({project.financials.currencyCode})
                </h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="p-2.5 font-semibold">Scenario</th>
                        <th className="p-2.5 text-right font-semibold">Units/Mo</th>
                        <th className="p-2.5 text-right font-semibold">Price</th>
                        <th className="p-2.5 text-right font-semibold">Var Cost</th>
                        <th className="p-2.5 text-right font-semibold">Mo Revenue</th>
                        <th className="p-2.5 text-right font-semibold">Op Surplus</th>
                        <th className="p-2.5 text-right font-semibold">Gross Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.financials.scenarios.map((sc) => {
                        const c = computeScenarioFinancials(sc);
                        return (
                          <tr key={sc.id}>
                            <td className="p-2.5 font-semibold text-slate-900">{sc.label}</td>
                            <td className="p-2.5 text-right font-mono tabular-nums">
                              {formatNumber(c.unitsPerMonth)}
                            </td>
                            <td className="p-2.5 text-right font-mono tabular-nums">
                              {formatCurrencyValue(c.sellingPrice, project.financials.currencyCode)}
                            </td>
                            <td className="p-2.5 text-right font-mono tabular-nums">
                              {formatCurrencyValue(
                                c.variableCostPerUnit,
                                project.financials.currencyCode
                              )}
                            </td>
                            <td className="p-2.5 text-right font-mono tabular-nums">
                              {formatCurrencyValue(
                                c.monthlyRevenue,
                                project.financials.currencyCode,
                                true
                              )}
                            </td>
                            <td className="p-2.5 text-right font-mono tabular-nums">
                              {formatCurrencyValue(
                                c.operatingSurplus,
                                project.financials.currencyCode,
                                true
                              )}
                            </td>
                            <td className="p-2.5 text-right font-mono tabular-nums">
                              {formatPercent(c.grossMarginPct)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {project.financials.auditIssues.length > 0 && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs">
                    <p className="font-semibold text-slate-900">Audit &amp; Integrity Flags:</p>
                    <ul className="mt-1.5 space-y-1 text-slate-700">
                      {project.financials.auditIssues.map((i) => (
                        <li key={i.id}>
                          • <strong>{i.title}:</strong> {i.detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {(selectedReport === 'market-research' || includeAll) && (
              <section>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Market Sizing &amp; Competitive Comparison
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 p-3.5 text-xs">
                    <p className="text-slate-500">TAM</p>
                    <p className="mt-1 font-mono text-base font-bold tabular-nums text-slate-900">
                      {formatCurrencyValue(
                        project.market.tamValue,
                        project.financials.currencyCode,
                        true
                      )}
                    </p>
                    <p className="mt-1 text-slate-600">
                      {formatNumber(project.market.tamCustomers)} customers
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3.5 text-xs">
                    <p className="text-slate-500">SAM</p>
                    <p className="mt-1 font-mono text-base font-bold tabular-nums text-slate-900">
                      {formatCurrencyValue(
                        project.market.samValue,
                        project.financials.currencyCode,
                        true
                      )}
                    </p>
                    <p className="mt-1 text-slate-600">
                      {formatNumber(project.market.samCustomers)} customers
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3.5 text-xs">
                    <p className="text-slate-500">SOM</p>
                    <p className="mt-1 font-mono text-base font-bold tabular-nums text-teal-700">
                      {formatCurrencyValue(
                        project.market.somValue,
                        project.financials.currencyCode,
                        true
                      )}
                    </p>
                    <p className="mt-1 text-slate-600">
                      {formatNumber(project.market.somCustomers)} customers
                    </p>
                  </div>
                </div>
              </section>
            )}

            {(selectedReport === 'swot-analysis' || includeAll) && (
              <section>
                <h3 className="font-display text-base font-bold text-slate-900">
                  SWOT Matrix Summary
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                  {(
                    [
                      ['Strengths', project.swot.strengths],
                      ['Weaknesses', project.swot.weaknesses],
                      ['Opportunities', project.swot.opportunities],
                      ['Threats', project.swot.threats],
                    ] as const
                  ).map(([title, items]) => (
                    <div key={title} className="rounded-lg border border-slate-200 p-3.5">
                      <p className="font-bold text-slate-900">{title}</p>
                      <ul className="mt-1.5 space-y-1.5 text-slate-600">
                        {items.map((item, idx) => (
                          <li key={idx}>
                            • <strong className="text-slate-800">{item.observation}</strong> (
                            {item.isDocumentFact ? 'Fact' : 'AI'}, P.{item.sourcePage ?? 'N/A'})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(selectedReport === 'risk-assessment' ||
              selectedReport === 'executive-summary' ||
              includeAll) && (
              <section>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Risk &amp; Ethical Governance Register
                </h3>
                <ul className="mt-2 space-y-2 text-xs text-slate-700">
                  {project.risks.map((r) => (
                    <li key={r.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <span className="font-semibold text-slate-900">
                        [{r.category}] {r.title} (Score {r.likelihood * r.impact}/25):
                      </span>{' '}
                      {r.mitigation}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
