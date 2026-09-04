import JSZip from 'jszip';
import type { CertificateBatch, GeneratedCertificate } from '../types/certificate';

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
    let rawName = cert.filename || `certificate_${String(cert.rowNumber || 1).padStart(3, '0')}.pdf`;
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
 * Immediately triggers browser download of an individual PDF certificate from memory.
 */
export function downloadCertificate(certificate: GeneratedCertificate): void {
  if (certificate.status !== 'generated' && certificate.status !== 'success') {
    return;
  }

  const blob = certificate.blob || certificate.pdfBlob;
  if (!blob || blob.size === 0) {
    console.warn('PDF Blob is missing or empty for certificate:', certificate.filename);
    return;
  }

  let filename = sanitizeFilename(certificate.filename || 'certificate.pdf');
  if (!filename.toLowerCase().endsWith('.pdf')) {
    filename += '.pdf';
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Backwards compatibility helper for downloading a single PDF
 */
export function downloadSinglePdf(certOrBlob: GeneratedCertificate | Blob | string, defaultFilename?: string): void {
  if (certOrBlob instanceof Blob) {
    const url = URL.createObjectURL(certOrBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    let filename = sanitizeFilename(defaultFilename || 'certificate.pdf');
    if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else if (typeof certOrBlob === 'object' && certOrBlob !== null) {
    downloadCertificate(certOrBlob);
  }
}

/**
 * Downloads all successful generated certificates in memory as a ZIP package.
 */
export async function downloadAllAsZip(
  certificates: GeneratedCertificate[], 
  batchName: string = 'Certificates'
): Promise<void> {
  const successful = certificates.filter(
    item => (item.status === 'generated' || item.status === 'success') && (item.blob || item.pdfBlob)
  );

  if (successful.length === 0) {
    return;
  }

  const zip = new JSZip();
  const filenameMap = deduplicateFilenames(successful);

  for (const cert of successful) {
    const blob = cert.blob || cert.pdfBlob;
    if (blob && blob.size > 0) {
      const finalFilename = filenameMap.get(cert.id) || cert.filename;
      zip.file(finalFilename, blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const anchor = document.createElement('a');
  anchor.href = url;
  let cleanName = sanitizeFilename(batchName || 'Certificates');
  anchor.download = `${cleanName}.zip`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Backwards compatibility helper for ZIP package downloads
 */
export async function downloadBatchZip(
  batchOrCerts: CertificateBatch | GeneratedCertificate[] | string,
  batchName?: string,
  certificates?: GeneratedCertificate[]
): Promise<void> {
  if (Array.isArray(batchOrCerts)) {
    return downloadAllAsZip(batchOrCerts, batchName || 'Certificates');
  } else if (typeof batchOrCerts === 'object' && batchOrCerts !== null) {
    const certs = batchOrCerts.generatedCertificates || [];
    return downloadAllAsZip(certs, batchOrCerts.name || 'Certificates');
  } else if (typeof batchOrCerts === 'string') {
    return downloadAllAsZip(certificates || [], batchName || 'Certificates');
  }
}

