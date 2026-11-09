import React from 'react';
import { Pin, X, Wand2, ShoppingBag } from 'lucide-react';
import { RetailerItem } from '../../types';

interface PinnedItemsOverlayProps {
  pinnedItems: RetailerItem[];
  onUnpin: (id: string) => void;
  onApplyItem: (item: RetailerItem) => void;
}

export const PinnedItemsOverlay: React.FC<PinnedItemsOverlayProps> = ({
  pinnedItems,
  onUnpin,
  onApplyItem,
}) => {
  if (pinnedItems.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 max-w-[280px] pointer-events-auto">
      {pinnedItems.map((item) => (
        <div
          key={item.id}
          className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-orange-300 shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute top-0.5 left-0.5 p-0.5 rounded-xs bg-orange-500 text-white">
              <Pin className="w-2.5 h-2.5 fill-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.2 rounded-xs bg-stone-900 text-white text-[9px] font-bold uppercase">
                {item.store}
              </span>
              <span className="text-[10px] text-stone-500 font-semibold truncate">
                {item.category}
              </span>
            </div>
            <h5 className="text-[11px] font-bold text-stone-900 truncate mt-0.5">
              {item.name}
            </h5>
            <div className="flex items-center gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => onApplyItem(item)}
                className="px-2 py-0.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs"
              >
                <Wand2 className="w-2.5 h-2.5" />
                <span>Place</span>
              </button>
              <button
                type="button"
                onClick={() => onUnpin(item.id)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                title="Unpin"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
