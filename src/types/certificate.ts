export type BatchStatus = 
  | 'draft' 
  | 'template_added' 
  | 'data_added' 
  | 'ready' 
  | 'generating' 
  | 'completed' 
  | 'completed_with_errors' 
  | 'failed';

export type FileType = 'png' | 'jpg' | 'jpeg' | 'pdf' | 'svg' | 'webp';

export type PagePreset = 
  | 'A4 Landscape' 
  | 'A4 Portrait' 
  | 'Letter Landscape' 
  | 'Letter Portrait' 
  | 'Custom';

export type LengthUnit = 'mm' | 'in' | 'px';

export type ElementType = 'text' | 'image' | 'shape' | 'line' | 'dynamic';

export type AssetCategory = 
  | 'logo' 
  | 'signature' 
  | 'stamp' 
  | 'seal' 
  | 'badge' 
  | 'decoration' 
  | 'background' 
  | 'other';

export type ShapeType = 
  | 'rectangle' 
  | 'rounded-rectangle' 
  | 'circle' 
  | 'ellipse' 
  | 'line-horizontal' 
  | 'line-vertical';

export type LineStyle = 'solid' | 'dashed' | 'dotted';

export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type FontStyle = 'normal' | 'italic';
export type TextAlignment = 'left' | 'center' | 'right';
export type TextTransform = 'none' | 'uppercase' | 'lowercase';

export interface CertificateElement {
  id: string;
  type: ElementType;
  
  // Position & Dimensions in normalized ratios (0.0 - 1.0)
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  rotation?: number; // In degrees
  zIndex: number;
  locked?: boolean;
  visible?: boolean;

  // --- TEXT ELEMENT PROPERTIES ---
  textType?: 'static' | 'dynamic' | 'sentence';
  content?: string;         // Static string or sentence with tokens e.g. "Issued to {{Name}}"
  textTemplate?: string;    // Sentence builder template
  staticValue?: string;     // Fixed static text
  sourceColumn?: string;    // Mapped spreadsheet header for simple dynamic field
  prefix?: string;          // e.g. "ID - "
  suffix?: string;
  
  fontFamily?: string;      // Built-in font or custom font family name
  fontSizeRatio?: number;   // fontSize / pageHeight
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  textColor?: string;
  alignment?: TextAlignment;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: TextTransform;
  
  autoFit?: boolean;
  minFontSizeRatio?: number;
  wrap?: boolean;
  maxLines?: number;
  preserveLineBreaks?: boolean;

  clearPatch?: boolean;     // Cover existing text in imported templates
  patchColor?: string;

  // --- IMAGE ELEMENT PROPERTIES ---
  assetId?: string;
  src?: string;             // Data URL or object URL
  assetCategory?: AssetCategory;
  maintainAspectRatio?: boolean;
  opacity?: number;

  // --- SHAPE & LINE PROPERTIES ---
  shapeType?: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;     // Ratio or absolute px
  lineStyle?: LineStyle;
  borderRadius?: number;    // In px or ratio
}

// Backwards compatibility alias
export type CertificateField = CertificateElement;

export interface CertificateTemplate {
  id: string;
  name: string;
  filename?: string;
  preset: PagePreset;
  widthMm: number;
  heightMm: number;
  unit: LengthUnit;
  orientation: 'landscape' | 'portrait';
  backgroundColor: string;
  backgroundImage?: string; // Data URL or background image
  elements: CertificateElement[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedAsset {
  id: string;
  name: string;
  category: AssetCategory;
  dataUrl: string;
  width: number;
  height: number;
  mimeType: string;
  createdAt: string;
}

export interface CustomFont {
  id: string;
  name: string;
  familyName: string;
  style: FontStyle;
  weight: FontWeight;
  dataUrl: string; // Base64 Data URL or Blob URL
  fileType: 'ttf' | 'otf';
  createdAt: string;
}

export interface TemplateInfo {
  id: string;
  name?: string;
  filename: string;
  type: FileType;
  width: number;
  height: number;
  dataUrl: string;
  originalBlob?: Blob;
  originalPdfBytes?: Uint8Array;
  pageCount?: number;
}

export interface SpreadsheetData {
  filename: string;
  sheetNames: string[];
  selectedSheet: string;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  renamedHeaders?: Record<string, string>;
  warnings?: string[];
}

export interface FieldMapping {
  templateToken: string;   // Token name inside {{TokenName}}
  spreadsheetColumn: string; // Mapped spreadsheet header
  isRequired: boolean;
}

export interface GeneratedCertificate {
  id: string;
  batchId: string;
  recordId: string;
  rowNumber: number;
  primaryName: string;
  certificateId: string;
  filename: string;
  pdfBlob?: Blob;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export interface CertificateBatch {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: BatchStatus;
  templateId?: string;
  template?: TemplateInfo | CertificateTemplate;
  spreadsheet?: SpreadsheetData;
  fields: CertificateField[];
  fieldMappings?: FieldMapping[];
  filenamePattern: string;
  displayColumn?: string;
  generatedCertificates?: GeneratedCertificate[];
}

export interface BatchValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
