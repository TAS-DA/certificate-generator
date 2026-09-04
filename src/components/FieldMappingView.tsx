import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  AlertTriangle, 
  Sparkles, 
  Table
} from 'lucide-react';
import type { 
  CertificateTemplate, 
  TemplateInfo, 
  SpreadsheetData, 
  FieldMapping 
} from '../types/certificate';
import { extractTokens } from '../lib/tokenParser';

interface FieldMappingViewProps {
  template: CertificateTemplate | TemplateInfo;
  fields: any[];
  spreadsheet: SpreadsheetData;
  fieldMappings: FieldMapping[];
  onUpdateMappings: (mappings: FieldMapping[]) => void;
  onProceedToPreview: () => void;
}

export const FieldMappingView: React.FC<FieldMappingViewProps> = ({
  template,
  fields,
  spreadsheet,
  fieldMappings,
  onUpdateMappings,
  onProceedToPreview,
}) => {
  // Step 1: Detect all tokens from template elements
  const [detectedTokens, setDetectedTokens] = useState<string[]>([]);
  const [localMappings, setLocalMappings] = useState<FieldMapping[]>([]);

  useEffect(() => {
    const tokens = new Set<string>();

    fields.forEach((el) => {
      if (el.textTemplate || el.content) {
        const found = extractTokens(el.textTemplate || el.content || '');
        found.forEach((t) => tokens.add(t));
      } else if (el.type === 'dynamic' && el.sourceColumn) {
        tokens.add(el.sourceColumn);
      }
    });

    const tokenList = Array.from(tokens);
    setDetectedTokens(tokenList);

    // Auto match tokens to spreadsheet headers
    const newMappings: FieldMapping[] = tokenList.map((token) => {
      const existing = fieldMappings.find((m) => m.templateToken === token);
      if (existing) return existing;

      // Auto match logic: exact match or case-insensitive match
      const matchedHeader = spreadsheet.headers.find(
        (h) => h.trim().toLowerCase() === token.trim().toLowerCase()
      ) || spreadsheet.headers.find(
        (h) => h.toLowerCase().includes(token.toLowerCase()) || token.toLowerCase().includes(h.toLowerCase())
      ) || '';

      return {
        templateToken: token,
        spreadsheetColumn: matchedHeader,
        isRequired: true,
      };
    });

    setLocalMappings(newMappings);
  }, [template, fields, spreadsheet, fieldMappings]);

  const handleColumnChange = (token: string, col: string) => {
    const updated = localMappings.map((m) =>
      m.templateToken === token ? { ...m, spreadsheetColumn: col } : m
    );
    setLocalMappings(updated);
    onUpdateMappings(updated);
  };

  const handleToggleRequired = (token: string) => {
    const updated = localMappings.map((m) =>
      m.templateToken === token ? { ...m, isRequired: !m.isRequired } : m
    );
    setLocalMappings(updated);
    onUpdateMappings(updated);
  };

  const unmappedCount = localMappings.filter((m) => !m.spreadsheetColumn && m.isRequired).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dynamic Field Mapping Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Map Spreadsheet Columns to Certificate Fields</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              We detected {detectedTokens.length} dynamic field tokens in your certificate template. Connect each template field to a column in <span className="font-semibold text-slate-800">{spreadsheet.filename}</span>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-300">
              {spreadsheet.totalRows} Records Ready
            </span>
          </div>
        </div>
      </div>

      {/* Field Mapping Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Table className="w-5 h-5 text-indigo-600" />
            <span>Field Mappings ({localMappings.length})</span>
          </h2>
          {unmappedCount > 0 && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {unmappedCount} required fields unmapped
            </span>
          )}
        </div>

        {localMappings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No dynamic fields (e.g. <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-indigo-600">&#123;&#123;Name&#125;&#125;</code>) detected in template. You can proceed directly to preview!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {localMappings.map((mapping) => (
              <div key={mapping.templateToken} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                
                {/* Left side: Template Token */}
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-xs font-bold px-3 py-2 rounded-xl">
                    &#123;&#123;{mapping.templateToken}&#125;&#125;
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900">{mapping.templateToken}</span>
                    <p className="text-[11px] text-slate-500">Field inside template layout</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block" />

                {/* Right side: Spreadsheet Header Selector */}
                <div className="flex items-center space-x-4">
                  <div>
                    <select
                      value={mapping.spreadsheetColumn}
                      onChange={(e) => handleColumnChange(mapping.templateToken, e.target.value)}
                      className={`w-56 px-3 py-2 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        mapping.spreadsheetColumn
                          ? 'border-emerald-300 bg-emerald-50/30 text-emerald-900 focus:ring-2 focus:ring-emerald-500'
                          : mapping.isRequired
                          ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500'
                          : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <option value="">-- Select Column Header --</option>
                      {spreadsheet.headers.map((hdr) => (
                        <option key={hdr} value={hdr}>
                          {hdr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={mapping.isRequired}
                      onChange={() => handleToggleRequired(mapping.templateToken)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Required</span>
                  </label>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <span className="text-xs text-slate-500">
          All values like Certificate IDs <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">000123</code> preserve exact formatting.
        </span>

        <button
          onClick={onProceedToPreview}
          disabled={unmappedCount > 0}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer flex items-center space-x-2"
        >
          <span>Preview Real Data Records</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
