import React from 'react';
import { RefreshCw, XCircle } from 'lucide-react';

interface GenerationProgressProps {
  completedCount: number;
  totalCount: number;
  currentRecordName?: string;
  onCancel: () => void;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  completedCount,
  totalCount,
  currentRecordName,
  onCancel,
}) => {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        
        {/* Animated Icon */}
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 shadow-xs">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>

        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Generating Certificates...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Rendering high-fidelity PDFs for your batch. Please wait.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Progress: {completedCount} / {totalCount}</span>
            <span className="font-mono text-indigo-600 font-bold">{percent}%</span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-150"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Current Record Info */}
        {currentRecordName && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-xs font-medium text-slate-600 truncate max-w-md mx-auto">
            Current: <span className="font-bold text-slate-900">{currentRecordName}</span>
          </div>
        )}

        {/* Cancel Action Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Generation</span>
          </button>
        </div>

      </div>
    </div>
  );
};
