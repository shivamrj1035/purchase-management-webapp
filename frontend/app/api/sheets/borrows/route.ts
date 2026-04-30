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
  borrowToRow,
  rowToBorrow,
  rowToConfig,
} from '@/lib/google-sheets/schema';

const MASTER_SPREADSHEET_ID = process.env.GOOGLE_MASTER_SPREADSHEET_ID!;

async function getUserSpreadsheetId(userId: string): Promise<string | null> {
  const result = await findRow(MASTER_SPREADSHEET_ID, MASTER_SHEET_NAME, 0, userId);
  if (!result) return null;
  const config = rowToConfig(result.data);
  return config.spreadsheetId;
}

/**
 * GET /api/sheets/borrows
 * Fetch all borrow/funding source records
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spreadsheetId = await getUserSpreadsheetId(userId);
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 404 });
    }

    const rows = await getSheetData(spreadsheetId, SHEET_NAMES.BORROWS);
    const borrows = rows.map(rowToBorrow);

    return NextResponse.json({ borrows });
  } catch (error: any) {
    console.error('Error fetching borrows:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/sheets/borrows
 * Add a new borrow/funding source
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spreadsheetId = await getUserSpreadsheetId(userId);
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 404 });
    }

    const body = await request.json();
    const now = new Date().toISOString();
    const borrow = {
      id: generateId(),
      name: body.name || '',
      type: body.type || 'bank_loan',
      principalAmount: Number(body.principalAmount) || 0,
      interestRate: Number(body.interestRate) || 0,
      interestType: body.interestType || 'percentage',
      tenureMonths: Number(body.tenureMonths) || 0,
      emiAmount: Number(body.emiAmount) || 0,
      startDate: body.startDate || now,
      status: body.status || 'active',
      bankName: body.bankName || '',
      lenderName: body.lenderName || '',
      accountNumber: body.accountNumber || '',
      notes: body.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    await appendRow(spreadsheetId, SHEET_NAMES.BORROWS, borrowToRow(borrow));

    return NextResponse.json({ success: true, borrow });
  } catch (error: any) {
    console.error('Error creating borrow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/sheets/borrows
 * Update an existing borrow
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spreadsheetId = await getUserSpreadsheetId(userId);
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 404 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const borrow = {
      id: body.id,
      name: body.name || '',
      type: body.type || 'bank_loan',
      principalAmount: Number(body.principalAmount) || 0,
      interestRate: Number(body.interestRate) || 0,
      interestType: body.interestType || 'percentage',
      tenureMonths: Number(body.tenureMonths) || 0,
      emiAmount: Number(body.emiAmount) || 0,
      startDate: body.startDate || '',
      status: body.status || 'active',
      bankName: body.bankName || '',
      lenderName: body.lenderName || '',
      accountNumber: body.accountNumber || '',
      notes: body.notes || '',
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    const updated = await updateRowById(spreadsheetId, SHEET_NAMES.BORROWS, body.id, borrowToRow(borrow));
    if (!updated) {
      return NextResponse.json({ error: 'Borrow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, borrow });
  } catch (error: any) {
    console.error('Error updating borrow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/sheets/borrows
 * Delete a borrow by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spreadsheetId = await getUserSpreadsheetId(userId);
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Spreadsheet not configured' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    const deleted = await deleteRowById(spreadsheetId, SHEET_NAMES.BORROWS, id);
    if (!deleted) {
      return NextResponse.json({ error: 'Borrow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting borrow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
