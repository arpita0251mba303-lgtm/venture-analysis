import { FinancialScenario } from '../types/venture';

export interface ComputedFinancials {
  hasCompleteInputs: boolean;
  missingFields: string[];
  sellingPrice: number | null;
  unitsPerMonth: number | null;
  variableCostPerUnit: number | null;
  monthlyFixedCost: number | null;
  purchasesPerCustomer: number;
  contributionPerUnit: number | null;
  grossMarginPct: number | null;
  monthlyRevenue: number | null;
  totalVariableCost: number | null;
  totalContribution: number | null;
  operatingSurplus: number | null;
  operatingMarginPct: number | null;
  breakEvenUnits: number | null;
  breakEvenRevenue: number | null;
  marginOfSafetyPct: number | null;
  annualizedRevenue: number | null;
  annualizedOperatingSurplus: number | null;
}

export interface ScenarioOverrides {
  sellingPrice?: number;
  expectedCustomers?: number;
  variableCost?: number;
  monthlyFixedCost?: number;
  purchasesPerCustomer?: number;
}

export function computeScenarioFinancials(
  scenario: FinancialScenario,
  overrides?: ScenarioOverrides
): ComputedFinancials {
  const sellingPrice = overrides?.sellingPrice ?? scenario.sellingPrice;
  const expectedCustomers = overrides?.expectedCustomers ?? scenario.expectedCustomers;
  const variableCostPerUnit = overrides?.variableCost ?? scenario.variableCost;
  const monthlyFixedCost = overrides?.monthlyFixedCost ?? scenario.monthlyFixedCost;
  const purchasesPerCustomer = overrides?.purchasesPerCustomer ?? scenario.purchasesPerCustomer ?? 1;

  const missingFields: string[] = [];
  if (sellingPrice === null || Number.isNaN(sellingPrice)) missingFields.push('Selling Price');
  if (expectedCustomers === null || Number.isNaN(expectedCustomers)) missingFields.push('Expected Customers');
  if (variableCostPerUnit === null || Number.isNaN(variableCostPerUnit)) missingFields.push('Variable Cost');
  if (monthlyFixedCost === null || Number.isNaN(monthlyFixedCost)) missingFields.push('Monthly Fixed Cost');

  if (missingFields.length > 0) {
    return {
      hasCompleteInputs: false,
      missingFields,
      sellingPrice,
      unitsPerMonth: expectedCustomers !== null ? expectedCustomers * purchasesPerCustomer : null,
      variableCostPerUnit,
      monthlyFixedCost,
      purchasesPerCustomer,
      contributionPerUnit:
        sellingPrice !== null && variableCostPerUnit !== null ? sellingPrice - variableCostPerUnit : null,
      grossMarginPct:
        sellingPrice !== null && sellingPrice > 0 && variableCostPerUnit !== null
          ? ((sellingPrice - variableCostPerUnit) / sellingPrice) * 100
          : null,
      monthlyRevenue:
        sellingPrice !== null && expectedCustomers !== null
          ? sellingPrice * expectedCustomers * purchasesPerCustomer
          : null,
      totalVariableCost: null,
      totalContribution: null,
      operatingSurplus: null,
      operatingMarginPct: null,
      breakEvenUnits: null,
      breakEvenRevenue: null,
      marginOfSafetyPct: null,
      annualizedRevenue: null,
      annualizedOperatingSurplus: null,
    };
  }

  const price = sellingPrice as number;
  const customers = expectedCustomers as number;
  const varCost = variableCostPerUnit as number;
  const fixedCost = monthlyFixedCost as number;

  const unitsPerMonth = customers * purchasesPerCustomer;
  const contributionPerUnit = price - varCost;
  const grossMarginPct = price > 0 ? (contributionPerUnit / price) * 100 : null;
  const monthlyRevenue = price * unitsPerMonth;
  const totalVariableCost = varCost * unitsPerMonth;
  const totalContribution = contributionPerUnit * unitsPerMonth;
  const operatingSurplus = totalContribution - fixedCost;
  const operatingMarginPct = monthlyRevenue > 0 ? (operatingSurplus / monthlyRevenue) * 100 : null;
  const breakEvenUnits = contributionPerUnit > 0 ? Math.ceil(fixedCost / contributionPerUnit) : null;
  const breakEvenRevenue =
    breakEvenUnits !== null ? breakEvenUnits * price : null;
  const marginOfSafetyPct =
    monthlyRevenue > 0 && breakEvenRevenue !== null
      ? ((monthlyRevenue - breakEvenRevenue) / monthlyRevenue) * 100
      : null;

  return {
    hasCompleteInputs: true,
    missingFields: [],
    sellingPrice: price,
    unitsPerMonth,
    variableCostPerUnit: varCost,
    monthlyFixedCost: fixedCost,
    purchasesPerCustomer,
    contributionPerUnit,
    grossMarginPct,
    monthlyRevenue,
    totalVariableCost,
    totalContribution,
    operatingSurplus,
    operatingMarginPct,
    breakEvenUnits,
    breakEvenRevenue,
    marginOfSafetyPct,
    annualizedRevenue: monthlyRevenue * 12,
    annualizedOperatingSurplus: operatingSurplus * 12,
  };
}

export function formatCurrencyValue(
  value: number | null | undefined,
  currencyCode = 'INR',
  compact = false
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Not Provided';
  }

  const isNegative = value < 0;
  const abs = Math.abs(value);
  const symbol = currencyCode === 'USD' ? '$' : currencyCode === 'EUR' ? '€' : 'INR ';

  if (compact && currencyCode === 'INR') {
    if (abs >= 1e11) {
      return `${isNegative ? '-' : ''}INR ${(abs / 1e7).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr`;
    }
    if (abs >= 1e7) {
      return `${isNegative ? '-' : ''}INR ${(abs / 1e7).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
    }
    if (abs >= 1e5) {
      return `${isNegative ? '-' : ''}INR ${(abs / 1e5).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`;
    }
    return `${isNegative ? '-' : ''}INR ${abs.toLocaleString('en-IN')}`;
  }

  if (compact) {
    if (abs >= 1e9) return `${isNegative ? '-' : ''}${symbol}${(abs / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${isNegative ? '-' : ''}${symbol}${(abs / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `${isNegative ? '-' : ''}${symbol}${(abs / 1e3).toFixed(1)}K`;
  }

  if (currencyCode === 'INR') {
    return `${isNegative ? '-' : ''}INR ${abs.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  return `${isNegative ? '-' : ''}${symbol}${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Not Provided';
  }
  return value.toLocaleString('en-IN');
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Not Provided';
  }
  return `${value.toFixed(decimals)}%`;
}
