/**
 * Payment type definitions
 */

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
