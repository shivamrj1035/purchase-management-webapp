import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSheetData, appendRow, updateRowById, deleteRowById, findRow, generateId } from '@/lib/google-sheets/client';
import { SHEET_NAMES, MASTER_SHEET_NAME, triggerToRow, rowToTrigger, rowToConfig, TriggerRow } from '@/lib/google-sheets/schema';

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
  const rows = await getSheetData(ssId, SHEET_NAMES.TRIGGERS);
  return NextResponse.json({ triggers: rows.map(rowToTrigger) });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ssId = await getSSId(userId);
  if (!ssId) return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  const b = await req.json();
  const now = new Date().toISOString();
  const t: TriggerRow = {
    id: generateId(),
    emiPaymentIds: Array.isArray(b.emiPaymentIds) ? b.emiPaymentIds.join(',') : (b.emiPaymentIds || ''),
    scheduledFor: b.scheduledFor || now,
    status: b.status || 'pending',
    ccEmails: Array.isArray(b.ccEmails) ? b.ccEmails.join(',') : (b.ccEmails || ''),
    createdAt: now,
    sentAt: b.sentAt || '',
    errorMessage: b.errorMessage || '',
  };
  await appendRow(ssId, SHEET_NAMES.TRIGGERS, triggerToRow(t));
  return NextResponse.json({ success: true, trigger: t });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ssId = await getSSId(userId);
  if (!ssId) return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  
  const t: TriggerRow = {
    id: b.id,
    emiPaymentIds: Array.isArray(b.emiPaymentIds) ? b.emiPaymentIds.join(',') : (b.emiPaymentIds || ''),
    scheduledFor: b.scheduledFor,
    status: b.status,
    ccEmails: Array.isArray(b.ccEmails) ? b.ccEmails.join(',') : (b.ccEmails || ''),
    createdAt: b.createdAt,
    sentAt: b.sentAt,
    errorMessage: b.errorMessage,
  };
  
  const ok = await updateRowById(ssId, SHEET_NAMES.TRIGGERS, b.id, triggerToRow(t));
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, trigger: t });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ssId = await getSSId(userId);
  if (!ssId) return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const ok = await deleteRowById(ssId, SHEET_NAMES.TRIGGERS, id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
