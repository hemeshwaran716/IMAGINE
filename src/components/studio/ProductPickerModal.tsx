import React, { useState } from 'react';
import { X, Search, Upload, Link, Check, ShoppingBag, Sparkles, Pin } from 'lucide-react';
import { CURATED_PRODUCTS } from '../../data/mockData';
import { ProductItem } from '../../types';
import { storage } from '../../services/storage';

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: { name: string; imageUrl: string; material?: string }) => void;
}

export const ProductPickerModal: React.FC<ProductPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'retailer' | 'upload' | 'url'>('retailer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customUrl, setCustomUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const retailerItems = storage.getRetailerItems();

  const categories = ['All', 'Sofas', 'Tables', 'Chairs', 'Beds', 'Curtains', 'Rugs', 'Lamps'];

  const filteredProducts = CURATED_PRODUCTS.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.retailer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmCustom = () => {
    if (activeTab === 'upload' && uploadedImage) {
      onSelectProduct({
        name: customName || 'Uploaded Custom Furniture Product',
        imageUrl: uploadedImage,
      });
      onClose();
    } else if (activeTab === 'url' && customUrl) {
      onSelectProduct({
        name: customName || 'Web Product Reference',
        imageUrl: customUrl,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-lg text-stone-900 font-display">
                Select Reference Product
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              The AI will extract shape, texture, material, and legs to place directly into your room.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-stone-100 bg-stone-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('retailer')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'retailer'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            🛒 My Saved Retailer Items (Amazon, Flipkart, IKEA)
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'catalog'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Curated Catalog
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'upload'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Upload Screenshot
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'url'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Paste URL
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'retailer' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Select Item Saved from Amazon, Flipkart, or IKEA ({retailerItems.length})
                </span>
                <span className="text-[11px] text-stone-500">Tap to place directly in your room</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {retailerItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectProduct({
                        name: item.name,
                        imageUrl: item.imageUrl,
                        material: item.category,
                      });
                      onClose();
                    }}
                    className="group border border-stone-200 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col justify-between"
                  >
                    <div className="relative aspect-square overflow-hidden bg-stone-100">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/85 backdrop-blur-xs text-[10px] font-bold text-white">
                        {item.store}
                      </span>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-orange-600 text-white text-[10px] font-bold">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-orange-600">
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="font-semibold text-stone-700">{item.price}</span>
                        <span className="text-[10px] text-orange-600 font-bold">Select ➔</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'catalog' && (
            <div className="flex flex-col gap-4">
              {/* Search & Category Pills */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search furniture, retailer, material..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onSelectProduct({
                        name: prod.name,
                        imageUrl: prod.imageUrl,
                        material: prod.material,
                      });
                      onClose();
                    }}
                    className="group border border-stone-200 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col"
                  >
                    <div className="relative aspect-square overflow-hidden bg-stone-100">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-[10px] font-bold text-white">
                        {prod.retailer}
                      </span>
                    </div>
                    <div className="p-3 flex flex-col flex-1 justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-orange-600">
                          {prod.name}
                        </h4>
                        <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                          {prod.material}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-stone-900">
                          ₹{prod.priceINR.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-orange-600 flex items-center gap-0.5">
                          Select <Check className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              {uploadedImage ? (
                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                  <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-md">
                    <img
                      src={uploadedImage}
                      alt="Uploaded Product"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-stone-900/80 text-white hover:bg-stone-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Product name / description (optional)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={handleConfirmCustom}
                    className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/30"
                  >
                    Use This Product Reference
                  </button>
                </div>
              ) : (
                <label className="w-full max-w-md border-2 border-dashed border-stone-300 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-orange-500 hover:bg-orange-50/20 transition-all text-center">
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800">
                      Upload Product Photo or Screenshot
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      Snap or upload a screenshot from Pepperfry, Amazon, IKEA, or Flipkart (JPG, PNG, WEBP)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="flex flex-col items-center justify-center gap-4 py-8 max-w-md mx-auto">
              <div className="w-full">
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Direct Product Image URL:
                </label>
                <div className="relative">
                  <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/product-image.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {customUrl && (
                <div className="w-40 h-40 rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100">
                  <img
                    src={customUrl}
                    alt="Preview"
                    onError={() => alert('Unable to preview image from URL')}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <input
                type="text"
                placeholder="Product name (e.g. Fluted Marble Console Table)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
              />

              <button
                disabled={!customUrl}
                onClick={handleConfirmCustom}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-orange-500/30"
              >
                Use URL Reference
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
