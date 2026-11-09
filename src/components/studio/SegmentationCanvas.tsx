import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Paintbrush,
  Eraser,
  Undo2,
  Redo2,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { DetectedObject } from '../../types';

interface SegmentationCanvasProps {
  imageSrc: string;
  detectedObjects: DetectedObject[];
  selectedObject: DetectedObject | null;
  onSelectObject: (obj: DetectedObject | null) => void;
  onMaskChange: (maskDataUrl: string) => void;
}

export const SegmentationCanvas: React.FC<SegmentationCanvasProps> = ({
  imageSrc,
  detectedObjects,
  selectedObject,
  onSelectObject,
  onMaskChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const [activeTool, setActiveTool] = useState<'smart' | 'brush' | 'eraser'>('smart');
  const [brushSize, setBrushSize] = useState<number>(30);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  // Load image onto base canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      const imageCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!imageCanvas || !maskCanvas) return;

      imageCanvas.width = img.naturalWidth;
      imageCanvas.height = img.naturalHeight;
      maskCanvas.width = img.naturalWidth;
      maskCanvas.height = img.naturalHeight;

      const imgCtx = imageCanvas.getContext('2d');
      if (imgCtx) {
        imgCtx.drawImage(img, 0, 0);
      }

      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        // Save initial blank state
        const initialData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        setHistory([initialData]);
        setHistoryStep(0);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Sync mask canvas when selectedObject changes via AI detection
  useEffect(() => {
    if (!selectedObject) return;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    const [ymin, xmin, ymax, xmax] = selectedObject.box2d;
    const x = (xmin / 1000) * maskCanvas.width;
    const y = (ymin / 1000) * maskCanvas.height;
    const w = ((xmax - xmin) / 1000) * maskCanvas.width;
    const h = ((ymax - ymin) / 1000) * maskCanvas.height;

    // Draw solid mask on mask canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(w, h) * 0.08);
    ctx.fill();

    const currentData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    setHistory((prev) => [...prev.slice(0, historyStep + 1), currentData]);
    setHistoryStep((prev) => prev + 1);

    onMaskChange(maskCanvas.toDataURL('image/png'));
  }, [selectedObject]);

  // Helper to get coordinates on natural image resolution
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'smart') return;
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'smart') return;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    ctx.save();
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    // Record history
    const currentData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const updatedHistory = [...history.slice(0, historyStep + 1), currentData];
    setHistory(updatedHistory);
    setHistoryStep(updatedHistory.length - 1);

    onMaskChange(maskCanvas.toDataURL('image/png'));
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const nextStep = historyStep - 1;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[nextStep], 0, 0);
    setHistoryStep(nextStep);
    onMaskChange(maskCanvas.toDataURL('image/png'));
  };

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;
    const nextStep = historyStep + 1;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[nextStep], 0, 0);
    setHistoryStep(nextStep);
    onMaskChange(maskCanvas.toDataURL('image/png'));
  };

  const handleReset = () => {
    onSelectObject(null);
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    const blankData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    setHistory([blankData]);
    setHistoryStep(0);
    onMaskChange('');
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white/95 backdrop-blur-sm rounded-2xl border border-stone-200 shadow-sm">
        {/* Tool Mode selector */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTool('smart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTool === 'smart'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Detect</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('brush')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTool === 'brush'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Brush</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTool === 'eraser'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>
        </div>

        {/* Brush Size Slider (shown when Brush or Eraser active) */}
        {activeTool !== 'smart' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-[11px] font-medium text-stone-500">Size:</span>
            <input
              type="range"
              min="5"
              max="80"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20 sm:w-28 accent-orange-500 h-1.5 bg-stone-200 rounded-lg"
            />
            <span className="text-[11px] font-mono text-stone-700 w-6">{brushSize}px</span>
          </div>
        )}

        {/* Undo, Redo, Reset, Overlay toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyStep <= 0}
            title="Undo"
            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            title="Redo"
            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowOverlay(!showOverlay)}
            title={showOverlay ? 'Hide Mask Overlay' : 'Show Mask Overlay'}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          >
            {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-stone-400" />}
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Reset All Selection"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-inner flex items-center justify-center select-none"
        style={{ minHeight: '380px', maxHeight: '620px' }}
      >
        {/* Base room image canvas */}
        <canvas
          ref={imageCanvasRef}
          className="max-w-full max-h-[600px] object-contain block mx-auto"
        />

        {/* Hidden or overlay mask canvas */}
        <canvas
          ref={maskCanvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 w-full h-full object-contain mx-auto ${
            activeTool !== 'smart' ? 'cursor-crosshair' : 'pointer-events-none'
          } ${showOverlay ? 'opacity-40 filter hue-rotate-180 contrast-125' : 'opacity-0'}`}
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Interactive Smart Bounding Boxes (Shown in 'smart' mode) */}
        {activeTool === 'smart' && (
          <div className="absolute inset-0 pointer-events-none">
            {detectedObjects.map((obj) => {
              const [ymin, xmin, ymax, xmax] = obj.box2d;
              const isSelected = selectedObject?.id === obj.id;
              return (
                <div
                  key={obj.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectObject(isSelected ? null : obj);
                  }}
                  className={`pointer-events-auto absolute transition-all cursor-pointer rounded-xl border-2 flex flex-col justify-start p-1.5 group ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/30 ring-2 ring-orange-400'
                      : 'border-white/50 bg-white/10 hover:border-orange-400 hover:bg-orange-500/15 backdrop-blur-[1px]'
                  }`}
                  style={{
                    top: `${ymin / 10}%`,
                    left: `${xmin / 10}%`,
                    width: `${(xmax - xmin) / 10}%`,
                    height: `${(ymax - ymin) / 10}%`,
                  }}
                >
                  <div className="flex items-center gap-1 self-start">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1 shadow-sm transition-colors ${
                        isSelected
                          ? 'bg-orange-600 text-white'
                          : 'bg-stone-900/80 text-white group-hover:bg-orange-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                      {obj.category}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="mt-auto hidden sm:block bg-stone-900/90 text-white text-[10px] p-1.5 rounded-lg backdrop-blur-md">
                      <p className="font-semibold line-clamp-1">{obj.label}</p>
                      {obj.currentColor && (
                        <p className="text-stone-300 text-[9px] line-clamp-1">
                          Current: {obj.currentColor} • {obj.currentMaterial}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detected Objects Quick Pills below Canvas */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span className="font-medium">
            Detected Objects ({detectedObjects.length}): Tap to select or use manual brush
          </span>
          {selectedObject && (
            <span className="font-semibold text-orange-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Selected: {selectedObject.label}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {detectedObjects.map((obj) => {
            const isSelected = selectedObject?.id === obj.id;
            return (
              <button
                key={obj.id}
                type="button"
                onClick={() => onSelectObject(isSelected ? null : obj)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/30'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-orange-300 hover:bg-orange-50/50'
                }`}
              >
                <span>{obj.category}:</span>
                <span className="font-semibold">{obj.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
