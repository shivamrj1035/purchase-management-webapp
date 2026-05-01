import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  extractSpreadsheetId,
  validateSpreadsheetAccess,
  ensureRequiredSheets,
} from '@/lib/google-sheets/client';
import { REQUIRED_SHEETS } from '@/lib/google-sheets/schema';

/**
 * POST /api/sheets/validate
 * Validate spreadsheet access and create required sheets
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { spreadsheetUrl } = body;

    if (!spreadsheetUrl) {
      return NextResponse.json(
        { error: 'spreadsheetUrl is required' },
        { status: 400 }
      );
    }

    // Extract spreadsheet ID from URL
    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Invalid Google Spreadsheet URL. Please provide a valid URL like: https://docs.google.com/spreadsheets/d/...' },
        { status: 400 }
      );
    }

    // Validate access
    const validation = await validateSpreadsheetAccess(spreadsheetId);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error,
          needsPermission: true,
          serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        },
        { status: 403 }
      );
    }

    // Create required sheets
    try {
      await ensureRequiredSheets(spreadsheetId, REQUIRED_SHEETS);
    } catch (error: any) {
      return NextResponse.json(
        { error: `Spreadsheet accessible but failed to create sheets: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      spreadsheetId,
      title: validation.title,
      message: 'Spreadsheet validated and sheets created successfully',
    });
  } catch (error: any) {
    console.error('Error validating spreadsheet:', error);
    return NextResponse.json(
      { error: 'Failed to validate spreadsheet', details: error.message },
      { status: 500 }
    );
  }
}
