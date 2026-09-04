import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Table, 
  Info,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import type { SpreadsheetData } from '../types/certificate';
import { parseSpreadsheetFile } from '../services/spreadsheetParser';

interface DataUploadProps {
  data?: SpreadsheetData;
  onDataUploaded: (spreadsheet: SpreadsheetData) => void;
  onContinue: () => void;
}

export const DataUpload: React.FC<DataUploadProps> = ({
  data,
  onDataUploaded,
  onContinue,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File, sheetOverride?: string) => {
    setErrorMsg(null);
    setIsProcessing(true);
    setActiveFile(file);

    try {
      const parsedData = await parseSpreadsheetFile(file, sheetOverride);
      onDataUploaded(parsedData);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to process spreadsheet file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSheetChange = async (sheetName: string) => {
    if (activeFile) {
      await handleFile(activeFile, sheetName);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Upload Excel or CSV Data</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload your student or recipient list (.xlsx, .xls, .csv). Columns are detected dynamically.
          </p>
        </div>

        {data && (
          <button
            onClick={onContinue}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Continue to Field Mapping</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {!data ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer bg-white ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-slate-900">
            Drag and drop your spreadsheet here
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            or <span className="text-indigo-600 font-semibold underline">Choose File</span> (.xlsx, .xls, .csv)
          </p>

          {isProcessing && (
            <div className="mt-4 text-xs font-semibold text-indigo-600 animate-pulse">
              Reading spreadsheet & detecting columns...
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Spreadsheet loaded successfully
                </span>
                <p className="text-xs text-slate-700 font-semibold mt-0.5">
                  {data.filename} &bull; <span className="font-bold text-slate-900">{data.totalRows}</span> Records &bull; <span className="font-bold text-slate-900">{data.headers.length}</span> Columns Detected
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {data.sheetNames && data.sheetNames.length > 1 && (
                <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-500 font-medium">Sheet:</span>
                  <select
                    value={data.selectedSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
                  >
                    {data.sheetNames.map((sheet) => (
                      <option key={sheet} value={sheet}>
                        {sheet}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Replace File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          </div>

          {data.warnings && data.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
              <div className="flex items-center space-x-2 text-amber-800 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Spreadsheet Column Warnings:</span>
              </div>
              <ul className="text-xs text-amber-700 space-y-0.5 pl-6 list-disc">
                {data.warnings.map((warn, idx) => (
                  <li key={idx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center space-x-3 text-rose-700 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {data && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Available Dynamic Fields ({data.headers.length})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.headers.map((header) => (
                <span
                  key={header}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {header}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Table className="w-4 h-4 text-slate-500" />
                <span>Data Preview (First 10 Rows)</span>
              </h3>
              <span className="text-xs text-slate-500">
                Showing {Math.min(10, data.rows.length)} of {data.totalRows} total rows
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                    <th className="px-4 py-2.5 border-r border-slate-200 w-12 text-center">#</th>
                    {data.headers.map((h) => (
                      <th key={h} className="px-4 py-2.5 border-r border-slate-200 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                  {data.rows.slice(0, 10).map((row, rowIdx) => {
                    const hasEmptyValues = data.headers.some(h => !row[h]);

                    return (
                      <tr key={rowIdx} className={`hover:bg-slate-50 ${hasEmptyValues ? 'bg-amber-50/30' : ''}`}>
                        <td className="px-4 py-2 text-center text-slate-400 font-semibold border-r border-slate-200">
                          {rowIdx + 1}
                        </td>
                        {data.headers.map((h) => (
                          <td key={h} className="px-4 py-2 border-r border-slate-200 whitespace-nowrap">
                            {row[h] ? (
                              <span>{row[h]}</span>
                            ) : (
                              <span className="text-slate-300 italic font-sans font-normal">&lt;blank&gt;</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
