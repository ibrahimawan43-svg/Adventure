import React, { useState } from 'react';
import { ImageSizeOption } from '../types';
import { X, Download, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt?: string;
  artStyle: string;
  currentSize: ImageSizeOption;
  onRegenerate: (size: ImageSizeOption) => Promise<void>;
  isGenerating: boolean;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  artStyle,
  currentSize,
  onRegenerate,
  isGenerating,
}) => {
  const [selectedSize, setSelectedSize] = useState<ImageSizeOption>(currentSize);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `chronicle-scene-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] z-10">
        {/* Top Header */}
        <div className="p-3.5 px-4 bg-stone-900/80 border-b border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span className="font-display font-semibold text-stone-200">
              High-Fidelity Scene Illustration
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700">
              gemini-3-pro-image-preview
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Display */}
        <div className="flex-1 overflow-auto bg-stone-950 flex items-center justify-center p-2 min-h-[300px]">
          {isGenerating ? (
            <div className="flex flex-col items-center space-y-3 p-12">
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-display text-amber-400 tracking-wider uppercase">
                Generating {selectedSize} Illustration...
              </p>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="Chapter Scene"
              className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>

        {/* Bottom Toolbar: Resolution Affordance (1K, 2K, 4K) & Re-render */}
        <div className="p-4 bg-stone-900/90 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Resolution Picker (1K, 2K, 4K) */}
          <div className="flex items-center space-x-2">
            <span className="text-stone-400 font-medium">Resolution Affordance:</span>
            <div className="flex space-x-1 font-mono">
              {(['1K', '2K', '4K'] as ImageSizeOption[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    selectedSize === size
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              onClick={() => onRegenerate(selectedSize)}
              disabled={isGenerating}
              className="ml-2 px-3 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Render at {selectedSize}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center space-x-1.5 transition-colors border border-stone-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Image</span>
            </button>
          </div>
        </div>

        {/* Prompt detail footer */}
        {prompt && (
          <div className="px-4 py-2 bg-stone-950 border-t border-stone-800/80 text-[11px] text-stone-400 flex items-center space-x-2">
            <span className="text-amber-500 font-semibold shrink-0">Prompt Anchor:</span>
            <span className="truncate italic">"{prompt}"</span>
          </div>
        )}
      </div>
    </div>
  );
};
