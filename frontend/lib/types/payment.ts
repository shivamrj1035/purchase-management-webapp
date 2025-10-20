/**
 * Payment type definitions
 */

// Incoming Payment (EMI Payment)
export interface Payment {
  id: string;
  fundingSourceId: string;
  fundingSourceName: string;
  monthNumber?: number;
  paymentDate: Date;
  dueDate: Date;
  amount: number;
  status: "paid" | "pending" | "overdue";
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Outgoing Payment
export interface OutgoingPayment {
  id: string;
  category:
    | "builder_payment"
    | "registration"
    | "legal_fees"
    | "stamp_duty"
    | "other";
  description: string;
  amount: number;
  paymentDate: Date;
  status: "paid" | "pending";
  recipientName?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Funding Source
export interface FundingSource {
  id: string;
  sourceName: string;
  sourceType: string;
  principalAmount: number;
  interestType: string;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  fundReceivedDate: Date;
  emiStartDate: Date;
  status: string;
  bankName?: string;
  lenderName?: string;
  accountNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
