import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

export interface PdfTemplateResult {
  dataUrl: string;
  width: number;
  height: number;
  pageCount: number;
}

export async function renderPdfFirstPageToImage(file: File): Promise<PdfTemplateResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const pageCount = pdfDoc.numPages;
  const page = await pdfDoc.getPage(1);

  // Render at 2x scale for ultra crisp quality
  const viewport = page.getViewport({ scale: 2.0 });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas for PDF rendering.');
  }

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext as any).promise;

  const dataUrl = canvas.toDataURL('image/png', 1.0);

  // Natural scale (1x) dimensions
  const originalViewport = page.getViewport({ scale: 1.0 });

  return {
    dataUrl,
    width: Math.round(originalViewport.width),
    height: Math.round(originalViewport.height),
    pageCount,
  };
}
