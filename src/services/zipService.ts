import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { CertificateBatch, GeneratedCertificate } from '../types/certificate';
import { dbService } from './db';

/**
 * Sanitizes a string to be a safe OS file name.
 */
export function sanitizeFilename(filename: string): string {
  let clean = filename
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!clean) clean = 'certificate';
  return clean;
}

/**
 * Evaluates a filename pattern like "{{Name}}_{{Certificate ID}}" against row record values.
 */
export function generateFilenameFromPattern(
  pattern: string, 
  rowRecord: Record<string, string>, 
  rowNumber: number
): string {
  if (!pattern || !pattern.trim()) {
    const formattedNum = String(rowNumber).padStart(3, '0');
    return `certificate_${formattedNum}.pdf`;
  }

  let result = pattern;
  const matches = pattern.match(/\{\{([^}]+)\}\}/g);

  if (matches) {
    for (const match of matches) {
      const colName = match.replace(/\{\{|\}\}/g, '').trim();
      const val = rowRecord[colName] || '';
      result = result.replace(match, val);
    }
  }

  let cleanName = sanitizeFilename(result);
  
  if (!cleanName || cleanName === '_') {
    const formattedNum = String(rowNumber).padStart(3, '0');
    cleanName = `certificate_${formattedNum}`;
  }

  if (!cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName += '.pdf';
  }

  return cleanName;
}

/**
 * Deduplicates filenames in a list by appending _2, _3 when collisions exist.
 */
export function deduplicateFilenames(certificates: GeneratedCertificate[]): Map<string, string> {
  const filenameMap = new Map<string, string>();
  const seenCounts = new Map<string, number>();

  for (const cert of certificates) {
    let rawName = cert.filename || `certificate_${String(cert.rowNumber).padStart(3, '0')}.pdf`;
    if (!rawName.toLowerCase().endsWith('.pdf')) {
      rawName += '.pdf';
    }

    const baseName = rawName.slice(0, -4);
    const count = (seenCounts.get(baseName) || 0) + 1;
    seenCounts.set(baseName, count);

    const finalName = count === 1 ? `${baseName}.pdf` : `${baseName}_${count}.pdf`;
    filenameMap.set(cert.id, finalName);
  }

  return filenameMap;
}

/**
 * Generates and downloads a ZIP file containing all successful PDF certificates for a batch.
 */
export async function downloadBatchZip(
  batchOrId: CertificateBatch | string, 
  batchName?: string, 
  certificates?: GeneratedCertificate[]
): Promise<void> {
  let batchId: string;
  let name: string;
  let certList: GeneratedCertificate[];

  if (typeof batchOrId === 'object') {
    batchId = batchOrId.id;
    name = batchOrId.name;
    certList = batchOrId.generatedCertificates || [];
  } else {
    batchId = batchOrId;
    name = batchName || 'Certificate_Batch';
    certList = certificates || [];
  }

  const zip = new JSZip();
  const pdfBlobs = await dbService.getAllPdfBlobsForBatch(batchId);
  const blobMap = new Map<string, Blob>();
  pdfBlobs.forEach(item => blobMap.set(item.generatedId, item.pdfBlob));

  const successfulCerts = certList.filter(c => c.status === 'success');
  if (successfulCerts.length === 0 && pdfBlobs.length === 0) {
    alert('No generated certificates are available in this batch to download.');
    return;
  }

  const filenameMap = deduplicateFilenames(successfulCerts.length > 0 ? successfulCerts : pdfBlobs.map(p => ({
    id: p.generatedId,
    batchId,
    recordId: p.recordId,
    rowNumber: 1,
    primaryName: p.filename,
    certificateId: p.recordId,
    filename: p.filename,
    status: 'success' as const
  })));

  if (successfulCerts.length > 0) {
    for (const cert of successfulCerts) {
      const blob = blobMap.get(cert.id);
      if (blob) {
        const finalFilename = filenameMap.get(cert.id) || cert.filename;
        zip.file(finalFilename, blob);
      }
    }
  } else {
    for (const item of pdfBlobs) {
      zip.file(item.filename, item.pdfBlob);
    }
  }

  const zipContent = await zip.generateAsync({ type: 'blob' });
  const cleanBatchName = sanitizeFilename(name || 'Certificate_Batch');
  saveAs(zipContent, `${cleanBatchName}.zip`);
}

/**
 * Downloads an individual single PDF certificate blob
 */
export async function downloadSinglePdf(generatedCertId: string, defaultFilename: string): Promise<void> {
  const blob = await dbService.getPdfBlob(generatedCertId);
  if (!blob) {
    alert('PDF binary for this certificate record was not found in storage.');
    return;
  }
  let filename = sanitizeFilename(defaultFilename);
  if (!filename.toLowerCase().endsWith('.pdf')) {
    filename += '.pdf';
  }
  saveAs(blob, filename);
}
