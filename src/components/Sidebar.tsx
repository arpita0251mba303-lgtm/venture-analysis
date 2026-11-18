import {
  BarChart3,
  Briefcase,
  FileSpreadsheet,
  FileText,
  FileUp,
  Globe2,
  Home,
  LayoutDashboard,
  MessageSquare,
  Presentation,
  ShieldAlert,
  Target,
  X,
} from 'lucide-react';
import { NavigationTab, VentureProject } from '../types/venture';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  projects: VentureProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onBackToLanding: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: NavigationTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { id: 'upload', label: 'PDF Upload & Extract', icon: FileUp },
  { id: 'business-model', label: 'Business Model Canvas', icon: Briefcase },
  { id: 'financials', label: 'Financial Intelligence', icon: BarChart3 },
  { id: 'market', label: 'Market & Competitors', icon: Globe2 },
  { id: 'swot', label: 'SWOT Analysis', icon: Target },
  { id: 'risks', label: 'Risk & Ethics Matrix', icon: ShieldAlert },
  { id: 'assistant', label: 'Venture Assistant', icon: MessageSquare },
  { id: 'reports', label: 'Report Generator', icon: FileText },
  { id: 'presentation', label: 'Presentation Studio', icon: Presentation },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  projects,
  activeProjectId,
  onSelectProject,
  onBackToLanding,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const content = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <button
          type="button"
          onClick={onBackToLanding}
          className="text-left focus-visible:outline-2 focus-visible:outline-teal-400"
        >
          <span className="block font-display text-base font-extrabold tracking-tight text-white">
            VENTURE IQ
          </span>
          <span className="block text-[11px] text-slate-400">AI Business Analyst</span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Active Venture Switcher */}
      <div className="border-b border-slate-800 px-4 py-3.5">
        <label
          htmlFor="venture-project-select"
          className="block text-[11px] font-medium text-slate-400"
        >
          Active Venture Plan
        </label>
        <select
          id="venture-project-select"
          value={activeProjectId}
          onChange={(e) => onSelectProject(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs font-medium text-white focus:border-teal-500 focus:outline-none"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.extraction.businessName} {p.isDemo ? '(Demo)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Workspace modules">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={() => {
            onSelectTab('upload');
            onCloseMobile();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-teal-400" />
          Analyze New PDF
        </button>
        <button
          type="button"
          onClick={onBackToLanding}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:text-white"
        >
          <Home className="h-3.5 w-3.5" />
          Landing Page
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[260px] shrink-0 border-r border-slate-800 lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-950/60" onClick={onCloseMobile} />
          <div className="relative z-50 w-[268px] max-w-[85vw]">{content}</div>
        </div>
      )}
    </>
  );
}
