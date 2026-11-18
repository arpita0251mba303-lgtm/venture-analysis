export type NavigationTab =
  | 'dashboard'
  | 'upload'
  | 'business-model'
  | 'financials'
  | 'market'
  | 'swot'
  | 'risks'
  | 'assistant'
  | 'reports'
  | 'presentation';

export interface DocumentPage {
  pageNumber: number;
  text: string;
}

export interface CitedPoint {
  text: string;
  sourcePage?: number;
  isDocumentFact: boolean;
}

export interface ExtractionSummary {
  businessName: string;
  businessCategory: string;
  authorContext: string;
  geography: string;
  problemStatement: CitedPoint;
  targetCustomers: CitedPoint;
  customerPainPoints: CitedPoint[];
  valueProposition: CitedPoint;
  competitorSummary: CitedPoint[];
  revenueModel: CitedPoint;
  financialAssumptions: CitedPoint[];
  marketSizeSummary: CitedPoint;
  marketingStrategy: CitedPoint;
  gtmExperiment: {
    week: string;
    channel: string;
    action: string;
    metric: string;
    owner: string;
    sourcePage?: number;
  }[];
  mvpScope: {
    coreFeature: string;
    priority: string;
    successMetric: string;
    excludedFeatures: string[];
    coreAssumption: string;
    sourcePage?: number;
  };
  risksAndAssumptions: CitedPoint[];
  immediateActions: CitedPoint[];
}

export interface CanvasItem {
  point: string;
  sourcePage?: number;
  isDocumentFact: boolean;
}

export interface BusinessModelCanvas {
  customerSegments: CanvasItem[];
  valueProposition: CanvasItem[];
  customerRelationships: CanvasItem[];
  distributionChannels: CanvasItem[];
  revenueStreams: CanvasItem[];
  costStructure: CanvasItem[];
  keyAssumptions: CanvasItem[];
  keyResources: CanvasItem[];
  keyPartnerships: CanvasItem[];
  evaluationNotes: string;
}

export type ScenarioId = 'conservative' | 'base' | 'ambitious';

export interface FinancialScenario {
  id: ScenarioId;
  label: string;
  sellingPrice: number | null;
  expectedCustomers: number | null;
  variableCost: number | null;
  monthlyFixedCost: number | null;
  purchasesPerCustomer: number | null;
  notes: string;
  sourcePage?: number;
  documentReported?: {
    contributionPerSale?: number;
    monthlyRevenue?: number;
    operatingSurplus?: number;
  };
  discrepancies: string[];
}

export interface FinancialAuditIssue {
  id: string;
  severity: 'inconsistency' | 'missing' | 'assumption';
  title: string;
  detail: string;
  sourcePage?: number;
}

export interface FinancialModuleData {
  currencyCode: string;
  currencySymbol: string;
  secondaryPriceNote: string;
  scenarios: FinancialScenario[];
  auditIssues: FinancialAuditIssue[];
  costEvidenceSource: string;
  priceEvidenceSource: string;
}

export interface CompetitorItem {
  name: string;
  type: 'Direct Competitor' | 'Indirect Competitor';
  priceRange: string;
  axisXScore: number | null;
  axisYScore: number | null;
  mainOffer: string;
  mainStrength: string;
  mainWeakness: string;
  evidenceSource: string;
  evidenceStrength: string;
  sourcePage?: number;
}

export interface MarketAnalysisData {
  currencySymbol: string;
  tamCustomers: number | null;
  samCustomers: number | null;
  somCustomers: number | null;
  annualSpendPerCustomer: number | null;
  tamValue: number | null;
  samValue: number | null;
  somValue: number | null;
  tamEvidence: string;
  samEvidence: string;
  somEvidence: string;
  spendEvidence: string;
  targetSegments: {
    name: string;
    description: string;
    demographics: string;
    willingnessToPay: string;
    sourcePage?: number;
  }[];
  marketAssumptions: CitedPoint[];
  marketOpportunities: CitedPoint[];
  industryChallenges: CitedPoint[];
  competitors: CompetitorItem[];
  axisXLabel: string;
  axisYLabel: string;
  ventureAxisXScore: number | null;
  ventureAxisYScore: number | null;
  positioningStatement: string;
  sourcePage?: number;
}

export interface SwotItem {
  observation: string;
  supportingEvidence: string;
  businessImplication: string;
  academicResearchRecommendation: string;
  isDocumentFact: boolean;
  sourcePage?: number;
}

export interface SwotAnalysisData {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  generatedAt: string;
}

export type RiskCategory =
  | 'Financial'
  | 'Market Adoption'
  | 'Technological Reliability'
  | 'Regulatory & Compliance'
  | 'Customer Trust'
  | 'Ethical Implications'
  | 'Data Privacy'
  | 'Product Safety';

export interface RiskItem {
  id: string;
  category: RiskCategory;
  title: string;
  description: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  mitigation: string;
  isDocumentFact: boolean;
  sourcePage?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PresentationSlide {
  slideNumber: number;
  sectionTitle: string;
  headline: string;
  bullets: string[];
  keyMetric?: {
    label: string;
    value: string;
  };
  speakerNotes: string;
  sourcePage?: number;
}

export interface VentureProject {
  id: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  pageCount: number;
  pages: DocumentPage[];
  executiveSummary: string;
  latestInsights: {
    title: string;
    detail: string;
    category: 'Financial' | 'Market' | 'Strategy' | 'Risk';
    sourcePage?: number;
  }[];
  extraction: ExtractionSummary;
  businessModel: BusinessModelCanvas;
  financials: FinancialModuleData;
  market: MarketAnalysisData;
  swot: SwotAnalysisData;
  risks: RiskItem[];
  chatHistory: ChatMessage[];
  savedSlides?: PresentationSlide[];
}
