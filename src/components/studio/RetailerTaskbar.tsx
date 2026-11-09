import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Pin,
  Sparkles,
  Upload,
  X,
  Check,
  Trash2,
  ExternalLink,
  MessageSquare,
  Wand2,
  Tag,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { RetailerItem, RetailerStore, RetailerCategory } from '../../types';
import { storage } from '../../services/storage';

interface RetailerTaskbarProps {
  items: RetailerItem[];
  onRefreshItems: () => void;
  onSelectForPlacement: (item: RetailerItem) => void;
  onChatAboutItem: (item: RetailerItem) => void;
  onTogglePin: (itemId: string) => void;
}

export const RetailerTaskbar: React.FC<RetailerTaskbarProps> = ({
  items,
  onRefreshItems,
  onSelectForPlacement,
  onChatAboutItem,
  onTogglePin,
}) => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Item Form State
  const [newStore, setNewStore] = useState<RetailerStore>('Amazon');
  const [newCategory, setNewCategory] = useState<RetailerCategory>('Furniture');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newColorHex, setNewColorHex] = useState('#C86446');
  const [newNotes, setNewNotes] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (activeTab === 'All') return true;
    return item.store === activeTab;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNewItem = () => {
    if (!newImage) return;

    let defaultPrompt = '';
    if (newCategory === 'Wall Paint') {
      defaultPrompt = `Paint the main wall in smooth matte ${newName || 'accent paint'} (${newColorHex})`;
    } else if (newCategory === 'Wall Sticker') {
      defaultPrompt = `Apply a modern ${newName || 'wall sticker decal'} on the primary wall above the seating`;
    } else {
      defaultPrompt = `Replace the selected object with this ${newName || 'furniture piece'} from ${newStore}`;
    }

    const newItem: RetailerItem = {
      id: `ret-${Date.now()}`,
      name: newName || `${newStore} ${newCategory} Item`,
      store: newStore,
      category: newCategory,
      price: newPrice || 'Saved from web',
      colorHex: newCategory === 'Wall Paint' ? newColorHex : undefined,
      imageUrl: newImage,
      suggestedPrompt: defaultPrompt,
      notes: newNotes || `Saved screenshot from ${newStore}`,
      isPinned: true, // pin by default when uploaded
      timestamp: Date.now(),
    };

    storage.saveRetailerItem(newItem);
    onRefreshItems();
    setIsAddModalOpen(false);

    // Reset form
    setNewName('');
    setNewPrice('');
    setNewNotes('');
    setNewImage(null);
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    storage.deleteRetailerItem(id);
    onRefreshItems();
  };

  const getStoreBadgeColor = (store: RetailerStore) => {
    switch (store) {
      case 'Amazon':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Flipkart':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'IKEA':
        return 'bg-yellow-100 text-blue-900 border-yellow-400';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-stone-200/90 shadow-sm p-4 sm:p-5 flex flex-col gap-4">
      {/* Top Header & Store Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-stone-900 font-display">
                Retailer Taskbar
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">
                Amazon • Flipkart • IKEA
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Save screenshots of furniture, wall paint & stickers to preview and place directly in your room.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Store Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200/60 text-xs">
            {['All', 'Amazon', 'Flipkart', 'IKEA'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab === 'Amazon' && '🛒 '}
                {tab === 'Flipkart' && '🛍️ '}
                {tab === 'IKEA' && '🇸🇪 '}
                {tab}
              </button>
            ))}
          </div>

          {/* Add Screenshot Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs shadow-orange-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Screenshot / Item</span>
          </button>
        </div>
      </div>

      {/* Horizontal Strip of Retailer Items */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin pt-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`flex-shrink-0 w-64 rounded-2xl border p-3 bg-stone-50/70 hover:bg-white hover:shadow-md transition-all group flex flex-col justify-between relative ${
              item.isPinned ? 'border-orange-400 ring-2 ring-orange-300/40 bg-orange-50/20' : 'border-stone-200'
            }`}
          >
            {/* Image Preview & Store Badges */}
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-200 mb-2.5">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute top-2 left-2 flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStoreBadgeColor(item.store)}`}>
                  {item.store}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                  {item.category}
                </span>
              </div>

              {/* Pin Button */}
              <button
                type="button"
                onClick={() => onTogglePin(item.id)}
                title={item.isPinned ? 'Unpin from preview' : 'Pin for room preview'}
                className={`absolute top-2 right-2 p-1.5 rounded-lg text-xs font-bold transition-all ${
                  item.isPinned
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-black/60 text-stone-200 hover:bg-black hover:text-white'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-white' : ''}`} />
              </button>

              {item.colorHex && (
                <div
                  className="absolute bottom-2 left-2 w-5 h-5 rounded-md border border-white shadow-xs"
                  style={{ backgroundColor: item.colorHex }}
                  title={`Color: ${item.colorHex}`}
                />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 mb-2">
              <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                {item.name}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-0.5">
                <span className="font-semibold text-stone-800">{item.price}</span>
                {item.isPinned && (
                  <span className="text-orange-600 font-bold text-[10px] flex items-center gap-1">
                    <Pin className="w-2.5 h-2.5 fill-orange-600" /> Pinned
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-stone-200/60">
              <button
                type="button"
                onClick={() => onSelectForPlacement(item)}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold shadow-2xs transition-all"
                title="Place or apply this item into your room"
              >
                <Wand2 className="w-3 h-3" />
                <span>Place in Room</span>
              </button>

              <button
                type="button"
                onClick={() => onChatAboutItem(item)}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold transition-all"
                title="Ask IMAGINE AI how this looks in the room"
              >
                <MessageSquare className="w-3 h-3 text-orange-600" />
                <span>Chat Idea</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= ADD SCREENSHOT MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900 font-display">
                    Save Screenshot from Retailer
                  </h3>
                  <p className="text-xs text-stone-500">
                    Amazon, Flipkart, or IKEA screenshot to save for future rooms
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              {/* Store Selector */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  1. Which Store Did You Screenshot From?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Amazon', 'Flipkart', 'IKEA'] as RetailerStore[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStore(st)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        newStore === st
                          ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-400'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {st === 'Amazon' && '🛒 Amazon'}
                      {st === 'Flipkart' && '🛍️ Flipkart'}
                      {st === 'IKEA' && '🇸🇪 IKEA'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  2. Item Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Furniture', 'Wall Paint', 'Wall Sticker', 'Lighting', 'Decor', 'Curtains'] as RetailerCategory[]).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all ${
                          newCategory === cat
                            ? 'border-stone-900 bg-stone-900 text-white font-bold'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Upload Screenshot Box */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  3. Upload Screenshot or Photo
                </label>
                {newImage ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-orange-500">
                    <img src={newImage} alt="Uploaded Item" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewImage(null)}
                      className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/80 text-white text-[11px]"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-stone-300 rounded-2xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-orange-500 hover:bg-orange-50/20 transition-all text-center">
                    <ImageIcon className="w-7 h-7 text-stone-400" />
                    <span className="font-bold text-stone-800 text-xs">
                      Drop screenshot here or Browse
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Supports phone screenshots & web snips (JPG, PNG)
                    </p>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Name & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Velvet Wing Chair, Floral Decal"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹4,999"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Optional Color Hex if Wall Paint */}
              {newCategory === 'Wall Paint' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/60 border border-orange-200">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0"
                  />
                  <div>
                    <span className="font-bold text-stone-800">Selected Paint Shade: {newColorHex}</span>
                    <p className="text-[10px] text-stone-500">
                      The AI will map this exact paint tone to your room wall
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newImage}
                onClick={handleSaveNewItem}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs shadow-orange-500/20 disabled:opacity-50 transition-all"
              >
                Save to My Taskbar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
