import { X, FileText } from 'lucide-react';
import { DocumentPage } from '../types/venture';

interface SourcePageModalProps {
  isOpen: boolean;
  pageNumber: number | null;
  pages: DocumentPage[];
  fileName: string;
  onClose: () => void;
  onSelectPage: (page: number) => void;
}

export function SourcePageModal({
  isOpen,
  pageNumber,
  pages,
  fileName,
  onClose,
  onSelectPage,
}: SourcePageModalProps) {
  if (!isOpen || pageNumber === null) return null;

  const activePage = pages.find((p) => p.pageNumber === pageNumber) || pages[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Source Document Page Inspector"
    >
      <div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="h-5 w-5 shrink-0 text-teal-400" />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">Source Reference Inspector</h3>
              <p className="truncate text-xs text-slate-300">
                {fileName} · Page {activePage?.pageNumber ?? pageNumber} of {pages.length}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-teal-400"
            aria-label="Close source inspector"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 bg-slate-50 px-6 py-2.5">
          <span className="mr-2 text-xs font-medium text-slate-500 whitespace-nowrap">Pages:</span>
          {pages.map((p) => (
            <button
              key={p.pageNumber}
              type="button"
              onClick={() => onSelectPage(p.pageNumber)}
              className={`rounded-md px-2.5 py-1 text-xs font-mono tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                p.pageNumber === activePage?.pageNumber
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              P.{p.pageNumber}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
            {activePage?.text || 'No extracted text available for this page.'}
          </pre>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <span className="text-xs text-slate-500">
            Extracted verbatim from uploaded PDF document
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!activePage || activePage.pageNumber <= 1}
              onClick={() => activePage && onSelectPage(activePage.pageNumber - 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40"
            >
              Previous Page
            </button>
            <button
              type="button"
              disabled={!activePage || activePage.pageNumber >= pages.length}
              onClick={() => activePage && onSelectPage(activePage.pageNumber + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40"
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
