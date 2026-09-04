import React from 'react';
import { ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react';
import type { SpreadsheetData } from '../types/certificate';

interface PreviewModeProps {
  isPreviewMode: boolean;
  onTogglePreviewMode: (enabled: boolean) => void;
  currentIndex: number;
  totalRecords: number;
  spreadsheet?: SpreadsheetData;
  onIndexChange: (newIndex: number) => void;
}

export const PreviewModeBar: React.FC<PreviewModeProps> = ({
  isPreviewMode,
  onTogglePreviewMode,
  currentIndex,
  totalRecords,
  spreadsheet,
  onIndexChange,
}) => {
  const rows = spreadsheet?.rows || [];
  const primaryHeader = spreadsheet?.headers[0] || '';

  return (
    <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border-b border-slate-800">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onTogglePreviewMode(!isPreviewMode)}
          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isPreviewMode
              ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>{isPreviewMode ? 'Preview Mode: ON' : 'Preview Mode: OFF'}</span>
        </button>

        <span className="text-xs text-slate-400 hidden md:inline-block">
          {isPreviewMode ? 'Viewing real spreadsheet record values' : 'Viewing column placeholders'}
        </span>
      </div>

      {isPreviewMode && totalRecords > 0 && (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={currentIndex}
              onChange={(e) => onIndexChange(parseInt(e.target.value))}
              className="bg-transparent text-xs text-white font-medium focus:outline-hidden cursor-pointer max-w-[180px] truncate"
            >
              {rows.map((row, idx) => {
                const label = primaryHeader && row[primaryHeader] ? row[primaryHeader] : `Record ${idx + 1}`;
                return (
                  <option key={idx} value={idx} className="bg-slate-900 text-white">
                    #{idx + 1}: {label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
              title="Previous Record"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-semibold text-indigo-300 px-2">
              Record {currentIndex + 1} of {totalRecords}
            </span>

            <button
              onClick={() => onIndexChange(Math.min(totalRecords - 1, currentIndex + 1))}
              disabled={currentIndex >= totalRecords - 1}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
              title="Next Record"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
