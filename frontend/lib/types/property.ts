/**
 * Property and Purchase related types
 */

export interface PropertyDetails {
  purchasePrice: number;
  propertyAddress?: string;
  propertyType?: string;
  purchaseDate?: Date;
  registrationAmount?: number;
  stampDuty?: number;
  legalFees?: number;
  notes?: string;
}

export interface PurchaseProgress {
  targetAmount: number;
  totalFunding: number;
  totalExpenses: number;
  amountPaid: number;
  remainingAmount: number;
  progressPercentage: number;
}
