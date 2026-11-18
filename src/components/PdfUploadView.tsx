import { useState, useRef } from 'react';
import {
  CheckCircle2,
  FileText,
  FileUp,
  Loader2,
  RotateCcw,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { VentureProject } from '../types/venture';

interface PdfUploadViewProps {
  activeProject: VentureProject;
  projects: VentureProject[];
  onProjectAnalyzed: (project: VentureProject) => void;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onResetDemo: () => void;
  onInspectPage: (page: number) => void;
}

export function PdfUploadView({
  activeProject,
  projects,
  onProjectAnalyzed,
  onSelectProject,
  onDeleteProject,
  onResetDemo,
  onInspectPage,
}: PdfUploadViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF (.pdf) business plan document.');
      return;
    }

    setIsAnalyzing(true);
    setUploadStatus(`Extracting text and analyzing "${file.name}" with Gemini AI...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze PDF document.');
      }

      onProjectAnalyzed(data.project);
      setUploadStatus(`Completed full analysis for "${data.project.extraction.businessName}".`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'PDF upload failed.');
      setUploadStatus('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ext = activeProject.extraction;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-teal-700">Document Intelligence Pipeline</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
            PDF Upload &amp; Structured Venture Extraction
          </h1>
        </div>
        <button
          type="button"
          onClick={() => onInspectPage(1)}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
        >
          View Raw PDF Pages ({activeProject.pageCount})
        </button>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-teal-600 bg-teal-50/40'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
            e.target.value = '';
          }}
        />

        {isAnalyzing ? (
          <div className="mx-auto flex max-w-md flex-col items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
            <p className="mt-3 text-sm font-semibold text-slate-900">{uploadStatus}</p>
            <p className="mt-1 text-xs text-slate-500">
              Extracting page-numbered text, financial scenarios, TAM/SAM/SOM, SWOT, and risk matrix.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-lg flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
              <FileUp className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-base font-bold text-slate-900">
              Upload Business Plan PDF
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Drag and drop a venture plan PDF here or browse your device (max 25 MB). Gemini AI
              extracts all sections with exact page references and highlights missing or inconsistent
              financial figures.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Select PDF Document
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mx-auto mt-4 flex max-w-xl items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-left text-xs text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {uploadStatus && !isAnalyzing && !errorMessage && (
          <div className="mx-auto mt-4 flex max-w-xl items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-left text-xs text-teal-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-700" />
            <span>{uploadStatus}</span>
          </div>
        )}
      </div>

      {/* Saved Projects Library */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Saved Venture Projects ({projects.length})
            </h2>
            <p className="text-xs text-slate-500">
              Projects persist locally in your browser so you can switch between uploaded plans.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetDemo}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore Biofire Demo
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 pr-4 font-semibold">Venture Name</th>
                <th className="py-2.5 pr-4 font-semibold">Source File</th>
                <th className="py-2.5 pr-4 font-semibold">Pages</th>
                <th className="py-2.5 pr-4 font-semibold">Category</th>
                <th className="py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => {
                const isSelected = p.id === activeProject.id;
                return (
                  <tr key={p.id} className={isSelected ? 'bg-slate-50/80' : 'hover:bg-slate-50'}>
                    <td className="py-3 pr-4 font-semibold text-slate-900">
                      {p.extraction.businessName}{' '}
                      {p.isDemo && (
                        <span className="ml-1.5 font-normal text-teal-700">· Demo Dataset</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{p.fileName}</td>
                    <td className="py-3 pr-4 font-mono tabular-nums text-slate-600">
                      {p.pageCount}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{p.extraction.businessCategory}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectProject(p.id)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                            isSelected
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Open'}
                        </button>
                        {!p.isDemo && (
                          <button
                            type="button"
                            onClick={() => onDeleteProject(p.id)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-700"
                            aria-label={`Delete ${p.extraction.businessName}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organized Venture Summary with Page Citations */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Organized Venture Extraction: {ext.businessName}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {ext.authorContext} · Click any page reference to verify the verbatim PDF excerpt.
            </p>
          </div>
          <FileText className="h-5 w-5 text-teal-700" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Business Problem
              </h3>
              {ext.problemStatement.sourcePage && (
                <button
                  type="button"
                  onClick={() => onInspectPage(ext.problemStatement.sourcePage!)}
                  className="font-mono text-xs text-teal-700 hover:underline"
                >
                  Page {ext.problemStatement.sourcePage}
                </button>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
              {ext.problemStatement.text}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Target Customers
              </h3>
              {ext.targetCustomers.sourcePage && (
                <button
                  type="button"
                  onClick={() => onInspectPage(ext.targetCustomers.sourcePage!)}
                  className="font-mono text-xs text-teal-700 hover:underline"
                >
                  Page {ext.targetCustomers.sourcePage}
                </button>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
              {ext.targetCustomers.text}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Value Proposition
              </h3>
              {ext.valueProposition.sourcePage && (
                <button
                  type="button"
                  onClick={() => onInspectPage(ext.valueProposition.sourcePage!)}
                  className="font-mono text-xs text-teal-700 hover:underline"
                >
                  Page {ext.valueProposition.sourcePage}
                </button>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
              {ext.valueProposition.text}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Revenue Model &amp; Marketing Strategy
              </h3>
              {ext.marketingStrategy.sourcePage && (
                <button
                  type="button"
                  onClick={() => onInspectPage(ext.marketingStrategy.sourcePage!)}
                  className="font-mono text-xs text-teal-700 hover:underline"
                >
                  Page {ext.marketingStrategy.sourcePage}
                </button>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
              {ext.revenueModel.text} {ext.marketingStrategy.text}
            </p>
          </div>
        </div>

        {/* Pain Points & Financial Assumptions */}
        <div className="mt-8 grid grid-cols-1 gap-6 border-t border-slate-100 pt-6 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Extracted Customer Pain Points
            </h3>
            <ul className="mt-3 space-y-2.5">
              {ext.customerPainPoints.map((pt, i) => (
                <li key={i} className="flex items-start justify-between gap-3 text-sm text-slate-700">
                  <span>• {pt.text}</span>
                  {pt.sourcePage && (
                    <button
                      type="button"
                      onClick={() => onInspectPage(pt.sourcePage!)}
                      className="shrink-0 font-mono text-xs text-teal-700 hover:underline"
                    >
                      P.{pt.sourcePage}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Extracted Financial Assumptions
            </h3>
            <ul className="mt-3 space-y-2.5">
              {ext.financialAssumptions.map((fa, i) => (
                <li key={i} className="flex items-start justify-between gap-3 text-sm text-slate-700">
                  <span>• {fa.text}</span>
                  {fa.sourcePage && (
                    <button
                      type="button"
                      onClick={() => onInspectPage(fa.sourcePage!)}
                      className="shrink-0 font-mono text-xs text-teal-700 hover:underline"
                    >
                      P.{fa.sourcePage}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* MVP Scope & 30-Day GTM Experiment */}
        <div className="mt-8 grid grid-cols-1 gap-6 border-t border-slate-100 pt-6 lg:grid-cols-12">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-slate-900">MVP Scope</h3>
              {ext.mvpScope.sourcePage && (
                <button
                  type="button"
                  onClick={() => onInspectPage(ext.mvpScope.sourcePage!)}
                  className="font-mono text-xs text-teal-700 hover:underline"
                >
                  Page {ext.mvpScope.sourcePage}
                </button>
              )}
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-800">{ext.mvpScope.coreFeature}</p>
            <p className="mt-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Success Metric:</span>{' '}
              {ext.mvpScope.successMetric}
            </p>
            <p className="mt-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Excluded from MVP:</span>{' '}
              {ext.mvpScope.excludedFeatures.join(', ')}
            </p>
          </div>

          <div className="lg:col-span-7">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Go-To-Market Experiment Roadmap
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-3 font-semibold">Phase</th>
                    <th className="py-2 pr-3 font-semibold">Channel</th>
                    <th className="py-2 pr-3 font-semibold">Target Metric</th>
                    <th className="py-2 text-right font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ext.gtmExperiment.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 pr-3 font-semibold text-slate-900 whitespace-nowrap">
                        {row.week}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-700">{row.channel}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{row.metric}</td>
                      <td className="py-2.5 text-right">
                        {row.sourcePage ? (
                          <button
                            type="button"
                            onClick={() => onInspectPage(row.sourcePage!)}
                            className="font-mono text-teal-700 hover:underline"
                          >
                            P.{row.sourcePage}
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
      </div>
    </div>
  );
}
