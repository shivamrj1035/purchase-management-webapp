/**
 * Google Sheets Schema Definitions
 * Defines the structure and column mappings for all data sheets
 */

// ============================================================
// Sheet Names
// ============================================================
export const SHEET_NAMES = {
  BORROWS: 'Borrows',
  EMIS: 'EMIs',
  PAYMENTS: 'Payments',
  DETAILS: 'Details',
  NOTIFICATIONS: 'Notifications',
  TRIGGERS: 'Triggers',
} as const;

// ============================================================
// Column Headers for each sheet
// ============================================================
export const BORROW_HEADERS = [
  'ID',
  'Name',
  'Type',
  'PrincipalAmount',
  'InterestRate',
  'InterestType',
  'TenureMonths',
  'EMIAmount',
  'StartDate',
  'Status',
  'BankName',
  'LenderName',
  'AccountNumber',
  'Notes',
  'CreatedAt',
  'UpdatedAt',
] as const;

export const EMI_HEADERS = [
  'ID',
  'BorrowID',
  'BorrowName',
  'MonthNo',
  'DueDate',
  'PaymentDate',
  'Amount',
  'PrincipalPaid',
  'InterestPaid',
  'RemainingBalance',
  'Status',
  'PaymentMethod',
  'TransactionID',
  'Notes',
  'CreatedAt',
] as const;

export const PAYMENT_HEADERS = [
  'ID',
  'Category',
  'Description',
  'Amount',
  'PaymentDate',
  'Status',
  'Recipient',
  'PaymentMethod',
  'ReceiptNumber',
  'Notes',
  'CreatedAt',
  'UpdatedAt',
] as const;

export const DETAIL_HEADERS = [
  'Key',
  'Value',
  'UpdatedAt',
] as const;

export const NOTIFICATION_HEADERS = [
  'ID',
  'Type',
  'Title',
  'Message',
  'Status',
  'CreatedAt',
  'ReadAt',
  'Metadata',
] as const;

export const TRIGGER_HEADERS = [
  'ID',
  'EMIPaymentIDs',
  'ScheduledFor',
  'Status',
  'CCEmails',
  'CreatedAt',
  'SentAt',
  'ErrorMessage',
] as const;

// ============================================================
// Required sheets with their headers
// ============================================================
export const REQUIRED_SHEETS = [
  { name: SHEET_NAMES.BORROWS, headers: [...BORROW_HEADERS] },
  { name: SHEET_NAMES.EMIS, headers: [...EMI_HEADERS] },
  { name: SHEET_NAMES.PAYMENTS, headers: [...PAYMENT_HEADERS] },
  { name: SHEET_NAMES.DETAILS, headers: [...DETAIL_HEADERS] },
  { name: SHEET_NAMES.NOTIFICATIONS, headers: [...NOTIFICATION_HEADERS] },
  { name: SHEET_NAMES.TRIGGERS, headers: [...TRIGGER_HEADERS] },
];

// ============================================================
// Master Config Sheet (for storing user spreadsheet mappings)
// ============================================================
export const MASTER_SHEET_NAME = 'UserConfig';
export const MASTER_HEADERS = [
  'UserID',
  'ClerkEmail',
  'SpreadsheetURL',
  'SpreadsheetID',
  'OnboardedAt',
  'LastAccessedAt',
] as const;

export const MASTER_REQUIRED_SHEETS = [
  { name: MASTER_SHEET_NAME, headers: [...MASTER_HEADERS] },
];

// ============================================================
// TypeScript Types (mapped from sheet columns)
// ============================================================
export interface BorrowRow {
  id: string;
  name: string;
  type: string; // 'bank_loan' | 'personal' | 'organization' | 'other'
  principalAmount: number;
  interestRate: number;
  interestType: string; // 'percentage' | 'fixed_amount' | 'none'
  tenureMonths: number;
  emiAmount: number;
  startDate: string;
  status: string; // 'active' | 'closed' | 'pending'
  bankName: string;
  lenderName: string;
  accountNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EMIRow {
  id: string;
  borrowId: string;
  borrowName: string;
  monthNo: number;
  dueDate: string;
  paymentDate: string;
  amount: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  status: string; // 'paid' | 'pending' | 'overdue'
  paymentMethod: string;
  transactionId: string;
  notes: string;
  createdAt: string;
}

export interface PaymentRow {
  id: string;
  category: string; // 'builder_payment' | 'registration' | 'legal_fees' | 'stamp_duty' | 'other'
  description: string;
  amount: number;
  paymentDate: string;
  status: string; // 'paid' | 'pending'
  recipient: string;
  paymentMethod: string;
  receiptNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetailEntry {
  key: string;
  value: string;
  updatedAt: string;
}

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  readAt: string;
  metadata: string; // JSON string
}

export interface TriggerRow {
  id: string;
  emiPaymentIds: string; // Comma separated or JSON
  scheduledFor: string;
  status: string;
  ccEmails: string; // Comma separated
  createdAt: string;
  sentAt: string;
  errorMessage: string;
}

export interface UserConfig {
  userId: string;
  clerkEmail: string;
  spreadsheetUrl: string;
  spreadsheetId: string;
  onboardedAt: string;
  lastAccessedAt: string;
}

// ============================================================
// Row Serialization Helpers
// ============================================================

export function borrowToRow(borrow: BorrowRow): (string | number)[] {
  return [
    borrow.id,
    borrow.name,
    borrow.type,
    borrow.principalAmount,
    borrow.interestRate,
    borrow.interestType,
    borrow.tenureMonths,
    borrow.emiAmount,
    borrow.startDate,
    borrow.status,
    borrow.bankName,
    borrow.lenderName,
    borrow.accountNumber,
    borrow.notes,
    borrow.createdAt,
    borrow.updatedAt,
  ];
}

export function rowToBorrow(row: string[]): BorrowRow {
  return {
    id: row[0] || '',
    name: row[1] || '',
    type: row[2] || '',
    principalAmount: Number(row[3]) || 0,
    interestRate: Number(row[4]) || 0,
    interestType: row[5] || 'percentage',
    tenureMonths: Number(row[6]) || 0,
    emiAmount: Number(row[7]) || 0,
    startDate: row[8] || '',
    status: row[9] || 'active',
    bankName: row[10] || '',
    lenderName: row[11] || '',
    accountNumber: row[12] || '',
    notes: row[13] || '',
    createdAt: row[14] || '',
    updatedAt: row[15] || '',
  };
}

export function emiToRow(emi: EMIRow): (string | number)[] {
  return [
    emi.id,
    emi.borrowId,
    emi.borrowName,
    emi.monthNo,
    emi.dueDate,
    emi.paymentDate,
    emi.amount,
    emi.principalPaid,
    emi.interestPaid,
    emi.remainingBalance,
    emi.status,
    emi.paymentMethod,
    emi.transactionId,
    emi.notes,
    emi.createdAt,
  ];
}

export function rowToEmi(row: string[]): EMIRow {
  return {
    id: row[0] || '',
    borrowId: row[1] || '',
    borrowName: row[2] || '',
    monthNo: Number(row[3]) || 0,
    dueDate: row[4] || '',
    paymentDate: row[5] || '',
    amount: Number(row[6]) || 0,
    principalPaid: Number(row[7]) || 0,
    interestPaid: Number(row[8]) || 0,
    remainingBalance: Number(row[9]) || 0,
    status: row[10] || 'pending',
    paymentMethod: row[11] || '',
    transactionId: row[12] || '',
    notes: row[13] || '',
    createdAt: row[14] || '',
  };
}

export function paymentToRow(payment: PaymentRow): (string | number)[] {
  return [
    payment.id,
    payment.category,
    payment.description,
    payment.amount,
    payment.paymentDate,
    payment.status,
    payment.recipient,
    payment.paymentMethod,
    payment.receiptNumber,
    payment.notes,
    payment.createdAt,
    payment.updatedAt,
  ];
}

export function rowToPayment(row: string[]): PaymentRow {
  return {
    id: row[0] || '',
    category: row[1] || '',
    description: row[2] || '',
    amount: Number(row[3]) || 0,
    paymentDate: row[4] || '',
    status: row[5] || 'pending',
    recipient: row[6] || '',
    paymentMethod: row[7] || '',
    receiptNumber: row[8] || '',
    notes: row[9] || '',
    createdAt: row[10] || '',
    updatedAt: row[11] || '',
  };
}

export function configToRow(config: UserConfig): string[] {
  return [
    config.userId,
    config.clerkEmail,
    config.spreadsheetUrl,
    config.spreadsheetId,
    config.onboardedAt,
    config.lastAccessedAt,
  ];
}

export function rowToConfig(row: string[]): UserConfig {
  return {
    userId: row[0] || '',
    clerkEmail: row[1] || '',
    spreadsheetUrl: row[2] || '',
    spreadsheetId: row[3] || '',
    onboardedAt: row[4] || '',
    lastAccessedAt: row[5] || '',
  };
}

export function notificationToRow(n: NotificationRow): (string | number)[] {
  return [
    n.id,
    n.type,
    n.title,
    n.message,
    n.status,
    n.createdAt,
    n.readAt,
    n.metadata,
  ];
}

export function rowToNotification(row: string[]): NotificationRow {
  return {
    id: row[0] || '',
    type: row[1] || '',
    title: row[2] || '',
    message: row[3] || '',
    status: row[4] || 'unread',
    createdAt: row[5] || '',
    readAt: row[6] || '',
    metadata: row[7] || '{}',
  };
}

export function triggerToRow(t: TriggerRow): (string | number)[] {
  return [
    t.id,
    t.emiPaymentIds,
    t.scheduledFor,
    t.status,
    t.ccEmails,
    t.createdAt,
    t.sentAt,
    t.errorMessage,
  ];
}

export function rowToTrigger(row: string[]): TriggerRow {
  return {
    id: row[0] || '',
    emiPaymentIds: row[1] || '',
    scheduledFor: row[2] || '',
    status: row[3] || 'pending',
    ccEmails: row[4] || '',
    createdAt: row[5] || '',
    sentAt: row[6] || '',
    errorMessage: row[7] || '',
  };
}
