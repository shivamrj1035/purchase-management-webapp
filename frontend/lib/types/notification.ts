/**
 * Notification Types and Interfaces
 */

export type NotificationStatus = "unread" | "read" | "archived";
export type NotificationType = "emi_reminder" | "payment_due" | "payment_overdue" | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt: Date;
  readAt?: Date;
  metadata?: {
    emiPaymentId?: string;
    fundingSourceId?: string;
    amount?: number;
    dueDate?: Date;
    [key: string]: any;
  };
}

export interface NotificationConfig {
  userId: string;
  primaryEmail: string;
  ccEmails: string[];
  enableAutoReminders: boolean;
  reminderDaysBefore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTrigger {
  id: string;
  userId: string;
  emiPaymentIds: string[];
  scheduledFor: Date;
  status: "pending" | "sent" | "failed" | "cancelled";
  ccEmails: string[];
  createdAt: Date;
  sentAt?: Date;
  errorMessage?: string;
}

export interface EMINotificationRequest {
  userId: string;
  userName: string;
  userEmail: string;
  emiDetails: {
    funding_source_name: string;
    month_number: number;
    amount: number;
    due_date: string;
    status: string;
  };
  ccEmails?: string[];
}

export interface BulkEMINotificationRequest {
  userId: string;
  userName: string;
  userEmail: string;
  emiList: Array<{
    funding_source_name: string;
    month_number: number;
    amount: number;
    due_date: string;
    status: string;
  }>;
  ccEmails?: string[];
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  emailsSent: number;
  timestamp: string;
}
