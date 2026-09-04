import React, { useState } from 'react';
import { 
  PlusCircle, 
  FileSpreadsheet, 
  Trash2, 
  FolderOpen, 
  Download, 
  Copy, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import type { CertificateBatch } from '../types/certificate';

interface DashboardProps {
  batches: CertificateBatch[];
  onCreateBatch: (batchName: string) => void;
  onOpenBatch: (batchId: string) => void;
  onDuplicateBatch: (batchId: string) => void;
  onDeleteBatch: (batchId: string) => void;
  onDownloadZip: (batch: CertificateBatch) => void;
  onLoadSampleBatch: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  batches,
  onCreateBatch,
  onOpenBatch,
  onDuplicateBatch,
  onDeleteBatch,
  onDownloadZip,
  onLoadSampleBatch,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [batchToDelete, setBatchToDelete] = useState<CertificateBatch | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;
    onCreateBatch(newBatchName.trim());
    setNewBatchName('');
    setIsModalOpen(false);
  };

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.template?.filename || b.template?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Offline-First & Privacy Guaranteed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bulk Certificate Generator
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
              Create hundreds of personalized certificates from one template and a spreadsheet. 100% fast, accurate, and processed right inside your browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onLoadSampleBatch}
              className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm px-4 py-2.5 rounded-xl border border-slate-300 transition-colors cursor-pointer"
              title="Load demo template & spreadsheet data"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Try Demo Sample Batch</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Certificate Batch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* Search & Filter Header */}
        {batches.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Recent Batches</span>
              <span className="bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {batches.length}
              </span>
            </h2>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search batches..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {batches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No certificate batches created yet.
            </h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              Upload your certificate template (PNG/JPG/PDF) and Excel or CSV data file to generate hundreds of certificates in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Your First Batch</span>
              </button>

              <button
                onClick={onLoadSampleBatch}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm px-4 py-2.5 rounded-xl border border-slate-300 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Try Demo Sample Batch</span>
              </button>
            </div>
          </div>
        ) : (
          /* Batches Grid / Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => {
              const recordCount = batch.spreadsheet?.totalRows || 0;
              const generatedCount = batch.generatedCertificates?.filter(c => c.status === 'success').length || 0;
              const statusInfo = getStatusBadge(batch.status);

              return (
                <div
                  key={batch.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5">
                    {/* Header: Name & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3
                        onClick={() => onOpenBatch(batch.id)}
                        className="font-bold text-slate-900 text-base leading-snug hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2"
                        title={batch.name}
                      >
                        {batch.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Template:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[160px]" title={batch.template?.filename || batch.template?.name}>
                          {batch.template?.filename || batch.template?.name || 'Not created'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Records:</span>
                        <span className="font-semibold text-slate-800 flex items-center space-x-1">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                          <span>{recordCount} Records</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Certificates:</span>
                        <span className="font-semibold text-slate-800 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{generatedCount} / {recordCount} Generated</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Created:</span>
                        <span className="font-normal text-slate-500 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between">
                    <button
                      onClick={() => onOpenBatch(batch.id)}
                      className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Open Batch</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      {generatedCount > 0 && (
                        <button
                          onClick={() => onDownloadZip(batch)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                          title="Download All PDFs as ZIP"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => onDuplicateBatch(batch.id)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        title="Duplicate Batch Setup"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setBatchToDelete(batch)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Create Certificate Batch
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter a descriptive name for your certificate batch to begin uploading your template and spreadsheet data.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Batch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="e.g. AI Internship Certificates - September 2026"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newBatchName.trim()}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {batchToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-start space-x-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Certificate Batch?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  This will permanently remove the batch configuration and all generated certificate files for <span className="font-semibold text-slate-700">"{batchToDelete.name}"</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBatchToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteBatch(batchToDelete.id);
                  setBatchToDelete(null);
                }}
                className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Delete Batch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'completed':
      return { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    case 'completed_with_errors':
      return { label: 'Completed w/ Errors', className: 'bg-amber-50 text-amber-700 border border-amber-200' };
    case 'ready':
      return { label: 'Ready', className: 'bg-indigo-50 text-indigo-700 border border-indigo-200' };
    case 'data_added':
      return { label: 'Data Added', className: 'bg-blue-50 text-blue-700 border border-blue-200' };
    case 'template_added':
      return { label: 'Template Added', className: 'bg-slate-100 text-slate-700 border border-slate-200' };
    default:
      return { label: 'Draft', className: 'bg-slate-100 text-slate-600 border border-slate-200' };
  }
}
