import React from 'react';
import {
  Wand2,
  Sparkles,
  ShoppingBag,
  Compass,
  ArrowRight,
  CheckCircle2,
  Layers,
  Palette,
  Eye,
  Star,
  Zap,
  Castle,
  HelpCircle,
} from 'lucide-react';
import { NavigationTab, Project, GenerationResult } from '../types';
import { SAMPLE_ROOMS, STYLE_OPTIONS, CURATED_PRODUCTS } from '../data/mockData';

interface HomeDashboardProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenProject: (project: Project) => void;
  recentProjects: Project[];
  savedDesigns: GenerationResult[];
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigateTab,
  onOpenProject,
  recentProjects,
  savedDesigns,
}) => {
  return (
    <div className="flex flex-col gap-14 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-stone-200/60 bg-gradient-to-b from-stone-100/60 via-stone-50 to-white">
        {/* Subtle decorative glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-300/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold shadow-2xs mb-6">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>IMAGINE • See it. Place it. Love it.</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight font-display leading-[1.15]">
              Imagine your space{' '}
              <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                differently.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-stone-600 font-normal leading-relaxed max-w-2xl">
              Transform your home before you spend a rupee. Test furniture, textures, wall paints, and designer styles directly inside your actual rooms with AI precision.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => onNavigateTab('studio')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all hover:scale-102 active:scale-98"
              >
                <Wand2 className="w-4 h-4 text-white" />
                <span>Visualise My Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('architect')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm shadow-md transition-all hover:scale-102 active:scale-98"
              >
                <Castle className="w-4 h-4 text-orange-400" />
                <span>IMAGEN</span>
              </button>

              <button
                onClick={() => onNavigateTab('products')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 font-bold text-sm shadow-xs transition-all hover:border-stone-300"
              >
                <ShoppingBag className="w-4 h-4 text-orange-500" />
                <span>Products</span>
              </button>

              <button
                onClick={() => onNavigateTab('explore')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-stone-100/80 hover:bg-stone-200/80 text-stone-700 font-semibold text-sm transition-all"
              >
                <Compass className="w-4 h-4 text-stone-500" />
                <span>Explore Ideas</span>
              </button>
            </div>

            {/* Value Props Row */}
            <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Preserves Original Room Structure
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Realistic Lighting & Shadows
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> IMAGINE Architecture & Critique
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Architect with IMAGINE */}
          <div
            onClick={() => onNavigateTab('architect')}
            className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 to-stone-950 text-white p-7 sm:p-9 shadow-xl border border-stone-800 cursor-pointer flex flex-col justify-between hover:border-orange-500 transition-all"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform">
                  <Castle className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
                  NEW ARCHITECT
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display group-hover:text-orange-400 transition-colors">
                Architect Your Sanctuary with IMAGEN
              </h3>
              <p className="text-sm text-stone-300 mt-2 leading-relaxed">
                Describe your house vision or upload a sketch. Generate photorealistic 3D architectural renders, create new perspectives with imENRATION, and remodel finishes live.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-stone-800 flex items-center justify-between text-xs font-bold text-orange-400">
              <span>Launch IMAGEN & imENRATION</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: "Is This Design Good?" Critique */}
          <div
            onClick={() => onNavigateTab('architect')}
            className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50/50 p-7 sm:p-9 shadow-md border border-orange-200/80 cursor-pointer flex flex-col justify-between hover:border-orange-400 transition-all"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
                  DESIGN AUDIT
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display group-hover:text-orange-600 transition-colors">
                &ldquo;Is This Design Good?&rdquo;
              </h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                Import any room photo, architectural floorplan, or Pinterest render. Get an honest professional audit of aesthetic harmony, ergonomics, lighting, and actionable redesign fixes.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-orange-200/60 flex items-center justify-between text-xs font-bold text-orange-600">
              <span>Import Image & Evaluate</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Interactive Transformation Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant AI Transformation Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 font-display">
              Try with Curated Room Spaces
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('studio')}
            className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_ROOMS.map((room) => (
            <div
              key={room.id}
              onClick={() => onNavigateTab('studio')}
              className="group relative rounded-3xl overflow-hidden border border-stone-200 bg-white hover:border-orange-500 hover:shadow-xl transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={room.url}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-bold">
                  {room.roomType}
                </span>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 group-hover:text-orange-600 transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{room.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-400">Tap to transform</span>
                  <span className="text-xs font-bold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Visualise <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Interior Styles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              <Palette className="w-3.5 h-3.5 text-orange-500" />
              <span>Design Aesthetics</span>
            </div>
            <h2 className="text-2xl font-extrabold text-stone-900 mt-1 font-display">
              Trending Interior Styles
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('explore')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            Browse all styles →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STYLE_OPTIONS.slice(0, 4).map((style) => (
            <div
              key={style.id}
              onClick={() => onNavigateTab('explore')}
              className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-orange-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="w-2 h-2 rounded-full bg-orange-500 mb-2 inline-block"></span>
                <h4 className="font-bold text-sm text-stone-900">{style.name}</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">{style.desc}</p>
              </div>
              <span className="text-[11px] font-bold text-orange-600 mt-3 flex items-center gap-1">
                Explore items <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Retail Products Placement Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>

          <div className="relative z-10 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-[11px] font-bold uppercase tracking-wider">
              Method B: Product Placement
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-3 font-display">
              Shop on Pepperfry, IKEA, or Amazon? Place it before buying.
            </h3>
            <p className="text-sm text-stone-300 mt-2 leading-relaxed">
              Upload a product screenshot or paste an image URL. Our AI extracts exact materials, legs, and proportions and renders them in your room with photorealistic lighting.
            </p>
            <button
              onClick={() => onNavigateTab('products')}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-102"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Products Ready for Placement</span>
            </button>
          </div>
        </div>
      </section>

      {/* Recent Projects & Saved Designs */}
      {recentProjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-stone-900 font-display">Your Recent Spaces</h3>
            <button
              onClick={() => onNavigateTab('spaces')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              View all spaces ({recentProjects.length}) →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentProjects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onOpenProject(proj)}
                className="group p-3 rounded-2xl border border-stone-200 bg-white hover:border-orange-500 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5"
              >
                <img
                  src={proj.originalImage}
                  alt={proj.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-orange-600">
                    {proj.name}
                  </h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">{proj.roomType}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {proj.generations?.length || 0} variations generated
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
