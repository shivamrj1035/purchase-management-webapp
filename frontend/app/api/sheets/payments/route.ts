import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSheetData, appendRow, updateRowById, deleteRowById, findRow, generateId } from '@/lib/google-sheets/client';
import { SHEET_NAMES, MASTER_SHEET_NAME, paymentToRow, rowToPayment, rowToConfig } from '@/lib/google-sheets/schema';

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
  const rows = await getSheetData(ssId, SHEET_NAMES.PAYMENTS);
  return NextResponse.json({ payments: rows.map(rowToPayment) });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ssId = await getSSId(userId);
  if (!ssId) return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  const b = await req.json();
  const now = new Date().toISOString();
  const p = { id: generateId(), category: b.category||'other', description: b.description||'', amount: Number(b.amount)||0, paymentDate: b.paymentDate||now, status: b.status||'paid', recipient: b.recipient||'', paymentMethod: b.paymentMethod||'', receiptNumber: b.receiptNumber||'', notes: b.notes||'', createdAt: now, updatedAt: now };
  await appendRow(ssId, SHEET_NAMES.PAYMENTS, paymentToRow(p));
  return NextResponse.json({ success: true, payment: p });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ssId = await getSSId(userId);
  if (!ssId) return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const now = new Date().toISOString();
  const p = { id: b.id, category: b.category||'other', description: b.description||'', amount: Number(b.amount)||0, paymentDate: b.paymentDate||'', status: b.status||'paid', recipient: b.recipient||'', paymentMethod: b.paymentMethod||'', receiptNumber: b.receiptNumber||'', notes: b.notes||'', createdAt: b.createdAt||now, updatedAt: now };
  const ok = await updateRowById(ssId, SHEET_NAMES.PAYMENTS, b.id, paymentToRow(p));
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, payment: p });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ssId = await getSSId(userId);
  if (!ssId) return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const ok = await deleteRowById(ssId, SHEET_NAMES.PAYMENTS, id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
