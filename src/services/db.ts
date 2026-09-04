import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { CertificateBatch, CertificateTemplate, SavedAsset, CustomFont } from '../types/certificate';

interface CertificateAppDB extends DBSchema {
  batches: {
    key: string;
    value: CertificateBatch;
    indexes: { 'by-updated': string };
  };
  templates: {
    key: string;
    value: CertificateTemplate;
    indexes: { 'by-updated': string };
  };
  saved_assets: {
    key: string;
    value: SavedAsset;
    indexes: { 'by-category': string };
  };
  custom_fonts: {
    key: string;
    value: CustomFont;
    indexes: { 'by-family': string };
  };
  template_blobs: {
    key: string;
    value: { batchId: string; blob: Blob; dataUrl?: string };
  };
  pdf_blobs: {
    key: string; // generatedCertificateId
    value: { id: string; batchId: string; recordId: string; pdfBlob: Blob; filename: string };
    indexes: { 'by-batch': string };
  };
}

const DB_NAME = 'certificate_studio_db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<CertificateAppDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CertificateAppDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('batches')) {
            const batchStore = db.createObjectStore('batches', { keyPath: 'id' });
            batchStore.createIndex('by-updated', 'updatedAt');
          }
          if (!db.objectStoreNames.contains('template_blobs')) {
            db.createObjectStore('template_blobs', { keyPath: 'batchId' });
          }
          if (!db.objectStoreNames.contains('pdf_blobs')) {
            const pdfStore = db.createObjectStore('pdf_blobs', { keyPath: 'id' });
            pdfStore.createIndex('by-batch', 'batchId');
          }
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('templates')) {
            const tmplStore = db.createObjectStore('templates', { keyPath: 'id' });
            tmplStore.createIndex('by-updated', 'updatedAt');
          }
          if (!db.objectStoreNames.contains('saved_assets')) {
            const assetStore = db.createObjectStore('saved_assets', { keyPath: 'id' });
            assetStore.createIndex('by-category', 'category');
          }
          if (!db.objectStoreNames.contains('custom_fonts')) {
            const fontStore = db.createObjectStore('custom_fonts', { keyPath: 'id' });
            fontStore.createIndex('by-family', 'familyName');
          }
        }
      },
    });
  }
  return dbPromise;
}

export const dbService = {
  // --- BATCHES ---
  async getAllBatches(): Promise<CertificateBatch[]> {
    const db = await getDB();
    const batches = await db.getAllFromIndex('batches', 'by-updated');
    return batches.reverse();
  },

  async getBatch(id: string): Promise<CertificateBatch | undefined> {
    const db = await getDB();
    return db.get('batches', id);
  },

  async saveBatch(batch: CertificateBatch): Promise<void> {
    const db = await getDB();
    batch.updatedAt = new Date().toISOString();
    await db.put('batches', batch);
  },

  async deleteBatch(id: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['batches', 'template_blobs', 'pdf_blobs'], 'readwrite');
    await tx.objectStore('batches').delete(id);
    await tx.objectStore('template_blobs').delete(id);
    
    const pdfIndex = tx.objectStore('pdf_blobs').index('by-batch');
    let cursor = await pdfIndex.openCursor(IDBKeyRange.only(id));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  },

  // --- TEMPLATES ---
  async getAllTemplates(): Promise<CertificateTemplate[]> {
    const db = await getDB();
    const templates = await db.getAllFromIndex('templates', 'by-updated');
    return templates.reverse();
  },

  async getTemplate(id: string): Promise<CertificateTemplate | undefined> {
    const db = await getDB();
    return db.get('templates', id);
  },

  async saveTemplate(template: CertificateTemplate): Promise<void> {
    const db = await getDB();
    template.updatedAt = new Date().toISOString();
    await db.put('templates', template);
  },

  async deleteTemplate(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('templates', id);
  },

  // --- SAVED ASSETS ---
  async getAllAssets(): Promise<SavedAsset[]> {
    const db = await getDB();
    return db.getAll('saved_assets');
  },

  async saveAsset(asset: SavedAsset): Promise<void> {
    const db = await getDB();
    await db.put('saved_assets', asset);
  },

  async deleteAsset(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('saved_assets', id);
  },

  // --- CUSTOM FONTS ---
  async getAllFonts(): Promise<CustomFont[]> {
    const db = await getDB();
    return db.getAll('custom_fonts');
  },

  async saveFont(font: CustomFont): Promise<void> {
    const db = await getDB();
    await db.put('custom_fonts', font);
  },

  async deleteFont(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('custom_fonts', id);
  },

  // --- BLOBS ---
  async saveTemplateBlob(batchId: string, blob: Blob, dataUrl?: string): Promise<void> {
    const db = await getDB();
    await db.put('template_blobs', { batchId, blob, dataUrl });
  },

  async getTemplateBlob(batchId: string): Promise<{ blob: Blob; dataUrl?: string } | undefined> {
    const db = await getDB();
    return db.get('template_blobs', batchId);
  },

  async savePdfBlob(batchId: string, generatedId: string, recordId: string, pdfBlob: Blob, filename: string): Promise<void> {
    const db = await getDB();
    await db.put('pdf_blobs', {
      id: generatedId,
      batchId,
      recordId,
      pdfBlob,
      filename
    });
  },

  async getPdfBlob(generatedId: string): Promise<Blob | undefined> {
    const db = await getDB();
    const item = await db.get('pdf_blobs', generatedId);
    return item?.pdfBlob;
  },

  async getAllPdfBlobsForBatch(batchId: string): Promise<Array<{ generatedId: string; recordId: string; pdfBlob: Blob; filename: string }>> {
    const db = await getDB();
    const items = await db.getAllFromIndex('pdf_blobs', 'by-batch', batchId);
    return items.map(i => ({
      generatedId: i.id,
      recordId: i.recordId,
      pdfBlob: i.pdfBlob,
      filename: i.filename,
    }));
  }
};
