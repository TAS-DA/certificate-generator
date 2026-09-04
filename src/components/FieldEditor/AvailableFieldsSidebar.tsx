import React, { useState } from 'react';
import { Search, Tag, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import type { SpreadsheetData } from '../../types/certificate';

interface AvailableFieldsSidebarProps {
  spreadsheet?: SpreadsheetData;
  onAddField: (type: 'dynamic' | 'static', sourceColumnOrText?: string) => void;
}

export const AvailableFieldsSidebar: React.FC<AvailableFieldsSidebarProps> = ({
  spreadsheet,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const headers = spreadsheet?.headers || [];
  const filteredHeaders = headers.filter(h => 
    h.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex flex-col shrink-0 space-y-4">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1.5">
          <Sparkles className="w-3 h-3" />
          <span>3-Field Bulk Data Merge</span>
        </div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Spreadsheet Data Fields
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Detected columns available to merge into the 3 dynamic certificate areas.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search columns..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white"
        />
      </div>

      {/* Spreadsheet Columns List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[140px]">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Available Columns ({filteredHeaders.length})
        </span>

        {filteredHeaders.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-3 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            {headers.length === 0 ? 'No dataset uploaded' : 'No matching fields'}
          </div>
        ) : (
          filteredHeaders.map((header) => (
            <div
              key={header}
              className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 select-none"
            >
              <div className="flex items-center space-x-2 truncate">
                <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate" title={header}>{header}</span>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>
          ))
        )}
      </div>

      {/* Master Artwork Lock Banner */}
      <div className="pt-3 border-t border-slate-200 bg-slate-50 rounded-xl p-3 border border-slate-200 text-slate-600 space-y-1.5">
        <div className="flex items-center space-x-1.5 text-slate-900 font-bold text-xs">
          <Lock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Locked Master Artwork</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Logos, seals, stamps, signatures, borders, <code className="bg-slate-200 px-1 py-0.5 rounded-xs text-slate-800">ID - VICS445</code>, and Founder details are 100% locked inside the original PDF.
        </p>
      </div>

    </div>
  );
};
