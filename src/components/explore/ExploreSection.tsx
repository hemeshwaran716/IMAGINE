import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Wand2,
  ArrowRight,
  Filter,
  Search,
  Castle,
  Layers,
  Check,
} from 'lucide-react';
import { INSPIRATION_ITEMS } from '../../data/mockData';
import { InspirationItem } from '../../types';

interface ExploreSectionProps {
  onTryStyle: (item: InspirationItem) => void;
  onGenerateArchitect?: (style: string, prompt?: string) => void;
}

const ARCHITECTURAL_CATEGORIES = [
  'All Architectures',
  'Modern & Minimalist',
  'Japandi & Zen',
  'Modern Brutalist',
  'Nordic & Alpine',
  'Mediterranean & French',
  'Heritage Indian Haveli',
  'Tropical & Balinese',
  'Industrial Loft',
  'Mid-Century Modern',
  'Futuristic & Eco',
];

export const ExploreSection: React.FC<ExploreSectionProps> = ({
  onTryStyle,
  onGenerateArchitect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Architectures');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = INSPIRATION_ITEMS.filter((item) => {
    // Category matching logic
    let matchesCategory = true;
    if (selectedCategory !== 'All Architectures') {
      const s = item.style.toLowerCase();
      const r = item.roomType.toLowerCase();
      const t = item.title.toLowerCase();

      switch (selectedCategory) {
        case 'Modern & Minimalist':
          matchesCategory = s.includes('minimalist') || s.includes('modern') || t.includes('minimalist');
          break;
        case 'Japandi & Zen':
          matchesCategory = s.includes('japandi') || t.includes('zen') || t.includes('japandi');
          break;
        case 'Modern Brutalist':
          matchesCategory = s.includes('brutalist') || t.includes('brutalist') || t.includes('concrete');
          break;
        case 'Nordic & Alpine':
          matchesCategory = s.includes('scandinavian') || s.includes('alpine') || t.includes('a-frame') || t.includes('chalet');
          break;
        case 'Mediterranean & French':
          matchesCategory = s.includes('mediterranean') || s.includes('french') || t.includes('stucco') || t.includes('châteaux');
          break;
        case 'Heritage Indian Haveli':
          matchesCategory = s.includes('indian') || s.includes('heritage') || t.includes('jaali') || t.includes('haveli');
          break;
        case 'Tropical & Balinese':
          matchesCategory = s.includes('tropical') || s.includes('balinese') || t.includes('balinese');
          break;
        case 'Industrial Loft':
          matchesCategory = s.includes('industrial') || t.includes('loft') || t.includes('warehouse');
          break;
        case 'Mid-Century Modern':
          matchesCategory = s.includes('mid-century') || t.includes('palm springs');
          break;
        case 'Futuristic & Eco':
          matchesCategory = s.includes('futuristic') || s.includes('parametric') || s.includes('eco') || t.includes('earthship');
          break;
        default:
          matchesCategory = true;
      }
    }

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.suggestedPrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.roomType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Master Architectural & Interior Showcase</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display">
            Explore All Architectures & Spaces
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Discover iconic architectural typologies worldwide. Tap{' '}
            <strong className="text-stone-900">&ldquo;Build in IMAGINE Architect&rdquo;</strong> to generate new 3D angles with imENRATION, or{' '}
            <strong className="text-orange-600">&ldquo;Try in Studio&rdquo;</strong> to remodel your own room.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search all architectural styles, typologies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 bg-white"
          />
        </div>
      </div>

      {/* Architectural Categories Filter Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {ARCHITECTURAL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-1 ring-orange-400'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Showing {filteredItems.length} Architectural Styles & Typologies
        </span>
      </div>

      {/* Grid of Inspiration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-xs hover:shadow-xl hover:border-orange-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/10 overflow-hidden bg-stone-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-stone-900/85 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                  {item.style}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-orange-600 text-white text-[10px] font-bold shadow-sm">
                  {item.roomType}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-base text-stone-900 font-display group-hover:text-orange-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                <div className="mt-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-0.5">
                    Suggested Vision:
                  </span>
                  <p className="text-xs font-medium text-stone-800 line-clamp-2">
                    &ldquo;{item.suggestedPrompt}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-5 pt-0 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onGenerateArchitect) {
                    onGenerateArchitect(item.style, item.suggestedPrompt);
                  }
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-[11px] font-extrabold transition-all"
                title="Architect with IMAGINE"
              >
                <Castle className="w-3.5 h-3.5 text-orange-600" />
                <span>IMAGINE Architect</span>
              </button>

              <button
                type="button"
                onClick={() => onTryStyle(item)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-orange-500 text-white text-[11px] font-extrabold shadow-sm transition-all"
                title="Open in AI Studio"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Try in Studio</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
