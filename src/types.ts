export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'artifact';
export type ItemType = 'weapon' | 'armor' | 'tool' | 'consumable' | 'relic' | 'document' | 'treasure';

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  icon: string;
  rarity: ItemRarity;
  acquiredTurn?: number;
  quantity?: number;
}

export interface Quest {
  title: string;
  currentObjective: string;
  stages: string[];
  progress: number; // 0 to 100
  lore: string;
}

export interface CharacterStatus {
  hp: number;
  maxHp: number;
  condition: string;
  statsSummary?: string;
  hpDelta?: number;
}

export interface NPC {
  name: string;
  role: string;
  relationship: 'friendly' | 'companion' | 'neutral' | 'hostile' | 'mysterious';
  description: string;
}

export interface StoryChoice {
  id: string;
  text: string;
  riskLevel: 'safe' | 'moderate' | 'perilous' | 'heroic';
  consequenceHint?: string;
}

export interface Chapter {
  turnNumber: number;
  title: string;
  narrative: string;
  sceneImage?: string | null;
  imagePrompt?: string;
  choiceTaken?: string;
  inventoryAdded?: InventoryItem[];
  inventoryRemovedIds?: string[];
  questSnapshot?: Quest;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  botRole?: string;
  modelUsed?: string;
}

export type ImageSizeOption = '1K' | '2K' | '4K';
export type ModelModeOption = 'fast' | 'standard' | 'deep';

export interface GenrePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultClass: string;
  defaultAppearance: string;
  suggestedArtStyle: string;
  sampleOpening: string;
}
