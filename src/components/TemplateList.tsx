import React, { useState } from 'react';
import { 
  PlusCircle, 
  FileText, 
  Palette, 
  Zap, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Calendar,
  Layers
} from 'lucide-react';
import type { CertificateTemplate } from '../types/certificate';

interface TemplateListProps {
  templates: CertificateTemplate[];
  onOpenDesigner: (template: CertificateTemplate) => void;
  onCreateNewTemplate: () => void;
  onDuplicateTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onReuseInBulk: (template: CertificateTemplate) => void;
  onExportTemplateJson: (template: CertificateTemplate) => void;
  onImportTemplateJson: (file: File) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onOpenDesigner,
  onCreateNewTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  onReuseInBulk,
  onExportTemplateJson,
  onImportTemplateJson,
}) => {
  const [templateToDelete, setTemplateToDelete] = useState<CertificateTemplate | null>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportTemplateJson(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Certificate Templates</h1>
          <p className="text-sm text-slate-600 mt-1">Design once and reuse your templates for unlimited bulk generation batches.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          <button
            onClick={onCreateNewTemplate}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Certificate Template</span>
          </button>
        </div>
      </div>

      {/* Grid of Templates */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Templates Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Create a new certificate template from scratch using our Canva-like visual editor.
            </p>
          </div>
          <button
            onClick={onCreateNewTemplate}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Template</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Preview Header */}
              <div 
                onClick={() => onOpenDesigner(template)}
                className="bg-slate-100 h-44 flex items-center justify-center p-4 relative cursor-pointer group-hover:bg-slate-200/60 transition-colors border-b border-slate-100"
              >
                {template.backgroundImage ? (
                  <img
                    src={template.backgroundImage}
                    alt={template.name}
                    className="max-h-full max-w-full object-contain rounded shadow-xs"
                  />
                ) : (
                  <div 
                    className="w-full h-full bg-white rounded shadow-sm border border-slate-200 flex flex-col items-center justify-center p-4 text-center space-y-2"
                    style={{ backgroundColor: template.backgroundColor || '#ffffff' }}
                  >
                    <div className="border border-indigo-200 bg-indigo-50/50 px-3 py-1 rounded text-[11px] font-bold text-indigo-700 tracking-wider uppercase">
                      CERTIFICATE PREVIEW
                    </div>
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{template.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {template.elements ? `${template.elements.length} elements` : 'Custom template'}
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-slate-900/75 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {template.preset}
                </div>
              </div>

              {/* Body Info */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 
                    onClick={() => onOpenDesigner(template)}
                    className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-1"
                  >
                    {template.name}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{template.elements?.length || 0} Elements</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onOpenDesigner(template)}
                      className="inline-flex items-center space-x-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onReuseInBulk(template)}
                      className="inline-flex items-center space-x-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Use this template in a bulk generation batch"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Generate</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onDuplicateTemplate(template.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Duplicate Template"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onExportTemplateJson(template)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Export JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTemplateToDelete(template)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Delete Certificate Template?</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-800">"{templateToDelete.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteTemplate(templateToDelete.id);
                  setTemplateToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 cursor-pointer"
              >
                Delete Template
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
