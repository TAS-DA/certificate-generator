import React, { useState, useRef, useEffect } from 'react';
import type { 
  CertificateElement, 
  CertificateTemplate, 
  TemplateInfo, 
  SpreadsheetData 
} from '../../types/certificate';
import { replaceTokens } from '../../lib/tokenParser';

interface TemplateCanvasProps {
  template: CertificateTemplate | TemplateInfo;
  fields: CertificateElement[];
  selectedFieldId: string | null;
  spreadsheet?: SpreadsheetData;
  previewRecord?: Record<string, string> | null;
  zoomLevel: number;
  isPreviewMode?: boolean;
  onSelectField: (fieldId: string | null) => void;
  onUpdateField: (field: CertificateElement) => void;
  onDeleteField: (fieldId: string) => void;
}

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({
  template,
  fields,
  selectedFieldId,
  previewRecord,
  zoomLevel,
  isPreviewMode = false,
  onSelectField,
  onUpdateField,
  onDeleteField,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [resizingFieldId, setResizingFieldId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [initialFieldState, setInitialFieldState] = useState<CertificateElement | null>(null);

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [showGuideH, setShowGuideH] = useState(false);
  const [showGuideV, setShowGuideV] = useState(false);

  // Aspect ratio calculation
  const widthMm = ('widthMm' in template) ? template.widthMm : (template.width || 297);
  const heightMm = ('heightMm' in template) ? template.heightMm : (template.height || 210);
  const aspectRatio = widthMm / heightMm;

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedFieldId || editingFieldId) return;

      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      const field = fields.find(f => f.id === selectedFieldId);
      if (!field || field.locked) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteField(selectedFieldId);
        return;
      }

      const step = e.shiftKey ? 0.01 : 0.002;
      let updatedX = field.xRatio;
      let updatedY = field.yRatio;

      if (e.key === 'ArrowLeft') {
        updatedX = Math.max(0, field.xRatio - step);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        updatedX = Math.min(1 - field.widthRatio, field.xRatio + step);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        updatedY = Math.max(0, field.yRatio - step);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        updatedY = Math.min(1 - field.heightRatio, field.yRatio + step);
        e.preventDefault();
      }

      if (updatedX !== field.xRatio || updatedY !== field.yRatio) {
        onUpdateField({ ...field, xRatio: updatedX, yRatio: updatedY });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId, editingFieldId, fields, onUpdateField, onDeleteField]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current || !dragStartPos || (!draggingFieldId && !resizingFieldId)) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) return;

    const deltaX = (e.clientX - dragStartPos.x) / canvasRect.width;
    const deltaY = (e.clientY - dragStartPos.y) / canvasRect.height;

    if (draggingFieldId && initialFieldState) {
      let newX = initialFieldState.xRatio + deltaX;
      let newY = initialFieldState.yRatio + deltaY;

      newX = Math.max(0, Math.min(1 - initialFieldState.widthRatio, newX));
      newY = Math.max(0, Math.min(1 - initialFieldState.heightRatio, newY));

      const centerX = newX + initialFieldState.widthRatio / 2;
      const centerY = newY + initialFieldState.heightRatio / 2;

      let isSnapH = false;
      let isSnapV = false;

      if (Math.abs(centerX - 0.5) < 0.015) {
        newX = 0.5 - initialFieldState.widthRatio / 2;
        isSnapV = true;
      }
      if (Math.abs(centerY - 0.5) < 0.015) {
        newY = 0.5 - initialFieldState.heightRatio / 2;
        isSnapH = true;
      }

      setShowGuideV(isSnapV);
      setShowGuideH(isSnapH);

      onUpdateField({
        ...initialFieldState,
        xRatio: newX,
        yRatio: newY,
      });
    } else if (resizingFieldId && initialFieldState) {
      let newW = Math.max(0.03, initialFieldState.widthRatio + deltaX);
      let newH = Math.max(0.015, initialFieldState.heightRatio + deltaY);

      onUpdateField({
        ...initialFieldState,
        widthRatio: newW,
        heightRatio: newH,
      });
    }
  };

  const handlePointerUp = () => {
    setDraggingFieldId(null);
    setResizingFieldId(null);
    setDragStartPos(null);
    setInitialFieldState(null);
    setShowGuideH(false);
    setShowGuideV(false);
  };

  const sortedFields = [...fields].filter(f => f.visible !== false).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  const bgColor = ('backgroundColor' in template) ? template.backgroundColor : '#ffffff';
  const bgImg = ('backgroundImage' in template) ? template.backgroundImage : ('dataUrl' in template ? template.dataUrl : undefined);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => {
        onSelectField(null);
        setEditingFieldId(null);
      }}
      className="flex-1 overflow-auto bg-slate-100 p-8 flex items-center justify-center relative certificate-canvas-container min-h-[550px] select-none"
    >
      <div
        ref={canvasRef}
        className="relative shadow-2xl rounded-sm transition-transform duration-100 bg-white select-none overflow-hidden"
        style={{
          width: '900px',
          height: `${900 / aspectRatio}px`,
          backgroundColor: bgColor || '#ffffff',
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Background Image Layer */}
        {bgImg && (
          <img
            src={bgImg}
            alt="Certificate Background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          />
        )}

        {/* Alignment Center Guides */}
        {showGuideH && <div className="absolute left-0 right-0 top-1/2 border-b border-indigo-500 border-dashed z-50 pointer-events-none" />}
        {showGuideV && <div className="absolute top-0 bottom-0 left-1/2 border-r border-indigo-500 border-dashed z-50 pointer-events-none" />}

        {/* Canvas Elements */}
        {sortedFields.map((field) => {
          const isSelected = field.id === selectedFieldId;
          const isEditing = field.id === editingFieldId;

          const isText = field.type === 'text' || !field.type || (field.type as any) === 'dynamic';
          const isImage = field.type === 'image';
          const isShape = field.type === 'shape' || field.type === 'line' || Boolean(field.shapeType);

          let textValue = '';
          if (isPreviewMode && previewRecord) {
            if (field.textTemplate) {
              textValue = replaceTokens(field.textTemplate, previewRecord);
            } else if (field.type === 'dynamic' || field.sourceColumn) {
              textValue = (field.prefix || '') + (previewRecord[field.sourceColumn || ''] ?? '') + (field.suffix || '');
            } else {
              textValue = (field.prefix || '') + (field.content || field.staticValue || '') + (field.suffix || '');
            }
          } else {
            if (field.textTemplate) {
              textValue = field.textTemplate;
            } else if (field.sourceColumn) {
              textValue = `${field.prefix || ''}{{${field.sourceColumn}}}${field.suffix || ''}`;
            } else {
              textValue = (field.prefix || '') + (field.content || field.staticValue || '') + (field.suffix || '');
            }
          }

          return (
            <div
              key={field.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectField(field.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (isText && !field.locked) setEditingFieldId(field.id);
              }}
              onPointerDown={(e) => {
                if (field.locked || isEditing) return;
                e.stopPropagation();
                onSelectField(field.id);
                setDraggingFieldId(field.id);
                setDragStartPos({ x: e.clientX, y: e.clientY });
                setInitialFieldState(field);
              }}
              className={`absolute flex items-center transition-shadow ${
                field.locked ? 'cursor-not-allowed' : 'cursor-move'
              } ${
                isSelected 
                  ? 'ring-2 ring-indigo-600 bg-indigo-50/20 z-40' 
                  : 'hover:ring-1 hover:ring-indigo-300'
              }`}
              style={{
                left: `${field.xRatio * 100}%`,
                top: `${field.yRatio * 100}%`,
                width: `${field.widthRatio * 100}%`,
                height: `${field.heightRatio * 100}%`,
                justifyContent: field.alignment === 'center' ? 'center' : field.alignment === 'right' ? 'flex-end' : 'flex-start',
                backgroundColor: field.clearPatch ? (field.patchColor || '#ffffff') : 'transparent',
                transform: field.rotation ? `rotate(${field.rotation}deg)` : undefined,
                opacity: field.opacity !== undefined ? field.opacity : 1,
              }}
            >
              {/* IMAGE ELEMENT */}
              {isImage && field.src && (
                <img
                  src={field.src}
                  alt={field.assetCategory || 'Element'}
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              )}

              {/* SHAPE / LINE ELEMENT */}
              {isShape && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: field.fillColor || 'transparent',
                    borderWidth: field.strokeWidth ? `${field.strokeWidth}px` : field.shapeType === 'line-horizontal' ? '2px 0 0 0' : '1px',
                    borderColor: field.strokeColor || '#000000',
                    borderStyle: field.lineStyle || 'solid',
                    borderRadius: field.shapeType === 'circle' ? '9999px' : field.shapeType === 'rounded-rectangle' ? '12px' : '0px',
                  }}
                />
              )}

              {/* TEXT ELEMENT */}
              {isText && (
                isEditing ? (
                  <textarea
                    autoFocus
                    value={field.textTemplate || field.content || ''}
                    onChange={(e) => onUpdateField({ ...field, textTemplate: e.target.value, content: e.target.value })}
                    onBlur={() => setEditingFieldId(null)}
                    className="w-full h-full bg-white p-1 text-xs outline-none border border-indigo-500 rounded resize-none"
                  />
                ) : (
                  <span
                    className={`w-full pointer-events-none whitespace-pre-wrap leading-tight ${field.wrap ? '' : 'truncate'}`}
                    style={{
                      fontFamily: `'${field.fontFamily || 'Georgia'}', Georgia, serif`,
                      fontWeight: field.fontWeight === 'bold' ? 700 : field.fontWeight === 'semibold' ? 600 : field.fontWeight === 'medium' ? 500 : 400,
                      fontStyle: field.fontStyle === 'italic' ? 'italic' : 'normal',
                      color: field.textColor || '#000000',
                      textAlign: field.alignment || 'left',
                      fontSize: `${(field.fontSizeRatio || 0.035) * (900 / aspectRatio)}px`,
                      lineHeight: field.lineHeight || 1.2,
                    }}
                  >
                    {textValue || <span className="opacity-40 italic">&lt;empty text&gt;</span>}
                  </span>
                )
              )}

              {/* Selection Resize Handle */}
              {isSelected && !field.locked && (
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setResizingFieldId(field.id);
                    setDragStartPos({ x: e.clientX, y: e.clientY });
                    setInitialFieldState(field);
                  }}
                  className="absolute bottom-0 right-0 w-3 h-3 bg-indigo-600 border border-white cursor-nwse-resize z-50 rounded-xs shadow-xs"
                />
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
};
