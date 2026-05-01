import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSheetData, appendRow, updateRowById, deleteRowById, findRow, generateId } from '@/lib/google-sheets/client';
import { SHEET_NAMES, MASTER_SHEET_NAME, notificationToRow, rowToNotification, rowToConfig, NotificationRow } from '@/lib/google-sheets/schema';

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
  const rows = await getSheetData(ssId, SHEET_NAMES.NOTIFICATIONS);
  return NextResponse.json({ notifications: rows.map(rowToNotification) });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ssId = await getSSId(userId);
  if (!ssId) return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  const b = await req.json();
  const now = new Date().toISOString();
  const n: NotificationRow = {
    id: generateId(),
    type: b.type || 'info',
    title: b.title || '',
    message: b.message || '',
    status: b.status || 'unread',
    createdAt: now,
    readAt: b.readAt || '',
    metadata: JSON.stringify(b.metadata || {}),
  };
  await appendRow(ssId, SHEET_NAMES.NOTIFICATIONS, notificationToRow(n));
  return NextResponse.json({ success: true, notification: n });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ssId = await getSSId(userId);
  if (!ssId) return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  
  const n: NotificationRow = {
    id: b.id,
    type: b.type,
    title: b.title,
    message: b.message,
    status: b.status,
    createdAt: b.createdAt,
    readAt: b.readAt,
    metadata: typeof b.metadata === 'string' ? b.metadata : JSON.stringify(b.metadata || {}),
  };
  
  const ok = await updateRowById(ssId, SHEET_NAMES.NOTIFICATIONS, b.id, notificationToRow(n));
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, notification: n });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ssId = await getSSId(userId);
  if (!ssId) return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const ok = await deleteRowById(ssId, SHEET_NAMES.NOTIFICATIONS, id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
