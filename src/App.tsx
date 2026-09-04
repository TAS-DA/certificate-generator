import { useState, useEffect, useCallback } from 'react';
import type { 
  CertificateBatch, 
  CertificateTemplate, 
  CertificateElement,
  SavedAsset,
  CustomFont,
  SpreadsheetData, 
  BatchValidationResult,
  GeneratedCertificate,
  AssetCategory
} from './types/certificate';
import { dbService } from './services/db';
import { Navbar } from './components/Navbar';
import type { ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TemplateList } from './components/TemplateList';
import { CreateTemplateModal } from './components/CreateTemplateModal';
import { AssetsLibrary } from './components/AssetsLibrary';
import { FontManager } from './components/FontManager';
import { DataUpload } from './components/DataUpload';
import { FieldMappingView } from './components/FieldMappingView';
import { DesignerLeftSidebar } from './components/FieldEditor/DesignerLeftSidebar';
import { PropertiesSidebar } from './components/FieldEditor/PropertiesSidebar';
import { TemplateCanvas } from './components/FieldEditor/TemplateCanvas';
import { PreviewModeBar } from './components/PreviewMode';
import { PreGenSummaryModal } from './components/PreGenSummaryModal';
import { GenerationProgress } from './components/GenerationProgress';
import { ResultsView } from './components/ResultsView';
import { generateSingleCertificatePdf } from './services/pdfGenerator';
import { generateFilenameFromPattern, downloadBatchZip } from './services/zipService';
import { registerCustomFonts } from './lib/fontManager';
import { 
  Undo2, 
  Redo2, 
  Save, 
  Zap, 
  Eye, 
  ZoomIn, 
  ZoomOut,
  ArrowLeft
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Storage State
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<CertificateTemplate | null>(null);
  const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  
  const [batches, setBatches] = useState<CertificateBatch[]>([]);
  const [activeBatch, setActiveBatch] = useState<CertificateBatch | null>(null);

  // Designer State
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<CertificateElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Bulk Generation State
  const [bulkStep, setBulkStep] = useState<number>(1);
  const [showPreGenModal, setShowPreGenModal] = useState<boolean>(false);
  const [validationResult] = useState<BatchValidationResult>({ isValid: true, errors: [], warnings: [] });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genProgress, setGenProgress] = useState<{ completed: number; total: number; currentName?: string }>({ completed: 0, total: 0 });
  const [cancelGen, setCancelGen] = useState<boolean>(false);

  // 1. Initial Data Loading from IndexedDB
  useEffect(() => {
    async function loadInitialData() {
      try {
        const loadedBatches = await dbService.getAllBatches();
        setBatches(loadedBatches);

        const loadedTemplates = await dbService.getAllTemplates();
        setTemplates(loadedTemplates);
        if (loadedTemplates.length > 0 && !activeTemplate) {
          setActiveTemplate(loadedTemplates[0]);
        }

        const loadedAssets = await dbService.getAllAssets();
        setSavedAssets(loadedAssets);

        const loadedFonts = await dbService.getAllFonts();
        setCustomFonts(loadedFonts);
        registerCustomFonts(loadedFonts);
      } catch (err) {
        console.error('Failed to load initial data from IndexedDB:', err);
      }
    }
    loadInitialData();
  }, []);

  // History Pushes for Designer Undo/Redo
  const pushHistory = useCallback((elements: CertificateElement[]) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, elements];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevElements = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      if (activeTemplate) {
        setActiveTemplate({ ...activeTemplate, elements: prevElements });
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextElements = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      if (activeTemplate) {
        setActiveTemplate({ ...activeTemplate, elements: nextElements });
      }
    }
  };

  // 2. Template Handlers
  const handleCreateTemplateSubmit = async (templateData: Partial<CertificateTemplate>) => {
    const newTemplate: CertificateTemplate = {
      id: `tmpl_${Date.now()}`,
      name: templateData.name || 'AI Internship Completion Certificate',
      preset: templateData.preset || 'A4 Landscape',
      widthMm: templateData.widthMm || 297,
      heightMm: templateData.heightMm || 210,
      unit: templateData.unit || 'mm',
      orientation: templateData.orientation || 'landscape',
      backgroundColor: '#ffffff',
      elements: [
        {
          id: `el_title_${Date.now()}`,
          type: 'text',
          content: 'CERTIFICATE OF COMPLETION',
          xRatio: 0.15,
          yRatio: 0.18,
          widthRatio: 0.7,
          heightRatio: 0.1,
          fontFamily: 'Georgia',
          fontSizeRatio: 0.055,
          fontWeight: 'bold',
          textColor: '#1e1b4b',
          alignment: 'center',
          autoFit: true,
          wrap: false,
          zIndex: 1,
          visible: true,
        },
        {
          id: `el_sub_${Date.now()}`,
          type: 'text',
          content: 'THIS CERTIFICATE IS PROUDLY PRESENTED TO',
          xRatio: 0.2,
          yRatio: 0.32,
          widthRatio: 0.6,
          heightRatio: 0.05,
          fontFamily: 'Georgia',
          fontSizeRatio: 0.022,
          fontWeight: 'semibold',
          textColor: '#64748b',
          alignment: 'center',
          autoFit: true,
          wrap: false,
          zIndex: 2,
          visible: true,
        },
        {
          id: `el_name_${Date.now()}`,
          type: 'text',
          textType: 'dynamic',
          content: '{{Name}}',
          sourceColumn: 'Name',
          xRatio: 0.15,
          yRatio: 0.40,
          widthRatio: 0.7,
          heightRatio: 0.12,
          fontFamily: 'Georgia',
          fontSizeRatio: 0.065,
          fontWeight: 'bold',
          textColor: '#0f172a',
          alignment: 'center',
          autoFit: true,
          minFontSizeRatio: 0.03,
          wrap: false,
          zIndex: 3,
          visible: true,
        },
        {
          id: `el_body_${Date.now()}`,
          type: 'text',
          textType: 'sentence',
          content: 'For successful completion of the {{Hours}}-Hour {{Program}} conducted from {{StartDate}} to {{EndDate}} at {{College}}.',
          xRatio: 0.1,
          yRatio: 0.58,
          widthRatio: 0.8,
          heightRatio: 0.15,
          fontFamily: 'Georgia',
          fontSizeRatio: 0.026,
          fontWeight: 'regular',
          textColor: '#334155',
          alignment: 'center',
          autoFit: true,
          wrap: true,
          maxLines: 4,
          zIndex: 4,
          visible: true,
        },
        {
          id: `el_date_${Date.now()}`,
          type: 'text',
          textType: 'dynamic',
          content: 'Date: {{Date}}',
          sourceColumn: 'Date',
          xRatio: 0.1,
          yRatio: 0.8,
          widthRatio: 0.3,
          heightRatio: 0.05,
          fontFamily: 'Georgia',
          fontSizeRatio: 0.022,
          textColor: '#475569',
          alignment: 'left',
          zIndex: 5,
          visible: true,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbService.saveTemplate(newTemplate);
    setTemplates((prev) => [newTemplate, ...prev]);
    setActiveTemplate(newTemplate);
    setHistory([newTemplate.elements]);
    setHistoryIndex(0);
    setActiveTab('designer');
  };

  const handleSaveActiveTemplate = async () => {
    if (!activeTemplate) return;
    await dbService.saveTemplate(activeTemplate);
    setTemplates((prev) => prev.map((t) => (t.id === activeTemplate.id ? activeTemplate : t)));
    alert(`Saved template "${activeTemplate.name}" successfully!`);
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    const found = templates.find((t) => t.id === templateId);
    if (!found) return;
    const dup: CertificateTemplate = {
      ...found,
      id: `tmpl_${Date.now()}`,
      name: `${found.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dbService.saveTemplate(dup);
    setTemplates((prev) => [dup, ...prev]);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    await dbService.deleteTemplate(templateId);
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    if (activeTemplate?.id === templateId) {
      setActiveTemplate(templates.find((t) => t.id !== templateId) || null);
    }
  };

  const handleExportTemplateJson = (template: CertificateTemplate) => {
    const jsonStr = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/[^a-z0-9]/gi, '_')}_template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTemplateJson = async (file: File) => {
    try {
      const text = await file.text();
      const imported = JSON.parse(text) as CertificateTemplate;
      imported.id = `tmpl_${Date.now()}`;
      imported.updatedAt = new Date().toISOString();
      await dbService.saveTemplate(imported);
      setTemplates((prev) => [imported, ...prev]);
      setActiveTemplate(imported);
      setActiveTab('designer');
    } catch (err) {
      alert('Failed to parse template JSON file: ' + err);
    }
  };

  // 3. Canvas Element Modifiers
  const handleUpdateElement = (updated: CertificateElement) => {
    if (!activeTemplate) return;
    const newElements = activeTemplate.elements.map((el) => (el.id === updated.id ? updated : el));
    setActiveTemplate({ ...activeTemplate, elements: newElements });
    pushHistory(newElements);
  };

  const handleAddTextElement = (variant: string, customText?: string) => {
    if (!activeTemplate) return;
    const id = `el_txt_${Date.now()}`;
    let content = customText || 'New Text Element';
    let fontSizeRatio = 0.03;
    let fontWeight: any = 'regular';

    if (variant === 'heading') {
      content = 'CERTIFICATE TITLE';
      fontSizeRatio = 0.055;
      fontWeight = 'bold';
    } else if (variant === 'subheading') {
      content = 'SUBTITLE / PRESENTED TO';
      fontSizeRatio = 0.03;
      fontWeight = 'semibold';
    }

    const newElement: CertificateElement = {
      id,
      type: 'text',
      content,
      xRatio: 0.2,
      yRatio: 0.3,
      widthRatio: 0.6,
      heightRatio: 0.08,
      fontFamily: 'Georgia',
      fontSizeRatio,
      fontWeight,
      textColor: '#000000',
      alignment: 'center',
      autoFit: true,
      wrap: false,
      zIndex: activeTemplate.elements.length + 1,
      visible: true,
    };

    const newElements = [...activeTemplate.elements, newElement];
    setActiveTemplate({ ...activeTemplate, elements: newElements });
    setSelectedFieldId(id);
    pushHistory(newElements);
  };

  const handleAddDynamicToken = (tokenName: string) => {
    if (!activeTemplate) return;
    const id = `el_dyn_${Date.now()}`;
    const newElement: CertificateElement = {
      id,
      type: 'text',
      textType: 'dynamic',
      content: `{{${tokenName}}}`,
      sourceColumn: tokenName,
      xRatio: 0.2,
      yRatio: 0.4,
      widthRatio: 0.6,
      heightRatio: 0.08,
      fontFamily: 'Georgia',
      fontSizeRatio: 0.05,
      fontWeight: 'bold',
      textColor: '#0f172a',
      alignment: 'center',
      autoFit: true,
      minFontSizeRatio: 0.025,
      wrap: false,
      zIndex: activeTemplate.elements.length + 1,
      visible: true,
    };

    const newElements = [...activeTemplate.elements, newElement];
    setActiveTemplate({ ...activeTemplate, elements: newElements });
    setSelectedFieldId(id);
    pushHistory(newElements);
  };

  const handleAddShape = (shapeType: any) => {
    if (!activeTemplate) return;
    const id = `el_shape_${Date.now()}`;
    const newElement: CertificateElement = {
      id,
      type: 'shape',
      shapeType,
      xRatio: 0.3,
      yRatio: 0.3,
      widthRatio: shapeType.includes('line') ? 0.4 : 0.2,
      heightRatio: shapeType === 'line-horizontal' ? 0.005 : 0.15,
      fillColor: shapeType.includes('line') ? '#000000' : 'transparent',
      strokeColor: '#000000',
      strokeWidth: 2,
      lineStyle: 'solid',
      zIndex: activeTemplate.elements.length + 1,
      visible: true,
    };

    const newElements = [...activeTemplate.elements, newElement];
    setActiveTemplate({ ...activeTemplate, elements: newElements });
    setSelectedFieldId(id);
    pushHistory(newElements);
  };

  const handleAddAssetToCanvas = (asset: SavedAsset) => {
    if (!activeTemplate) return;
    const id = `el_img_${Date.now()}`;
    const newElement: CertificateElement = {
      id,
      type: 'image',
      assetId: asset.id,
      src: asset.dataUrl,
      assetCategory: asset.category,
      xRatio: 0.35,
      yRatio: 0.35,
      widthRatio: 0.2,
      heightRatio: 0.15,
      maintainAspectRatio: true,
      opacity: 1,
      zIndex: activeTemplate.elements.length + 1,
      visible: true,
    };

    const newElements = [...activeTemplate.elements, newElement];
    setActiveTemplate({ ...activeTemplate, elements: newElements });
    setSelectedFieldId(id);
    pushHistory(newElements);
  };

  const handleUploadAsset = async (file: File, category: AssetCategory, name: string) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = async () => {
        const newAsset: SavedAsset = {
          id: `asset_${Date.now()}`,
          name,
          category,
          dataUrl,
          width: img.width,
          height: img.height,
          mimeType: file.type,
          createdAt: new Date().toISOString(),
        };
        await dbService.saveAsset(newAsset);
        setSavedAssets((prev) => [newAsset, ...prev]);

        if (activeTab === 'designer' && activeTemplate) {
          handleAddAssetToCanvas(newAsset);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadFont = async (file: File, familyName: string, name: string, weight: any, style: any) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const fileType = file.name.endsWith('.otf') ? 'otf' : 'ttf';
      const newFont: CustomFont = {
        id: `font_${Date.now()}`,
        name,
        familyName,
        weight,
        style,
        dataUrl,
        fileType,
        createdAt: new Date().toISOString(),
      };
      await dbService.saveFont(newFont);
      setCustomFonts((prev) => [newFont, ...prev]);
      registerCustomFonts([newFont]);
      alert(`Registered font "${familyName}" successfully!`);
    };
    reader.readAsDataURL(file);
  };

  // 4. Bulk Generation Batch Workflow
  const handleReuseInBulk = (template: CertificateTemplate) => {
    setActiveTemplate(template);
    const newBatch: CertificateBatch = {
      id: `batch_${Date.now()}`,
      name: `${template.name} - Batch ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      templateId: template.id,
      template,
      fields: template.elements,
      filenamePattern: '{{Name}}_{{Date}}',
    };
    setActiveBatch(newBatch);
    setBulkStep(2);
    setActiveTab('bulk');
  };

  const handleDataSpreadsheetUploaded = async (data: SpreadsheetData) => {
    if (!activeBatch) return;
    const updated: CertificateBatch = {
      ...activeBatch,
      spreadsheet: data,
      status: 'data_added',
    };
    setActiveBatch(updated);
    await dbService.saveBatch(updated);
    setBulkStep(3);
  };

  const handleStartBulkGeneration = async () => {
    if (!activeBatch || !activeBatch.spreadsheet || !activeBatch.template) return;
    setIsGenerating(true);
    setGenProgress({ completed: 0, total: activeBatch.spreadsheet.totalRows });
    setCancelGen(false);

    const rows = activeBatch.spreadsheet.rows;
    const generatedList: GeneratedCertificate[] = [];
    const templateObj = activeBatch.template as CertificateTemplate;
    const fields = activeBatch.fields || templateObj.elements || [];

    for (let i = 0; i < rows.length; i++) {
      if (cancelGen) break;
      const row = rows[i];
      const primaryName = row['Name'] || row['Student Name'] || Object.values(row)[0] || `Row_${i + 1}`;
      const certId = row['CertificateID'] || row['ID'] || `CERT_${i + 1}`;
      const genId = `gen_${Date.now()}_${i}`;

      setGenProgress({ completed: i + 1, total: rows.length, currentName: primaryName });

      try {
        const pdfBlob = await generateSingleCertificatePdf(templateObj, fields, row);
        const filename = generateFilenameFromPattern(activeBatch.filenamePattern || '{{Name}}', row, i + 1);

        generatedList.push({
          id: genId,
          batchId: activeBatch.id,
          recordId: certId,
          rowIndex: i,
          rowNumber: i + 1,
          primaryName,
          displayName: primaryName,
          certificateId: certId,
          filename,
          blob: pdfBlob,
          pdfBlob: pdfBlob,
          status: 'generated',
        });
      } catch (err: any) {
        generatedList.push({
          id: genId,
          batchId: activeBatch.id,
          recordId: certId,
          rowIndex: i,
          rowNumber: i + 1,
          primaryName,
          displayName: primaryName,
          certificateId: certId,
          filename: `Error_Row_${i + 1}.pdf`,
          blob: new Blob(),
          pdfBlob: new Blob(),
          status: 'failed',
          error: err.message || 'PDF Generation Error',
        });
      }

      if (i % 5 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    const finalBatch: CertificateBatch = {
      ...activeBatch,
      status: 'completed',
      generatedCertificates: generatedList,
    };

    setActiveBatch(finalBatch);
    setBatches((prev) => [finalBatch, ...prev.filter((b) => b.id !== finalBatch.id)]);
    setIsGenerating(false);
    setShowPreGenModal(false);
    setBulkStep(7);
  };

  const selectedField = activeTemplate?.elements.find((el) => el.id === selectedFieldId) || null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Top Main Navbar Shell */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTemplateName={activeTemplate?.name}
      />

      {/* Main Body View Switching */}
      <main className="flex-1 flex flex-col">
        
        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <Dashboard
            batches={batches}
            onCreateBatch={() => {
              if (templates.length > 0) handleReuseInBulk(templates[0]);
              else setIsCreateModalOpen(true);
            }}
            onOpenBatch={(batchId) => {
              const b = batches.find((x) => x.id === batchId);
              if (b) {
                setActiveBatch(b);
                setActiveTab('bulk');
                setBulkStep(b.status === 'completed' ? 7 : 4);
              }
            }}
            onDuplicateBatch={() => {}}
            onDeleteBatch={async (id) => {
              await dbService.deleteBatch(id);
              setBatches((prev) => prev.filter((b) => b.id !== id));
            }}
            onDownloadZip={(batch) => downloadBatchZip(batch)}
            onLoadSampleBatch={() => {
              setIsCreateModalOpen(true);
            }}
          />
        )}

        {/* TEMPLATES LIST VIEW */}
        {activeTab === 'templates' && (
          <TemplateList
            templates={templates}
            onOpenDesigner={(tmpl) => {
              setActiveTemplate(tmpl);
              setActiveTab('designer');
            }}
            onCreateNewTemplate={() => setIsCreateModalOpen(true)}
            onDuplicateTemplate={handleDuplicateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onReuseInBulk={handleReuseInBulk}
            onExportTemplateJson={handleExportTemplateJson}
            onImportTemplateJson={handleImportTemplateJson}
          />
        )}

        {/* TEMPLATE DESIGNER VIEW */}
        {activeTab === 'designer' && activeTemplate && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Toolbar */}
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between z-30 shadow-xs">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('templates')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Back to Templates"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={activeTemplate.name}
                  onChange={(e) => setActiveTemplate({ ...activeTemplate, name: e.target.value })}
                  className="font-extrabold text-sm text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white px-2 py-1 rounded border border-transparent focus:border-slate-300 outline-none"
                />
                <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                  {activeTemplate.preset}
                </span>
              </div>

              {/* Toolbar Center Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer"
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer"
                  title="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                {/* Zoom Selector */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setZoomLevel((z) => Math.max(0.25, z - 0.1))} className="p-1 text-slate-600 hover:bg-white rounded cursor-pointer">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-700 w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))} className="p-1 text-slate-600 hover:bg-white rounded cursor-pointer">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                {/* Design Mode vs Data Preview Toggle */}
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isPreviewMode ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isPreviewMode ? 'Data Preview' : 'Design Mode'}</span>
                </button>
              </div>

              {/* Toolbar Right Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveActiveTemplate}
                  className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Save</span>
                </button>

                <button
                  onClick={() => handleReuseInBulk(activeTemplate)}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Certificates</span>
                </button>
              </div>
            </div>

            {/* Main Designer Workspace */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Sidebar */}
              <DesignerLeftSidebar
                savedAssets={savedAssets}
                spreadsheet={activeBatch?.spreadsheet}
                onAddText={handleAddTextElement}
                onAddDynamicToken={handleAddDynamicToken}
                onUploadAsset={handleUploadAsset}
                onAddAssetToCanvas={handleAddAssetToCanvas}
                onAddShape={handleAddShape}
                onUploadBackground={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    if (activeTemplate) {
                      setActiveTemplate({ ...activeTemplate, backgroundImage: e.target?.result as string });
                    }
                  };
                  reader.readAsDataURL(file);
                }}
                onUploadDataSpreadsheet={() => {}}
              />

              {/* Canvas Center */}
              <TemplateCanvas
                template={activeTemplate}
                fields={activeTemplate.elements}
                selectedFieldId={selectedFieldId}
                spreadsheet={activeBatch?.spreadsheet}
                previewRecord={activeBatch?.spreadsheet?.rows[previewIndex]}
                zoomLevel={zoomLevel}
                isPreviewMode={isPreviewMode}
                onSelectField={setSelectedFieldId}
                onUpdateField={handleUpdateElement}
                onDeleteField={(id) => {
                  const remaining = activeTemplate.elements.filter((el) => el.id !== id);
                  setActiveTemplate({ ...activeTemplate, elements: remaining });
                  setSelectedFieldId(null);
                  pushHistory(remaining);
                }}
              />

              {/* Right Properties Sidebar */}
              <PropertiesSidebar
                selectedField={selectedField}
                spreadsheet={activeBatch?.spreadsheet}
                customFonts={customFonts}
                naturalHeight={activeTemplate.heightMm * 3.78}
                onUpdateField={handleUpdateElement}
                onDeleteField={(id) => {
                  const remaining = activeTemplate.elements.filter((el) => el.id !== id);
                  setActiveTemplate({ ...activeTemplate, elements: remaining });
                  setSelectedFieldId(null);
                }}
                onDuplicateField={(el) => {
                  const dup: CertificateElement = {
                    ...el,
                    id: `el_${Date.now()}`,
                    xRatio: el.xRatio + 0.02,
                    yRatio: el.yRatio + 0.02,
                  };
                  const newElements = [...activeTemplate.elements, dup];
                  setActiveTemplate({ ...activeTemplate, elements: newElements });
                  setSelectedFieldId(dup.id);
                }}
                onBringForward={(id) => {
                  const el = activeTemplate.elements.find((x) => x.id === id);
                  if (el) handleUpdateElement({ ...el, zIndex: (el.zIndex || 0) + 1 });
                }}
                onSendBackward={(id) => {
                  const el = activeTemplate.elements.find((x) => x.id === id);
                  if (el) handleUpdateElement({ ...el, zIndex: Math.max(0, (el.zIndex || 0) - 1) });
                }}
              />

            </div>
          </div>
        )}

        {/* BULK GENERATION WORKFLOW VIEW */}
        {activeTab === 'bulk' && (
          <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
            
            {/* Step 2: Upload Data */}
            {bulkStep === 2 && (
              <DataUpload
                data={activeBatch?.spreadsheet}
                onDataUploaded={handleDataSpreadsheetUploaded}
                onContinue={() => setBulkStep(3)}
              />
            )}

            {/* Step 3: Field Mapping */}
            {bulkStep === 3 && activeBatch?.spreadsheet && activeTemplate && (
              <FieldMappingView
                template={activeTemplate}
                fields={activeTemplate.elements}
                spreadsheet={activeBatch.spreadsheet}
                fieldMappings={activeBatch.fieldMappings || []}
                onUpdateMappings={(mappings) => {
                  setActiveBatch({ ...activeBatch, fieldMappings: mappings });
                }}
                onProceedToPreview={() => setBulkStep(4)}
              />
            )}

            {/* Step 4: Preview Real Records */}
            {bulkStep === 4 && activeBatch?.spreadsheet && activeTemplate && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Preview & Generate Certificates</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify your field mappings against real spreadsheet records before starting bulk generation.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setBulkStep(3)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300"
                    >
                      Back to Mapping
                    </button>
                    <button
                      onClick={() => setShowPreGenModal(true)}
                      className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Generate {activeBatch.spreadsheet.totalRows} Certificates</span>
                    </button>
                  </div>
                </div>

                <PreviewModeBar
                  isPreviewMode={isPreviewMode}
                  onTogglePreviewMode={setIsPreviewMode}
                  currentIndex={previewIndex}
                  totalRecords={activeBatch.spreadsheet.totalRows}
                  spreadsheet={activeBatch.spreadsheet}
                  onIndexChange={setPreviewIndex}
                />

                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center">
                  <TemplateCanvas
                    template={activeTemplate}
                    fields={activeTemplate.elements}
                    selectedFieldId={null}
                    previewRecord={activeBatch.spreadsheet.rows[previewIndex]}
                    zoomLevel={0.9}
                    isPreviewMode={true}
                    onSelectField={() => {}}
                    onUpdateField={() => {}}
                    onDeleteField={() => {}}
                  />
                </div>
              </div>
            )}

            {/* Step 7: Results View */}
            {bulkStep === 7 && activeBatch && (
              <ResultsView
                batch={activeBatch}
                onRetryFailed={handleStartBulkGeneration}
                onBackToEditor={() => setBulkStep(4)}
                onClearResults={() => {
                  setActiveBatch({ ...activeBatch, generatedCertificates: [] });
                  setBulkStep(4);
                }}
              />
            )}

          </div>
        )}

        {/* BATCH HISTORY VIEW */}
        {activeTab === 'history' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 w-full">
            <h1 className="text-2xl font-extrabold text-slate-900">Generated Certificate Batches</h1>
            {batches.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
                No past certificate generation batches found.
              </div>
            ) : (
              <div className="space-y-4">
                {batches.map((b) => (
                  <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {b.generatedCertificates?.length || 0} Certificates Generated • {new Date(b.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => downloadBatchZip(b)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Download ZIP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ASSETS LIBRARY VIEW */}
        {activeTab === 'assets' && (
          <AssetsLibrary
            assets={savedAssets}
            onUploadAsset={handleUploadAsset}
            onDeleteAsset={async (id) => {
              await dbService.deleteAsset(id);
              setSavedAssets((prev) => prev.filter((a) => a.id !== id));
            }}
          />
        )}

        {/* SETTINGS / FONT MANAGER VIEW */}
        {activeTab === 'settings' && (
          <FontManager
            customFonts={customFonts}
            onUploadFont={handleUploadFont}
            onDeleteFont={async (id) => {
              await dbService.deleteFont(id);
              setCustomFonts((prev) => prev.filter((f) => f.id !== id));
            }}
          />
        )}

      </main>

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTemplate={handleCreateTemplateSubmit}
      />

      {/* Pre-Generation Validation Modal */}
      {showPreGenModal && activeBatch && (
        <PreGenSummaryModal
          batch={activeBatch}
          validation={validationResult}
          onClose={() => setShowPreGenModal(false)}
          onConfirmGenerate={handleStartBulkGeneration}
          onChangeFilenamePattern={(pattern) => {
            if (activeBatch) setActiveBatch({ ...activeBatch, filenamePattern: pattern });
          }}
        />
      )}

      {/* Controlled Progress Overlay */}
      {isGenerating && (
        <GenerationProgress
          completedCount={genProgress.completed}
          totalCount={genProgress.total}
          currentRecordName={genProgress.currentName}
          onCancel={() => setCancelGen(true)}
        />
      )}

    </div>
  );
}

export default App;
