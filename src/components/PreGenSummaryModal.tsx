import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  FileSpreadsheet, 
  Settings, 
  Sparkles 
} from 'lucide-react';
import type { CertificateBatch, BatchValidationResult } from '../types/certificate';

interface PreGenSummaryModalProps {
  batch: CertificateBatch;
  validation: BatchValidationResult;
  onConfirmGenerate: () => void;
  onClose: () => void;
  onChangeFilenamePattern: (pattern: string) => void;
}

export const PreGenSummaryModal: React.FC<PreGenSummaryModalProps> = ({
  batch,
  validation,
  onConfirmGenerate,
  onClose,
  onChangeFilenamePattern,
}) => {
  const recordCount = batch.spreadsheet?.totalRows || 0;
  const fieldCount = batch.fields.length;
  const primaryHeader = batch.spreadsheet?.headers[0] || 'Name';
  const secondaryHeader = batch.spreadsheet?.headers[1] || 'Certificate ID';

  const defaultPattern = `{{${primaryHeader}}}_{{${secondaryHeader}}}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pre-Generation Summary & Validation
              </h3>
              <p className="text-xs text-slate-500">
                Review setup parameters before creating bulk certificates.
              </p>
            </div>
          </div>
        </div>

        <div className="my-4 space-y-3">
          {validation.errors.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs mb-1">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{validation.errors.length} Blocking Error(s) Found:</span>
              </div>
              <ul className="text-xs text-rose-700 space-y-1 pl-6 list-disc">
                {validation.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs mb-1">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{validation.warnings.length} Warning(s) to Note:</span>
              </div>
              <ul className="text-xs text-amber-700 space-y-1 pl-6 list-disc max-h-24 overflow-y-auto">
                {validation.warnings.map((warn, idx) => (
                  <li key={idx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Template:</span>
            </span>
            <span className="font-semibold text-slate-800">{batch.template?.filename || batch.template?.name || 'None'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center space-x-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              <span>Data File & Worksheet:</span>
            </span>
            <span className="font-semibold text-slate-800">{batch.spreadsheet?.filename} ({batch.spreadsheet?.selectedSheet})</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Records to Generate:</span>
            </span>
            <span className="font-bold text-indigo-600 text-sm">{recordCount} PDFs</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center space-x-1.5">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Dynamic Certificate Fields:</span>
            </span>
            <span className="font-semibold text-slate-800">{fieldCount} Fields Configured</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            PDF Filename Pattern
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            Use column names in double curly braces (e.g. <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded-sm">{defaultPattern}</code>).
          </p>
          <input
            type="text"
            value={batch.filenamePattern || ''}
            onChange={(e) => onChangeFilenamePattern(e.target.value)}
            placeholder={defaultPattern}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6 mt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Back to Editor
          </button>

          <button
            type="button"
            disabled={!validation.isValid}
            onClick={onConfirmGenerate}
            className="inline-flex items-center space-x-2 px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <span>Generate {recordCount} Certificates</span>
          </button>
        </div>
      </div>
    </div>
  );
};
