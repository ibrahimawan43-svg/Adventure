import React, { useState } from 'react';
import { Chapter, StoryChoice, ImageSizeOption, ModelModeOption } from '../types';
import {
  Sparkles,
  Zap,
  Dice5,
  Eye,
  MessageSquare,
  Maximize2,
  RefreshCw,
  Send,
  Shield,
  Flame,
  AlertTriangle,
  History,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface StoryViewProps {
  currentChapter: Chapter;
  chapters: Chapter[];
  activeChoices: StoryChoice[];
  isGenerating: boolean;
  onSelectChoice: (choiceText: string) => void;
  onCustomAction: (actionText: string) => void;
  onQuickAction: (actionType: string, label: string) => void;
  onRegenerateImage: (imageSize: ImageSizeOption) => void;
  onOpenImageModal: (imageUrl: string, prompt?: string) => void;
  imageSize: ImageSizeOption;
  onChangeImageSize: (size: ImageSizeOption) => void;
  modelMode: ModelModeOption;
  onChangeModelMode: (mode: ModelModeOption) => void;
  artStyle: string;
  quotaNotice?: string | null;
}

export const StoryView: React.FC<StoryViewProps> = ({
  currentChapter,
  chapters,
  activeChoices,
  isGenerating,
  onSelectChoice,
  onCustomAction,
  onQuickAction,
  onRegenerateImage,
  onOpenImageModal,
  imageSize,
  onChangeImageSize,
  modelMode,
  onChangeModelMode,
  artStyle,
  quotaNotice,
}) => {
  const [customText, setCustomText] = useState('');
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(null);

  const displayedChapter =
    selectedChapterIndex !== null ? chapters[selectedChapterIndex] : currentChapter;
  const isViewingPast =
    selectedChapterIndex !== null && selectedChapterIndex !== chapters.length - 1;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || isGenerating) return;
    sound.playChoiceSelect();
    onCustomAction(customText.trim());
    setCustomText('');
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'safe':
        return {
          icon: <Shield className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Calculated & Safe',
          style: 'border-emerald-700/50 text-emerald-300 bg-emerald-950/20 hover:border-emerald-500',
        };
      case 'moderate':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-blue-400" />,
          label: 'Moderate Venture',
          style: 'border-blue-700/50 text-blue-300 bg-blue-950/20 hover:border-blue-500',
        };
      case 'perilous':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Perilous Gamble',
          style: 'border-amber-700/50 text-amber-300 bg-amber-950/20 hover:border-amber-500',
        };
      case 'heroic':
        return {
          icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
          label: 'Heroic / High Stakes',
          style: 'border-rose-700/50 text-rose-300 bg-rose-950/20 hover:border-rose-500',
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-stone-400" />,
          label: 'Choice',
          style: 'border-stone-700 text-stone-300 bg-stone-900/40 hover:border-stone-500',
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Top Bar Controls & Mode Toggles */}
      <div className="border-b border-stone-800 bg-stone-950/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sticky top-0 z-30 backdrop-blur-md">
        {/* Story Chapter Navigation */}
        <div className="flex items-center space-x-2">
          <span className="font-display font-semibold text-amber-400 flex items-center space-x-1.5">
            <span>Chapter {displayedChapter.turnNumber}</span>
          </span>
          {chapters.length > 1 && (
            <div className="flex items-center space-x-1 border-l border-stone-800 pl-2">
              <button
                disabled={selectedChapterIndex === 0}
                onClick={() => {
                  const target =
                    selectedChapterIndex === null
                      ? chapters.length - 2
                      : Math.max(0, selectedChapterIndex - 1);
                  setSelectedChapterIndex(target);
                }}
                className="p-1 rounded hover:bg-stone-800 disabled:opacity-30 text-stone-400 hover:text-stone-200"
                title="Previous chapter"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-stone-400 font-mono">
                {displayedChapter.turnNumber} / {chapters.length}
              </span>
              <button
                disabled={
                  selectedChapterIndex === null ||
                  selectedChapterIndex === chapters.length - 1
                }
                onClick={() => {
                  if (selectedChapterIndex !== null) {
                    const next = selectedChapterIndex + 1;
                    setSelectedChapterIndex(next >= chapters.length - 1 ? null : next);
                  }
                }}
                className="p-1 rounded hover:bg-stone-800 disabled:opacity-30 text-stone-400 hover:text-stone-200"
                title="Next chapter"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {isViewingPast && (
                <button
                  onClick={() => setSelectedChapterIndex(null)}
                  className="ml-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold"
                >
                  Return to Present
                </button>
              )}
            </div>
          )}
        </div>

        {/* Engine Controls: Image Resolution + Model Speed Mode */}
        <div className="flex items-center space-x-3">
          {/* Image Size Picker (affordance for 1K, 2K, 4K using gemini-3-pro-image-preview) */}
          <div className="flex items-center space-x-1.5 bg-stone-900 border border-stone-800 rounded-md px-2 py-1">
            <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[11px] text-stone-400 font-medium">Image Res:</span>
            <div className="flex space-x-1 font-mono text-[11px]">
              {(['1K', '2K', '4K'] as ImageSizeOption[]).map((size) => (
                <button
                  key={size}
                  onClick={() => onChangeImageSize(size)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    imageSize === size
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title={`Generate images at ${size} resolution with gemini-3-pro-image-preview`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Model Engine Speed Mode */}
          <div className="flex items-center space-x-1.5 bg-stone-900 border border-stone-800 rounded-md px-2 py-1">
            <Sliders className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[11px] text-stone-400 font-medium">Engine:</span>
            <div className="flex space-x-1 text-[11px]">
              <button
                onClick={() => onChangeModelMode('fast')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  modelMode === 'fast'
                    ? 'bg-emerald-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Fast Low-Latency Mode using gemini-3.1-flash-lite"
              >
                Fast
              </button>
              <button
                onClick={() => onChangeModelMode('standard')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  modelMode === 'standard'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Balanced Storytelling Mode using gemini-3.8-flash"
              >
                Standard
              </button>
              <button
                onClick={() => onChangeModelMode('deep')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  modelMode === 'deep'
                    ? 'bg-indigo-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Deep Complex Narrative Mode using gemini-4-argon"
              >
                Deep
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chapter Content Container */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Past Action Lead-in (if any) */}
        {displayedChapter.choiceTaken && (
          <div className="flex items-center space-x-2 text-xs text-stone-400 bg-stone-900/40 border border-stone-800/80 rounded-md p-2.5">
            <span className="text-amber-500 font-bold">You decided:</span>
            <span className="italic text-stone-300">"{displayedChapter.choiceTaken}"</span>
          </div>
        )}

        {/* Free Tier / Quota Notice Banner */}
        {quotaNotice && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{quotaNotice}</span>
            </div>
          </div>
        )}

        {/* Scene Image Display (generated via gemini-3-pro-image-preview) */}
        <div className="relative rounded-xl overflow-hidden border border-stone-800/80 bg-stone-900 shadow-2xl group">
          {displayedChapter.sceneImage ? (
            <div className="relative aspect-video w-full bg-stone-950">
              <img
                src={displayedChapter.sceneImage}
                alt={displayedChapter.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30 pointer-events-none" />

              {/* Badges & Actions Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-stone-700/60 font-mono text-amber-300 text-[10px]">
                    {imageSize} • gemini-3-pro-image-preview
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-stone-700/50 text-stone-300 text-[10px] truncate max-w-xs">
                    Style: {artStyle.slice(0, 32)}...
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onRegenerateImage(imageSize)}
                    disabled={isGenerating}
                    title="Regenerate this scene image"
                    className="p-1.5 rounded-md bg-black/70 hover:bg-black/90 text-stone-300 hover:text-amber-300 border border-stone-700/60 transition-colors flex items-center space-x-1 text-[11px]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Regenerate</span>
                  </button>
                  <button
                    onClick={() =>
                      onOpenImageModal(
                        displayedChapter.sceneImage!,
                        displayedChapter.imagePrompt
                      )
                    }
                    title="View fullscreen"
                    className="p-1.5 rounded-md bg-black/70 hover:bg-black/90 text-stone-300 hover:text-white border border-stone-700/60 transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-[21/9] w-full flex flex-col items-center justify-center bg-stone-950 text-stone-500 p-6 text-center border-b border-stone-800">
              {isGenerating ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-display tracking-widest text-amber-400 uppercase">
                    Weaving the next tapestry...
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-xs">No image rendered for this scene</p>
                  <button
                    onClick={() => onRegenerateImage(imageSize)}
                    className="px-3 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700 transition-colors"
                  >
                    Generate {imageSize} Illustration
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chapter Title Banner inside/below image */}
          <div className="p-4 sm:p-5 bg-gradient-to-b from-stone-900/90 to-stone-950 border-t border-stone-800/80">
            <h2 className="font-display font-bold text-stone-100 text-xl sm:text-2xl tracking-wide">
              {displayedChapter.title}
            </h2>
          </div>
        </div>

        {/* Narrative Prose Body */}
        <div className="bg-stone-900/40 border border-stone-800/80 rounded-xl p-5 sm:p-7 shadow-lg backdrop-blur-sm">
          <div className="prose prose-invert max-w-none text-stone-200 font-story text-base sm:text-lg leading-relaxed space-y-4">
            {displayedChapter.narrative.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="first-letter:text-2xl first-letter:font-display first-letter:text-amber-400">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Quick Low-Latency Tactical Actions (Powered by gemini-3.1-flash-lite) */}
        {!isViewingPast && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-xs text-stone-400 uppercase tracking-wider font-semibold">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Low-Latency Tactical Actions (gemini-3.1-flash-lite)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  sound.playFastInspect();
                  onQuickAction('sense_danger', 'Sense Immediate Danger');
                }}
                disabled={isGenerating}
                className="p-2.5 rounded-lg border border-stone-800 hover:border-emerald-500/50 bg-stone-900/50 hover:bg-emerald-950/20 text-stone-300 hover:text-emerald-300 text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sense Danger</span>
              </button>

              <button
                onClick={() => {
                  sound.playFastInspect();
                  onQuickAction('tactical_assessment', 'Assess Surroundings');
                }}
                disabled={isGenerating}
                className="p-2.5 rounded-lg border border-stone-800 hover:border-blue-500/50 bg-stone-900/50 hover:bg-blue-950/20 text-stone-300 hover:text-blue-300 text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Examine Area</span>
              </button>

              <button
                onClick={() => {
                  sound.playFastInspect();
                  onQuickAction('roll_d20', 'D20 Tactical Check');
                }}
                disabled={isGenerating}
                className="p-2.5 rounded-lg border border-stone-800 hover:border-amber-500/50 bg-stone-900/50 hover:bg-amber-950/20 text-stone-300 hover:text-amber-300 text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Dice5 className="w-3.5 h-3.5 text-amber-400" />
                <span>Roll D20 Check</span>
              </button>

              <button
                onClick={() => {
                  sound.playFastInspect();
                  onQuickAction('companion_whisper', "Companion's Thought");
                }}
                disabled={isGenerating}
                className="p-2.5 rounded-lg border border-stone-800 hover:border-purple-500/50 bg-stone-900/50 hover:bg-purple-950/20 text-stone-300 hover:text-purple-300 text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Companion Word</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Branching Choices (The Choose-Your-Own-Adventure Core) */}
        {!isViewingPast ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-stone-200 text-base tracking-wide flex items-center space-x-2">
                <span>What do you do next?</span>
              </h3>
              <span className="text-[11px] text-stone-500 font-mono">
                {isGenerating ? 'World is responding...' : 'Your choice reshapes fate'}
              </span>
            </div>

            {/* AI Generated Divergent Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeChoices.map((choice) => {
                const badge = getRiskBadge(choice.riskLevel);
                return (
                  <button
                    key={choice.id}
                    onClick={() => {
                      sound.playChoiceSelect();
                      onSelectChoice(choice.text);
                    }}
                    disabled={isGenerating}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 group flex flex-col justify-between space-y-2 shadow-md relative overflow-hidden disabled:opacity-50 ${badge.style}`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center space-x-1 font-medium">
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                      <span className="font-mono text-stone-500 group-hover:text-stone-300 transition-colors">
                        ➔
                      </span>
                    </div>

                    <p className="font-story text-sm text-stone-100 font-medium group-hover:text-amber-200 transition-colors leading-snug">
                      "{choice.text}"
                    </p>

                    {choice.consequenceHint && (
                      <p className="text-[11px] text-stone-400 italic">
                        {choice.consequenceHint}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Free-form Action Input (Player can type anything!) */}
            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2">
              <label className="text-xs text-stone-300 font-medium flex items-center justify-between">
                <span>Or take an unscripted custom action:</span>
                <span className="text-[10px] text-amber-400/80">Infinite freedom</span>
              </label>
              <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. I draw my silver dagger, feign surrender, and whisper the binding chant..."
                  disabled={isGenerating}
                  className="flex-1 bg-stone-950 border border-stone-700/80 rounded-lg px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50"
                />
                <button
                  type="submit"
                  disabled={!customText.trim() || isGenerating}
                  className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-lg"
                >
                  <span>Act</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-stone-900/40 border border-stone-800 text-center space-y-2">
            <p className="text-xs text-stone-400">
              You are reviewing Chapter {displayedChapter.turnNumber}. To continue making choices, return to the present turn.
            </p>
            <button
              onClick={() => setSelectedChapterIndex(null)}
              className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 font-semibold text-xs hover:bg-amber-400 transition-colors"
            >
              Back to Current Turn
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
