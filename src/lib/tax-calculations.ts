export interface TaxInput {
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  lta: number;
  rentPaid: number;
  isMetro: boolean;
  section80C: number;
  section80D: number;
  nps80CCD: number;
  homeLoanInterest: number;
}

interface TaxSlab {
  from: number;
  to: number;
  rate: number;
}

const OLD_SLABS: TaxSlab[] = [
  { from: 0, to: 250000, rate: 0 },
  { from: 250000, to: 500000, rate: 0.05 },
  { from: 500000, to: 1000000, rate: 0.2 },
  { from: 1000000, to: Infinity, rate: 0.3 },
];

const NEW_SLABS: TaxSlab[] = [
  { from: 0, to: 300000, rate: 0 },
  { from: 300000, to: 700000, rate: 0.05 },
  { from: 700000, to: 1000000, rate: 0.1 },
  { from: 1000000, to: 1200000, rate: 0.15 },
  { from: 1200000, to: 1500000, rate: 0.2 },
  { from: 1500000, to: Infinity, rate: 0.3 },
];

function calcTaxFromSlabs(income: number, slabs: TaxSlab[]): number {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.from) break;
    const taxable = Math.min(income, slab.to) - slab.from;
    tax += taxable * slab.rate;
  }
  return Math.round(tax);
}

export function calculateHRAExemption(input: TaxInput): number {
  const { basicSalary, hra, rentPaid, isMetro } = input;
  if (rentPaid === 0 || hra === 0) return 0;
  const actual = hra;
  const rule1 = rentPaid - 0.1 * basicSalary;
  const rule2 = (isMetro ? 0.5 : 0.4) * basicSalary;
  return Math.max(0, Math.round(Math.min(actual, rule1, rule2)));
}

export function calculateOldRegimeTax(input: TaxInput) {
  const grossSalary = input.basicSalary + input.hra + input.specialAllowance + input.lta;
  const hraExemption = calculateHRAExemption(input);
  const standardDeduction = 50000;
  const sec80C = Math.min(input.section80C, 150000);
  const sec80D = Math.min(input.section80D, 75000);
  const nps = Math.min(input.nps80CCD, 50000);
  const homeLoan = Math.min(input.homeLoanInterest, 200000);

  const totalDeductions = standardDeduction + hraExemption + sec80C + sec80D + nps + homeLoan;
  const taxableIncome = Math.max(0, grossSalary - totalDeductions);
  const tax = calcTaxFromSlabs(taxableIncome, OLD_SLABS);
  const cess = Math.round(tax * 0.04);

  return {
    grossSalary,
    totalDeductions,
    taxableIncome,
    tax,
    cess,
    totalTax: tax + cess,
    breakdown: { standardDeduction, hraExemption, sec80C, sec80D, nps, homeLoan },
  };
}

export function calculateNewRegimeTax(input: TaxInput) {
  const grossSalary = input.basicSalary + input.hra + input.specialAllowance + input.lta;
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, grossSalary - standardDeduction);

  // Rebate under new regime for income up to 7L
  let tax = calcTaxFromSlabs(taxableIncome, NEW_SLABS);
  if (taxableIncome <= 700000) tax = 0;
  const cess = Math.round(tax * 0.04);

  return {
    grossSalary,
    totalDeductions: standardDeduction,
    taxableIncome,
    tax,
    cess,
    totalTax: tax + cess,
  };
}

export interface TaxSavingSuggestion {
  section: string;
  title: string;
  maxLimit: number;
  currentUsed: number;
  remaining: number;
  suggestions: string[];
}

export function getTaxSavingSuggestions(input: TaxInput): TaxSavingSuggestion[] {
  const results: TaxSavingSuggestion[] = [];

  const sec80CUsed = Math.min(input.section80C, 150000);
  if (sec80CUsed < 150000) {
    results.push({
      section: "80C",
      title: "Section 80C Deductions",
      maxLimit: 150000,
      currentUsed: sec80CUsed,
      remaining: 150000 - sec80CUsed,
      suggestions: ["PPF (Public Provident Fund)", "ELSS Mutual Funds (3-yr lock-in)", "NSC, Tax-saver FDs", "Life Insurance Premium"],
    });
  }

  const sec80DUsed = Math.min(input.section80D, 75000);
  if (sec80DUsed < 75000) {
    results.push({
      section: "80D",
      title: "Health Insurance (80D)",
      maxLimit: 75000,
      currentUsed: sec80DUsed,
      remaining: 75000 - sec80DUsed,
      suggestions: ["Self & family health insurance (₹25K)", "Parents' health insurance (₹25–50K)", "Preventive health check-up (₹5K)"],
    });
  }

  const npsUsed = Math.min(input.nps80CCD, 50000);
  if (npsUsed < 50000) {
    results.push({
      section: "80CCD(1B)",
      title: "NPS Extra Deduction",
      maxLimit: 50000,
      currentUsed: npsUsed,
      remaining: 50000 - npsUsed,
      suggestions: ["Additional NPS contribution for extra ₹50K deduction", "This is over and above the 80C limit"],
    });
  }

  return results;
}
