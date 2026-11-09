import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Pin,
  Wand2,
  X,
  Bot,
  User,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RetailerItem, DetectedObject } from '../../types';

interface StudioIdeaChatProps {
  roomImage: string;
  detectedObjects: DetectedObject[];
  pinnedItems: RetailerItem[];
  onApplyTransformation: (prompt: string, productRef?: { name: string; imageUrl: string }) => void;
  onSelectObject: (obj: DetectedObject) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

interface ChatEntry {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionPrompt?: string;
  actionProduct?: { name: string; imageUrl: string };
  actionObjectCategory?: string;
}

export const StudioIdeaChat: React.FC<StudioIdeaChatProps> = ({
  roomImage,
  detectedObjects,
  pinnedItems,
  onApplyTransformation,
  onSelectObject,
  isOpen,
  onToggleOpen,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hi! I am IMAGINE AI. Ask me any design idea for your room! If you dislike a chair or table, pin a screenshot from Amazon, Flipkart, or IKEA, and tell me: "Replace this chair with my pinned item" or "Add a wall sticker here".`,
      actionPrompt: pinnedItems[0]
        ? pinnedItems[0].suggestedPrompt
        : 'Replace chair with modern velvet armchair from Amazon',
    },
  ]);

  const activePinned = pinnedItems[0] || null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatEntry = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      // Intelligent spatial response synthesizing room elements + pinned items
      const lower = text.toLowerCase();
      let reply = '';
      let promptToApply = '';
      let productRef: { name: string; imageUrl: string } | undefined;
      let targetCat = 'Chair';

      if (lower.includes('dislike') || lower.includes('chair') || lower.includes('sofa') || lower.includes('replace')) {
        const chairItem = pinnedItems.find((p) => p.category === 'Furniture') || activePinned;
        if (chairItem) {
          reply = `Great idea! I'll replace the existing seating with your pinned "${chairItem.name}" from ${chairItem.store}. It will fit the room's scale, matching natural shadows and wood tones.`;
          promptToApply = `Replace the existing chair with ${chairItem.name} from ${chairItem.store}, preserving original floor and natural lighting`;
          productRef = { name: chairItem.name, imageUrl: chairItem.imageUrl };
        } else {
          reply = `I noticed you want to upgrade the seating. You can pin any chair screenshot from Amazon or IKEA in the taskbar above, or tap below to transform it into an emerald green velvet armchair.`;
          promptToApply = `Transform this chair into an emerald green molded velvet armchair with tapered brass legs`;
        }
      } else if (lower.includes('paint') || lower.includes('wall') || lower.includes('color')) {
        const paintItem = pinnedItems.find((p) => p.category === 'Wall Paint');
        if (paintItem) {
          reply = `Painting the main accent wall with ${paintItem.name} (${paintItem.colorHex || 'Terracotta'}) will bring warm grounding warmth and balance the daylight beautifully!`;
          promptToApply = paintItem.suggestedPrompt || `Repaint the main accent wall with ${paintItem.name}`;
          targetCat = 'Wall';
        } else {
          reply = `A rich terracotta limewash or soothing sage plaster on the back wall would add high-end depth while keeping the space airy.`;
          promptToApply = `Repaint the back wall in smooth matte terracotta limewash with subtle warm undertones`;
          targetCat = 'Wall';
        }
      } else if (lower.includes('sticker') || lower.includes('decal')) {
        const stickerItem = pinnedItems.find((p) => p.category === 'Wall Sticker');
        reply = `A modern ${stickerItem ? stickerItem.name : 'botanical monstera wall decal'} placed above the primary seating will create an organic focal point without damaging the wall.`;
        promptToApply = stickerItem?.suggestedPrompt || `Apply a botanical monstera and palm leaves wall sticker decal as an artistic accent above the seating`;
        targetCat = 'Wall';
      } else {
        reply = `Based on your room's natural lighting and dimensions, I recommend pairing textured upholstery (like velvet or bouclé) with brass accents or adding a warm accent wall. What specific item would you like to swap?`;
        promptToApply = `Enhance room with modern styling, velvet textures, and ambient warm illumination`;
      }

      // Auto-target matching detected object if available
      const matchedObj = detectedObjects.find(
        (o) => o.category.toLowerCase() === targetCat.toLowerCase()
      );
      if (matchedObj) {
        onSelectObject(matchedObj);
      }

      const aiMsg: ChatEntry = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        actionPrompt: promptToApply,
        actionProduct: productRef,
        actionObjectCategory: targetCat,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div
        onClick={onToggleOpen}
        className="flex items-center justify-between p-4 cursor-pointer bg-stone-50/70 hover:bg-stone-100 transition-colors border-b border-stone-200/60"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs text-stone-900 font-display">
                IMAGINE Studio Idea Chat
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-stone-500">
              Chat what to change, dislike, or replace with Amazon/Flipkart/IKEA screenshots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activePinned && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
              <Pin className="w-2.5 h-2.5 fill-orange-800" />
              <span>{activePinned.store}: {activePinned.name.slice(0, 20)}...</span>
            </span>
          )}
          <button className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Chat Body */}
      {isOpen && (
        <div className="p-4 flex flex-col gap-3">
          {/* Quick Idea Starters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-stone-400 font-bold text-[10px] uppercase whitespace-nowrap">
              Try asking:
            </span>
            <button
              onClick={() => handleSend('I dislike this chair, replace it with my pinned Amazon item')}
              className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-orange-50 hover:text-orange-700 border border-stone-200/60 text-stone-700 whitespace-nowrap transition-colors"
            >
              &ldquo;I dislike this chair, replace with pinned item&rdquo;
            </button>
            <button
              onClick={() => handleSend('How will the Terracotta wall paint from Amazon look on my back wall?')}
              className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-orange-50 hover:text-orange-700 border border-stone-200/60 text-stone-700 whitespace-nowrap transition-colors"
            >
              &ldquo;Try Terracotta wall paint on back wall&rdquo;
            </button>
            <button
              onClick={() => handleSend('Add a botanical wall sticker decal from Flipkart above the sofa')}
              className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-orange-50 hover:text-orange-700 border border-stone-200/60 text-stone-700 whitespace-nowrap transition-colors"
            >
              &ldquo;Add wall sticker decal above sofa&rdquo;
            </button>
          </div>

          {/* Messages Container */}
          <div className="max-h-56 overflow-y-auto space-y-3 pr-1 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-stone-900 text-white rounded-tr-xs'
                      : 'bg-stone-100 text-stone-800 rounded-tl-xs'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* 1-Click Action Button from AI */}
                  {m.actionPrompt && (
                    <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-orange-600 truncate">
                        ✨ Suggested: {m.actionPrompt.slice(0, 45)}...
                      </span>
                      <button
                        onClick={() => onApplyTransformation(m.actionPrompt!, m.actionProduct)}
                        className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold shadow-2xs transition-all flex items-center gap-1 flex-shrink-0"
                      >
                        <Wand2 className="w-2.5 h-2.5" />
                        <span>Apply to Room</span>
                      </button>
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-stone-300 text-stone-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-stone-400 text-xs italic">
                <Bot className="w-3.5 h-3.5 text-orange-500" />
                <span>IMAGINE AI is evaluating your room idea...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60">
            <input
              type="text"
              placeholder="e.g. I dislike this chair, replace it with the velvet armchair on Amazon..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 bg-stone-50"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40 transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
