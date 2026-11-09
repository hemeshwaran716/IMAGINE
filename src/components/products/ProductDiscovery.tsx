import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Wand2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Tag,
  Check,
} from 'lucide-react';
import { CURATED_PRODUCTS } from '../../data/mockData';
import { ProductItem } from '../../types';

interface ProductDiscoveryProps {
  onPlaceProductInRoom: (product: ProductItem) => void;
}

export const ProductDiscovery: React.FC<ProductDiscoveryProps> = ({ onPlaceProductInRoom }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRetailer, setSelectedRetailer] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Sofas',
    'Tables',
    'Chairs',
    'Beds',
    'Curtains',
    'Rugs',
    'Lamps',
    'Wall decorations',
  ];

  const retailers = ['All', 'IKEA India', 'Pepperfry', 'Urban Ladder', 'Amazon India', 'West Elm'];

  const filtered = CURATED_PRODUCTS.filter((prod) => {
    const matchesCat = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesRetailer = selectedRetailer === 'All' || prod.retailer === selectedRetailer;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.style.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesRetailer && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Retailer Catalog & Product Placement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display">
            Discover Home Decor & Furniture
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            Browse verified products from top Indian retailers. Click &ldquo;Visualise in My Room&rdquo; to place them directly into your uploaded space.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search sofas, marble tables, lamps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 bg-white"
          />
        </div>
      </div>

      {/* Filter Bars */}
      <div className="flex flex-col gap-3 mb-8">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider pl-1 mr-2">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Retailers */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider pl-1 mr-2">
            Retailer:
          </span>
          {retailers.map((ret) => (
            <button
              key={ret}
              onClick={() => setSelectedRetailer(ret)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRetailer === ret
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {ret}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((prod) => (
          <div
            key={prod.id}
            className="group rounded-3xl overflow-hidden border border-stone-200 bg-white hover:border-orange-400 hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-stone-100">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                  {prod.retailer}
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-orange-600/90 text-white text-[10px] font-semibold">
                  {prod.style}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-base font-extrabold text-stone-900">
                    ₹{prod.priceINR.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">{prod.dimensions}</span>
                </div>

                <h3 className="font-bold text-sm text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1 font-display">
                  {prod.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.description}</p>

                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-stone-600">
                  <Tag className="w-3.5 h-3.5 text-stone-400" />
                  <span className="line-clamp-1 font-medium">{prod.material}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 pt-0">
              <button
                onClick={() => onPlaceProductInRoom(prod)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-102"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Visualise in My Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
