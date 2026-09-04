import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  AlertCircle, 
  ZoomIn, 
  ZoomOut, 
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import type { TemplateInfo } from '../types/certificate';
import { renderPdfFirstPageToImage } from '../services/pdfTemplateLoader';

interface TemplateUploadProps {
  template?: TemplateInfo;
  onTemplateUploaded: (template: TemplateInfo) => void;
  onContinue: () => void;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const TemplateUpload: React.FC<TemplateUploadProps> = ({
  template,
  onTemplateUploaded,
  onContinue,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg('File exceeds the maximum allowed size of 20 MB.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['png', 'jpg', 'jpeg', 'pdf'];

    if (!ext || !allowedExts.includes(ext)) {
      setErrorMsg('Unsupported file format. Please upload PNG, JPG, JPEG, or PDF.');
      return;
    }

    setIsProcessing(true);

    try {
      if (ext === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfBytes = new Uint8Array(arrayBuffer);
        const pdfResult = await renderPdfFirstPageToImage(file);
        
        onTemplateUploaded({
          id: `tpl_${Date.now()}`,
          filename: file.name,
          type: 'pdf',
          width: pdfResult.width,
          height: pdfResult.height,
          dataUrl: pdfResult.dataUrl,
          originalBlob: file,
          originalPdfBytes: pdfBytes,
          pageCount: pdfResult.pageCount,
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            onTemplateUploaded({
              id: `tpl_${Date.now()}`,
              filename: file.name,
              type: ext as 'png' | 'jpg' | 'jpeg',
              width: img.naturalWidth,
              height: img.naturalHeight,
              dataUrl,
              originalBlob: file,
            });
            setIsProcessing(false);
          };
          img.onerror = () => {
            setErrorMsg('Failed to process image dimensions.');
            setIsProcessing(false);
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to process template file.');
    } finally {
      if (ext === 'pdf') {
        setIsProcessing(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <span>Upload Certificate Template</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload your master background certificate design (PNG, JPG, or PDF). Max size: 20 MB.
          </p>
        </div>

        {template && (
          <button
            onClick={onContinue}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Continue to Upload Data</span>
            <span>&rarr;</span>
          </button>
        )}
      </div>

      {!template ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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
            accept=".png,.jpg,.jpeg,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-slate-900">
            Drag and drop your certificate template here
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            or <span className="text-indigo-600 font-semibold underline">Choose File</span> from your computer
          </p>
          <p className="text-xs text-slate-400">
            Supported Formats: PNG, JPG, JPEG, PDF (Max 20 MB)
          </p>

          {isProcessing && (
            <div className="mt-4 text-xs font-semibold text-indigo-600 animate-pulse">
              Processing template...
            </div>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Master template uploaded successfully
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5" title={template.filename}>
                {template.filename} &bull; <span className="uppercase">{template.type}</span> &bull; {template.width} &times; {template.height} pt
              </p>
              {template.type === 'pdf' && (template.pageCount || 1) > 1 && (
                <p className="text-xs text-amber-700 font-medium mt-0.5">
                  Notice: This version supports the first page of a PDF certificate template.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Replace Template
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center space-x-3 text-rose-700 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {template && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-600 font-medium">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Template Workspace ({Math.round(zoomLevel * 100)}%)</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.3, prev - 0.1))}
                className="p-1 text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono text-xs font-bold text-slate-700">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.1))}
                className="p-1 text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-slate-200 mx-1" />

              <button
                onClick={() => setZoomLevel(1.0)}
                className="px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Reset to 100%"
              >
                100%
              </button>

              <button
                onClick={() => setZoomLevel(0.7)}
                className="px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Fit to Screen"
              >
                Fit
              </button>
            </div>
          </div>

          <div className="p-8 overflow-auto flex items-center justify-center min-h-[420px] bg-slate-100 certificate-canvas-container">
            <div
              className="relative shadow-lg rounded-sm transition-transform duration-100 bg-white"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={template.dataUrl}
                alt="Certificate Template Background"
                className="max-w-full block select-none pointer-events-none"
                style={{
                  width: `${template.width}px`,
                  maxWidth: '1000px',
                  height: 'auto',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
