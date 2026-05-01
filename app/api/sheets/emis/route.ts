import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getSheetData,
  appendRow,
  updateRowById,
  deleteRowById,
  findRow,
  generateId,
} from '@/lib/google-sheets/client';
import {
  SHEET_NAMES,
  MASTER_SHEET_NAME,
  emiToRow,
  rowToEmi,
  rowToConfig,
} from '@/lib/google-sheets/schema';

const MASTER_SPREADSHEET_ID = process.env.GOOGLE_MASTER_SPREADSHEET_ID!;

async function getUserSpreadsheetId(userId: string): Promise<string | null> {
  const result = await findRow(MASTER_SPREADSHEET_ID, MASTER_SHEET_NAME, 0, userId);
  if (!result) return null;
  return rowToConfig(result.data).spreadsheetId;
}

/**
 * GET /api/sheets/emis
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const spreadsheetId = await getUserSpreadsheetId(userId);
    if (!spreadsheetId) return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const borrowId = searchParams.get('borrowId');

    const rows = await getSheetData(spreadsheetId, SHEET_NAMES.EMIS);
    let emis = rows.map(rowToEmi);

    // Filter by borrowId if provided
    if (borrowId) {
      emis = emis.filter((e) => e.borrowId === borrowId);
    }

    return NextResponse.json({ emis });
  } catch (error: any) {
    console.error('Error fetching EMIs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/sheets/emis
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const spreadsheetId = await getUserSpreadsheetId(userId);
    if (!spreadsheetId) return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 404 });

    const body = await request.json();
    const now = new Date().toISOString();

    const emi = {
      id: generateId(),
      borrowId: body.borrowId || '',
      borrowName: body.borrowName || '',
      monthNo: Number(body.monthNo) || 0,
      dueDate: body.dueDate || '',
      paymentDate: body.paymentDate || '',
      amount: Number(body.amount) || 0,
      principalPaid: Number(body.principalPaid) || 0,
      interestPaid: Number(body.interestPaid) || 0,
      remainingBalance: Number(body.remainingBalance) || 0,
      status: body.status || 'pending',
      paymentMethod: body.paymentMethod || '',
      transactionId: body.transactionId || '',
      notes: body.notes || '',
      createdAt: now,
    };

    await appendRow(spreadsheetId, SHEET_NAMES.EMIS, emiToRow(emi));

    return NextResponse.json({ success: true, emi });
  } catch (error: any) {
    console.error('Error creating EMI:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/sheets/emis
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const spreadsheetId = await getUserSpreadsheetId(userId);
    if (!spreadsheetId) return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 404 });

    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const emi = {
      id: body.id,
      borrowId: body.borrowId || '',
      borrowName: body.borrowName || '',
      monthNo: Number(body.monthNo) || 0,
      dueDate: body.dueDate || '',
      paymentDate: body.paymentDate || '',
      amount: Number(body.amount) || 0,
      principalPaid: Number(body.principalPaid) || 0,
      interestPaid: Number(body.interestPaid) || 0,
      remainingBalance: Number(body.remainingBalance) || 0,
      status: body.status || 'pending',
      paymentMethod: body.paymentMethod || '',
      transactionId: body.transactionId || '',
      notes: body.notes || '',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const updated = await updateRowById(spreadsheetId, SHEET_NAMES.EMIS, body.id, emiToRow(emi));
    if (!updated) return NextResponse.json({ error: 'EMI not found' }, { status: 404 });

    return NextResponse.json({ success: true, emi });
  } catch (error: any) {
    console.error('Error updating EMI:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/sheets/emis
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const spreadsheetId = await getUserSpreadsheetId(userId);
    if (!spreadsheetId) return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const deleted = await deleteRowById(spreadsheetId, SHEET_NAMES.EMIS, id);
    if (!deleted) return NextResponse.json({ error: 'EMI not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting EMI:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
