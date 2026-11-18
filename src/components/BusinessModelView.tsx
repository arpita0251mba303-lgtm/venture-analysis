import { VentureProject, CanvasItem } from '../types/venture';

interface BusinessModelViewProps {
  project: VentureProject;
  onInspectPage: (page: number) => void;
}

interface CanvasCardProps {
  title: string;
  subtitle: string;
  items: CanvasItem[];
  onInspectPage: (page: number) => void;
  className?: string;
}

function CanvasBlock({ title, subtitle, items, onInspectPage, className = '' }: CanvasCardProps) {
  return (
    <div className={`flex flex-col rounded-xl border border-slate-200 bg-white p-5 ${className}`}>
      <div className="border-b border-slate-100 pb-3">
        <h2 className="font-display text-sm font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
      </div>
      <ul className="mt-3.5 flex-1 space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="text-xs leading-relaxed text-slate-700">
            <p>{item.point}</p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
              <span>{item.isDocumentFact ? 'Document Stated' : 'Analytical Synthesis'}</span>
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
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BusinessModelView({ project, onInspectPage }: BusinessModelViewProps) {
  const bm = project.businessModel;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-medium text-teal-700">Strategic Architecture</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
          Business Model Canvas &amp; Assumption Evaluation
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Structured evaluation of {project.extraction.businessName} across all 9 operating blocks.
        </p>
      </div>

      {/* 5-Column Classic Business Model Canvas Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <CanvasBlock
          title="Key Partnerships"
          subtitle="External alliances & compliance"
          items={bm.keyPartnerships}
          onInspectPage={onInspectPage}
          className="lg:row-span-2"
        />

        <div className="flex flex-col gap-4">
          <CanvasBlock
            title="Key Business Assumptions"
            subtitle="Core hypotheses requiring proof"
            items={bm.keyAssumptions}
            onInspectPage={onInspectPage}
            className="flex-1"
          />
          <CanvasBlock
            title="Key Resources"
            subtitle="IP, infrastructure & capabilities"
            items={bm.keyResources}
            onInspectPage={onInspectPage}
            className="flex-1"
          />
        </div>

        <CanvasBlock
          title="Value Proposition"
          subtitle="Pain relief & core differentiation"
          items={bm.valueProposition}
          onInspectPage={onInspectPage}
          className="lg:row-span-2 border-teal-200 bg-teal-50/20"
        />

        <div className="flex flex-col gap-4">
          <CanvasBlock
            title="Customer Relationships"
            subtitle="Trust building & support"
            items={bm.customerRelationships}
            onInspectPage={onInspectPage}
            className="flex-1"
          />
          <CanvasBlock
            title="Distribution Channels"
            subtitle="Acquisition & delivery paths"
            items={bm.distributionChannels}
            onInspectPage={onInspectPage}
            className="flex-1"
          />
        </div>

        <CanvasBlock
          title="Customer Segments"
          subtitle="Beachhead & secondary buyers"
          items={bm.customerSegments}
          onInspectPage={onInspectPage}
          className="lg:row-span-2"
        />
      </div>

      {/* Bottom Row: Cost Structure + Revenue Streams */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CanvasBlock
          title="Cost Structure"
          subtitle="Variable COGS, fixed overhead & GTM spend"
          items={bm.costStructure}
          onInspectPage={onInspectPage}
        />
        <CanvasBlock
          title="Revenue Streams"
          subtitle="Pricing, monetization & deposit mechanics"
          items={bm.revenueStreams}
          onInspectPage={onInspectPage}
        />
      </div>

      {/* Critical Analyst Evaluation */}
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-white">
        <h2 className="font-display text-base font-bold text-white">
          Business Model Evaluation Commentary
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{bm.evaluationNotes}</p>
      </div>
    </div>
  );
}
