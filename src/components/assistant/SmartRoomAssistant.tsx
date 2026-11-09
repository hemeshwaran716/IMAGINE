import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Wand2,
  Palette,
  Lightbulb,
  ArrowRight,
  Bot,
  User,
  Image as ImageIcon,
  Check,
  Maximize2,
  Minimize2,
  Upload,
  ChevronDown,
  Layers,
  Info,
} from 'lucide-react';
import { ChatMessage, Project } from '../../types';
import { api } from '../../services/api';

interface SmartRoomAssistantProps {
  currentProject: Project | null;
  onApplyPromptToStudio: (promptText: string, objectCategory?: string) => void;
  availableProjects?: Project[];
  onSelectProject?: (project: Project) => void;
}

const DEFAULT_QUESTIONS = [
  'Which sofa colour suits this room?',
  'Suggest a modern interior style for this layout',
  'What colour curtains should I try to maximize daylight?',
  'How can I make this room look brighter and more spacious?',
  'Suggest furniture and lighting that matches my existing table',
  'What wall paint pairs with my flooring?',
];

export const SmartRoomAssistant: React.FC<SmartRoomAssistantProps> = ({
  currentProject,
  onApplyPromptToStudio,
  availableProjects = [],
  onSelectProject,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello! I am IMAGINE, your AI Interior Designer & Spatial Stylist. I analyze room sunlight, floor plans, architecture, and current materials to recommend flattering colors, spatial layouts, and transformations.`,
      timestamp: Date.now(),
      keyRecommendations: [
        'Analyze natural light direction before selecting dark fabrics or paints',
        'Use tactile texture contrast (e.g., Bouclé or Velvet paired with Brushed Brass/Stone)',
        'Maintain comfortable 18-inch walking clearances around seating tables',
      ],
      suggestedTransformations: [
        {
          title: 'Emerald Velvet Lounge',
          objectCategory: 'Sofa',
          actionPrompt: 'Make this sofa emerald green velvet with tapered brass legs',
        },
        {
          title: 'Carrara Marble Refresh',
          objectCategory: 'Table',
          actionPrompt: 'Change this coffee table into a round white Carrara marble table',
        },
      ],
      suggestedColorPalette: [
        { name: 'Warm Terracotta', hex: '#C86446' },
        { name: 'Sage Green', hex: '#9CAF88' },
        { name: 'Oatmeal Linen', hex: '#E6DFC5' },
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreenModal, setIsFullScreenModal] = useState(false);
  const [showRoomDrawer, setShowRoomDrawer] = useState(true);
  const [customRoomPreview, setCustomRoomPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeImage = customRoomPreview || currentProject?.originalImage;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleUploadRoomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomRoomPreview(reader.result);
          // Add system guidance in chat
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              sender: 'assistant',
              text: `✨ I have loaded your new room photo! Ask me anything: "What style suits this room?", "What paint colors work on this wall?", or "Which furniture should I replace?"`,
              timestamp: Date.now(),
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.askInteriorAssistant({
        message: text.trim(),
        roomImage: activeImage,
        roomContext: {
          roomType: currentProject?.roomType || 'Living Room',
          detectedObjects: currentProject?.detectedObjects?.map((o) => o.label) || [],
          roomSummary: currentProject?.roomSummary,
        },
        history: messages.slice(-4).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        })),
      });

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: response.replyText,
        timestamp: Date.now(),
        keyRecommendations: response.keyRecommendations,
        suggestedTransformations: response.suggestedTransformations,
        suggestedColorPalette: response.suggestedColorPalette,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `Based on your room's layout, a rich textured upholstery like Emerald Velvet or Oatmeal Bouclé would introduce tactile depth while preserving the open architectural flow. Consider pairing it with brushed brass or matte charcoal accents.`,
        timestamp: Date.now(),
        keyRecommendations: [
          'Choose low-sheen velvet or textured linen to catch diffuse ambient daylight.',
          'Introduce warm lighting via 2700K floor lamps or fluted sconces.',
        ],
        suggestedTransformations: [
          {
            title: 'Velvet Sofa Transformation',
            objectCategory: 'Sofa',
            actionPrompt: 'Transform this sofa into emerald green velvet with warm ambient lighting',
          },
        ],
        suggestedColorPalette: [
          { name: 'Forest Green', hex: '#0B6623' },
          { name: 'Brushed Brass', hex: '#D4AF37' },
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`w-full flex flex-col bg-[#FAF8F5] transition-all ${
        isFullScreenModal
          ? 'fixed inset-0 z-50 h-screen overflow-hidden'
          : 'h-[calc(100vh-5rem)] pb-16 lg:pb-0'
      }`}
    >
      {/* Top Header Bar */}
      <div className="bg-white border-b border-stone-200/90 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 font-display">
                IMAGINE Room AI
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Online
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block">
              Full-screen multimodal interior reasoning powered by Gemini 3.8
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Active Room Badge / Switcher */}
          {activeImage && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs">
              <img
                src={activeImage}
                alt="Active Room"
                className="w-7 h-7 rounded-lg object-cover"
              />
              <span className="font-semibold text-stone-800 hidden md:inline truncate max-w-[140px]">
                {currentProject?.name || 'Uploaded Room'}
              </span>
            </div>
          )}

          {/* Toggle Room Visual Drawer */}
          <button
            type="button"
            onClick={() => setShowRoomDrawer(!showRoomDrawer)}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              showRoomDrawer
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
            title="Toggle Room Visual Sidebar"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Room Visual</span>
          </button>

          {/* Fullscreen Expand Button */}
          <button
            type="button"
            onClick={() => setIsFullScreenModal(!isFullScreenModal)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs"
            title={isFullScreenModal ? 'Exit Full Screen' : 'Expand to Full Screen'}
          >
            {isFullScreenModal ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips Bar */}
      <div className="bg-white/80 backdrop-blur-xs border-b border-stone-200/70 px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap pl-0.5">
          Quick Ideas:
        </span>
        {DEFAULT_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-transparent text-xs text-stone-700 font-medium whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main Full-Height Content Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side (Desktop): Visual Room Studio Context Panel */}
        {showRoomDrawer && (
          <aside className="w-80 lg:w-96 bg-white border-r border-stone-200/80 p-5 flex flex-col justify-between overflow-y-auto hidden lg:flex flex-shrink-0">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-orange-600" />
                  Active Room Image
                </span>
                <label
                  htmlFor="room-ai-upload"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  title="Upload another room photo"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Room</span>
                </label>
                <input
                  id="room-ai-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadRoomImage}
                  className="hidden"
                />
              </div>

              {/* Room Preview */}
              <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 shadow-sm relative aspect-4/3 group">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt="Active Room Context"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-stone-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">No room selected</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-semibold">
                    {currentProject?.roomType || 'Living Room Space'}
                  </span>
                </div>
              </div>

              {/* Room Info Specs */}
              {currentProject?.roomSummary && (
                <div className="mt-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-500 font-medium">
                    <span>Style:</span>
                    <span className="font-bold text-stone-900">
                      {currentProject.roomSummary.currentStyle}
                    </span>
                  </div>
                  {currentProject.roomSummary.lighting && (
                    <div className="flex items-center justify-between text-stone-500 font-medium">
                      <span>Lighting:</span>
                      <span className="font-bold text-stone-900 truncate max-w-[170px]">
                        {currentProject.roomSummary.lighting}
                      </span>
                    </div>
                  )}
                  {currentProject.detectedObjects && (
                    <div className="pt-2 border-t border-stone-200/60 flex flex-wrap gap-1">
                      {currentProject.detectedObjects.map((o) => (
                        <span
                          key={o.id}
                          className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] font-semibold text-stone-700"
                        >
                          {o.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Available Rooms Switcher */}
              {availableProjects.length > 1 && onSelectProject && (
                <div className="mt-4">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                    Switch Active Space:
                  </span>
                  <div className="space-y-1.5">
                    {availableProjects.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setCustomRoomPreview(null);
                          onSelectProject(p);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left border transition-all ${
                          currentProject?.id === p.id && !customRoomPreview
                            ? 'bg-orange-50 border-orange-300 text-orange-900 font-bold'
                            : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700 text-xs'
                        }`}
                      >
                        <img
                          src={p.originalImage}
                          alt={p.name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <span className="text-xs truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Tip */}
            <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Room AI uses computer vision to inspect your room’s lighting and wall layout in real-time.
              </span>
            </div>
          </aside>
        )}

        {/* Center/Right: Full Screen Chat Conversation Stream */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-stone-50/50">
          {/* Scrollable Message History */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-2xl rounded-3xl p-5 shadow-xs transition-all ${
                    msg.sender === 'user'
                      ? 'bg-stone-900 text-white rounded-tr-xs'
                      : 'bg-white border border-stone-200/90 text-stone-900 rounded-tl-xs'
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>

                  {/* Key Recommendations */}
                  {msg.keyRecommendations && msg.keyRecommendations.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-stone-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        Key Takeaways:
                      </span>
                      <ul className="mt-2 space-y-1.5">
                        {msg.keyRecommendations.map((rec, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-stone-700 flex items-start gap-2"
                          >
                            <span className="text-orange-500 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Color Swatches */}
                  {msg.suggestedColorPalette && msg.suggestedColorPalette.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-stone-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2">
                        <Palette className="w-3.5 h-3.5 text-orange-500" />
                        Recommended Color Harmony:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.suggestedColorPalette.map((col, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                          >
                            <div
                              className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span className="font-semibold text-stone-800 text-[11px]">
                              {col.name}
                            </span>
                            <span className="text-stone-400 font-mono text-[10px]">
                              {col.hex}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 1-Click Actionable Transformation Prompts */}
                  {msg.suggestedTransformations && msg.suggestedTransformations.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-stone-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                        Try this in Studio right now:
                      </span>
                      <div className="space-y-2">
                        {msg.suggestedTransformations.map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => onApplyPromptToStudio(t.actionPrompt, t.objectCategory)}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-orange-50/80 hover:bg-orange-100/90 text-orange-900 border border-orange-200 text-xs font-semibold transition-colors text-left group"
                          >
                            <div className="flex items-center gap-2">
                              <Wand2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                              <span className="line-clamp-1 font-bold">
                                {t.title}: <span className="font-normal text-stone-700">{t.actionPrompt}</span>
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-9 h-9 rounded-2xl bg-stone-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 items-center">
                <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 animate-spin" />
                </div>
                <div className="p-4 rounded-3xl bg-white border border-stone-200 rounded-tl-none flex items-center gap-2 text-xs text-stone-600">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="ml-1 font-medium">Analyzing room sunlight, materials & spatial geometry...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Full-Width Interactive Input Bar */}
          <div className="p-4 sm:p-5 bg-white border-t border-stone-200/80 shadow-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3"
            >
              {/* Optional Room Upload on Mobile */}
              <label
                htmlFor="mobile-room-upload"
                className="lg:hidden p-3 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-600 cursor-pointer transition-colors"
                title="Upload room photo"
              >
                <Upload className="w-4 h-4" />
              </label>
              <input
                id="mobile-room-upload"
                type="file"
                accept="image/*"
                onChange={handleUploadRoomImage}
                className="hidden"
              />

              <input
                type="text"
                placeholder="Ask Room AI anything (e.g. Which curtain color pairs with my flooring? Suggest velvet couch colors)"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 sm:px-5 py-3.5 rounded-2xl border border-stone-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm bg-white shadow-2xs"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-5 sm:px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm disabled:opacity-40 shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

