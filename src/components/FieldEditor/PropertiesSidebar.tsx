import React from 'react';
import { 
  Trash2, 
  Copy, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  ArrowUp, 
  ArrowDown,
  Sliders,
  Lock,
  Unlock
} from 'lucide-react';
import type { 
  CertificateElement, 
  FontWeight, 
  TextAlignment, 
  SpreadsheetData,
  CustomFont
} from '../../types/certificate';
import { BUILT_IN_FONTS } from '../../lib/fontManager';

interface PropertiesSidebarProps {
  selectedField: CertificateElement | null;
  selectedFieldIds?: string[];
  spreadsheet?: SpreadsheetData;
  customFonts?: CustomFont[];
  naturalHeight: number;
  onUpdateField: (updatedField: CertificateElement) => void;
  onDeleteField: (fieldId: string) => void;
  onDuplicateField: (field: CertificateElement) => void;
  onBringForward: (fieldId: string) => void;
  onSendBackward: (fieldId: string) => void;
  onAlignElements?: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

export const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({
  selectedField,
  selectedFieldIds = [],
  spreadsheet,
  customFonts = [],
  naturalHeight,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onBringForward,
  onSendBackward,
  onAlignElements,
}) => {
  if (selectedFieldIds.length > 1 && onAlignElements) {
    return (
      <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 shrink-0 overflow-y-auto space-y-6 text-xs select-none">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Multi-Selection</span>
          <h3 className="text-sm font-bold text-slate-900">{selectedFieldIds.length} Elements Selected</h3>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-800 block">Alignment Tools</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onAlignElements('left')}
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 text-center cursor-pointer"
            >
              Align Left
            </button>
            <button
              onClick={() => onAlignElements('center')}
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 text-center cursor-pointer"
            >
              Center H
            </button>
            <button
              onClick={() => onAlignElements('right')}
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 text-center cursor-pointer"
            >
              Align Right
            </button>
            <button
              onClick={() => onAlignElements('top')}
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 text-center cursor-pointer"
            >
              Align Top
            </button>
            <button
              onClick={() => onAlignElements('middle')}
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 text-center cursor-pointer"
            >
              Center V
            </button>
            <button
              onClick={() => onAlignElements('bottom')}
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 text-center cursor-pointer"
            >
              Align Bottom
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedField) {
    return (
      <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-6 text-center text-slate-400 flex flex-col items-center justify-center shrink-0 min-h-[220px]">
        <Sliders className="w-8 h-8 text-slate-300 mb-2" />
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          No Element Selected
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
          Click any element on the certificate canvas to customize typography, positioning, layers, or styling.
        </p>
      </div>
    );
  }

  const isText = selectedField.type === 'text' || !selectedField.type || selectedField.type === ('dynamic' as any);
  const isImage = selectedField.type === 'image';
  const isShape = selectedField.type === 'shape' || selectedField.type === 'line' || Boolean(selectedField.shapeType);

  const currentPxFontSize = Math.round(((selectedField.fontSizeRatio || 0.035) * naturalHeight) * 10) / 10;
  const currentPxMinFontSize = Math.round((((selectedField.minFontSizeRatio || (selectedField.fontSizeRatio || 0.035) * 0.5)) * naturalHeight) * 10) / 10;

  const handlePxFontSizeChange = (px: number) => {
    const safePx = Math.max(6, px);
    const newRatio = safePx / naturalHeight;
    onUpdateField({
      ...selectedField,
      fontSizeRatio: newRatio,
      minFontSizeRatio: Math.min(newRatio, selectedField.minFontSizeRatio || newRatio * 0.5),
    });
  };

  const handlePxMinFontSizeChange = (px: number) => {
    const safePx = Math.max(6, Math.min(currentPxFontSize, px));
    onUpdateField({
      ...selectedField,
      minFontSizeRatio: safePx / naturalHeight,
    });
  };

  const insertToken = (token: string) => {
    const current = selectedField.textTemplate || selectedField.content || '';
    onUpdateField({
      ...selectedField,
      textTemplate: current + ` {{${token}}}`,
      textType: 'sentence',
    });
  };

  return (
    <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 flex flex-col shrink-0 overflow-y-auto max-h-[calc(100vh-120px)] space-y-4 text-xs select-none">
      
      {/* Property Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
            {isText ? 'Text Properties' : isImage ? 'Image Properties' : 'Shape Properties'}
          </span>
          <h3 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
            {selectedField.textTemplate || selectedField.content || selectedField.sourceColumn || selectedField.assetCategory || 'Element'}
          </h3>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onUpdateField({ ...selectedField, locked: !selectedField.locked })}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              selectedField.locked ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={selectedField.locked ? 'Unlock Element' : 'Lock Element'}
          >
            {selectedField.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDuplicateField(selectedField)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Duplicate Element"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteField(selectedField.id)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            title="Delete Element"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TEXT PROPERTIES */}
      {isText && (
        <div className="space-y-4">
          
          {/* Content / Sentence Template Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Text Content / Template
            </label>
            <textarea
              rows={2}
              value={selectedField.textTemplate || selectedField.content || ''}
              onChange={(e) => onUpdateField({ ...selectedField, textTemplate: e.target.value, content: e.target.value })}
              placeholder="e.g. CERTIFICATE OF COMPLETION or Presented to {{Name}}"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Quick Insert Token Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Insert Dynamic Field Token
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  insertToken(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-900 text-xs font-semibold outline-none"
            >
              <option value="">+ Insert Token (e.g. &#123;&#123;Name&#125;&#125;)</option>
              {['Name', 'College', 'CertificateID', 'Course', 'Date', 'StartDate', 'EndDate', 'Hours', 'Grade', 'Department', 'Batch'].map((token) => (
                <option key={token} value={token}>
                  &#123;&#123;{token}&#125;&#125;
                </option>
              ))}
              {spreadsheet?.headers.map((h) => (
                <option key={h} value={h}>
                  &#123;&#123;{h}&#125;&#125; (Spreadsheet)
                </option>
              ))}
            </select>
          </div>

          {/* Font Family Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Font Family
            </label>
            <select
              value={selectedField.fontFamily || 'Georgia'}
              onChange={(e) => onUpdateField({ ...selectedField, fontFamily: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <optgroup label="Uploaded Custom Fonts">
                {customFonts.map((f) => (
                  <option key={f.id} value={f.familyName}>
                    ★ {f.familyName} ({f.fileType.toUpperCase()})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Built-in Standard Fonts">
                {BUILT_IN_FONTS.map((f) => (
                  <option key={f.family} value={f.family}>
                    {f.name} ({f.category})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Font Size & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Font Size (px)
              </label>
              <input
                type="number"
                min="6"
                max="200"
                value={currentPxFontSize}
                onChange={(e) => handlePxFontSizeChange(parseFloat(e.target.value) || 12)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Text Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedField.textColor || '#000000'}
                  onChange={(e) => onUpdateField({ ...selectedField, textColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0"
                />
                <input
                  type="text"
                  value={selectedField.textColor || '#000000'}
                  onChange={(e) => onUpdateField({ ...selectedField, textColor: e.target.value })}
                  className="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-mono outline-none"
                />
              </div>
            </div>
          </div>

          {/* Alignment & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Text Alignment
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 justify-between">
                {[
                  { id: 'left', icon: AlignLeft },
                  { id: 'center', icon: AlignCenter },
                  { id: 'right', icon: AlignRight },
                ].map((align) => {
                  const Icon = align.icon;
                  return (
                    <button
                      key={align.id}
                      type="button"
                      onClick={() => onUpdateField({ ...selectedField, alignment: align.id as TextAlignment })}
                      className={`p-1.5 rounded-md flex-1 flex items-center justify-center transition-colors cursor-pointer ${
                        selectedField.alignment === align.id ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Font Weight
              </label>
              <select
                value={selectedField.fontWeight || 'regular'}
                onChange={(e) => onUpdateField({ ...selectedField, fontWeight: e.target.value as FontWeight })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white outline-none"
              >
                <option value="regular">Regular (400)</option>
                <option value="medium">Medium (500)</option>
                <option value="semibold">Semibold (600)</option>
                <option value="bold">Bold (700)</option>
              </select>
            </div>
          </div>

          {/* Auto Fit & Multiline Wrap */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={selectedField.autoFit ?? true}
                  onChange={(e) => onUpdateField({ ...selectedField, autoFit: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Enable Text Auto-Fit</span>
              </label>
            </div>

            {selectedField.autoFit && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Minimum Font Size (px): {currentPxMinFontSize}px
                </label>
                <input
                  type="range"
                  min="6"
                  max={currentPxFontSize}
                  value={currentPxMinFontSize}
                  onChange={(e) => handlePxMinFontSizeChange(parseFloat(e.target.value) || 6)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={selectedField.wrap ?? false}
                  onChange={(e) => onUpdateField({ ...selectedField, wrap: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Wrap Multiline Text</span>
              </label>
            </div>
          </div>

        </div>
      )}

      {/* IMAGE PROPERTIES */}
      {isImage && (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Opacity ({Math.round((selectedField.opacity ?? 1) * 100)}%)
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={selectedField.opacity ?? 1}
              onChange={(e) => onUpdateField({ ...selectedField, opacity: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* SHAPE PROPERTIES */}
      {isShape && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fill Color
              </label>
              <input
                type="color"
                value={selectedField.fillColor || '#ffffff'}
                onChange={(e) => onUpdateField({ ...selectedField, fillColor: e.target.value })}
                className="w-full h-8 rounded-lg cursor-pointer border border-slate-300 p-0"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Border Color
              </label>
              <input
                type="color"
                value={selectedField.strokeColor || '#000000'}
                onChange={(e) => onUpdateField({ ...selectedField, strokeColor: e.target.value })}
                className="w-full h-8 rounded-lg cursor-pointer border border-slate-300 p-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* LAYER CONTROLS */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Layer & Ordering
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => onBringForward(selectedField.id)}
            className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Bring Forward</span>
          </button>
          <button
            onClick={() => onSendBackward(selectedField.id)}
            className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Send Backward</span>
          </button>
        </div>
      </div>

    </div>
  );
};
