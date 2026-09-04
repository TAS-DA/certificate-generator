import React, { useState } from 'react';
import { 
  Upload, 
  Trash2, 
  Tag, 
  Image as ImageIcon, 
  Award, 
  FileCheck, 
  ShieldCheck, 
  PenTool, 
  Search,
  Plus
} from 'lucide-react';
import type { SavedAsset, AssetCategory } from '../types/certificate';

interface AssetsLibraryProps {
  assets: SavedAsset[];
  onUploadAsset: (file: File, category: AssetCategory, name: string) => Promise<void>;
  onDeleteAsset: (assetId: string) => void;
}

export const AssetsLibrary: React.FC<AssetsLibraryProps> = ({
  assets,
  onUploadAsset,
  onDeleteAsset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<AssetCategory>('logo');
  const [assetName, setAssetName] = useState('');
  const [assetFile, setAssetFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAssetFile(file);
      if (!assetName) {
        setAssetName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetFile || !assetName.trim()) return;

    setIsUploading(true);
    try {
      await onUploadAsset(assetFile, uploadCategory, assetName.trim());
      setAssetFile(null);
      setAssetName('');
    } catch (err) {
      console.error('Failed to upload asset:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'All Assets', icon: ImageIcon },
    { id: 'logo', label: 'Logos', icon: Award },
    { id: 'signature', label: 'Signatures', icon: PenTool },
    { id: 'stamp', label: 'Stamps', icon: FileCheck },
    { id: 'seal', label: 'Seals & Badges', icon: ShieldCheck },
    { id: 'other', label: 'Other Graphics', icon: Tag },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Assets Library</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Upload logos, transparent PNG signatures, official stamps, seals, and badges to reuse across all your certificate templates without re-uploading every time.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-xl font-bold">
              {assets.length} Reusable Assets Stored
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 h-fit">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            <span>Upload New Asset</span>
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Asset Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="e.g. AI School Official Logo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Asset Category
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as AssetCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm outline-none bg-white"
              >
                <option value="logo">Logo</option>
                <option value="signature">Signature (Transparent PNG recommended)</option>
                <option value="stamp">Stamp (Transparent PNG recommended)</option>
                <option value="seal">Seal / Badge</option>
                <option value="decoration">Decorative Graphics</option>
                <option value="background">Background Pattern</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Image File (PNG, JPG, SVG, WEBP)
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-colors relative bg-slate-50/50">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {assetFile ? (
                  <div className="text-xs font-bold text-indigo-700 truncate">
                    ✓ {assetFile.name} ({(assetFile.size / 1024).toFixed(1)} KB)
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Click to select or drag file here</p>
                    <p className="text-[11px] text-slate-400">PNG with transparency recommended for signatures & stamps</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!assetFile || !assetName.trim() || isUploading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Save to Asset Library'}</span>
            </button>
          </form>
        </div>

        {/* Asset Grid & Filter */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Category Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-44"
              />
            </div>
          </div>

          {/* Assets Grid */}
          {filteredAssets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              No saved assets found in this category. Upload your logos, signatures, and stamps on the left!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  <div className="h-32 bg-slate-50 rounded-xl flex items-center justify-center p-2 relative overflow-hidden border border-slate-100">
                    <img
                      src={asset.dataUrl}
                      alt={asset.name}
                      className="max-h-full max-w-full object-contain drop-shadow-xs"
                    />
                    <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {asset.category}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate" title={asset.name}>{asset.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{asset.width} × {asset.height} px</p>
                    </div>

                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
