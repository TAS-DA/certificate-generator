import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { SpreadsheetData } from '../types/certificate';

export async function parseSpreadsheetFile(file: File, sheetNameOverride?: string): Promise<SpreadsheetData> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSVFile(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file, sheetNameOverride);
  } else {
    throw new Error('Unsupported file format. Please upload a CSV or XLSX file.');
  }
}

function parseCSVFile(file: File): Promise<SpreadsheetData> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            return reject(new Error('No data found in the uploaded CSV file.'));
          }

          let rawHeaders = results.meta.fields || [];
          rawHeaders = rawHeaders.map((h, idx) => (h && h.trim() ? h.trim() : `Column_${idx + 1}`));

          if (rawHeaders.length === 0) {
            return reject(new Error('No column headers detected in CSV file.'));
          }

          const { headers, renamedMap, warnings } = normalizeAndDeduplicateHeaders(rawHeaders);

          const rows: Record<string, string>[] = [];
          for (const rawRow of results.data) {
            const rowObj: Record<string, string> = {};
            let hasAnyValue = false;

            rawHeaders.forEach((rawH, i) => {
              const cleanH = headers[i];
              const val = rawRow[rawH] !== undefined && rawRow[rawH] !== null ? String(rawRow[rawH]).trim() : '';
              rowObj[cleanH] = val;
              if (val !== '') hasAnyValue = true;
            });

            if (hasAnyValue) {
              rows.push(rowObj);
            }
          }

          if (rows.length === 0) {
            return reject(new Error('This spreadsheet does not contain any usable records.'));
          }

          resolve({
            filename: file.name,
            sheetNames: ['Sheet1'],
            selectedSheet: 'Sheet1',
            headers,
            rows,
            totalRows: rows.length,
            renamedHeaders: Object.keys(renamedMap).length > 0 ? renamedMap : undefined,
            warnings,
          });
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Failed to process CSV file.'));
        }
      },
      error: (err) => {
        reject(new Error(`CSV Parsing error: ${err.message}`));
      },
    });
  });
}

function parseExcelFile(file: File, targetSheetName?: string): Promise<SpreadsheetData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true,
          cellText: true,
          raw: false,
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          return reject(new Error('No worksheets found in the Excel file.'));
        }

        const sheetNames = workbook.SheetNames;
        const selectedSheet = targetSheetName && sheetNames.includes(targetSheetName)
          ? targetSheetName
          : sheetNames[0];

        const worksheet = workbook.Sheets[selectedSheet];
        if (!worksheet) {
          return reject(new Error(`Worksheet "${selectedSheet}" could not be loaded.`));
        }

        const rawJson = XLSX.utils.sheet_to_json<Array<string | number | boolean>>(worksheet, {
          header: 1,
          defval: '',
          raw: false,
          blankrows: false,
        });

        if (!rawJson || rawJson.length === 0) {
          return reject(new Error(`The selected worksheet "${selectedSheet}" is empty.`));
        }

        const rawHeaderRow = (rawJson[0] || []) as string[];
        const rawHeaders = rawHeaderRow.map((h, idx) => {
          const str = h !== undefined && h !== null ? String(h).trim() : '';
          return str !== '' ? str : `Column_${idx + 1}`;
        });

        if (rawHeaders.length === 0) {
          return reject(new Error('No column headers detected in the Excel sheet.'));
        }

        const { headers, renamedMap, warnings } = normalizeAndDeduplicateHeaders(rawHeaders);

        const rows: Record<string, string>[] = [];
        for (let i = 1; i < rawJson.length; i++) {
          const rawRow = rawJson[i] as Array<string | number | boolean>;
          if (!rawRow || rawRow.length === 0) continue;

          const rowObj: Record<string, string> = {};
          let hasAnyValue = false;

          headers.forEach((h, colIdx) => {
            const rawVal = rawRow[colIdx];
            const val = rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : '';
            rowObj[h] = val;
            if (val !== '') hasAnyValue = true;
          });

          if (hasAnyValue) {
            rows.push(rowObj);
          }
        }

        if (rows.length === 0) {
          return reject(new Error(`Worksheet "${selectedSheet}" contains headers but no data rows.`));
        }

        resolve({
          filename: file.name,
          sheetNames,
          selectedSheet,
          headers,
          rows,
          totalRows: rows.length,
          renamedHeaders: Object.keys(renamedMap).length > 0 ? renamedMap : undefined,
          warnings,
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to parse Excel file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read spreadsheet file from disk.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

function normalizeAndDeduplicateHeaders(rawHeaders: string[]): {
  headers: string[];
  renamedMap: Record<string, string>;
  warnings: string[];
} {
  const headers: string[] = [];
  const counts: Record<string, number> = {};
  const renamedMap: Record<string, string> = {};
  const warnings: string[] = [];

  rawHeaders.forEach((origHeader) => {
    const clean = origHeader.trim();
    if (!counts[clean]) {
      counts[clean] = 1;
      headers.push(clean);
    } else {
      counts[clean]++;
      const newHeader = `${clean}_${counts[clean]}`;
      renamedMap[clean] = newHeader;
      headers.push(newHeader);
      warnings.push(`Duplicate column "${clean}" was automatically renamed to "${newHeader}".`);
    }
  });

  return { headers, renamedMap, warnings };
}
