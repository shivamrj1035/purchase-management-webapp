import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getSheetsClient,
  ensureRequiredSheets,
  getSheetData,
  findRow,
  appendRow,
} from '@/lib/google-sheets/client';
import {
  MASTER_SHEET_NAME,
  MASTER_REQUIRED_SHEETS,
  rowToConfig,
  configToRow,
} from '@/lib/google-sheets/schema';

const MASTER_SPREADSHEET_ID = process.env.GOOGLE_MASTER_SPREADSHEET_ID!;

/**
 * GET /api/user/config
 * Check if the current user has configured their spreadsheet
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure master config sheet exists
    await ensureRequiredSheets(MASTER_SPREADSHEET_ID, MASTER_REQUIRED_SHEETS);

    // Find user config
    const result = await findRow(MASTER_SPREADSHEET_ID, MASTER_SHEET_NAME, 0, userId);

    if (result) {
      const config = rowToConfig(result.data);
      return NextResponse.json({ configured: true, config });
    }

    return NextResponse.json({ configured: false });
  } catch (error: any) {
    console.error('Error fetching user config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user config', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/config
 * Save the user's spreadsheet URL
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { spreadsheetUrl, spreadsheetId, email } = body;

    if (!spreadsheetUrl || !spreadsheetId) {
      return NextResponse.json(
        { error: 'spreadsheetUrl and spreadsheetId are required' },
        { status: 400 }
      );
    }

    // Ensure master config sheet exists
    await ensureRequiredSheets(MASTER_SPREADSHEET_ID, MASTER_REQUIRED_SHEETS);

    const now = new Date().toISOString();

    // Check if user already has a config
    const existing = await findRow(MASTER_SPREADSHEET_ID, MASTER_SHEET_NAME, 0, userId);

    if (existing) {
      // Update existing row
      const sheets = getSheetsClient();
      await sheets.spreadsheets.values.update({
        spreadsheetId: MASTER_SPREADSHEET_ID,
        range: `${MASTER_SHEET_NAME}!A${existing.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [configToRow({
            userId,
            clerkEmail: email || existing.data[1] || '',
            spreadsheetUrl,
            spreadsheetId,
            onboardedAt: existing.data[4] || now,
            lastAccessedAt: now,
          })],
        },
      });
    } else {
      // Create new row
      await appendRow(MASTER_SPREADSHEET_ID, MASTER_SHEET_NAME, configToRow({
        userId,
        clerkEmail: email || '',
        spreadsheetUrl,
        spreadsheetId,
        onboardedAt: now,
        lastAccessedAt: now,
      }));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving user config:', error);
    return NextResponse.json(
      { error: 'Failed to save config', details: error.message },
      { status: 500 }
    );
  }
}
