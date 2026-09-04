import React, { useState } from 'react';
import { 
  Download, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  RotateCcw,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import type { CertificateBatch, GeneratedCertificate } from '../types/certificate';
import { downloadCertificate, downloadAllAsZip } from '../services/zipService';

interface ResultsViewProps {
  batch: CertificateBatch;
  onRetryFailed: () => void;
  onBackToEditor: () => void;
  onClearResults?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  batch,
  onRetryFailed,
  onBackToEditor,
  onClearResults,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'generated' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'row' | 'name' | 'status'>('row');
  const [isZipping, setIsZipping] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const certs = batch.generatedCertificates || [];
  const totalCount = certs.length;
  const successCount = certs.filter(c => c.status === 'generated' || c.status === 'success').length;
  const failedCount = certs.filter(c => c.status === 'failed').length;

  let filteredCerts = certs.filter(c => {
    const matchesSearch = 
      (c.primaryName || c.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.certificateId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.filename || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'generated' && (c.status === 'generated' || c.status === 'success')) ||
      (statusFilter === 'failed' && c.status === 'failed');
    
    return matchesSearch && matchesStatus;
  });

  filteredCerts.sort((a, b) => {
    if (sortBy === 'name') return (a.primaryName || a.displayName || '').localeCompare(b.primaryName || b.displayName || '');
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return (a.rowNumber || a.rowIndex || 0) - (b.rowNumber || b.rowIndex || 0);
  });

  const handleSingleDownload = (cert: GeneratedCertificate) => {
    setDownloadingId(cert.id);
    try {
      downloadCertificate(cert);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 300);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadAllAsZip(certs, batch.name);
    } catch (err) {
      console.error('ZIP creation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Session Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-900 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold">Important: </span>
          Generated certificates are kept only for this browser session. Download your PDFs or ZIP before refreshing or closing this page.
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Generation Complete</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Generation Results
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Batch: <span className="font-semibold text-slate-700">{batch.name}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToEditor}
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Generate Again</span>
          </button>

          {onClearResults && (
            <button
              onClick={onClearResults}
              className="inline-flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Results</span>
            </button>
          )}

          <button
            onClick={handleDownloadZip}
            disabled={isZipping || successCount === 0}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4.5 h-4.5" />
            <span>{isZipping ? 'Creating ZIP Package...' : 'Download All ZIP'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Records</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Generated PDFs</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{successCount}</p>
        </div>

        <div className={`bg-white p-4 rounded-xl border shadow-2xs ${failedCount > 0 ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${failedCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            Failed Records
          </span>
          <p className={`text-2xl font-extrabold mt-1 ${failedCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{failedCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Warnings</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">0</p>
        </div>
      </div>

      {failedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>{failedCount} certificates failed to render. Retry failed items without re-generating the entire batch.</span>
          </div>
          <button
            onClick={onRetryFailed}
            className="inline-flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Failed Certificates</span>
          </button>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search certificates by name, ID, or filename..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('generated')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${statusFilter === 'generated' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'}`}
              >
                Generated ({successCount})
              </button>
              {failedCount > 0 && (
                <button
                  onClick={() => setStatusFilter('failed')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${statusFilter === 'failed' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'}`}
                >
                  Failed ({failedCount})
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="row">Sort by Row #</option>
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <th className="px-4 py-3 w-16 text-center">Row</th>
                <th className="px-4 py-3">Primary Recipient</th>
                <th className="px-4 py-3">Certificate ID / Ref</th>
                <th className="px-4 py-3">PDF Filename</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                    No certificates matched your search filter.
                  </td>
                </tr>
              ) : (
                filteredCerts.map((cert) => {
                  const isSuccess = cert.status === 'generated' || cert.status === 'success';
                  return (
                    <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-center text-slate-400 font-mono font-bold">
                        {cert.rowNumber || (cert.rowIndex !== undefined ? cert.rowIndex + 1 : 1)}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {cert.primaryName || cert.displayName || `Record ${cert.rowNumber || 1}`}
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-600">
                        {cert.certificateId || '—'}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-[200px] truncate" title={cert.filename}>
                        {cert.filename}
                      </td>

                      <td className="px-4 py-3">
                        {isSuccess ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Generated</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title={cert.error}>
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {isSuccess && (
                          <button
                            onClick={() => handleSingleDownload(cert)}
                            disabled={downloadingId === cert.id}
                            className="inline-flex items-center space-x-1 bg-white hover:bg-slate-100 text-indigo-600 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{downloadingId === cert.id ? 'Downloading...' : 'Download PDF'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
