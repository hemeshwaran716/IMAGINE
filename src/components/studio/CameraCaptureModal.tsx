import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(
        'Unable to access camera. Please allow camera permissions or upload an image from your files.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 bg-stone-950/80 border-b border-stone-800">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-sm font-display">Capture Room Photo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-red-400 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm">{error}</p>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured Room" className="w-full h-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
          )}

          {/* Guide Grid overlay when live */}
          {!capturedImage && !error && (
            <div className="absolute inset-0 pointer-events-none border border-white/20 grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border border-white/20"></div>
              <div className="border border-white/20"></div>
              <div className="border border-white/20"></div>
              <div className="border border-white/20"></div>
              <div className="border border-white/20"></div>
              <div className="border border-white/20"></div>
              <div className="border border-white/20"></div>
              <div className="border border-white/20"></div>
              <div className="border border-white/20"></div>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="p-4 bg-stone-950/90 flex items-center justify-between">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-medium hover:bg-stone-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Switch Camera</span>
              </button>

              <button
                type="button"
                onClick={takeSnapshot}
                className="w-14 h-14 rounded-full bg-white border-4 border-orange-500 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                title="Capture Room Photo"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500"></div>
              </button>

              <div className="w-20"></div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/30"
              >
                <Check className="w-4 h-4" />
                <span>Use This Room Photo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
