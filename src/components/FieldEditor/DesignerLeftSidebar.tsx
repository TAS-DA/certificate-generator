import React, { useState } from 'react';
import { 
  Type, 
  Sparkles, 
  Image as ImageIcon, 
  Shapes, 
  FolderOpen, 
  FileSpreadsheet, 
  Plus, 
  Upload, 
  Square,
  Circle,
  Minus
} from 'lucide-react';
import type { 
  SavedAsset, 
  SpreadsheetData, 
  AssetCategory 
} from '../../types/certificate';

interface DesignerLeftSidebarProps {
  savedAssets: SavedAsset[];
  spreadsheet?: SpreadsheetData;
  onAddText: (variant: 'heading' | 'subheading' | 'body' | 'small' | 'dynamic' | 'sentence', customText?: string) => void;
  onAddDynamicToken: (tokenName: string) => void;
  onUploadAsset: (file: File, category: AssetCategory, name: string) => Promise<void>;
  onAddAssetToCanvas: (asset: SavedAsset) => void;
  onAddShape: (shapeType: 'rectangle' | 'rounded-rectangle' | 'circle' | 'line-horizontal' | 'line-vertical') => void;
  onUploadBackground: (file: File) => void;
  onUploadDataSpreadsheet: (file: File) => void;
}

export const DesignerLeftSidebar: React.FC<DesignerLeftSidebarProps> = ({
  savedAssets,
  spreadsheet,
  onAddText,
  onAddDynamicToken,
  onUploadAsset,
  onAddAssetToCanvas,
  onAddShape,
  onUploadBackground,
  onUploadDataSpreadsheet,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'dynamic' | 'images' | 'shapes' | 'assets' | 'data'>('text');
  const [customTokenName, setCustomTokenName] = useState('');
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('logo');

  const handleAssetUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetFile || !assetName.trim()) return;
    await onUploadAsset(assetFile, assetCategory, assetName.trim());
    setAssetFile(null);
    setAssetName('');
  };

  const handleAddCustomTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTokenName.trim()) return;
    onAddDynamicToken(customTokenName.trim());
    setCustomTokenName('');
  };

  const presetTokens = [
    'Name', 'College', 'CertificateID', 'Course', 'Date', 
    'StartDate', 'EndDate', 'Hours', 'Grade', 'Department', 'Batch'
  ];

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full select-none z-20">
      
      {/* Sidebar Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 overflow-x-auto bg-slate-50 p-1">
        {[
          { id: 'text', label: 'Text', icon: Type },
          { id: 'dynamic', label: 'Fields', icon: Sparkles },
          { id: 'images', label: 'Images', icon: ImageIcon },
          { id: 'shapes', label: 'Shapes', icon: Shapes },
          { id: 'assets', label: 'Assets', icon: FolderOpen },
          { id: 'data', label: 'Data', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center py-2 px-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Add Typography</h3>
              <p className="text-[11px] text-slate-500">Click to add text elements to your canvas</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onAddText('heading')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all cursor-pointer group"
              >
                <span className="text-lg font-black text-slate-900 group-hover:text-indigo-600">Add Heading</span>
                <p className="text-[10px] text-slate-400">e.g. CERTIFICATE OF COMPLETION</p>
              </button>

              <button
                onClick={() => onAddText('subheading')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all cursor-pointer group"
              >
                <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">Add Subheading</span>
                <p className="text-[10px] text-slate-400">e.g. PROUDLY PRESENTED TO</p>
              </button>

              <button
                onClick={() => onAddText('body')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all cursor-pointer group"
              >
                <span className="text-xs font-normal text-slate-700 group-hover:text-indigo-600">Add Body Paragraph</span>
                <p className="text-[10px] text-slate-400">e.g. For successful completion of training...</p>
              </button>

              <button
                onClick={() => onAddText('small')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all cursor-pointer group"
              >
                <span className="text-[11px] font-medium text-slate-600 group-hover:text-indigo-600">Add Small Details</span>
                <p className="text-[10px] text-slate-400">e.g. Authorized Signatory / Date</p>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Dynamic Sentence Builder</h4>
              <button
                onClick={() => onAddText('sentence', 'This certificate is presented to {{Name}} for completing {{Course}}.')}
                className="w-full text-left p-3 rounded-xl border border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                <span className="text-xs font-bold text-indigo-700 block mb-1">Sentence with Tokens</span>
                <p className="text-[11px] text-slate-600 italic">"This certificate is presented to &#123;&#123;Name&#125;&#125; for completing &#123;&#123;Course&#125;&#125;."</p>
              </button>
            </div>
          </div>
        )}

        {/* DYNAMIC FIELDS TAB */}
        {activeTab === 'dynamic' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Dynamic Field Tokens</h3>
              <p className="text-[11px] text-slate-500">Tokens are replaced with spreadsheet values during bulk generation.</p>
            </div>

            {/* Custom Token Adder */}
            <form onSubmit={handleAddCustomTokenSubmit} className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Add Custom Field Token</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTokenName}
                  onChange={(e) => setCustomTokenName(e.target.value)}
                  placeholder="Field name e.g. Rank"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!customTokenName.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-700 block mb-2">Preset Field Chips (Click to Add)</span>
              <div className="flex flex-wrap gap-2">
                {presetTokens.map((token) => (
                  <button
                    key={token}
                    onClick={() => onAddDynamicToken(token)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-mono text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-indigo-500" />
                    <span>&#123;&#123;{token}&#125;&#125;</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IMAGES TAB */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Image Upload</h3>
              <p className="text-[11px] text-slate-500">PNG transparency is preserved for signatures, stamps & logos.</p>
            </div>

            {/* Background Image Upload */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Upload Certificate Background</span>
              <label className="flex items-center justify-center space-x-2 p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload Certificate BG (PNG/JPG/SVG)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={(e) => {
                    if (e.target.files?.[0]) onUploadBackground(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Upload Image Asset */}
            <form onSubmit={handleAssetUploadSubmit} className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-800 block">Upload Graphic / Signature</span>

              <input
                type="text"
                required
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Asset name e.g. CEO Signature"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white outline-none"
              />

              <select
                value={assetCategory}
                onChange={(e) => setAssetCategory(e.target.value as AssetCategory)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white outline-none"
              >
                <option value="signature">Signature (Transparent PNG)</option>
                <option value="stamp">Stamp (Transparent PNG)</option>
                <option value="logo">Logo</option>
                <option value="seal">Seal / Badge</option>
                <option value="decoration">Decoration</option>
              </select>

              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setAssetFile(e.target.files[0]);
                    if (!assetName) setAssetName(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                  }
                }}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />

              <button
                type="submit"
                disabled={!assetFile || !assetName.trim()}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Upload & Add to Canvas
              </button>
            </form>
          </div>
        )}

        {/* SHAPES & LINES TAB */}
        {activeTab === 'shapes' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Shapes & Lines</h3>
              <p className="text-[11px] text-slate-500">Add decorative shapes, borders, and separator lines.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onAddShape('rectangle')}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-center space-y-1 cursor-pointer"
              >
                <Square className="w-6 h-6 text-indigo-600 mx-auto" />
                <span className="text-xs font-bold text-slate-800 block">Rectangle</span>
              </button>

              <button
                onClick={() => onAddShape('rounded-rectangle')}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-center space-y-1 cursor-pointer"
              >
                <div className="w-6 h-6 border-2 border-indigo-600 rounded-md mx-auto" />
                <span className="text-xs font-bold text-slate-800 block">Rounded Rect</span>
              </button>

              <button
                onClick={() => onAddShape('circle')}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-center space-y-1 cursor-pointer"
              >
                <Circle className="w-6 h-6 text-indigo-600 mx-auto" />
                <span className="text-xs font-bold text-slate-800 block">Circle / Ellipse</span>
              </button>

              <button
                onClick={() => onAddShape('line-horizontal')}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-center space-y-1 cursor-pointer"
              >
                <Minus className="w-6 h-6 text-indigo-600 mx-auto" />
                <span className="text-xs font-bold text-slate-800 block">Horizontal Line</span>
              </button>
            </div>
          </div>
        )}

        {/* ASSETS LIBRARY REUSE TAB */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Reusable Asset Library</h3>
              <p className="text-[11px] text-slate-500">Click any saved asset to place it directly on your certificate canvas.</p>
            </div>

            {savedAssets.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center p-4">No saved assets in library yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {savedAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => onAddAssetToCanvas(asset)}
                    className="p-2 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-400 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="h-20 bg-white rounded-lg flex items-center justify-center p-1 border border-slate-100 overflow-hidden">
                      <img src={asset.dataUrl} alt={asset.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-600 block mt-1.5 truncate">
                      {asset.name}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase">{asset.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SPREADSHEET DATA TEST TAB */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Live Test Data</h3>
              <p className="text-[11px] text-slate-500">Upload a test CSV or Excel file to preview real rows directly in the designer canvas.</p>
            </div>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors text-center space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">Upload Excel (.xlsx) / CSV</span>
              <span className="text-[10px] text-slate-500">Test live data record replacement</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  if (e.target.files?.[0]) onUploadDataSpreadsheet(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>

            {spreadsheet && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-emerald-800 block truncate">✓ {spreadsheet.filename}</span>
                <span className="text-[11px] text-emerald-700">{spreadsheet.totalRows} rows • {spreadsheet.headers.length} headers</span>
              </div>
            )}
          </div>
        )}

      </div>
    </aside>
  );
};
