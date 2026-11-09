import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Bookmark,
  Sparkles,
  Maximize2,
  Minimize2,
  SplitSquareVertical,
  Columns,
  RefreshCw,
  Palette,
  Check,
  ZoomIn,
  ZoomOut,
  Share2,
} from 'lucide-react';
import { GenerationResult } from '../../types';
import { downloadImage } from '../../services/imageProcessing';

interface BeforeAfterSliderProps {
  generation: GenerationResult;
  onSaveVariation: (gen: GenerationResult) => void;
  onGenerateAnother: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  generation,
  onSaveVariation,
  onGenerateAnother,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setSliderPos((p) => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setSliderPos((p) => Math.min(100, p + 5));
  };

  const handleSave = () => {
    onSaveVariation(generation);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownload = () => {
    downloadImage(generation.generatedImage, `imagine-${generation.designTitle.replace(/\s+/g, '-').toLowerCase()}.jpg`);
  };

  return (
    <div
      className={`flex flex-col gap-4 bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto' : 'w-full'
      }`}
    >
      {/* Top Header & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold tracking-wide uppercase">
              AI Transformation Result
            </span>
            <span className="text-xs text-stone-400 font-mono">
              {new Date(generation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h3 className="text-xl font-bold text-stone-900 mt-0.5 font-display">
            {generation.designTitle}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View Mode */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('slider')}
              title="Split Slider Mode"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'slider'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Slider</span>
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              title="Side-by-side Comparison"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Side-by-Side</span>
            </button>
          </div>

          {/* Zoom controls */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
            disabled={zoomLevel <= 1}
            title="Zoom Out"
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
            disabled={zoomLevel >= 2}
            title="Zoom In"
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Image Comparison Canvas Area */}
      {viewMode === 'slider' ? (
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className="relative w-full rounded-2xl overflow-hidden bg-stone-950 select-none cursor-ew-resize focus:outline-none shadow-inner"
          style={{ height: isFullscreen ? '70vh' : '480px' }}
        >
          {/* Transformed / After Image (Underneath, full size) */}
          <img
            src={generation.generatedImage}
            alt="Transformed Room"
            className="absolute inset-0 w-full h-full object-cover transition-transform"
            style={{ transform: `scale(${zoomLevel})` }}
          />

          {/* Original / Before Image (Clipped by slider position) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={generation.originalImage}
              alt="Original Room"
              className="absolute inset-0 w-full h-full object-cover transition-transform"
              style={{
                transform: `scale(${zoomLevel})`,
                width: containerRef.current?.clientWidth || '100%',
                maxWidth: 'none',
              }}
            />
          </div>

          {/* Draggable Divider Line & Knob */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl"></div>
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-stone-900 shadow-xl flex items-center justify-center border-2 border-orange-500">
              <SplitSquareVertical className="w-4 h-4 text-orange-600" />
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-stone-900/80 backdrop-blur-md text-white text-xs font-bold pointer-events-none shadow-md">
            ORIGINAL
          </div>
          <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-orange-600/90 backdrop-blur-md text-white text-xs font-bold pointer-events-none shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AFTER AI
          </div>
        </div>
      ) : (
        /* Side by Side Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-stone-900 h-80 sm:h-96 shadow-md">
            <img
              src={generation.originalImage}
              alt="Original Room"
              className="w-full h-full object-cover"
              style={{ transform: `scale(${zoomLevel})` }}
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-stone-900/80 text-white text-xs font-bold">
              ORIGINAL
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-stone-900 h-80 sm:h-96 shadow-md border-2 border-orange-500">
            <img
              src={generation.generatedImage}
              alt="Transformed Room"
              className="w-full h-full object-cover"
              style={{ transform: `scale(${zoomLevel})` }}
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-orange-600 text-white text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              AFTER TRANSFORMATION
            </div>
          </div>
        </div>
      )}

      {/* Designer Review, Critique & Accent Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Designer Rationale & Spatial Aesthetics
            </h4>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">
            {generation.stylingRationale}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Suggested Pairs:</span>
            {generation.suggestedAccessories?.map((acc, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs font-medium text-stone-700 shadow-2xs"
              >
                + {acc}
              </span>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Palette className="w-4 h-4 text-orange-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Harmonized Palette
              </h4>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {generation.accentColors?.map((hex, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-xl shadow-inner border border-black/10"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[10px] font-mono text-stone-500">{hex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onGenerateAnother}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Generate Another Variation</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-stone-200 text-stone-700 hover:border-orange-500 hover:text-orange-600'
            }`}
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved to Project' : 'Save Variation'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res</span>
          </button>
        </div>
      </div>
    </div>
  );
};
