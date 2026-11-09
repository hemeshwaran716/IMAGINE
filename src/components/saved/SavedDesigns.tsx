import React from 'react';
import { Bookmark, Sparkles, Download, ArrowRight, Wand2, Trash2 } from 'lucide-react';
import { GenerationResult } from '../../types';
import { downloadImage } from '../../services/imageProcessing';

interface SavedDesignsProps {
  savedDesigns: GenerationResult[];
  onOpenInStudio: (gen: GenerationResult) => void;
  onRemoveFavorite: (gen: GenerationResult) => void;
}

export const SavedDesigns: React.FC<SavedDesignsProps> = ({
  savedDesigns,
  onOpenInStudio,
  onRemoveFavorite,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Curated Favourites</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 font-display">Saved Designs</h1>
        <p className="text-sm text-stone-600 mt-1">
          Review and compare all bookmarked AI transformations across your room spaces.
        </p>
      </div>

      {savedDesigns.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 max-w-md mx-auto">
          <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No saved designs yet</h3>
          <p className="text-xs text-stone-500 mt-1">
            When you generate a room transformation you love, tap &ldquo;Save Variation&rdquo; to add it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedDesigns.map((gen) => (
            <div
              key={gen.id}
              className="group rounded-3xl overflow-hidden border border-stone-200 bg-white hover:border-orange-500 hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-16/10 overflow-hidden bg-stone-900">
                  <img
                    src={gen.generatedImage}
                    alt={gen.designTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-orange-600 text-white text-[11px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Transformed
                  </span>
                  <button
                    onClick={() => onRemoveFavorite(gen)}
                    title="Remove from Saved"
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="font-bold text-base text-stone-900 font-display group-hover:text-orange-600 transition-colors">
                    {gen.designTitle}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {gen.stylingRationale}
                  </p>

                  {/* Accent Colors preview */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Palette:</span>
                    {gen.accentColors?.map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-black/10 inline-block"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <button
                  onClick={() =>
                    downloadImage(
                      gen.generatedImage,
                      `imagine-${gen.designTitle.replace(/\s+/g, '-').toLowerCase()}.jpg`
                    )
                  }
                  className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-400"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenInStudio(gen)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-900 hover:bg-orange-500 text-white text-xs font-bold transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Open in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
