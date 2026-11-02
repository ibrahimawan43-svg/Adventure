import React, { useState, useEffect } from 'react';
import {
  Chapter,
  InventoryItem,
  Quest,
  CharacterStatus,
  NPC,
  StoryChoice,
  ChatMessage,
  ImageSizeOption,
  ModelModeOption,
} from './types';
import { GENRE_PRESETS } from './data/presets';
import { Sidebar } from './components/Sidebar';
import { StoryView } from './components/StoryView';
import { ChatDrawer } from './components/ChatDrawer';
import { NewGameModal } from './components/NewGameModal';
import { QuickActionModal } from './components/QuickActionModal';
import { ImageModal } from './components/ImageModal';
import { sound } from './utils/audio';
import {
  Sparkles,
  MessageSquare,
  Volume2,
  VolumeX,
  Menu,
  RotateCcw,
  BookOpen,
  Backpack,
  Scroll,
} from 'lucide-react';

const STORAGE_KEY = 'chronicle_adventure_state_v1';

export default function App() {
  // Game Setup & Anchors
  const [characterName, setCharacterName] = useState<string>('Theron Valen');
  const [characterClass, setCharacterClass] = useState<string>('Rune Warden');
  const [characterAppearance, setCharacterAppearance] = useState<string>(
    GENRE_PRESETS[0].defaultAppearance
  );
  const [genre, setGenre] = useState<string>(GENRE_PRESETS[0].name);
  const [artStyle, setArtStyle] = useState<string>(GENRE_PRESETS[0].suggestedArtStyle);
  const [imageSize, setImageSize] = useState<ImageSizeOption>('1K');
  const [modelMode, setModelMode] = useState<ModelModeOption>('standard');

  // Dynamic Sidebar State (automatically updated by AI)
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'item-1',
      name: 'Runic Silver Broadsword',
      type: 'weapon',
      description: 'Etched with ancient binding glyphs that hum when spirits or cursed wards draw near.',
      icon: 'sword',
      rarity: 'rare',
    },
    {
      id: 'item-2',
      name: 'Black Iron Key of Oros',
      type: 'tool',
      description: 'Heavy, ice-cold iron inscribed with seven notches matching the subterranean vault doors.',
      icon: 'key',
      rarity: 'uncommon',
    },
    {
      id: 'item-3',
      name: 'Vial of Ember-Sap',
      type: 'consumable',
      description: 'Glowing distillation of elder pine sap that can cauterize wounds or ignite wet timber.',
      icon: 'potion',
      rarity: 'common',
    },
  ]);

  const [quest, setQuest] = useState<Quest>({
    title: 'The Fractured Seal of Oros',
    currentObjective: 'Investigate the broken ward at the crypt entrance and find who broke in.',
    stages: [
      'Reach the Sunken Crypt threshold',
      'Decipher the shattered ward glyphs',
      'Track the intruder into the lower catacombs',
      'Recover the Stolen Core of Dawn',
    ],
    progress: 15,
    lore: 'For seven hundred years, the tomb held the slumbering arch-lich. Last night, the bells of the valley tolled unprompted.',
  });

  const [characterStatus, setCharacterStatus] = useState<CharacterStatus>({
    hp: 95,
    maxHp: 100,
    condition: 'Cautious & Alert',
    statsSummary: 'Rune mastery: Adept • Combat: Veteran',
  });

  const [charactersMet, setCharactersMet] = useState<NPC[]>([
    {
      name: 'Vael the Raven',
      role: 'Bonded Spirit Guide',
      relationship: 'companion',
      description: 'A spectral raven that roosts on your shoulder, possessing keen senses for arcane disturbances.',
    },
  ]);

  const [consequences, setConsequences] = useState<string[]>([
    'Volunteered to enter the Sunken Crypt alone rather than wait for the slow Grand Inquest',
    'Carrying the cursed heirloom blade of House Valen',
  ]);

  // Story & Choices State
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      turnNumber: 1,
      title: 'The Severed Ward',
      narrative: `The chill of the sunken valley clings to your breath like powdered glass. Before you, the massive basalt portal of the Crypt of Oros hangs ajar, its iron bindings sheared not by rust, but by concentrated eldritch flame. Smoke still curls lazily from the molten groove in the threshold.

Vael shifts upon your shoulder, black feathers ruffling with agitated clicks. Through your mind weaves the bird's telepathic murmur: "Fresh ash. Three pairs of boots, one dragging a heavy iron chain. They entered less than an hour ago, Theron."

At your feet lies the shattered remains of the threshold talisman. If you step through now, the residual curse of the broken ward will mark your passage—alerting whatever lies in the subterranean depths. Yet waiting for the garrison watch will take until twilight, and the thieves are moving deeper with every passing second.`,
      sceneImage: null,
      imagePrompt: 'A hooded warrior in scarred armor standing at the threshold of a massive ancient stone crypt, with glowing fractured runes and a raven on their shoulder',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [activeChoices, setActiveChoices] = useState<StoryChoice[]>([
    {
      id: 'c1',
      text: 'Draw your runic broadsword and slip quietly into the crypt shadows to track the bootprints.',
      riskLevel: 'moderate',
      consequenceHint: 'Gains surprise advantage, but leaves the crypt entrance open behind you.',
    },
    {
      id: 'c2',
      text: 'Spend a moment kneeling to mend the broken threshold ward with your ember-sap.',
      riskLevel: 'safe',
      consequenceHint: 'Prevents back attacks and secures the exit, but costs precious time.',
    },
    {
      id: 'c3',
      text: 'Send Vael flying ahead through the ceiling fissures to scout their exact numbers and weapons.',
      riskLevel: 'safe',
      consequenceHint: 'Yields critical tactical intel on the intruders before engaging.',
    },
    {
      id: 'c4',
      text: 'Channel your rune into the melted threshold to trigger a resonant pulse, demanding their surrender.',
      riskLevel: 'heroic',
      consequenceHint: 'High-risk intimidation; might demoralize the thieves or alert all denizens.',
    },
  ]);

  // UI Modals & Interaction
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [inventoryUpdatedFlash, setInventoryUpdatedFlash] = useState<boolean>(false);
  const [questUpdatedFlash, setQuestUpdatedFlash] = useState<boolean>(false);
  const [isNewGameOpen, setIsNewGameOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Chatbot State (Gemini multi-turn)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatSending, setIsChatSending] = useState<boolean>(false);

  // Quick Action Modal (Gemini 3.1-flash-lite low-latency)
  const [quickModal, setQuickModal] = useState<{
    isOpen: boolean;
    title: string;
    result: string | null;
    isLoading: boolean;
    model: string;
  }>({
    isOpen: false,
    title: '',
    result: null,
    isLoading: false,
    model: 'gemini-3.1-flash-lite',
  });

  // Image Modal (1K, 2K, 4K inspection)
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    prompt?: string;
  }>({
    isOpen: false,
    imageUrl: '',
  });

  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);

  // Load from local storage or generate first image on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.chapters && data.chapters.length > 0) {
          setCharacterName(data.characterName || 'Theron Valen');
          setCharacterClass(data.characterClass || 'Rune Warden');
          setCharacterAppearance(data.characterAppearance || '');
          setGenre(data.genre || GENRE_PRESETS[0].name);
          setArtStyle(data.artStyle || GENRE_PRESETS[0].suggestedArtStyle);
          setImageSize(data.imageSize || '1K');
          setModelMode(data.modelMode || 'standard');
          setInventory(data.inventory || []);
          setQuest(data.quest || quest);
          setCharacterStatus(data.characterStatus || characterStatus);
          setCharactersMet(data.charactersMet || []);
          setConsequences(data.consequences || []);
          setChapters(data.chapters || []);
          setActiveChoices(data.activeChoices || []);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load saved state:', e);
    }

    // If starting fresh without an image, generate the initial scene image
    generateInitialSceneImage();
  }, []);

  // Save to local storage
  const saveStateToStorage = (updated: any) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          characterName,
          characterClass,
          characterAppearance,
          genre,
          artStyle,
          imageSize,
          modelMode,
          inventory,
          quest,
          characterStatus,
          charactersMet,
          consequences,
          chapters,
          activeChoices,
          ...updated,
        })
      );
    } catch (e) {
      console.warn('Error saving to storage:', e);
    }
  };

  const triggerInventoryFlash = () => {
    setInventoryUpdatedFlash(true);
    sound.playItemAcquired();
    setTimeout(() => setInventoryUpdatedFlash(false), 3000);
  };

  const triggerQuestFlash = () => {
    setQuestUpdatedFlash(true);
    sound.playQuestUpdated();
    setTimeout(() => setQuestUpdatedFlash(false), 3000);
  };

  // Generate initial image on first turn if missing
  const generateInitialSceneImage = async () => {
    if (chapters[0] && !chapters[0].sceneImage && chapters[0].imagePrompt) {
      try {
        const res = await fetch('/api/adventure/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: chapters[0].imagePrompt,
            artStyle,
            characterAppearance,
            imageSize,
            genre,
            chapterTitle: chapters[0].title,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.quotaExceeded) {
            setQuotaNotice(
              'Gemini image generation with gemini-3-pro-image-preview (1K/2K/4K) is enabled. If on Free Tier, you can select a billing-enabled key in Settings > Secrets. Procedural scene art is active.'
            );
          }
          if (data.imageUrl) {
            setChapters((prev) => {
              const updated = [...prev];
              updated[0] = { ...updated[0], sceneImage: data.imageUrl };
              saveStateToStorage({ chapters: updated });
              return updated;
            });
          }
        }
      } catch (err) {
        console.warn('Initial image generation skipped/failed:', err);
      }
    }
  };

  // Start a brand new adventure
  const handleStartAdventure = async (config: {
    genre: string;
    characterName: string;
    characterClass: string;
    characterAppearance: string;
    artStyle: string;
    imageSize: ImageSizeOption;
    modelMode: ModelModeOption;
    customPremise: string;
  }) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/adventure/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      setCharacterName(config.characterName);
      setCharacterClass(config.characterClass);
      setCharacterAppearance(config.characterAppearance);
      setGenre(config.genre);
      setArtStyle(config.artStyle);
      setImageSize(config.imageSize);
      setModelMode(config.modelMode);

      if (data.imageQuotaExceeded) {
        setQuotaNotice(
          'Gemini image generation with gemini-3-pro-image-preview (1K/2K/4K) is enabled. If on Free Tier, you can select a billing-enabled key in Settings > Secrets. Procedural scene art is active.'
        );
      }

      setInventory(data.inventory || []);
      setQuest(data.quest || quest);
      setCharacterStatus(data.characterStatus || characterStatus);
      setCharactersMet(data.charactersMet || []);
      setConsequences(data.consequences || []);

      const firstChapter: Chapter = {
        turnNumber: 1,
        title: data.chapterTitle || 'The Journey Begins',
        narrative: data.narrative || '',
        sceneImage: data.sceneImage || null,
        imagePrompt: data.imagePrompt || '',
        timestamp: new Date().toLocaleTimeString(),
      };

      setChapters([firstChapter]);
      setActiveChoices(data.choices || []);
      setChatMessages([]);

      saveStateToStorage({
        characterName: config.characterName,
        characterClass: config.characterClass,
        characterAppearance: config.characterAppearance,
        genre: config.genre,
        artStyle: config.artStyle,
        imageSize: config.imageSize,
        modelMode: config.modelMode,
        inventory: data.inventory || [],
        quest: data.quest || quest,
        characterStatus: data.characterStatus || characterStatus,
        charactersMet: data.charactersMet || [],
        consequences: data.consequences || [],
        chapters: [firstChapter],
        activeChoices: data.choices || [],
      });

      triggerInventoryFlash();
      triggerQuestFlash();
      setIsNewGameOpen(false);
    } catch (err) {
      console.error('Failed to start new adventure:', err);
      alert('Failed to start adventure. Please check server logs or API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Advance the adventure (unscripted branching + dynamic sidebar update)
  const handleAdvanceStory = async (actionText: string) => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const current = chapters[chapters.length - 1];

      const res = await fetch('/api/adventure/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionText,
          turnNumber: chapters.length,
          lastChapter: current.narrative,
          historySummary: chapters.map((c) => `${c.title}: ${c.choiceTaken || 'Began'}`).join(' -> '),
          inventory,
          quest,
          characterStatus,
          charactersMet,
          consequences,
          genre,
          characterName,
          characterClass,
          characterAppearance,
          artStyle,
          modelMode,
          imageSize,
        }),
      });

      if (!res.ok) {
        throw new Error(`Turn failed with status ${res.status}`);
      }

      const data = await res.json();

      // Automatically update inventory from AI response
      let updatedInventory = [...inventory];
      let didInventoryChange = false;

      if (data.inventoryRemovedIds && Array.isArray(data.inventoryRemovedIds)) {
        updatedInventory = updatedInventory.filter(
          (item) => !data.inventoryRemovedIds.includes(item.id)
        );
        didInventoryChange = true;
      }

      if (data.inventoryAdded && Array.isArray(data.inventoryAdded) && data.inventoryAdded.length > 0) {
        const newItems: InventoryItem[] = data.inventoryAdded.map((item: any, i: number) => ({
          id: item.id || `item-gen-${Date.now()}-${i}`,
          name: item.name || 'Discovered Item',
          type: item.type || 'relic',
          description: item.description || '',
          icon: item.icon || 'gem',
          rarity: item.rarity || 'uncommon',
          acquiredTurn: chapters.length + 1,
        }));
        updatedInventory = [...updatedInventory, ...newItems];
        didInventoryChange = true;
      }

      if (didInventoryChange) {
        setInventory(updatedInventory);
        triggerInventoryFlash();
      }

      // Automatically update current quest from AI response
      if (data.quest && data.quest.title) {
        setQuest(data.quest);
        triggerQuestFlash();
      }

      // Automatically update status/health
      if (data.characterStatus) {
        setCharacterStatus((prev) => ({
          ...prev,
          hp: data.characterStatus.hp ?? prev.hp,
          maxHp: data.characterStatus.maxHp ?? prev.maxHp,
          condition: data.characterStatus.condition ?? prev.condition,
          hpDelta: data.characterStatus.hpDelta,
        }));
      }

      // Update characters met
      if (data.newCharacters && Array.isArray(data.newCharacters)) {
        setCharactersMet((prev) => {
          const existingNames = new Set(prev.map((c) => c.name.toLowerCase()));
          const novel = data.newCharacters.filter(
            (c: any) => !existingNames.has(c.name?.toLowerCase())
          );
          return [...prev, ...novel];
        });
      }

      // Update consequences
      if (data.newConsequences && Array.isArray(data.newConsequences)) {
        setConsequences((prev) => [...prev, ...data.newConsequences]);
      }

      // Record new chapter
      if (data.imageQuotaExceeded) {
        setQuotaNotice(
          'Gemini image generation with gemini-3-pro-image-preview (1K/2K/4K) is enabled. If on Free Tier, you can select a billing-enabled key in Settings > Secrets. Procedural scene art is active.'
        );
      }

      const newChapter: Chapter = {
        turnNumber: chapters.length + 1,
        title: data.chapterTitle || `Chapter ${chapters.length + 1}`,
        narrative: data.narrative || '',
        sceneImage: data.sceneImage || null,
        imagePrompt: data.imagePrompt || '',
        choiceTaken: actionText,
        timestamp: new Date().toLocaleTimeString(),
      };

      const updatedChapters = [...chapters, newChapter];
      setChapters(updatedChapters);
      setActiveChoices(data.choices || []);

      saveStateToStorage({
        chapters: updatedChapters,
        inventory: updatedInventory,
        quest: data.quest || quest,
        consequences: [...consequences, ...(data.newConsequences || [])],
        activeChoices: data.choices || [],
      });
    } catch (err) {
      console.error('Error generating turn:', err);
      alert('Error advancing the story. Please try again or check console.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Low-latency instant action (powered by gemini-3.1-flash-lite)
  const handleQuickAction = async (actionType: string, label: string) => {
    setQuickModal({
      isOpen: true,
      title: label,
      result: null,
      isLoading: true,
      model: 'gemini-3.1-flash-lite',
    });

    try {
      const current = chapters[chapters.length - 1];
      const res = await fetch('/api/adventure/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          currentChapter: current.narrative,
          characterClass,
        }),
      });

      if (!res.ok) throw new Error('Quick action failed');
      const data = await res.json();

      setQuickModal((prev) => ({
        ...prev,
        result: data.result || 'Nothing unusual detected.',
        isLoading: false,
      }));
    } catch (err) {
      setQuickModal((prev) => ({
        ...prev,
        result: 'Your senses momentarily falter, discerning only the ambient stillness.',
        isLoading: false,
      }));
    }
  };

  // Inspect item with fast AI (gemini-3.1-flash-lite)
  const handleInspectItem = async (item: InventoryItem) => {
    setQuickModal({
      isOpen: true,
      title: `Inspect: ${item.name}`,
      result: null,
      isLoading: true,
      model: 'gemini-3.1-flash-lite',
    });

    try {
      const current = chapters[chapters.length - 1];
      const res = await fetch('/api/adventure/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'inspect_item',
          targetName: item.name,
          targetContext: `${item.type} - ${item.rarity} - ${item.description}`,
          currentChapter: current.narrative,
          characterClass,
        }),
      });

      if (!res.ok) throw new Error('Item inspection failed');
      const data = await res.json();

      setQuickModal((prev) => ({
        ...prev,
        result: data.result,
        isLoading: false,
      }));
    } catch (err) {
      setQuickModal((prev) => ({
        ...prev,
        result: `You examine the ${item.name} closely. Its craftsmanship holds steady, but its deepest arcane origins remain veiled.`,
        isLoading: false,
      }));
    }
  };

  // Re-generate scene image in specified size (1K, 2K, 4K) using gemini-3-pro-image-preview
  const handleRegenerateImage = async (sizeToUse: ImageSizeOption) => {
    const current = chapters[chapters.length - 1];
    if (!current) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/adventure/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: current.imagePrompt || `${current.title} in ${genre}`,
          artStyle,
          characterAppearance,
          imageSize: sizeToUse,
          genre,
          chapterTitle: current.title,
        }),
      });

      if (!res.ok) throw new Error('Image generation failed');
      const data = await res.json();

      if (data.quotaExceeded) {
        setQuotaNotice(
          'Gemini image generation with gemini-3-pro-image-preview (1K/2K/4K) is enabled. If on Free Tier, you can select a billing-enabled key in Settings > Secrets. Procedural scene art is active.'
        );
      }

      if (data.imageUrl) {
        setChapters((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = { ...updated[lastIdx], sceneImage: data.imageUrl };
          saveStateToStorage({ chapters: updated });
          return updated;
        });

        if (imageModal.isOpen) {
          setImageModal((prev) => ({ ...prev, imageUrl: data.imageUrl }));
        }
      }
    } catch (err) {
      console.error('Image regen failed:', err);
      alert('Could not render image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Multi-turn chatbot message handler (gemini-4-argon / gemini-3.8-flash / gemini-3.1-flash-lite)
  const handleSendChatMessage = async (text: string, botRole: string, modelChoice: string) => {
    setIsChatSending(true);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    const newThread = [...chatMessages, userMsg];
    setChatMessages(newThread);

    try {
      const current = chapters[chapters.length - 1];
      const res = await fetch('/api/adventure/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread,
          botRole,
          modelChoice,
          adventureContext: {
            characterName,
            characterClass,
            genre,
            currentQuestTitle: quest.title,
            currentQuestObjective: quest.currentObjective,
            currentChapterTitle: current?.title || '',
            hp: characterStatus.hp,
            maxHp: characterStatus.maxHp,
            inventoryCount: inventory.length,
          },
        }),
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'model',
        text: data.reply || '(A knowing silence)',
        timestamp: new Date().toLocaleTimeString(),
        botRole: data.botRole,
        modelUsed: data.modelUsed,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'model',
          text: 'The ethereal connection ripples; words fail to materialize. Please try again.',
          timestamp: new Date().toLocaleTimeString(),
          botRole,
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-600/30 selection:text-amber-200">
      {/* Top Navbar */}
      <header className="border-b border-stone-800/90 bg-stone-950/90 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-stone-950 font-display font-black text-lg">
            C
          </div>
          <div>
            <h1 className="font-display font-bold text-stone-100 text-base sm:text-lg tracking-wider flex items-center space-x-2">
              <span>CHRONICLE</span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                INFINITE CYOA
              </span>
            </h1>
            <p className="text-[11px] text-stone-400 hidden sm:block">
              {genre} • {characterClass}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
          {/* New Game Button */}
          <button
            onClick={() => setIsNewGameOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-700/80 transition-colors flex items-center space-x-1.5 font-medium"
            title="Start new adventure"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Adventure</span>
          </button>

          {/* Chatbot Consultation Button */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors flex items-center space-x-1.5 font-medium"
            title="Consult AI Companion or Oracle"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Companion Chat</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors"
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
            title="Open inventory and quest sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Story Chapter & Choices Main View */}
        <StoryView
          currentChapter={chapters[chapters.length - 1]}
          chapters={chapters}
          activeChoices={activeChoices}
          isGenerating={isGenerating}
          onSelectChoice={handleAdvanceStory}
          onCustomAction={handleAdvanceStory}
          onQuickAction={handleQuickAction}
          onRegenerateImage={handleRegenerateImage}
          onOpenImageModal={(url, prompt) =>
            setImageModal({ isOpen: true, imageUrl: url, prompt })
          }
          imageSize={imageSize}
          onChangeImageSize={(size) => {
            setImageSize(size);
            saveStateToStorage({ imageSize: size });
          }}
          modelMode={modelMode}
          onChangeModelMode={(mode) => {
            setModelMode(mode);
            saveStateToStorage({ modelMode: mode });
          }}
          artStyle={artStyle}
          quotaNotice={quotaNotice}
        />

        {/* Dynamic Sidebar (Inventory & Current Quest) */}
        <Sidebar
          inventory={inventory}
          quest={quest}
          characterStatus={characterStatus}
          charactersMet={charactersMet}
          consequences={consequences}
          characterName={characterName}
          characterClass={characterClass}
          onInspectItem={handleInspectItem}
          inventoryUpdatedFlash={inventoryUpdatedFlash}
          questUpdatedFlash={questUpdatedFlash}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Multi-Turn Chatbot Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        isSending={isChatSending}
        adventureContext={{
          characterName,
          characterClass,
          genre,
          currentQuestTitle: quest.title,
          currentQuestObjective: quest.currentObjective,
          currentChapterTitle: chapters[chapters.length - 1]?.title || '',
          hp: characterStatus.hp,
          maxHp: characterStatus.maxHp,
          inventoryCount: inventory.length,
        }}
      />

      {/* New Game / Adventure Setup Modal */}
      <NewGameModal
        isOpen={isNewGameOpen}
        canCancel={chapters.length > 0}
        onClose={() => setIsNewGameOpen(false)}
        onStartAdventure={handleStartAdventure}
        isStarting={isGenerating}
      />

      {/* Fast Tactical Evaluation Modal (Gemini 3.1-flash-lite) */}
      <QuickActionModal
        isOpen={quickModal.isOpen}
        onClose={() => setQuickModal((prev) => ({ ...prev, isOpen: false }))}
        title={quickModal.title}
        result={quickModal.result}
        isLoading={quickModal.isLoading}
        model={quickModal.model}
      />

      {/* Scene Image Inspection & 1K/2K/4K Re-rendering Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={imageModal.imageUrl}
        prompt={imageModal.prompt}
        artStyle={artStyle}
        currentSize={imageSize}
        onRegenerate={handleRegenerateImage}
        isGenerating={isGenerating}
      />
    </div>
  );
}
