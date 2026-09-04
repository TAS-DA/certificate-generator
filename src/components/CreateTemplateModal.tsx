import React, { useState } from 'react';
import { X, FileText, Layout, CheckCircle2, Sparkles } from 'lucide-react';
import type { PagePreset, LengthUnit, CertificateTemplate } from '../types/certificate';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate: (template: Partial<CertificateTemplate>) => void;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  onCreateTemplate,
}) => {
  const [name, setName] = useState('AI Internship Completion Certificate');
  const [preset, setPreset] = useState<PagePreset>('A4 Landscape');
  const [unit, setUnit] = useState<LengthUnit>('mm');
  const [customWidth, setCustomWidth] = useState<number>(297);
  const [customHeight, setCustomHeight] = useState<number>(210);

  if (!isOpen) return null;

  const handlePresetSelect = (p: PagePreset) => {
    setPreset(p);
    if (p === 'A4 Landscape') {
      setUnit('mm');
      setCustomWidth(297);
      setCustomHeight(210);
    } else if (p === 'A4 Portrait') {
      setUnit('mm');
      setCustomWidth(210);
      setCustomHeight(297);
    } else if (p === 'Letter Landscape') {
      setUnit('in');
      setCustomWidth(11);
      setCustomHeight(8.5);
    } else if (p === 'Letter Portrait') {
      setUnit('in');
      setCustomWidth(8.5);
      setCustomHeight(11);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let widthMm = customWidth;
    let heightMm = customHeight;
    let orientation: 'landscape' | 'portrait' = customWidth >= customHeight ? 'landscape' : 'portrait';

    if (preset === 'A4 Landscape') {
      widthMm = 297;
      heightMm = 210;
      orientation = 'landscape';
    } else if (preset === 'A4 Portrait') {
      widthMm = 210;
      heightMm = 297;
      orientation = 'portrait';
    } else if (preset === 'Letter Landscape') {
      widthMm = 279.4; // 11 in
      heightMm = 215.9; // 8.5 in
      orientation = 'landscape';
    } else if (preset === 'Letter Portrait') {
      widthMm = 215.9;
      heightMm = 279.4;
      orientation = 'portrait';
    }

    onCreateTemplate({
      name: name.trim(),
      preset,
      widthMm,
      heightMm,
      unit,
      orientation,
      backgroundColor: '#ffffff',
      elements: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Create Certificate Template</h2>
              <p className="text-xs text-slate-500">Choose page dimensions and template properties</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Template Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Template Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI Internship Completion Certificate"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition-all"
            />
          </div>

          {/* Page Size Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Page Size & Orientation
              </label>
              <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Recommended: A4 Landscape
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'A4 Landscape', label: 'A4 Landscape', desc: '297 × 210 mm', isRec: true },
                { id: 'A4 Portrait', label: 'A4 Portrait', desc: '210 × 297 mm' },
                { id: 'Letter Landscape', label: 'Letter Landscape', desc: '11 × 8.5 in' },
                { id: 'Letter Portrait', label: 'Letter Portrait', desc: '8.5 × 11 in' },
                { id: 'Custom', label: 'Custom Dimensions', desc: 'Specify dimensions' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePresetSelect(item.id as PagePreset)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    preset === item.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.label}</span>
                      {preset === item.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                  </div>
                  {item.isRec && (
                    <span className="mt-2 inline-block text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded w-max">
                      Recommended
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dimension Fields */}
          {preset === 'Custom' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Custom Canvas Dimensions</span>
                <div className="flex items-center space-x-2">
                  {(['mm', 'in', 'px'] as LengthUnit[]).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-colors cursor-pointer ${
                        unit === u ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Width ({unit})
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="0.1"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Height ({unit})
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="0.1"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer flex items-center space-x-2"
            >
              <Layout className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
