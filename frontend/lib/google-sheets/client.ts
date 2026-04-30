import { google } from 'googleapis';

/**
 * Google Sheets API Client
 * Uses service account credentials from environment variables
 */

interface CacheEntry {
  data: any;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 10000; // 10 seconds TTL

function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  apiCache.set(key, { data, timestamp: Date.now() });
}

function invalidateCache(spreadsheetId: string, sheetName?: string): void {
  const prefix = sheetName ? `${spreadsheetId}-${sheetName}` : spreadsheetId;
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) {
      apiCache.delete(key);
    }
  }
  for (const key of pendingRequests.keys()) {
    if (key.startsWith(prefix)) {
      pendingRequests.delete(key);
    }
  }
}

function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !privateKey) {
    throw new Error('Google service account credentials not configured');
  }

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export function getSheetsClient() {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
}

/**
 * Extract spreadsheet ID from a Google Sheets URL
 */
export function extractSpreadsheetId(url: string): string | null {
  // Matches: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/...
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Validate that the service account can access the spreadsheet
 */
export async function validateSpreadsheetAccess(spreadsheetId: string): Promise<{
  success: boolean;
  title?: string;
  error?: string;
}> {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'properties.title,sheets.properties.title',
    });

    return {
      success: true,
      title: response.data.properties?.title || 'Untitled',
    };
  } catch (error: any) {
    if (error.code === 403 || error.code === 404) {
      return {
        success: false,
        error: 'Cannot access this spreadsheet. Please share it with the service account email.',
      };
    }
    return {
      success: false,
      error: `Failed to access spreadsheet: ${error.message}`,
    };
  }
}

/**
 * Ensure required sheets exist in the spreadsheet, create them if missing
 */
export async function ensureRequiredSheets(
  spreadsheetId: string,
  requiredSheets: { name: string; headers: string[] }[]
): Promise<void> {
  const sheets = getSheetsClient();

  // Get existing sheet names
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });

  const existingSheets = response.data.sheets?.map(
    (s) => s.properties?.title || ''
  ) || [];

  // Create missing sheets
  const sheetsToCreate = requiredSheets.filter(
    (rs) => !existingSheets.includes(rs.name)
  );

  if (sheetsToCreate.length > 0) {
    // Add missing sheets
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: sheetsToCreate.map((s) => ({
          addSheet: {
            properties: { title: s.name },
          },
        })),
      },
    });

    // Add headers to newly created sheets
    for (const sheet of sheetsToCreate) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheet.name}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [sheet.headers],
        },
      });
    }
  }
}

/**
 * Get all rows from a sheet (excluding header)
 */
export async function getSheetData(
  spreadsheetId: string,
  sheetName: string
): Promise<string[][]> {
  const cacheKey = `${spreadsheetId}-${sheetName}-data`;
  const cached = getCached<string[][]>(cacheKey);
  if (cached) return cached;

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const sheets = getSheetsClient();

  const requestPromise = sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  }).then(response => {
    const rows = response.data.values || [];
    // Skip header row
    const result = rows.length > 1 ? rows.slice(1) : [];
    setCache(cacheKey, result);
    pendingRequests.delete(cacheKey);
    return result;
  }).catch(error => {
    pendingRequests.delete(cacheKey);
    throw error;
  });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Get header row from a sheet
 */
export async function getSheetHeaders(
  spreadsheetId: string,
  sheetName: string
): Promise<string[]> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });

  return response.data.values?.[0] || [];
}

/**
 * Append a row to a sheet
 */
export async function appendRow(
  spreadsheetId: string,
  sheetName: string,
  values: (string | number | boolean)[]
): Promise<void> {
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:A`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [values],
    },
  });
}

/**
 * Update a specific row by finding the row with matching ID (column A)
 */
export async function updateRowById(
  spreadsheetId: string,
  sheetName: string,
  id: string,
  values: (string | number | boolean)[]
): Promise<boolean> {
  const sheets = getSheetsClient();

  // Get all data to find the row
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:A`,
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === id);

  if (rowIndex === -1) return false;

  const rowNumber = rowIndex + 1; // 1-indexed
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });

  return true;
}

/**
 * Delete a row by ID (clears the row content and then removes it)
 */
export async function deleteRowById(
  spreadsheetId: string,
  sheetName: string,
  id: string
): Promise<boolean> {
  const sheets = getSheetsClient();

  // Get all data to find the row
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:A`,
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === id);

  if (rowIndex === -1) return false;

  // Get sheet ID for the delete request
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties',
  });

  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );

  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) return false;

  // Delete the row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });

  return true;
}

/**
 * Append multiple rows to a sheet in a single request
 */
export async function batchAppendRows(
  spreadsheetId: string,
  sheetName: string,
  rows: (string | number | boolean)[][]
): Promise<void> {
  if (rows.length === 0) return;
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:A`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: rows,
    },
  });
}

/**
 * Update multiple rows in a single batch request
 * Note: This implementation is simplified and assumes we know the row indices or we find them.
 * For a true batch update of arbitrary rows by ID, we'd need to find all indices first.
 */
export async function batchUpdateRowsById(
  spreadsheetId: string,
  sheetName: string,
  updates: { id: string; values: (string | number | boolean)[] }[]
): Promise<void> {
  if (updates.length === 0) return;
  const sheets = getSheetsClient();

  // Get all IDs to find the row indices
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:A`,
  });

  const rows = response.data.values || [];
  const data: any[] = [];

  for (const update of updates) {
    const rowIndex = rows.findIndex((row) => row[0] === update.id);
    if (rowIndex !== -1) {
      const rowNumber = rowIndex + 1;
      data.push({
        range: `${sheetName}!A${rowNumber}`,
        values: [update.values],
      });
    }
  }

  if (data.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data,
      },
    });
  }
}

/**
 * Find a row by a value in a specific column
 */
export async function findRow(
  spreadsheetId: string,
  sheetName: string,
  columnIndex: number,
  value: string
): Promise<{ rowIndex: number; data: string[] } | null> {
  const data = await getSheetData(spreadsheetId, sheetName);

  for (let i = 0; i < data.length; i++) {
    if (data[i][columnIndex] === value) {
      return { rowIndex: i + 2, data: data[i] }; // +2 for 1-indexed + header
    }
  }

  return null;
}

/**
 * Generate a unique ID for a row
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
