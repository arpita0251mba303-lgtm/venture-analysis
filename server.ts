import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { extractText } from 'unpdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = 'gemini-4-hydrogen';

const SAFETY_GOVERNANCE_RULE = `
CRITICAL ACADEMIC & SAFETY POLICY:
1. Ground every factual claim, financial number, market metric, and competitor detail strictly in the uploaded business plan document.
2. NEVER invent, guess, or silently fix missing or inconsistent financial numbers. If a number is missing, return null and log a clear entry in auditIssues. If two numbers in the document conflict, preserve the document's exact figures and document the discrepancy in auditIssues and scenario discrepancies.
3. Include exact sourcePage integers referencing the [Page N] markers wherever possible.
4. REGULATED PRODUCT SAFETY RULE: Do NOT generate instructions for designing, manufacturing, modifying, operating, or using weapons or other dangerous products. For ventures involving regulated or potentially dangerous products, restrict all analysis strictly to high-level academic, ethical, regulatory, and business-risk assessment.
`;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildPageContext(pages: { pageNumber: number; text: string }[]): string {
  return pages
    .map((p) => `--- [Page ${p.pageNumber}] ---\n${p.text.trim()}`)
    .join('\n\n')
    .slice(0, 120000);
}

const citedPointSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    sourcePage: { type: Type.INTEGER, nullable: true },
    isDocumentFact: { type: Type.BOOLEAN },
  },
  required: ['text', 'isDocumentFact'],
};

const canvasItemSchema = {
  type: Type.OBJECT,
  properties: {
    point: { type: Type.STRING },
    sourcePage: { type: Type.INTEGER, nullable: true },
    isDocumentFact: { type: Type.BOOLEAN },
  },
  required: ['point', 'isDocumentFact'],
};

const swotItemSchema = {
  type: Type.OBJECT,
  properties: {
    observation: { type: Type.STRING },
    supportingEvidence: { type: Type.STRING },
    businessImplication: { type: Type.STRING },
    academicResearchRecommendation: { type: Type.STRING },
    isDocumentFact: { type: Type.BOOLEAN },
    sourcePage: { type: Type.INTEGER, nullable: true },
  },
  required: [
    'observation',
    'supportingEvidence',
    'businessImplication',
    'academicResearchRecommendation',
    'isDocumentFact',
  ],
};

const ventureAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { type: Type.STRING },
    latestInsights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          detail: { type: Type.STRING },
          category: { type: Type.STRING },
          sourcePage: { type: Type.INTEGER, nullable: true },
        },
        required: ['title', 'detail', 'category'],
      },
    },
    extraction: {
      type: Type.OBJECT,
      properties: {
        businessName: { type: Type.STRING },
        businessCategory: { type: Type.STRING },
        authorContext: { type: Type.STRING },
        geography: { type: Type.STRING },
        problemStatement: citedPointSchema,
        targetCustomers: citedPointSchema,
        customerPainPoints: { type: Type.ARRAY, items: citedPointSchema },
        valueProposition: citedPointSchema,
        competitorSummary: { type: Type.ARRAY, items: citedPointSchema },
        revenueModel: citedPointSchema,
        financialAssumptions: { type: Type.ARRAY, items: citedPointSchema },
        marketSizeSummary: citedPointSchema,
        marketingStrategy: citedPointSchema,
        gtmExperiment: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              week: { type: Type.STRING },
              channel: { type: Type.STRING },
              action: { type: Type.STRING },
              metric: { type: Type.STRING },
              owner: { type: Type.STRING },
              sourcePage: { type: Type.INTEGER, nullable: true },
            },
            required: ['week', 'channel', 'action', 'metric', 'owner'],
          },
        },
        mvpScope: {
          type: Type.OBJECT,
          properties: {
            coreFeature: { type: Type.STRING },
            priority: { type: Type.STRING },
            successMetric: { type: Type.STRING },
            excludedFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
            coreAssumption: { type: Type.STRING },
            sourcePage: { type: Type.INTEGER, nullable: true },
          },
          required: ['coreFeature', 'priority', 'successMetric', 'excludedFeatures', 'coreAssumption'],
        },
        risksAndAssumptions: { type: Type.ARRAY, items: citedPointSchema },
        immediateActions: { type: Type.ARRAY, items: citedPointSchema },
      },
      required: [
        'businessName',
        'businessCategory',
        'authorContext',
        'geography',
        'problemStatement',
        'targetCustomers',
        'customerPainPoints',
        'valueProposition',
        'competitorSummary',
        'revenueModel',
        'financialAssumptions',
        'marketSizeSummary',
        'marketingStrategy',
        'gtmExperiment',
        'mvpScope',
        'risksAndAssumptions',
        'immediateActions',
      ],
    },
    businessModel: {
      type: Type.OBJECT,
      properties: {
        customerSegments: { type: Type.ARRAY, items: canvasItemSchema },
        valueProposition: { type: Type.ARRAY, items: canvasItemSchema },
        customerRelationships: { type: Type.ARRAY, items: canvasItemSchema },
        distributionChannels: { type: Type.ARRAY, items: canvasItemSchema },
        revenueStreams: { type: Type.ARRAY, items: canvasItemSchema },
        costStructure: { type: Type.ARRAY, items: canvasItemSchema },
        keyAssumptions: { type: Type.ARRAY, items: canvasItemSchema },
        keyResources: { type: Type.ARRAY, items: canvasItemSchema },
        keyPartnerships: { type: Type.ARRAY, items: canvasItemSchema },
        evaluationNotes: { type: Type.STRING },
      },
      required: [
        'customerSegments',
        'valueProposition',
        'customerRelationships',
        'distributionChannels',
        'revenueStreams',
        'costStructure',
        'keyAssumptions',
        'keyResources',
        'keyPartnerships',
        'evaluationNotes',
      ],
    },
    financials: {
      type: Type.OBJECT,
      properties: {
        currencyCode: { type: Type.STRING },
        currencySymbol: { type: Type.STRING },
        secondaryPriceNote: { type: Type.STRING },
        costEvidenceSource: { type: Type.STRING },
        priceEvidenceSource: { type: Type.STRING },
        scenarios: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              sellingPrice: { type: Type.NUMBER, nullable: true },
              expectedCustomers: { type: Type.NUMBER, nullable: true },
              variableCost: { type: Type.NUMBER, nullable: true },
              monthlyFixedCost: { type: Type.NUMBER, nullable: true },
              purchasesPerCustomer: { type: Type.NUMBER, nullable: true },
              notes: { type: Type.STRING },
              sourcePage: { type: Type.INTEGER, nullable: true },
              discrepancies: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['id', 'label', 'notes', 'discrepancies'],
          },
        },
        auditIssues: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              severity: { type: Type.STRING },
              title: { type: Type.STRING },
              detail: { type: Type.STRING },
              sourcePage: { type: Type.INTEGER, nullable: true },
            },
            required: ['id', 'severity', 'title', 'detail'],
          },
        },
      },
      required: [
        'currencyCode',
        'currencySymbol',
        'secondaryPriceNote',
        'costEvidenceSource',
        'priceEvidenceSource',
        'scenarios',
        'auditIssues',
      ],
    },
    market: {
      type: Type.OBJECT,
      properties: {
        currencySymbol: { type: Type.STRING },
        tamCustomers: { type: Type.NUMBER, nullable: true },
        samCustomers: { type: Type.NUMBER, nullable: true },
        somCustomers: { type: Type.NUMBER, nullable: true },
        annualSpendPerCustomer: { type: Type.NUMBER, nullable: true },
        tamValue: { type: Type.NUMBER, nullable: true },
        samValue: { type: Type.NUMBER, nullable: true },
        somValue: { type: Type.NUMBER, nullable: true },
        tamEvidence: { type: Type.STRING },
        samEvidence: { type: Type.STRING },
        somEvidence: { type: Type.STRING },
        spendEvidence: { type: Type.STRING },
        targetSegments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              demographics: { type: Type.STRING },
              willingnessToPay: { type: Type.STRING },
              sourcePage: { type: Type.INTEGER, nullable: true },
            },
            required: ['name', 'description', 'demographics', 'willingnessToPay'],
          },
        },
        marketAssumptions: { type: Type.ARRAY, items: citedPointSchema },
        marketOpportunities: { type: Type.ARRAY, items: citedPointSchema },
        industryChallenges: { type: Type.ARRAY, items: citedPointSchema },
        competitors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              priceRange: { type: Type.STRING },
              axisXScore: { type: Type.NUMBER, nullable: true },
              axisYScore: { type: Type.NUMBER, nullable: true },
              mainOffer: { type: Type.STRING },
              mainStrength: { type: Type.STRING },
              mainWeakness: { type: Type.STRING },
              evidenceSource: { type: Type.STRING },
              evidenceStrength: { type: Type.STRING },
              sourcePage: { type: Type.INTEGER, nullable: true },
            },
            required: [
              'name',
              'type',
              'priceRange',
              'mainOffer',
              'mainStrength',
              'mainWeakness',
              'evidenceSource',
              'evidenceStrength',
            ],
          },
        },
        axisXLabel: { type: Type.STRING },
        axisYLabel: { type: Type.STRING },
        ventureAxisXScore: { type: Type.NUMBER, nullable: true },
        ventureAxisYScore: { type: Type.NUMBER, nullable: true },
        positioningStatement: { type: Type.STRING },
        sourcePage: { type: Type.INTEGER, nullable: true },
      },
      required: [
        'currencySymbol',
        'tamEvidence',
        'samEvidence',
        'somEvidence',
        'spendEvidence',
        'targetSegments',
        'marketAssumptions',
        'marketOpportunities',
        'industryChallenges',
        'competitors',
        'axisXLabel',
        'axisYLabel',
        'positioningStatement',
      ],
    },
    swot: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: swotItemSchema },
        weaknesses: { type: Type.ARRAY, items: swotItemSchema },
        opportunities: { type: Type.ARRAY, items: swotItemSchema },
        threats: { type: Type.ARRAY, items: swotItemSchema },
      },
      required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          likelihood: { type: Type.INTEGER },
          impact: { type: Type.INTEGER },
          mitigation: { type: Type.STRING },
          isDocumentFact: { type: Type.BOOLEAN },
          sourcePage: { type: Type.INTEGER, nullable: true },
        },
        required: ['id', 'category', 'title', 'description', 'likelihood', 'impact', 'mitigation', 'isDocumentFact'],
      },
    },
  },
  required: ['executiveSummary', 'latestInsights', 'extraction', 'businessModel', 'financials', 'market', 'swot', 'risks'],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'venture-iq-api' });
  });

  // Upload and analyze a PDF business plan
  app.post('/api/analyze-pdf', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded.' });
      }
      if (
        req.file.mimetype !== 'application/pdf' &&
        !req.file.originalname.toLowerCase().endsWith('.pdf')
      ) {
        return res.status(400).json({ error: 'Uploaded file must be a PDF document.' });
      }

      const uint8 = new Uint8Array(req.file.buffer);
      const extracted = await extractText(uint8, { mergePages: false });
      const rawPages = Array.isArray(extracted.text) ? extracted.text : [String(extracted.text || '')];
      const pages = rawPages.map((txt, idx) => ({
        pageNumber: idx + 1,
        text: (txt || '').trim(),
      }));

      const nonEmptyChars = pages.reduce((acc, p) => acc + p.text.length, 0);
      if (nonEmptyChars < 40) {
        return res.status(422).json({
          error:
            'Could not extract readable text from this PDF. Please upload a text-based PDF business plan.',
        });
      }

      const ai = getGeminiClient();
      const pageContext = buildPageContext(pages);

      const prompt = `Analyze the following uploaded business plan PDF ("${req.file.originalname}", ${extracted.totalPages} pages) and extract a complete, strictly grounded venture intelligence dataset.

RULES:
- Every financial scenario (conservative, base, ambitious) must come ONLY from the document. If a scenario is not present, include only the scenarios present or set missing numbers to null—NEVER fabricate financial numbers.
- If financial numbers are missing or inconsistent across pages/notes, explicitly log them in auditIssues (severity: "inconsistency" or "missing" or "assumption") and scenario.discrepancies.
- For financials.scenarios[].id use "conservative", "base", or "ambitious".
- For risks[].category use one of: "Financial", "Market Adoption", "Technological Reliability", "Regulatory & Compliance", "Customer Trust", "Ethical Implications", "Data Privacy", "Product Safety". Ensure all 8 categories are evaluated at an academic level. Likelihood and impact must be integers 1 to 5.
- For competitors[].type use "Direct Competitor" or "Indirect Competitor".
- In SWOT, clearly set isDocumentFact = true for facts directly stated in the PDF and false for AI analytical interpretations.

DOCUMENT CONTENT:
${pageContext}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction: SAFETY_GOVERNANCE_RULE,
          responseMimeType: 'application/json',
          responseSchema: ventureAnalysisSchema,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const now = new Date().toISOString();
      const project = {
        id: `venture-${Date.now()}`,
        isDemo: false,
        createdAt: now,
        updatedAt: now,
        fileName: req.file.originalname,
        pageCount: extracted.totalPages || pages.length,
        pages,
        ...parsed,
        swot: {
          ...parsed.swot,
          generatedAt: now,
        },
        chatHistory: [],
      };

      return res.json({ project });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PDF analysis failed.';
      console.error('Error in /api/analyze-pdf:', err);
      return res.status(500).json({ error: message });
    }
  });

  // Regenerate / deepen SWOT analysis
  app.post('/api/swot', async (req, res) => {
    try {
      const { project, focusPrompt } = req.body as {
        project?: { fileName?: string; pages?: { pageNumber: number; text: string }[] };
        focusPrompt?: string;
      };
      if (!project || !Array.isArray(project.pages)) {
        return res.status(400).json({ error: 'Project document pages are required.' });
      }

      const ai = getGeminiClient();
      const pageContext = buildPageContext(project.pages);

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Generate an in-depth MBA-level SWOT analysis for "${project.fileName || 'Venture Plan'}".
${focusPrompt ? `Additional focus requested by analyst: ${focusPrompt}` : ''}
For each quadrant (strengths, weaknesses, opportunities, threats), provide 3–4 rich items including main observation, supporting evidence from the document, business implication, and recommendation for further academic research. Explicitly mark isDocumentFact as true when grounded directly in the text and false when representing AI strategic interpretation. Cite sourcePage where available.

DOCUMENT CONTENT:
${pageContext}`,
        config: {
          systemInstruction: SAFETY_GOVERNANCE_RULE,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: swotItemSchema },
              weaknesses: { type: Type.ARRAY, items: swotItemSchema },
              opportunities: { type: Type.ARRAY, items: swotItemSchema },
              threats: { type: Type.ARRAY, items: swotItemSchema },
            },
            required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
          },
        },
      });

      const swot = JSON.parse(response.text || '{}');
      return res.json({
        swot: {
          ...swot,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SWOT generation failed.';
      console.error('Error in /api/swot:', err);
      return res.status(500).json({ error: message });
    }
  });

  // Venture Assistant AI Chatbot
  app.post('/api/chat', async (req, res) => {
    try {
      const { project, messages, question } = req.body as {
        project?: {
          fileName?: string;
          pages?: { pageNumber: number; text: string }[];
          financials?: unknown;
          market?: unknown;
        };
        messages?: { role: string; content: string }[];
        question?: string;
      };

      if (!project || !Array.isArray(project.pages) || !question) {
        return res.status(400).json({ error: 'Project context and question are required.' });
      }

      const ai = getGeminiClient();
      const pageContext = buildPageContext(project.pages);
      const recentHistory = (messages || [])
        .slice(-8)
        .map((m) => `${m.role === 'user' ? 'User' : 'Venture Assistant'}: ${m.content}`)
        .join('\n\n');

      const systemInstruction = `You are "Venture Assistant", an expert MBA Business Intelligence Analyst inside VENTURE IQ.
${SAFETY_GOVERNANCE_RULE}
CHATBOT GROUNDING RULES:
- Use the uploaded document ("${project.fileName}") as your PRIMARY source of truth.
- Always cite page numbers in parentheses like (Page 6) or (Pages 3–4) when referencing document facts.
- If the user asks about a detail, financial metric, or topic NOT provided in the document, explicitly state: "This specific information is not provided in the uploaded document." You may then offer general academic frameworks clearly labeled as [Academic Framework Guidance] without inventing venture-specific numbers.
- Highlight financial inconsistencies transparently if relevant (e.g., Base variable cost typo or missing multi-year cash flows).
- Keep formatting clean, structured, and executive-ready with clear headings and bullet points.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `UPLOADED DOCUMENT PAGES:
${pageContext}

CONVERSATION HISTORY:
${recentHistory || '(No prior messages)'}

CURRENT USER QUESTION:
${question}`,
        config: {
          systemInstruction,
        },
      });

      return res.json({ answer: response.text || 'Unable to generate a response.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Venture Assistant request failed.';
      console.error('Error in /api/chat:', err);
      return res.status(500).json({ error: message });
    }
  });

  // Generate AI Report Narrative
  app.post('/api/generate-report', async (req, res) => {
    try {
      const { project, reportType, reportTitle } = req.body as {
        project?: { fileName?: string; pages?: { pageNumber: number; text: string }[] };
        reportType?: string;
        reportTitle?: string;
      };

      if (!project || !Array.isArray(project.pages) || !reportType) {
        return res.status(400).json({ error: 'Project context and report type are required.' });
      }

      const ai = getGeminiClient();
      const pageContext = buildPageContext(project.pages);

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Write an executive, MBA-grade analytical narrative for the "${reportTitle || reportType}" based strictly on the uploaded document "${project.fileName}".
Requirements:
- Structure with clear numbered section headings.
- Cite page numbers (e.g., Page 4, Page 7) for every factual claim and figure.
- Explicitly distinguish document-stated data from analytical interpretation, and flag any missing data or numeric discrepancies rather than inventing values.
- Keep concise (450–700 words) and suitable for inclusion before structured tables in a PDF/DOCX export.

DOCUMENT CONTENT:
${pageContext}`,
        config: {
          systemInstruction: SAFETY_GOVERNANCE_RULE,
        },
      });

      return res.json({ narrative: response.text || '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Report narrative generation failed.';
      console.error('Error in /api/generate-report:', err);
      return res.status(500).json({ error: message });
    }
  });

  // Generate Academic Presentation Deck
  app.post('/api/generate-presentation', async (req, res) => {
    try {
      const { project, slideCount } = req.body as {
        project?: { fileName?: string; pages?: { pageNumber: number; text: string }[] };
        slideCount?: number;
      };

      if (!project || !Array.isArray(project.pages)) {
        return res.status(400).json({ error: 'Project context is required.' });
      }

      const targetCount = slideCount === 6 || slideCount === 10 || slideCount === 12 ? slideCount : 12;
      const ai = getGeminiClient();
      const pageContext = buildPageContext(project.pages);

      const topicList =
        targetCount === 6
          ? '1. Introduction & Business Idea, 2. Problem & Target Customers, 3. Value Proposition & Business Model, 4. Market & Competitor Analysis, 5. Financial Projections & Unit Economics, 6. SWOT, Risks & Conclusion'
          : targetCount === 10
            ? '1. Introduction, 2. Business Idea & Problem Identification, 3. Target Customers & Beachhead, 4. Value Proposition, 5. Business Model, 6. Market Analysis (TAM/SAM/SOM), 7. Competitor Analysis, 8. Financial Analysis, 9. SWOT & Risk Assessment, 10. Conclusion & Next Steps'
            : '1. Introduction, 2. Business Idea, 3. Problem Identification, 4. Target Customers, 5. Value Proposition, 6. Business Model, 7. Market Analysis, 8. Competitor Analysis, 9. Financial Analysis, 10. SWOT Analysis, 11. Risks and Challenges, 12. Conclusion';

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Generate an academic MBA presentation deck with exactly ${targetCount} slides for "${project.fileName}".
Required slide sequence: ${topicList}.
Each slide must have concise, presenter-ready bullet points (3–4 bullets, max 18 words each), a crisp insight-driven headline, optional keyMetric callout grounded strictly in the document, speakerNotes for oral presentation, and sourcePage citation. Never invent missing financial numbers.

DOCUMENT CONTENT:
${pageContext}`,
        config: {
          systemInstruction: SAFETY_GOVERNANCE_RULE,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                slideNumber: { type: Type.INTEGER },
                sectionTitle: { type: Type.STRING },
                headline: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyMetric: {
                  type: Type.OBJECT,
                  nullable: true,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING },
                  },
                  required: ['label', 'value'],
                },
                speakerNotes: { type: Type.STRING },
                sourcePage: { type: Type.INTEGER, nullable: true },
              },
              required: ['slideNumber', 'sectionTitle', 'headline', 'bullets', 'speakerNotes'],
            },
          },
        },
      });

      const slides = JSON.parse(response.text || '[]');
      return res.json({ slides });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Presentation generation failed.';
      console.error('Error in /api/generate-presentation:', err);
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VENTURE IQ server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
