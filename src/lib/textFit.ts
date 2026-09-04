import type { PDFFont } from 'pdf-lib';

export interface FitFontSizeOptions {
  text: string;
  font: PDFFont;
  maxWidth: number;
  preferredSize: number;
  minimumSize: number;
}

/**
 * Calculates font size by shrinking in steps of 0.5pt until text width <= maxWidth.
 */
export function calculateFittedFontSize({
  text,
  font,
  maxWidth,
  preferredSize,
  minimumSize,
}: FitFontSizeOptions): number {
  if (!text || maxWidth <= 0) return preferredSize;

  let size = preferredSize;
  try {
    let measuredWidth = font.widthOfTextAtSize(text, size);
    while (measuredWidth > maxWidth && size > minimumSize) {
      size -= 0.5;
      measuredWidth = font.widthOfTextAtSize(text, size);
    }
  } catch {
    // If font measurement encounters unexpected glyphs, return preferred size
  }

  return Math.max(minimumSize, size);
}

/**
 * Wraps text into lines based on exact font width measurement.
 */
export function wrapTextByFontWidth(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
  maxLines: number = 4,
  preserveManualBreaks: boolean = true
): string[] {
  if (!text) return [];

  const rawParagraphs = preserveManualBreaks ? text.split('\n') : [text.replace(/\n/g, ' ')];
  const finalLines: string[] = [];

  for (const para of rawParagraphs) {
    if (finalLines.length >= maxLines) break;

    const words = para.trim().split(/\s+/);
    if (words.length === 0 || (words.length === 1 && words[0] === '')) {
      finalLines.push('');
      continue;
    }

    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = `${currentLine} ${word}`;
      let testWidth = 0;

      try {
        testWidth = font.widthOfTextAtSize(testLine, fontSize);
      } catch {
        testWidth = testLine.length * (fontSize * 0.6);
      }

      if (testWidth > maxWidth) {
        finalLines.push(currentLine);
        currentLine = word;
        if (finalLines.length >= maxLines - 1) {
          // Put remaining words into last line
          currentLine = words.slice(i).join(' ');
          break;
        }
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine && finalLines.length < maxLines) {
      finalLines.push(currentLine);
    }
  }

  return finalLines.slice(0, maxLines);
}
