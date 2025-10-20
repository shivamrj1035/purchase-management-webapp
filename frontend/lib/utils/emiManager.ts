import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface FundingSource {
  id: string;
  sourceName: string;
  sourceType: string;
  principalAmount: number;
  interestType?: "percentage" | "fixed_amount" | "none";
  interestRate: number;
  fixedInterestAmount?: number;
  tenureMonths: number;
  emiAmount: number;
  emiStartDate: Date;
  status: string;
}

export interface EMIPayment {
  id: string;
  fundingSourceId: string;
  fundingSourceName: string;
  monthNumber: number;
  dueDate: Date;
  amount: number;
  status: "pending" | "paid" | "overdue";
  paymentDate?: Date;
  createdAt: Date;
}

/**
 * Calculate the due date for a specific EMI month
 */
function calculateDueDate(startDate: Date, monthNumber: number): Date {
  const dueDate = new Date(startDate);
  dueDate.setMonth(dueDate.getMonth() + monthNumber - 1);
  return dueDate;
}

/**
 * Check if EMI payment already exists
 */
async function emiPaymentExists(
  userId: string,
  fundingSourceId: string,
  monthNumber: number
): Promise<boolean> {
  try {
    const paymentsRef = collection(db, "users", userId, "emiPayments");
    const q = query(
      paymentsRef,
      where("fundingSourceId", "==", fundingSourceId),
      where("monthNumber", "==", monthNumber)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking EMI existence:", error);
    return false;
  }
}

/**
 * Generate EMI payments for a funding source
 * Creates payments for next 30 days if they don't exist
 */
export async function generateEMIPayments(
  userId: string,
  fundingSource: FundingSource
): Promise<number> {
  if (
    fundingSource.sourceType !== "bank_loan" &&
    fundingSource.sourceType !== "personal_loan"
  ) {
    return 0; // Not a loan, skip
  }

  if (fundingSource.status !== "active") {
    return 0; // Only generate for active loans
  }

  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  let createdCount = 0;

  // Calculate which month we're in
  const monthsSinceStart = Math.floor(
    (now.getTime() - fundingSource.emiStartDate.getTime()) /
      (1000 * 60 * 60 * 24 * 30)
  );

  // Generate EMIs for upcoming months (current month + next few months that fall within 30 days)
  for (
    let monthNum = Math.max(0, monthsSinceStart);
    monthNum < fundingSource.tenureMonths;
    monthNum++
  ) {
    const dueDate = calculateDueDate(fundingSource.emiStartDate, monthNum + 1);

    // Only create if due date is within next 30 days or overdue
    if (dueDate <= thirtyDaysFromNow) {
      // Check if EMI payment already exists
      const exists = await emiPaymentExists(
        userId,
        fundingSource.id,
        monthNum + 1
      );

      if (!exists) {
        // Create EMI payment record
        const paymentsRef = collection(db, "users", userId, "emiPayments");
        
        // Determine status based on due date
        let status: "pending" | "overdue" = "pending";
        if (dueDate < now) {
          status = "overdue";
        }

        await addDoc(paymentsRef, {
          fundingSourceId: fundingSource.id,
          fundingSourceName: fundingSource.sourceName,
          monthNumber: monthNum + 1,
          dueDate: Timestamp.fromDate(dueDate),
          amount: fundingSource.emiAmount,
          status: status,
          interestType: fundingSource.interestType,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        createdCount++;
      }
    } else {
      // Due date is beyond 30 days, stop generating
      break;
    }
  }

  return createdCount;
}

/**
 * Generate EMI payments for all active funding sources
 */
export async function generateAllEMIPayments(userId: string): Promise<number> {
  const sourcesRef = collection(db, "users", userId, "fundingSources");
  const snapshot = await getDocs(sourcesRef);

  let totalCreated = 0;

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    const fundingSource: FundingSource = {
      id: docSnapshot.id,
      sourceName: data.sourceName,
      sourceType: data.sourceType,
      principalAmount: data.principalAmount,
      interestType: data.interestType,
      interestRate: data.interestRate,
      fixedInterestAmount: data.fixedInterestAmount,
      tenureMonths: data.tenureMonths,
      emiAmount: data.emiAmount,
      emiStartDate: data.emiStartDate?.toDate() || new Date(),
      status: data.status,
    };

    const created = await generateEMIPayments(userId, fundingSource);
    totalCreated += created;
  }

  return totalCreated;
}

/**
 * Update overdue status for all pending EMI payments
 */
export async function updateOverdueEMIPayments(userId: string): Promise<number> {
  const now = new Date();
  const paymentsRef = collection(db, "users", userId, "emiPayments");
  
  // Get all pending payments
  const q = query(paymentsRef, where("status", "==", "pending"));
  const snapshot = await getDocs(q);

  let updatedCount = 0;

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    const dueDate = data.dueDate?.toDate();

    if (dueDate && dueDate < now) {
      // Update to overdue
      const paymentRef = doc(db, "users", userId, "emiPayments", docSnapshot.id);
      await updateDoc(paymentRef, {
        status: "overdue",
        updatedAt: Timestamp.now(),
      });
      updatedCount++;
    }
  }

  return updatedCount;
}

/**
 * Remove duplicate EMI payments
 * Keeps the earliest created record for each fundingSourceId + monthNumber combination
 */
export async function removeDuplicateEMIPayments(
  userId: string
): Promise<number> {
  const paymentsRef = collection(db, "users", userId, "emiPayments");
  const snapshot = await getDocs(paymentsRef);

  // Group payments by fundingSourceId + monthNumber
  const paymentGroups = new Map<string, any[]>();

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const key = `${data.fundingSourceId}-${data.monthNumber}`;

    if (!paymentGroups.has(key)) {
      paymentGroups.set(key, []);
    }

    paymentGroups.get(key)!.push({
      id: docSnapshot.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      ...data,
    });
  });

  let deletedCount = 0;

  // For each group, keep the earliest created one and delete the rest
  for (const [key, payments] of paymentGroups) {
    if (payments.length > 1) {
      // Sort by createdAt (earliest first)
      payments.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );

      // Delete all except the first one
      for (let i = 1; i < payments.length; i++) {
        const paymentRef = doc(
          db,
          "users",
          userId,
          "emiPayments",
          payments[i].id
        );
        await deleteDoc(paymentRef);
        deletedCount++;
      }
    }
  }

  return deletedCount;
}

/**
 * Sync EMI payments - Generate new ones and update overdue status
 */
export async function syncEMIPayments(userId: string): Promise<{
  created: number;
  updated: number;
  duplicatesRemoved: number;
}> {
  // First remove duplicates
  const duplicatesRemoved = await removeDuplicateEMIPayments(userId);
  
  // Then generate new payments
  const created = await generateAllEMIPayments(userId);
  
  // Finally update overdue status
  const updated = await updateOverdueEMIPayments(userId);

  return { created, updated, duplicatesRemoved };
}
