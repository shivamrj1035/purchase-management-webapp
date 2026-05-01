import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getSheetData,
  batchAppendRows,
  batchUpdateRowsById,
  deleteRowById,
  findRow,
  generateId,
} from '@/lib/google-sheets/client';
import {
  SHEET_NAMES,
  MASTER_SHEET_NAME,
  emiToRow,
  rowToEmi,
  rowToBorrow,
  rowToConfig,
} from '@/lib/google-sheets/schema';

const MASTER_SPREADSHEET_ID = process.env.GOOGLE_MASTER_SPREADSHEET_ID!;

async function getUserSpreadsheetId(userId: string): Promise<string | null> {
  const result = await findRow(MASTER_SPREADSHEET_ID, MASTER_SHEET_NAME, 0, userId);
  if (!result) return null;
  return rowToConfig(result.data).spreadsheetId;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const spreadsheetId = await getUserSpreadsheetId(userId);
    if (!spreadsheetId) return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 404 });

    // 1. Get all Borrows and existing EMIs
    const borrowRows = await getSheetData(spreadsheetId, SHEET_NAMES.BORROWS);
    const borrows = borrowRows.map(rowToBorrow);

    const emiRows = await getSheetData(spreadsheetId, SHEET_NAMES.EMIS);
    const existingEmis = emiRows.map(rowToEmi);

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    let created = 0;
    let updated = 0;
    let duplicatesRemoved = 0;

    const newEmis: any[] = [];
    const updatedEmis: any[] = [];
    const idsToDelete: string[] = [];

    // 2. Remove Duplicates logic
    const emiGroups = new Map<string, any[]>();
    existingEmis.forEach((emi) => {
      const key = `${emi.borrowId}-${emi.monthNo}`;
      if (!emiGroups.has(key)) emiGroups.set(key, []);
      emiGroups.get(key)!.push(emi);
    });

    for (const [key, emis] of emiGroups.entries()) {
      if (emis.length > 1) {
        // Sort by createdAt
        emis.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        // Keep the first one, mark others for deletion
        for (let i = 1; i < emis.length; i++) {
          idsToDelete.push(emis[i].id);
          duplicatesRemoved++;
        }
      }
    }

    // 3. Generate New EMIs logic
    for (const borrow of borrows) {
      if (borrow.status !== 'active') continue;
      if (!borrow.startDate) continue;

      const startDate = new Date(borrow.startDate);
      
      // Calculate which month we're in
      const monthsSinceStart = Math.floor(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      for (let m = Math.max(0, monthsSinceStart); m < (borrow.tenureMonths || 0); m++) {
        const monthNo = m + 1;
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + m);

        if (dueDate <= thirtyDaysFromNow) {
          // Check if already exists
          const exists = existingEmis.find(e => e.borrowId === borrow.id && e.monthNo === monthNo);
          if (!exists) {
            let status = 'pending';
            if (dueDate < now) status = 'overdue';

            const newEmi = {
              id: generateId(),
              borrowId: borrow.id,
              borrowName: borrow.name,
              monthNo: monthNo,
              dueDate: dueDate.toISOString(),
              paymentDate: '',
              amount: borrow.emiAmount,
              principalPaid: 0,
              interestPaid: 0,
              remainingBalance: 0,
              status: status,
              paymentMethod: '',
              transactionId: '',
              notes: '',
              createdAt: new Date().toISOString(),
            };
            newEmis.push(emiToRow(newEmi));
            created++;
          }
        } else {
          break;
        }
      }
    }

    // 4. Update Overdue status logic
    for (const emi of existingEmis) {
      if (emi.status === 'pending') {
        const dueDate = new Date(emi.dueDate);
        if (dueDate < now) {
          emi.status = 'overdue';
          updatedEmis.push({ id: emi.id, values: emiToRow(emi) });
          updated++;
        }
      }
    }

    // 5. Execute operations
    if (idsToDelete.length > 0) {
      for (const id of idsToDelete) {
        await deleteRowById(spreadsheetId, SHEET_NAMES.EMIS, id);
      }
    }

    if (newEmis.length > 0) {
      await batchAppendRows(spreadsheetId, SHEET_NAMES.EMIS, newEmis);
    }

    if (updatedEmis.length > 0) {
      await batchUpdateRowsById(spreadsheetId, SHEET_NAMES.EMIS, updatedEmis);
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      duplicatesRemoved,
    });
  } catch (error: any) {
    console.error('Error syncing EMIs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
