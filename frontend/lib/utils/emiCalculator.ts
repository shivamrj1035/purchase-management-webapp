/**
 * EMI Calculator Utility
 * Calculates EMI, total interest, and generates amortization schedules
 */

export interface AmortizationRow {
  month: number;
  emiAmount: number;
  principalPaid: number;
  interestPaid: number;
  principalBalance: number;
  paymentDate: Date;
}

export interface EMICalculation {
  emi: number;
  totalInterest: number;
  totalAmount: number;
  amortizationSchedule: AmortizationRow[];
}

/**
 * Calculate EMI using the formula:
 * EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
 * where P = Principal, R = Monthly interest rate, N = Tenure in months
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) {
    return 0;
  }

  // Convert annual rate to monthly rate
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    // If interest rate is 0, EMI is simply principal divided by tenure
    return principal / tenureMonths;
  }

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  return Math.round(emi * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate complete amortization schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  startDate: Date = new Date(),
  interestType: "percentage" | "fixed_amount" | "none" = "percentage",
  fixedInterestAmount = 0
): EMICalculation {
  if (interestType === "fixed_amount") {
    const amortizationSchedule: AmortizationRow[] = [];
    const totalInterest = fixedInterestAmount * tenureMonths;

    for (let month = 1; month <= tenureMonths; month++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + month - 1);

      amortizationSchedule.push({
        month,
        emiAmount: fixedInterestAmount,
        principalPaid: 0,
        interestPaid: fixedInterestAmount,
        principalBalance: principal,
        paymentDate,
      });
    }

    // Add a final row for principal payment at the end of the tenure
    const finalPaymentDate = new Date(startDate);
    finalPaymentDate.setMonth(startDate.getMonth() + tenureMonths);
    amortizationSchedule.push({
      month: tenureMonths + 1,
      emiAmount: principal,
      principalPaid: principal,
      interestPaid: 0,
      principalBalance: 0,
      paymentDate: finalPaymentDate,
    });

    return {
      emi: fixedInterestAmount,
      totalInterest: totalInterest,
      totalAmount: principal + totalInterest,
      amortizationSchedule,
    };
  }

  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const monthlyRate = annualRate / 12 / 100;

  const amortizationSchedule: AmortizationRow[] = [];
  let remainingPrincipal = principal;
  let totalInterestPaid = 0;

  for (let month = 1; month <= tenureMonths; month++) {
    const interestForMonth = remainingPrincipal * monthlyRate;
    const principalForMonth = emi - interestForMonth;

    remainingPrincipal -= principalForMonth;
    totalInterestPaid += interestForMonth;

    // Calculate payment date (add months to start date)
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + month - 1);

    amortizationSchedule.push({
      month,
      emiAmount: Math.round(emi * 100) / 100,
      principalPaid: Math.round(principalForMonth * 100) / 100,
      interestPaid: Math.round(interestForMonth * 100) / 100,
      principalBalance: Math.max(0, Math.round(remainingPrincipal * 100) / 100),
      paymentDate,
    });
  }

  return {
    emi: Math.round(emi * 100) / 100,
    totalInterest: Math.round(totalInterestPaid * 100) / 100,
    totalAmount: Math.round((principal + totalInterestPaid) * 100) / 100,
    amortizationSchedule,
  };
}

/**
 * Format currency for Indian Rupee
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
