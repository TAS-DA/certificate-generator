import React, { useState } from 'react';
import { 
  Type, 
  Upload, 
  Trash2, 
  Sparkles, 
  Plus
} from 'lucide-react';
import type { CustomFont, FontWeight, FontStyle } from '../types/certificate';
import { BUILT_IN_FONTS } from '../lib/fontManager';

interface FontManagerProps {
  customFonts: CustomFont[];
  onUploadFont: (file: File, familyName: string, name: string, weight: FontWeight, style: FontStyle) => Promise<void>;
  onDeleteFont: (fontId: string) => void;
}

export const FontManager: React.FC<FontManagerProps> = ({
  customFonts,
  onUploadFont,
  onDeleteFont,
}) => {
  const [fontName, setFontName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [fontWeight, setFontWeight] = useState<FontWeight>('regular');
  const [fontStyle, setFontStyle] = useState<FontStyle>('normal');
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFontFile(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      if (!fontName) setFontName(cleanName);
      if (!familyName) setFamilyName(cleanName.replace(/[^a-zA-Z0-9\s]/g, ''));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fontFile || !familyName.trim()) return;

    setIsUploading(true);
    try {
      await onUploadFont(
        fontFile,
        familyName.trim(),
        fontName.trim() || familyName.trim(),
        fontWeight,
        fontStyle
      );
      setFontFile(null);
      setFontName('');
      setFamilyName('');
    } catch (err) {
      console.error('Failed to upload font:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Typography & Custom Font Manager</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Upload custom TTF and OTF font files. Uploaded fonts render live in the designer and embed directly into generated vector PDFs with 100% visual parity.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-1.5 rounded-xl font-bold">
              {customFonts.length} Custom Fonts Uploaded
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Font Upload Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 h-fit">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            <span>Upload Custom Font File</span>
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Font Family Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. Cinema Script or Royal Serif"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Font Weight
                </label>
                <select
                  value={fontWeight}
                  onChange={(e) => setFontWeight(e.target.value as FontWeight)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="regular">Regular (400)</option>
                  <option value="medium">Medium (500)</option>
                  <option value="semibold">Semibold (600)</option>
                  <option value="bold">Bold (700)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Font Style
                </label>
                <select
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value as FontStyle)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Font File (.TTF or .OTF)
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-colors relative bg-slate-50/50">
                <input
                  type="file"
                  accept=".ttf,.otf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {fontFile ? (
                  <div className="text-xs font-bold text-indigo-700 truncate">
                    ✓ {fontFile.name} ({(fontFile.size / 1024).toFixed(1)} KB)
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Type className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Select TTF or OTF File</p>
                    <p className="text-[11px] text-slate-400">Supported: TrueType (.ttf) & OpenType (.otf)</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!fontFile || !familyName.trim() || isUploading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isUploading ? 'Registering Font...' : 'Add Font to Designer'}</span>
            </button>
          </form>
        </div>

        {/* Custom & Built-in Font Lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom Uploaded Fonts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Your Uploaded Fonts ({customFonts.length})</span>
            </h2>

            {customFonts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                No custom fonts uploaded yet. Upload your custom brand font files on the left!
              </div>
            ) : (
              <div className="space-y-3">
                {customFonts.map((font) => (
                  <div
                    key={font.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">{font.familyName}</span>
                        <span className="text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          {font.fileType}
                        </span>
                      </div>
                      <p 
                        className="text-lg mt-1 text-slate-800"
                        style={{ fontFamily: `'${font.familyName}', sans-serif`, fontWeight: font.weight === 'bold' ? 700 : 400 }}
                      >
                        CERTIFICATE OF COMPLETION — Rahul Kumar
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteFont(font.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer self-end sm:self-center"
                      title="Delete Custom Font"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Built-in Fonts Library */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Type className="w-5 h-5 text-slate-700" />
              <span>Built-In Fonts ({BUILT_IN_FONTS.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUILT_IN_FONTS.map((font) => (
                <div key={font.family} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{font.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{font.category}</span>
                  </div>
                  <p 
                    className="text-sm mt-1 text-slate-900 truncate"
                    style={{ fontFamily: `'${font.family}', sans-serif` }}
                  >
                    Presented to Venkata Sai Krishna
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
