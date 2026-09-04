import { PDFDocument, PDFFont, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { CustomFont } from '../types/certificate';

export const BUILT_IN_FONTS = [
  { name: 'Georgia', family: 'Georgia', category: 'Serif' },
  { name: 'Times New Roman', family: 'Times New Roman', category: 'Serif' },
  { name: 'Merriweather', family: 'Merriweather', category: 'Serif' },
  { name: 'Playfair Display', family: 'Playfair Display', category: 'Serif' },
  { name: 'Cinzel', family: 'Cinzel', category: 'Serif' },
  { name: 'Libre Baskerville', family: 'Libre Baskerville', category: 'Serif' },
  { name: 'Cormorant Garamond', family: 'Cormorant Garamond', category: 'Serif' },
  { name: 'Arial', family: 'Arial', category: 'Sans-Serif' },
  { name: 'Helvetica', family: 'Helvetica', category: 'Sans-Serif' },
  { name: 'Verdana', family: 'Verdana', category: 'Sans-Serif' },
  { name: 'Roboto', family: 'Roboto', category: 'Sans-Serif' },
  { name: 'Open Sans', family: 'Open Sans', category: 'Sans-Serif' },
  { name: 'Montserrat', family: 'Montserrat', category: 'Sans-Serif' },
  { name: 'Poppins', family: 'Poppins', category: 'Sans-Serif' },
  { name: 'Lato', family: 'Lato', category: 'Sans-Serif' },
  { name: 'Inter', family: 'Inter', category: 'Sans-Serif' },
];

// Memory cache for custom font ArrayBuffers (key: familyName or fontId)
const customFontBuffers: Map<string, ArrayBuffer> = new Map();
const customFontObjects: Map<string, CustomFont> = new Map();

/**
 * Converts DataURL or base64 to ArrayBuffer
 */
export function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64Str = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const binaryStr = window.atob(base64Str);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Registers custom font in DOM via @font-face style tag & caches buffer
 */
export function registerCustomFontInDOM(font: CustomFont): ArrayBuffer {
  const buffer = dataUrlToArrayBuffer(font.dataUrl);
  customFontBuffers.set(font.familyName, buffer);
  customFontBuffers.set(font.name, buffer);
  customFontBuffers.set(font.id, buffer);
  customFontObjects.set(font.id, font);

  // Check if @font-face style element already exists
  const styleId = `custom-font-style-${font.id}`;
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.innerHTML = `
      @font-face {
        font-family: '${font.familyName}';
        src: url('${font.dataUrl}') format('${font.fileType === 'otf' ? 'opentype' : 'truetype'}');
        font-weight: ${font.weight === 'bold' ? '700' : font.weight === 'semibold' ? '600' : font.weight === 'medium' ? '500' : '400'};
        font-style: ${font.style === 'italic' ? 'italic' : 'normal'};
        font-display: swap;
      }
    `;
    document.head.appendChild(styleEl);
  }

  return buffer;
}

/**
 * Registers multiple custom fonts in memory and DOM
 */
export function registerCustomFonts(fonts: CustomFont[]) {
  fonts.forEach(f => registerCustomFontInDOM(f));
}

/**
 * Embeds a font into a pdf-lib PDFDocument.
 * Uses fontkit for custom registered TTF/OTF fonts, falling back to Standard Fonts.
 */
export async function getOrEmbedPdfFont(
  pdfDoc: PDFDocument,
  fontFamily: string,
  fontWeight: string = 'regular',
  fontStyle: string = 'normal'
): Promise<PDFFont> {
  pdfDoc.registerFontkit(fontkit);

  const isBold = fontWeight === 'bold' || fontWeight === 'semibold';
  const isItalic = fontStyle === 'italic';

  // Check if custom TTF/OTF buffer is registered for this font family
  const cachedBuffer = customFontBuffers.get(fontFamily);
  if (cachedBuffer) {
    try {
      return await pdfDoc.embedFont(cachedBuffer, { subset: true });
    } catch (err) {
      console.warn(`Failed to embed custom font "${fontFamily}" with fontkit, using standard font fallback:`, err);
    }
  }

  // Standard font mapping fallback
  const serifFamilies = [
    'Times New Roman', 'Georgia', 'GeorgiaPro', 'Merriweather', 
    'Playfair Display', 'Cinzel', 'Libre Baskerville', 'Cormorant Garamond'
  ];
  const isSerif = serifFamilies.some(f => fontFamily.toLowerCase().includes(f.toLowerCase()));

  let standardFontName = StandardFonts.Helvetica;
  if (isSerif) {
    if (isBold && isItalic) standardFontName = StandardFonts.TimesRomanBoldItalic;
    else if (isBold) standardFontName = StandardFonts.TimesRomanBold;
    else if (isItalic) standardFontName = StandardFonts.TimesRomanItalic;
    else standardFontName = StandardFonts.TimesRoman;
  } else {
    if (isBold && isItalic) standardFontName = StandardFonts.HelveticaBoldOblique;
    else if (isBold) standardFontName = StandardFonts.HelveticaBold;
    else if (isItalic) standardFontName = StandardFonts.HelveticaOblique;
    else standardFontName = StandardFonts.Helvetica;
  }

  return await pdfDoc.embedFont(standardFontName);
}
