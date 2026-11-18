import { useEffect, useState } from 'react';
import { Menu, MessageSquare, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BIOFIRE_DEMO_PROJECT } from './data/biofireDemo';
import {
  ChatMessage,
  NavigationTab,
  PresentationSlide,
  SwotAnalysisData,
  VentureProject,
} from './types/venture';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PdfUploadView } from './components/PdfUploadView';
import { BusinessModelView } from './components/BusinessModelView';
import { FinancialAnalysisView } from './components/FinancialAnalysisView';
import { MarketAnalysisView } from './components/MarketAnalysisView';
import { SwotAnalysisView } from './components/SwotAnalysisView';
import { RiskEthicsView } from './components/RiskEthicsView';
import { VentureAssistantView } from './components/VentureAssistantView';
import { ReportGeneratorView } from './components/ReportGeneratorView';
import { PresentationGeneratorView } from './components/PresentationGeneratorView';
import { SourcePageModal } from './components/SourcePageModal';

const STORAGE_KEY = 'venture_iq_projects_v1';
const ACTIVE_ID_KEY = 'venture_iq_active_project_v1';

const TAB_LABELS: Record<NavigationTab, string> = {
  dashboard: 'Executive Dashboard',
  upload: 'PDF Upload & Extraction',
  'business-model': 'Business Model Canvas',
  financials: 'Financial Intelligence',
  market: 'Market & Competitors',
  swot: 'SWOT Analysis',
  risks: 'Risk & Ethics Matrix',
  assistant: 'Venture Assistant',
  reports: 'Report Generator',
  presentation: 'Presentation Studio',
};

function loadInitialProjects(): VentureProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as VentureProject[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasDemo = parsed.some((p) => p.id === BIOFIRE_DEMO_PROJECT.id);
        return hasDemo ? parsed : [BIOFIRE_DEMO_PROJECT, ...parsed];
      }
    }
  } catch {
    // Fall back cleanly to Biofire demonstration dataset
  }
  return [BIOFIRE_DEMO_PROJECT];
}

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [projects, setProjects] = useState<VentureProject[]>(loadInitialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      return localStorage.getItem(ACTIVE_ID_KEY) || BIOFIRE_DEMO_PROJECT.id;
    } catch {
      return BIOFIRE_DEMO_PROJECT.id;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inspectorPage, setInspectorPage] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // Ignore storage quota errors
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_ID_KEY, activeProjectId);
    } catch {
      // Ignore storage errors
    }
  }, [activeProjectId]);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || BIOFIRE_DEMO_PROJECT;

  const handleEnterWorkspace = (initialTab?: 'dashboard' | 'upload') => {
    if (initialTab) setActiveTab(initialTab);
    setViewMode('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProjectAnalyzed = (newProject: VentureProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (next.length === 0) return [BIOFIRE_DEMO_PROJECT];
      if (activeProjectId === id) {
        setActiveProjectId(next[0].id);
      }
      return next;
    });
  };

  const handleResetDemo = () => {
    setProjects((prev) => {
      const nonDemo = prev.filter((p) => p.id !== BIOFIRE_DEMO_PROJECT.id);
      return [BIOFIRE_DEMO_PROJECT, ...nonDemo];
    });
    setActiveProjectId(BIOFIRE_DEMO_PROJECT.id);
  };

  const handleUpdateSwot = (swot: SwotAnalysisData) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id ? { ...p, swot, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const handleUpdateChatHistory = (chatHistory: ChatMessage[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id
          ? { ...p, chatHistory, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const handleSaveSlides = (savedSlides: PresentationSlide[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id
          ? { ...p, savedSlides, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  if (viewMode === 'landing') {
    return (
      <LandingPage
        onEnterWorkspace={handleEnterWorkspace}
        savedProjectCount={projects.length}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        projects={projects}
        activeProjectId={activeProject.id}
        onSelectProject={(id) => setActiveProjectId(id)}
        onBackToLanding={() => setViewMode('landing')}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Workspace Top Bar */}
        <header className="no-print sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xs sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0 text-xs text-slate-500">
              <span className="hidden sm:inline">Workspace / </span>
              <span className="font-semibold text-slate-900">{TAB_LABELS[activeTab]}</span>
              <span className="hidden md:inline"> · {activeProject.extraction.businessName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
            >
              <FileUp className="h-3.5 w-3.5 text-teal-700" />
              <span className="hidden sm:inline">Upload PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap"
            >
              <MessageSquare className="h-3.5 w-3.5 text-teal-400" />
              <span>Venture Assistant</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeProject.id}-${activeTab}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  project={activeProject}
                  totalProjects={projects.length}
                  onNavigate={setActiveTab}
                  onInspectPage={setInspectorPage}
                />
              )}
              {activeTab === 'upload' && (
                <PdfUploadView
                  activeProject={activeProject}
                  projects={projects}
                  onProjectAnalyzed={handleProjectAnalyzed}
                  onSelectProject={setActiveProjectId}
                  onDeleteProject={handleDeleteProject}
                  onResetDemo={handleResetDemo}
                  onInspectPage={setInspectorPage}
                />
              )}
              {activeTab === 'business-model' && (
                <BusinessModelView
                  project={activeProject}
                  onInspectPage={setInspectorPage}
                />
              )}
              {activeTab === 'financials' && (
                <FinancialAnalysisView
                  project={activeProject}
                  onInspectPage={setInspectorPage}
                />
              )}
              {activeTab === 'market' && (
                <MarketAnalysisView
                  project={activeProject}
                  onInspectPage={setInspectorPage}
                />
              )}
              {activeTab === 'swot' && (
                <SwotAnalysisView
                  project={activeProject}
                  onUpdateSwot={handleUpdateSwot}
                  onInspectPage={setInspectorPage}
                />
              )}
              {activeTab === 'risks' && (
                <RiskEthicsView
                  project={activeProject}
                  onInspectPage={setInspectorPage}
                />
              )}
              {activeTab === 'assistant' && (
                <VentureAssistantView
                  project={activeProject}
                  onUpdateChatHistory={handleUpdateChatHistory}
                />
              )}
              {activeTab === 'reports' && <ReportGeneratorView project={activeProject} />}
              {activeTab === 'presentation' && (
                <PresentationGeneratorView
                  project={activeProject}
                  onSaveSlides={handleSaveSlides}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <SourcePageModal
        isOpen={inspectorPage !== null}
        pageNumber={inspectorPage}
        pages={activeProject.pages}
        fileName={activeProject.fileName}
        onClose={() => setInspectorPage(null)}
        onSelectPage={(p) => setInspectorPage(p)}
      />
    </div>
  );
}
