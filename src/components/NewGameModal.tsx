import React, { useState } from 'react';
import { GENRE_PRESETS } from '../data/presets';
import { GenrePreset, ImageSizeOption, ModelModeOption } from '../types';
import {
  Sparkles,
  Flame,
  Compass,
  Cpu,
  Moon,
  Radio,
  Image as ImageIcon,
  Zap,
  Sliders,
  Shield,
  Palette,
  X,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface NewGameModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canCancel?: boolean;
  onStartAdventure: (config: {
    genre: string;
    characterName: string;
    characterClass: string;
    characterAppearance: string;
    artStyle: string;
    imageSize: ImageSizeOption;
    modelMode: ModelModeOption;
    customPremise: string;
  }) => Promise<void>;
  isStarting: boolean;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  canCancel = false,
  onStartAdventure,
  isStarting,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('dark-fantasy');
  const [genre, setGenre] = useState<string>(GENRE_PRESETS[0].name);
  const [characterName, setCharacterName] = useState<string>('Theron Valen');
  const [characterClass, setCharacterClass] = useState<string>(GENRE_PRESETS[0].defaultClass);
  const [characterAppearance, setCharacterAppearance] = useState<string>(
    GENRE_PRESETS[0].defaultAppearance
  );
  const [artStyle, setArtStyle] = useState<string>(GENRE_PRESETS[0].suggestedArtStyle);
  const [imageSize, setImageSize] = useState<ImageSizeOption>('1K');
  const [modelMode, setModelMode] = useState<ModelModeOption>('standard');
  const [customPremise, setCustomPremise] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: GenrePreset) => {
    setSelectedPresetId(preset.id);
    setGenre(preset.name);
    setCharacterClass(preset.defaultClass);
    setCharacterAppearance(preset.defaultAppearance);
    setArtStyle(preset.suggestedArtStyle);
    setCustomPremise(preset.sampleOpening);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'Moon':
        return <Moon className="w-4 h-4 text-purple-400" />;
      case 'Radio':
        return <Radio className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStarting) return;
    sound.playDeepPageTurn();
    await onStartAdventure({
      genre,
      characterName: characterName.trim() || 'Wanderer',
      characterClass: characterClass.trim() || 'Adventurer',
      characterAppearance: characterAppearance.trim(),
      artStyle,
      imageSize,
      modelMode,
      customPremise,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 z-10 my-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Chronicle Adventure Engine</span>
            </div>
            <h2 className="font-display font-bold text-stone-100 text-2xl tracking-wide">
              Embark on an Infinite Journey
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Your choices create genuine unscripted branches. Visuals remain character-consistent in real time.
            </p>
          </div>
          {canCancel && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-stone-400 hover:text-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Choose World Preset:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GENRE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-3 rounded-xl border transition-all flex items-start space-x-3 ${
                    selectedPresetId === preset.id
                      ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/50'
                      : 'border-stone-800 bg-stone-900/40 hover:border-stone-700'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-stone-950 border border-stone-800 shrink-0">
                    {getPresetIcon(preset.icon)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-stone-200 text-xs truncate">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
                      {preset.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Character & Visual Anchor (Crucial for character-consistent images!) */}
          <div className="space-y-3 pt-2 border-t border-stone-800/80">
            <div className="flex items-center space-x-2 text-xs font-semibold text-stone-300 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Protagonist Identity & Visual Anchor</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Character Name</label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Class / Role</label>
                <input
                  type="text"
                  value={characterClass}
                  onChange={(e) => setCharacterClass(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-stone-400 mb-1">
                Visual Appearance Anchor (used in all generated images so you look identical throughout)
              </label>
              <textarea
                value={characterAppearance}
                onChange={(e) => setCharacterAppearance(e.target.value)}
                rows={2}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500 leading-relaxed"
                placeholder="e.g. A tall ranger with scarred left brow, silver-braided hair, charcoal traveler mantle, and etched rune-blade"
              />
            </div>
          </div>

          {/* Art Style & Image Size (gemini-3-pro-image-preview with 1K, 2K, 4K) */}
          <div className="space-y-3 pt-2 border-t border-stone-800/80">
            <div className="flex items-center space-x-2 text-xs font-semibold text-stone-300 uppercase tracking-wider">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Art Style & Image Resolution (gemini-3-pro-image-preview)</span>
            </div>

            <div>
              <label className="block text-[11px] text-stone-400 mb-1">Visual Art Style Prompt</label>
              <input
                type="text"
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Image Size Selection affordance (1K, 2K, 4K) */}
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">
                  Default Scene Image Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1K', '2K', '4K'] as ImageSizeOption[]).map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all text-center ${
                        imageSize === size
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                          : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-stone-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Model Engine Speed */}
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">
                  Story Engine Speed / Depth
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setModelMode('fast')}
                    className={`py-2 px-2 rounded-lg border text-[11px] font-medium transition-all text-center ${
                      modelMode === 'fast'
                        ? 'bg-emerald-500 text-stone-950 font-bold border-emerald-400'
                        : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    3.1-Lite (Fast)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModelMode('standard')}
                    className={`py-2 px-2 rounded-lg border text-[11px] font-medium transition-all text-center ${
                      modelMode === 'standard'
                        ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                        : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    3.8-Flash (Norm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModelMode('deep')}
                    className={`py-2 px-2 rounded-lg border text-[11px] font-medium transition-all text-center ${
                      modelMode === 'deep'
                        ? 'bg-indigo-500 text-stone-950 font-bold border-indigo-400'
                        : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    4-Argon (Deep)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isStarting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-display font-bold text-sm tracking-wider uppercase shadow-xl hover:shadow-amber-500/20 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2"
            >
              {isStarting ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Generating Opening Chapter & {imageSize} Scene...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>Begin Adventure Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
