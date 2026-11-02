import React from 'react';
import { Zap, X, Clock, Sparkles } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  result: string | null;
  isLoading: boolean;
  model: string;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  title,
  result,
  isLoading,
  model = 'gemini-3.1-flash-lite',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl p-6 z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-stone-100 text-sm">{title}</h3>
              <div className="flex items-center space-x-1.5 text-[10px] text-stone-400">
                <span className="flex items-center space-x-0.5 text-emerald-400 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Sub-second Low-Latency</span>
                </span>
                <span>•</span>
                <span className="font-mono text-stone-400">{model}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-2">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-stone-400 font-mono">Streaming instant evaluation...</p>
            </div>
          ) : (
            <div className="bg-stone-900/60 border border-stone-800/80 rounded-xl p-4 text-xs sm:text-sm text-stone-200 leading-relaxed font-story space-y-2">
              <p>{result}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-stone-800/60">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
