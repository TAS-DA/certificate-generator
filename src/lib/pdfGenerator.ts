import { PDFDocument, rgb, degrees } from 'pdf-lib';
import type { 
  CertificateElement, 
  CertificateTemplate, 
  TemplateInfo 
} from '../types/certificate';
import { replaceTokens } from './tokenParser';
import { getOrEmbedPdfFont } from './fontManager';
import { calculateFittedFontSize, wrapTextByFontWidth } from './textFit';

/**
 * Preloads image element if rendering from canvas image fallback
 */
export async function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
    img.src = dataUrl;
  });
}

/**
 * Calculates page width and height in PDF points (72 points = 1 inch, 1 mm = 2.83465 pt)
 */
export function getPdfDimensionsInPoints(template: CertificateTemplate | TemplateInfo): { width: number; height: number } {
  if ('preset' in template) {
    const mmToPt = 2.834645669;
    const inToPt = 72;

    if (template.preset === 'A4 Landscape') return { width: 297 * mmToPt, height: 210 * mmToPt };
    if (template.preset === 'A4 Portrait') return { width: 210 * mmToPt, height: 297 * mmToPt };
    if (template.preset === 'Letter Landscape') return { width: 11 * inToPt, height: 8.5 * inToPt };
    if (template.preset === 'Letter Portrait') return { width: 8.5 * inToPt, height: 11 * inToPt };

    // Custom preset
    let wPt = template.widthMm * mmToPt;
    let hPt = template.heightMm * mmToPt;
    if (template.unit === 'in') {
      wPt = template.widthMm * inToPt;
      hPt = template.heightMm * inToPt;
    } else if (template.unit === 'px') {
      wPt = template.widthMm * (72 / 96);
      hPt = template.heightMm * (72 / 96);
    }
    return { width: wPt, height: hPt };
  }

  // Legacy TemplateInfo
  return {
    width: template.width || 841.89,
    height: template.height || 595.28,
  };
}

/**
 * Renders a single certificate PDF using structured template elements (Text, Image, Shapes, Lines)
 */
export async function generateSingleCertificatePdf(
  template: CertificateTemplate | TemplateInfo,
  fields: CertificateElement[],
  rowRecord: Record<string, string>,
  _cachedImage?: HTMLImageElement
): Promise<Blob> {
  const { width: pdfWidth, height: pdfHeight } = getPdfDimensionsInPoints(template);

  let outputDoc: PDFDocument;
  let page: any;

  // Master PDF template background mode
  if ('originalPdfBytes' in template && template.originalPdfBytes && template.originalPdfBytes.length > 0) {
    const templateDoc = await PDFDocument.load(template.originalPdfBytes);
    outputDoc = await PDFDocument.create();
    const [copiedPage] = await outputDoc.copyPages(templateDoc, [0]);
    outputDoc.addPage(copiedPage);
    page = outputDoc.getPage(0);
  } else {
    // Canvas designer mode
    outputDoc = await PDFDocument.create();
    page = outputDoc.addPage([pdfWidth, pdfHeight]);

    // Draw background color if present
    const bgColor = ('backgroundColor' in template && template.backgroundColor) ? template.backgroundColor : '#ffffff';
    if (bgColor && bgColor !== 'transparent') {
      const bgRgb = parseHexToRgb(bgColor);
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pdfWidth,
        height: pdfHeight,
        color: bgRgb,
      });
    }

    // Draw background image if present
    const bgImageSrc = 'backgroundImage' in template ? template.backgroundImage : ('dataUrl' in template ? template.dataUrl : undefined);
    if (bgImageSrc) {
      try {
        if (bgImageSrc.startsWith('data:image/png')) {
          const pngImg = await outputDoc.embedPng(bgImageSrc);
          page.drawImage(pngImg, { x: 0, y: 0, width: pdfWidth, height: pdfHeight });
        } else if (bgImageSrc.startsWith('data:image/jpeg') || bgImageSrc.startsWith('data:image/jpg')) {
          const jpgImg = await outputDoc.embedJpg(bgImageSrc);
          page.drawImage(jpgImg, { x: 0, y: 0, width: pdfWidth, height: pdfHeight });
        }
      } catch (err) {
        console.warn('Failed to embed background image:', err);
      }
    }
  }

  // Sort elements by zIndex
  const sortedElements = [...fields]
    .filter(el => el.visible !== false)
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // Step 1: Draw patch masks if any field has clearPatch enabled
  for (const el of sortedElements) {
    if (el.clearPatch) {
      const patchX = el.xRatio * pdfWidth;
      const patchYTop = el.yRatio * pdfHeight;
      const patchW = el.widthRatio * pdfWidth;
      const patchH = el.heightRatio * pdfHeight;
      const patchYBottom = pdfHeight - patchYTop - patchH;

      const patchRgb = parseHexToRgb(el.patchColor || '#ffffff');
      page.drawRectangle({
        x: patchX,
        y: patchYBottom,
        width: patchW,
        height: patchH,
        color: patchRgb,
      });
    }
  }

  // Step 2: Render each element based on type (text, image, shape, line)
  for (const el of sortedElements) {
    const elX = el.xRatio * pdfWidth;
    const elYTop = el.yRatio * pdfHeight;
    const elW = el.widthRatio * pdfWidth;
    const elH = el.heightRatio * pdfHeight;
    const elYBottom = pdfHeight - elYTop - elH;

    if (el.type === 'shape' || el.shapeType) {
      // Shape / Line rendering
      const fillColor = el.fillColor ? parseHexToRgb(el.fillColor) : undefined;
      const strokeColor = el.strokeColor ? parseHexToRgb(el.strokeColor) : undefined;
      const borderWidth = el.strokeWidth || 1;

      if (el.shapeType === 'circle' || el.shapeType === 'ellipse') {
        const xCenter = elX + elW / 2;
        const yCenter = elYBottom + elH / 2;
        page.drawEllipse({
          x: xCenter,
          y: yCenter,
          xScale: elW / 2,
          yScale: elH / 2,
          color: fillColor,
          borderColor: strokeColor,
          borderWidth: strokeColor ? borderWidth : 0,
        });
      } else if (el.shapeType === 'line-horizontal' || el.type === 'line') {
        const yCenter = elYBottom + elH / 2;
        page.drawLine({
          start: { x: elX, y: yCenter },
          end: { x: elX + elW, y: yCenter },
          color: strokeColor || fillColor || rgb(0, 0, 0),
          thickness: borderWidth,
        });
      } else if (el.shapeType === 'line-vertical') {
        const xCenter = elX + elW / 2;
        page.drawLine({
          start: { x: xCenter, y: elYBottom },
          end: { x: xCenter, y: elYBottom + elH },
          color: strokeColor || fillColor || rgb(0, 0, 0),
          thickness: borderWidth,
        });
      } else {
        // Rectangle / Rounded Rectangle
        page.drawRectangle({
          x: elX,
          y: elYBottom,
          width: elW,
          height: elH,
          color: fillColor,
          borderColor: strokeColor,
          borderWidth: strokeColor ? borderWidth : 0,
        });
      }
    } else if (el.type === 'image' && el.src) {
      // Image element rendering (Logos, Signatures, Stamps, Seals, Badges)
      try {
        let embeddedImg: any = null;
        if (el.src.startsWith('data:image/png')) {
          embeddedImg = await outputDoc.embedPng(el.src);
        } else if (el.src.startsWith('data:image/jpeg') || el.src.startsWith('data:image/jpg')) {
          embeddedImg = await outputDoc.embedJpg(el.src);
        }

        if (embeddedImg) {
          page.drawImage(embeddedImg, {
            x: elX,
            y: elYBottom,
            width: elW,
            height: elH,
            opacity: el.opacity !== undefined ? el.opacity : 1,
            rotate: el.rotation ? degrees(el.rotation) : undefined,
          });
        }
      } catch (err) {
        console.warn(`Failed to embed image element ${el.id}:`, err);
      }
    } else {
      // Text element rendering (Static text, Dynamic field, Dynamic Sentence)
      let rawText = '';
      if (el.textType === 'sentence' || el.textTemplate) {
        rawText = replaceTokens(el.textTemplate || el.content || '', rowRecord);
      } else if (el.type === 'dynamic' || el.textType === 'dynamic') {
        const val = rowRecord[el.sourceColumn || ''] ?? '';
        rawText = (el.prefix || '') + val + (el.suffix || '');
      } else {
        rawText = (el.prefix || '') + (el.content || el.staticValue || '') + (el.suffix || '');
      }

      const text = applyTextTransform(rawText, el.textTransform);
      if (!text && text !== '0') continue; // Skip empty string

      const preferredFontSize = Math.max(6, (el.fontSizeRatio || 0.035) * pdfHeight);
      const minFontSize = Math.max(6, ((el.minFontSizeRatio || (el.fontSizeRatio || 0.035) * 0.5)) * pdfHeight);

      const font = await getOrEmbedPdfFont(
        outputDoc,
        el.fontFamily || 'Georgia',
        el.fontWeight || 'regular',
        el.fontStyle || 'normal'
      );

      const textRgb = parseHexToRgb(el.textColor || '#000000');

      let fontSize = preferredFontSize;
      if (el.autoFit && elW > 10) {
        fontSize = calculateFittedFontSize({
          text,
          font,
          maxWidth: elW,
          preferredSize: preferredFontSize,
          minimumSize: minFontSize,
        });
      }

      const lineHeight = (el.lineHeight || 1.25) * fontSize;

      if (el.wrap && elW > 10) {
        // Multiline wrapping
        const lines = wrapTextByFontWidth(
          text,
          font,
          fontSize,
          elW,
          el.maxLines || 4,
          el.preserveLineBreaks ?? true
        );

        lines.forEach((line, lineIdx) => {
          let measuredWidth = 0;
          try {
            measuredWidth = font.widthOfTextAtSize(line, fontSize);
          } catch {
            measuredWidth = line.length * (fontSize * 0.55);
          }

          let drawX = elX;
          if (el.alignment === 'center') {
            drawX = elX + (elW / 2) - (measuredWidth / 2);
          } else if (el.alignment === 'right') {
            drawX = elX + elW - measuredWidth;
          }

          const currentLineTopY = elYTop + (lineIdx * lineHeight);
          const pdfY = pdfHeight - currentLineTopY - fontSize;

          page.drawText(line, {
            x: drawX,
            y: pdfY,
            size: fontSize,
            font: font,
            color: textRgb,
          });
        });
      } else {
        // Single line text
        let measuredWidth = 0;
        try {
          measuredWidth = font.widthOfTextAtSize(text, fontSize);
        } catch {
          measuredWidth = text.length * (fontSize * 0.55);
        }

        let drawX = elX;
        if (el.alignment === 'center') {
          drawX = elX + (elW / 2) - (measuredWidth / 2);
        } else if (el.alignment === 'right') {
          drawX = elX + elW - measuredWidth;
        }

        const pdfY = pdfHeight - elYTop - (elH / 2) - (fontSize / 3);

        page.drawText(text, {
          x: drawX,
          y: pdfY,
          size: fontSize,
          font: font,
          color: textRgb,
        });
      }
    }
  }

  const pdfBytes = await outputDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

function parseHexToRgb(hexStr: string) {
  let hex = hexStr.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) {
    return rgb(0, 0, 0);
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

function applyTextTransform(str: string, transform?: string): string {
  if (!str) return '';
  if (transform === 'uppercase') return str.toUpperCase();
  if (transform === 'lowercase') return str.toLowerCase();
  return str;
}
