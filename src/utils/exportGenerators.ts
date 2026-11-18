import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { PresentationSlide, VentureProject } from '../types/venture';
import {
  computeScenarioFinancials,
  formatCurrencyValue,
  formatNumber,
  formatPercent,
} from './financialCalculations';

export type ReportTypeId =
  | 'executive-summary'
  | 'complete-venture'
  | 'financial-analysis'
  | 'market-research'
  | 'swot-analysis'
  | 'risk-assessment'
  | 'academic-project';

export const REPORT_TYPES: { id: ReportTypeId; title: string; subtitle: string }[] = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    subtitle: 'Concise boardroom brief covering problem, positioning, unit economics, and top risks.',
  },
  {
    id: 'complete-venture',
    title: 'Complete Venture Analysis',
    subtitle: 'End-to-end dossier spanning extraction, Business Model Canvas, financials, market, SWOT, and risks.',
  },
  {
    id: 'financial-analysis',
    title: 'Financial Analysis Report',
    subtitle: 'Scenario modeling, break-even thresholds, unit contribution, and document audit findings.',
  },
  {
    id: 'market-research',
    title: 'Market Research Summary',
    subtitle: 'TAM/SAM/SOM sizing, target beachhead segmentation, and competitor positioning matrix.',
  },
  {
    id: 'swot-analysis',
    title: 'SWOT Analysis Report',
    subtitle: 'Document-grounded strengths, weaknesses, opportunities, threats, and academic research prompts.',
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment Report',
    subtitle: '8-domain risk matrix covering financial, adoption, technical reliability, regulatory, privacy, and ethics.',
  },
  {
    id: 'academic-project',
    title: 'Academic Project Report',
    subtitle: 'MBA evaluation format with source citations, assumptions review, and viva preparation notes.',
  },
];

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportToPDF(
  project: VentureProject,
  reportType: ReportTypeId,
  aiNarrative?: string
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const reportMeta = REPORT_TYPES.find((r) => r.id === reportType) || REPORT_TYPES[0];

  // Header band
  doc.setFillColor(15, 30, 54);
  doc.rect(0, 0, pageWidth, 84, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('VENTURE IQ — AI Business Analyst', 40, 34);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`${reportMeta.title} · ${project.extraction.businessName}`, 40, 54);
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Source: ${project.fileName} (${project.pageCount} pages) · Generated ${new Date().toLocaleDateString()}`, 40, 70);

  let y = 108;
  const ensureSpace = (needed = 80) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 48) {
      doc.addPage();
      y = 48;
    }
  };

  const addSectionHeading = (title: string) => {
    ensureSpace(45);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 30, 54);
    doc.text(title, 40, y);
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(1.5);
    doc.line(40, y + 5, pageWidth - 40, y + 5);
    y += 22;
  };

  const addParagraph = (text: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(text, pageWidth - 80);
    for (const line of lines) {
      ensureSpace(16);
      doc.text(line, 40, y);
      y += 14;
    }
    y += 6;
  };

  if (aiNarrative && aiNarrative.trim().length > 0) {
    addSectionHeading('AI Analytical Synthesis');
    addParagraph(aiNarrative.replace(/[#*`]/g, ''));
  }

  const includeAll = reportType === 'complete-venture' || reportType === 'academic-project';

  if (reportType === 'executive-summary' || includeAll) {
    addSectionHeading('1. Executive Summary & Venture Profile');
    addParagraph(project.executiveSummary);
    addParagraph(`Category: ${project.extraction.businessCategory} | Geography: ${project.extraction.geography}`);
    addParagraph(`Problem Solved (Page ${project.extraction.problemStatement.sourcePage ?? 'N/A'}): ${project.extraction.problemStatement.text}`);
    addParagraph(`Value Proposition (Page ${project.extraction.valueProposition.sourcePage ?? 'N/A'}): ${project.extraction.valueProposition.text}`);
  }

  if (reportType === 'financial-analysis' || reportType === 'executive-summary' || includeAll) {
    addSectionHeading('Financial Scenario & Unit Economics Summary');
    const finRows = project.financials.scenarios.map((sc) => {
      const c = computeScenarioFinancials(sc);
      return [
        sc.label,
        formatCurrencyValue(c.sellingPrice, project.financials.currencyCode),
        formatNumber(c.unitsPerMonth),
        formatCurrencyValue(c.variableCostPerUnit, project.financials.currencyCode),
        formatCurrencyValue(c.monthlyFixedCost, project.financials.currencyCode, true),
        formatCurrencyValue(c.monthlyRevenue, project.financials.currencyCode, true),
        formatCurrencyValue(c.operatingSurplus, project.financials.currencyCode, true),
        c.breakEvenUnits !== null ? `${formatNumber(c.breakEvenUnits)} units` : 'N/A',
      ];
    });
    ensureSpace(110);
    autoTable(doc, {
      startY: y,
      head: [['Scenario', 'Price', 'Units/Mo', 'Var Cost', 'Fixed Cost', 'Mo Revenue', 'Op Surplus', 'Break-Even']],
      body: finRows,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [15, 30, 54] },
      margin: { left: 40, right: 40 },
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 20;

    if (project.financials.auditIssues.length > 0) {
      addParagraph('Document Financial Audit & Discrepancy Flags:');
      for (const issue of project.financials.auditIssues) {
        addParagraph(`• [${issue.severity.toUpperCase()}] ${issue.title} (Page ${issue.sourcePage ?? 'N/A'}): ${issue.detail}`);
      }
    }
  }

  if (reportType === 'market-research' || includeAll) {
    addSectionHeading('Market Sizing (TAM / SAM / SOM) & Competitors');
    ensureSpace(90);
    autoTable(doc, {
      startY: y,
      head: [['Tier', 'Customers', 'Est. Annual Spend/Customer', 'Total Market Value', 'Evidence']],
      body: [
        [
          'TAM',
          formatNumber(project.market.tamCustomers),
          formatCurrencyValue(project.market.annualSpendPerCustomer, project.financials.currencyCode),
          formatCurrencyValue(project.market.tamValue, project.financials.currencyCode, true),
          project.market.tamEvidence,
        ],
        [
          'SAM',
          formatNumber(project.market.samCustomers),
          formatCurrencyValue(project.market.annualSpendPerCustomer, project.financials.currencyCode),
          formatCurrencyValue(project.market.samValue, project.financials.currencyCode, true),
          project.market.samEvidence,
        ],
        [
          'SOM',
          formatNumber(project.market.somCustomers),
          formatCurrencyValue(project.market.annualSpendPerCustomer, project.financials.currencyCode),
          formatCurrencyValue(project.market.somValue, project.financials.currencyCode, true),
          project.market.somEvidence,
        ],
      ],
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [13, 148, 136] },
      margin: { left: 40, right: 40 },
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 20;

    ensureSpace(90);
    autoTable(doc, {
      startY: y,
      head: [['Competitor', 'Type', 'Price Range', 'X / Y Score', 'Strength & Weakness']],
      body: project.market.competitors.map((c) => [
        c.name,
        c.type,
        c.priceRange,
        `${c.axisXScore ?? '-'} / ${c.axisYScore ?? '-'}`,
        `Strength: ${c.mainStrength} | Weakness: ${c.mainWeakness}`,
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [15, 30, 54] },
      margin: { left: 40, right: 40 },
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 20;
  }

  if (reportType === 'swot-analysis' || includeAll) {
    addSectionHeading('SWOT Analysis (Document Facts vs. AI Interpretations)');
    const swotRows: string[][] = [];
    const pushQuad = (quad: string, items: VentureProject['swot']['strengths']) => {
      for (const item of items) {
        swotRows.push([
          quad,
          item.isDocumentFact ? 'Document Fact' : 'AI Interpretation',
          item.observation,
          item.supportingEvidence,
          item.businessImplication,
        ]);
      }
    };
    pushQuad('Strength', project.swot.strengths);
    pushQuad('Weakness', project.swot.weaknesses);
    pushQuad('Opportunity', project.swot.opportunities);
    pushQuad('Threat', project.swot.threats);

    ensureSpace(100);
    autoTable(doc, {
      startY: y,
      head: [['Quadrant', 'Basis', 'Observation', 'Evidence', 'Implication']],
      body: swotRows,
      styles: { fontSize: 7.5, cellPadding: 4 },
      headStyles: { fillColor: [15, 30, 54] },
      margin: { left: 40, right: 40 },
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 20;
  }

  if (reportType === 'risk-assessment' || reportType === 'executive-summary' || includeAll) {
    addSectionHeading('Risk & Ethical Governance Matrix');
    ensureSpace(100);
    autoTable(doc, {
      startY: y,
      head: [['Category', 'Risk Title', 'L x I', 'Mitigation & Governance']],
      body: project.risks.map((r) => [
        r.category,
        r.title,
        `${r.likelihood} x ${r.impact} (${r.likelihood * r.impact})`,
        r.mitigation,
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [15, 30, 54] },
      margin: { left: 40, right: 40 },
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 20;
  }

  if (reportType === 'academic-project') {
    addSectionHeading('Academic Evaluation & Viva Discussion Prompts');
    addParagraph(
      '1. Methodology Check: Distinguish verbatim figures provided in the venture document from derived unit-economic calculations (e.g., break-even volume and operating surplus).'
    );
    addParagraph(
      '2. Assumption Stress-Test: Evaluate whether a 60% hardware gross margin and sub-100ms biometric reliability can be sustained at initial production scale.'
    );
    addParagraph(
      '3. Discrepancy Reconciliation: Address the Base scenario variable cost input (5,000 vs. 50,000) and Ambitious customer volume discrepancy (250 vs. 2,500) during oral defense.'
    );
  }

  const safeSlug = project.extraction.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`venture-iq-${safeSlug}-${reportType}.pdf`);
}

export async function exportReportToDOCX(
  project: VentureProject,
  reportType: ReportTypeId,
  aiNarrative?: string
): Promise<void> {
  const reportMeta = REPORT_TYPES.find((r) => r.id === reportType) || REPORT_TYPES[0];
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      text: `VENTURE IQ — ${reportMeta.title}`,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${project.extraction.businessName} · ${project.extraction.businessCategory}`, bold: true }),
      ],
    }),
    new Paragraph({
      text: `Source Document: ${project.fileName} (${project.pageCount} pages) | Generated: ${new Date().toLocaleDateString()}`,
      spacing: { after: 240 },
    })
  );

  if (aiNarrative && aiNarrative.trim().length > 0) {
    children.push(
      new Paragraph({ text: 'AI Analytical Synthesis', heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: aiNarrative.replace(/[#*`]/g, ''), spacing: { after: 200 } })
    );
  }

  const includeAll = reportType === 'complete-venture' || reportType === 'academic-project';

  if (reportType === 'executive-summary' || includeAll) {
    children.push(
      new Paragraph({ text: 'Executive Summary', heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: project.executiveSummary, spacing: { after: 140 } }),
      new Paragraph({
        text: `Problem Solved (Page ${project.extraction.problemStatement.sourcePage ?? 'N/A'}): ${project.extraction.problemStatement.text}`,
        spacing: { after: 120 },
      }),
      new Paragraph({
        text: `Value Proposition (Page ${project.extraction.valueProposition.sourcePage ?? 'N/A'}): ${project.extraction.valueProposition.text}`,
        spacing: { after: 200 },
      })
    );
  }

  if (reportType === 'financial-analysis' || reportType === 'executive-summary' || includeAll) {
    children.push(new Paragraph({ text: 'Financial Scenario Summary', heading: HeadingLevel.HEADING_1 }));
    const headerRow = new TableRow({
      children: ['Scenario', 'Price', 'Units/Mo', 'Var Cost', 'Fixed Cost', 'Revenue', 'Surplus', 'Break-Even'].map(
        (h) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
          })
      ),
    });
    const bodyRows = project.financials.scenarios.map((sc) => {
      const c = computeScenarioFinancials(sc);
      const cells = [
        sc.label,
        formatCurrencyValue(c.sellingPrice, project.financials.currencyCode),
        formatNumber(c.unitsPerMonth),
        formatCurrencyValue(c.variableCostPerUnit, project.financials.currencyCode),
        formatCurrencyValue(c.monthlyFixedCost, project.financials.currencyCode, true),
        formatCurrencyValue(c.monthlyRevenue, project.financials.currencyCode, true),
        formatCurrencyValue(c.operatingSurplus, project.financials.currencyCode, true),
        c.breakEvenUnits !== null ? `${formatNumber(c.breakEvenUnits)} (${formatPercent(c.grossMarginPct)} GM)` : 'N/A',
      ];
      return new TableRow({
        children: cells.map((val) => new TableCell({ children: [new Paragraph(val)] })),
      });
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...bodyRows],
      })
    );

    if (project.financials.auditIssues.length > 0) {
      children.push(
        new Paragraph({ text: 'Document Audit & Discrepancies', heading: HeadingLevel.HEADING_2, spacing: { before: 180 } })
      );
      for (const issue of project.financials.auditIssues) {
        children.push(
          new Paragraph({
            text: `• [${issue.severity.toUpperCase()}] ${issue.title} (Page ${issue.sourcePage ?? 'N/A'}): ${issue.detail}`,
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  if (reportType === 'market-research' || includeAll) {
    children.push(
      new Paragraph({ text: 'Market Sizing (TAM / SAM / SOM)', heading: HeadingLevel.HEADING_1, spacing: { before: 200 } }),
      new Paragraph(`TAM: ${formatNumber(project.market.tamCustomers)} customers | ${formatCurrencyValue(project.market.tamValue, project.financials.currencyCode, true)} — ${project.market.tamEvidence}`),
      new Paragraph(`SAM: ${formatNumber(project.market.samCustomers)} customers | ${formatCurrencyValue(project.market.samValue, project.financials.currencyCode, true)} — ${project.market.samEvidence}`),
      new Paragraph({
        text: `SOM: ${formatNumber(project.market.somCustomers)} customers | ${formatCurrencyValue(project.market.somValue, project.financials.currencyCode, true)} — ${project.market.somEvidence}`,
        spacing: { after: 180 },
      })
    );
  }

  if (reportType === 'swot-analysis' || includeAll) {
    children.push(new Paragraph({ text: 'SWOT Analysis', heading: HeadingLevel.HEADING_1, spacing: { before: 200 } }));
    const sections: [string, VentureProject['swot']['strengths']][] = [
      ['Strengths', project.swot.strengths],
      ['Weaknesses', project.swot.weaknesses],
      ['Opportunities', project.swot.opportunities],
      ['Threats', project.swot.threats],
    ];
    for (const [label, items] of sections) {
      children.push(new Paragraph({ text: label, heading: HeadingLevel.HEADING_2 }));
      for (const item of items) {
        children.push(
          new Paragraph({
            text: `• ${item.observation} [${item.isDocumentFact ? 'Document Fact' : 'AI Interpretation'}, Page ${item.sourcePage ?? 'N/A'}] — Evidence: ${item.supportingEvidence} | Implication: ${item.businessImplication}`,
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  if (reportType === 'risk-assessment' || reportType === 'executive-summary' || includeAll) {
    children.push(new Paragraph({ text: 'Risk & Ethical Assessment', heading: HeadingLevel.HEADING_1, spacing: { before: 200 } }));
    for (const r of project.risks) {
      children.push(
        new Paragraph({
          text: `• [${r.category}] ${r.title} (Likelihood ${r.likelihood}/5, Impact ${r.impact}/5): ${r.description} Mitigation: ${r.mitigation}`,
          spacing: { after: 90 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });
  const blob = await Packer.toBlob(doc);
  const safeSlug = project.extraction.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  triggerDownload(blob, `venture-iq-${safeSlug}-${reportType}.docx`);
}

export function exportPresentationToPDF(
  project: VentureProject,
  slides: PresentationSlide[],
  theme: 'navy' | 'academic' | 'teal'
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  const colors = {
    navy: { bg: [15, 30, 54] as const, accent: [20, 184, 166] as const, text: [248, 250, 252] as const, muted: [148, 163, 184] as const },
    academic: { bg: [255, 255, 255] as const, accent: [15, 30, 54] as const, text: [15, 23, 42] as const, muted: [71, 85, 105] as const },
    teal: { bg: [17, 94, 89] as const, accent: [255, 255, 255] as const, text: [248, 250, 252] as const, muted: [204, 251, 241] as const },
  }[theme];

  slides.forEach((slide, idx) => {
    if (idx > 0) doc.addPage();
    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.rect(0, 0, w, h, 'F');

    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(48, 46, 56, 4, 'F');

    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`${slide.slideNumber}. ${slide.sectionTitle}`, 48, 72);

    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(24);
    const headlineLines = doc.splitTextToSize(slide.headline, w - 96);
    doc.text(headlineLines, 48, 108);

    let bulletY = 108 + headlineLines.length * 28 + 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    for (const b of slide.bullets) {
      const wrapped = doc.splitTextToSize(`•  ${b}`, w - (slide.keyMetric ? 290 : 110));
      doc.text(wrapped, 52, bulletY);
      bulletY += wrapped.length * 18 + 10;
    }

    if (slide.keyMetric) {
      doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.setLineWidth(1);
      doc.roundedRect(w - 220, 140, 172, 110, 8, 8, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text(slide.keyMetric.label, w - 204, 172, { maxWidth: 140 });
      doc.setFontSize(18);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(slide.keyMetric.value, w - 204, 214, { maxWidth: 140 });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(
      `VENTURE IQ · ${project.extraction.businessName} · Slide ${slide.slideNumber} of ${slides.length}${
        slide.sourcePage ? ` · Source Page ${slide.sourcePage}` : ''
      }`,
      48,
      h - 30
    );
  });

  const safeSlug = project.extraction.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`venture-iq-${safeSlug}-presentation.pdf`);
}
