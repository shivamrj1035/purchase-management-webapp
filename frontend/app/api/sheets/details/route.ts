import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSheetData, findRow, getSheetsClient } from '@/lib/google-sheets/client';
import { SHEET_NAMES, MASTER_SHEET_NAME, rowToConfig } from '@/lib/google-sheets/schema';

const MASTER_ID = process.env.GOOGLE_MASTER_SPREADSHEET_ID!;

async function getSSId(uid: string) {
  const r = await findRow(MASTER_ID, MASTER_SHEET_NAME, 0, uid);
  return r ? rowToConfig(r.data).spreadsheetId : null;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ssId = await getSSId(userId);
  if (!ssId) return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  const rows = await getSheetData(ssId, SHEET_NAMES.DETAILS);
  const details: Record<string, string> = {};
  rows.forEach(row => { if (row[0]) details[row[0]] = row[1] || ''; });
  return NextResponse.json({ details });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ssId = await getSSId(userId);
  if (!ssId) return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  const body = await req.json();
  const now = new Date().toISOString();
  const sheets = getSheetsClient();
  // Clear existing details and rewrite all
  const entries = Object.entries(body.details || {});
  const values = [['Key', 'Value', 'UpdatedAt'], ...entries.map(([k, v]) => [k, String(v), now])];
  await sheets.spreadsheets.values.update({
    spreadsheetId: ssId,
    range: `${SHEET_NAMES.DETAILS}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
  // Clear any remaining old rows
  const resp = await sheets.spreadsheets.values.get({ spreadsheetId: ssId, range: `${SHEET_NAMES.DETAILS}!A:C` });
  const totalRows = resp.data.values?.length || 0;
  if (totalRows > values.length) {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: ssId,
      range: `${SHEET_NAMES.DETAILS}!A${values.length + 1}:C${totalRows}`,
    });
  }
  return NextResponse.json({ success: true });
}
