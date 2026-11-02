import React, { useState } from 'react';
import {
  InventoryItem,
  Quest,
  CharacterStatus,
  NPC,
  ItemRarity,
} from '../types';
import { ItemIcon } from './ItemIcon';
import {
  Backpack,
  Scroll,
  Heart,
  Users,
  ShieldAlert,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  Circle,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SidebarProps {
  inventory: InventoryItem[];
  quest: Quest;
  characterStatus: CharacterStatus;
  charactersMet: NPC[];
  consequences: string[];
  characterName: string;
  characterClass: string;
  onInspectItem: (item: InventoryItem) => void;
  inventoryUpdatedFlash?: boolean;
  questUpdatedFlash?: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  inventory,
  quest,
  characterStatus,
  charactersMet,
  consequences,
  characterName,
  characterClass,
  onInspectItem,
  inventoryUpdatedFlash,
  questUpdatedFlash,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [activeTab, setActiveTab] = useState<'quest' | 'inventory' | 'allies' | 'consequences'>('quest');
  const [inventoryFilter, setInventoryFilter] = useState<string>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const rarityColor: Record<ItemRarity, { border: string; bg: string; text: string; badge: string }> = {
    common: {
      border: 'border-stone-700',
      bg: 'bg-stone-900/60',
      text: 'text-stone-300',
      badge: 'bg-stone-800 text-stone-400 border-stone-700',
    },
    uncommon: {
      border: 'border-emerald-700/60',
      bg: 'bg-emerald-950/20',
      text: 'text-emerald-200',
      badge: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
    },
    rare: {
      border: 'border-blue-600/60',
      bg: 'bg-blue-950/20',
      text: 'text-blue-200',
      badge: 'bg-blue-900/50 text-blue-300 border-blue-600',
    },
    artifact: {
      border: 'border-amber-500/80',
      bg: 'bg-amber-950/30',
      text: 'text-amber-200',
      badge: 'bg-amber-900/60 text-amber-300 border-amber-500',
    },
  };

  const filteredInventory = inventory.filter((item) => {
    if (inventoryFilter === 'all') return true;
    if (inventoryFilter === 'weapons') return item.type === 'weapon' || item.type === 'armor';
    if (inventoryFilter === 'relics') return item.type === 'relic' || item.rarity === 'artifact';
    if (inventoryFilter === 'supplies') return item.type === 'consumable' || item.type === 'tool';
    return true;
  });

  const hpPercent = Math.min(
    100,
    Math.max(0, Math.round((characterStatus.hp / (characterStatus.maxHp || 100)) * 100))
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 right-0 bottom-0 z-50 w-84 sm:w-96 bg-stone-950/95 border-l border-stone-800/80 flex flex-col shadow-2xl backdrop-blur-md transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Character Header / Vitals */}
        <div className="p-4 border-b border-stone-800 bg-stone-900/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-md bg-stone-800 border border-stone-700 flex items-center justify-center font-display font-bold text-amber-400 text-lg shadow-inner">
                {characterName.charAt(0)}
              </div>
              <div>
                <h3 className="font-display font-semibold text-stone-100 text-sm tracking-wide">
                  {characterName}
                </h3>
                <p className="text-xs text-stone-400">{characterClass}</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-stone-400 hover:text-stone-100 p-1"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Health Bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="flex items-center space-x-1 text-rose-400 font-medium">
                <Heart className="w-3.5 h-3.5 fill-rose-500/30 text-rose-400" />
                <span>Health Points</span>
              </span>
              <span className="font-mono text-stone-300">
                {characterStatus.hp} / {characterStatus.maxHp}
              </span>
            </div>
            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700/50">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  hpPercent > 50
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : hpPercent > 25
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-rose-600 to-rose-400 animate-pulse'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            {characterStatus.condition && (
              <div className="mt-1.5 flex items-center space-x-1 text-[11px] text-stone-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Status: {characterStatus.condition}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 border-b border-stone-800 bg-stone-900/30 text-xs">
          <button
            onClick={() => setActiveTab('quest')}
            className={`py-2.5 flex flex-col items-center justify-center space-y-1 relative transition-colors ${
              activeTab === 'quest'
                ? 'text-amber-400 font-medium bg-stone-900/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Scroll className="w-4 h-4" />
            <span className="text-[11px]">Quest</span>
            {questUpdatedFlash && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
            {activeTab === 'quest' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2.5 flex flex-col items-center justify-center space-y-1 relative transition-colors ${
              activeTab === 'inventory'
                ? 'text-amber-400 font-medium bg-stone-900/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="relative">
              <Backpack className="w-4 h-4" />
              <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[14px] h-3.5 rounded-full bg-stone-800 border border-stone-700 text-[9px] font-mono flex items-center justify-center text-amber-300">
                {inventory.length}
              </span>
            </div>
            <span className="text-[11px]">Inventory</span>
            {inventoryUpdatedFlash && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
            {activeTab === 'inventory' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('allies')}
            className={`py-2.5 flex flex-col items-center justify-center space-y-1 relative transition-colors ${
              activeTab === 'allies'
                ? 'text-amber-400 font-medium bg-stone-900/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[11px]">People ({charactersMet.length})</span>
            {activeTab === 'allies' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('consequences')}
            className={`py-2.5 flex flex-col items-center justify-center space-y-1 relative transition-colors ${
              activeTab === 'consequences'
                ? 'text-amber-400 font-medium bg-stone-900/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[11px]">Fate ({consequences.length})</span>
            {activeTab === 'consequences' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-400" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* QUEST TAB */}
          {activeTab === 'quest' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg border transition-all ${
                  questUpdatedFlash
                    ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-500/50'
                    : 'border-stone-800 bg-stone-900/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-medium uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Active Quest</span>
                  </div>
                  <span className="text-xs font-mono text-stone-400">
                    {quest.progress || 0}% Complete
                  </span>
                </div>

                <h4 className="font-display font-bold text-stone-100 text-base mt-2 mb-1">
                  {quest.title || 'The Unfolding Path'}
                </h4>

                <div className="w-full h-1.5 bg-stone-800 rounded-full my-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700"
                    style={{ width: `${quest.progress || 5}%` }}
                  />
                </div>

                <div className="mt-3 p-2.5 rounded bg-stone-950/70 border border-stone-800 text-xs">
                  <div className="text-stone-400 font-medium text-[11px] uppercase tracking-wider mb-1">
                    Current Objective
                  </div>
                  <p className="text-amber-200 font-medium leading-relaxed">
                    {quest.currentObjective || 'Survey the immediate surroundings.'}
                  </p>
                </div>

                {quest.stages && quest.stages.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <div className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
                      Quest Milestones
                    </div>
                    {quest.stages.map((stage, idx) => {
                      const isComplete = idx < Math.floor((quest.progress / 100) * quest.stages.length);
                      return (
                        <div
                          key={idx}
                          className="flex items-start space-x-2 text-xs text-stone-300"
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                          )}
                          <span className={isComplete ? 'line-through text-stone-500' : ''}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {quest.lore && (
                  <div className="mt-3 pt-3 border-t border-stone-800/80 text-[11px] text-stone-400 italic">
                    "{quest.lore}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              {/* Category Pills */}
              <div className="flex space-x-1 pb-1 overflow-x-auto text-[11px]">
                {['all', 'weapons', 'relics', 'supplies'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setInventoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                      inventoryFilter === cat
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                        : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filteredInventory.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs">
                  <Backpack className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Your pack holds no items in this category.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredInventory.map((item) => {
                    const rarityStyle = rarityColor[item.rarity] || rarityColor.common;
                    const isExpanded = expandedItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-lg border p-3 transition-all ${rarityStyle.border} ${rarityStyle.bg}`}
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 rounded bg-stone-900/80 border border-stone-700/50 text-stone-200">
                              <ItemIcon icon={item.icon} type={item.type} />
                            </div>
                            <div>
                              <h5 className={`font-medium text-xs ${rarityStyle.text}`}>
                                {item.name}
                              </h5>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className={`text-[10px] px-1.5 py-0.2 rounded border uppercase font-mono ${rarityStyle.badge}`}>
                                  {item.rarity}
                                </span>
                                <span className="text-[10px] text-stone-400 capitalize">
                                  {item.type}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playFastInspect();
                                onInspectItem(item);
                              }}
                              title="Inspect with fast AI"
                              className="p-1 rounded bg-stone-800/80 hover:bg-amber-900/40 text-stone-400 hover:text-amber-300 border border-stone-700/50 transition-colors"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {isExpanded && (
                          <div className="mt-2.5 pt-2 border-t border-stone-800/80 text-xs text-stone-300 space-y-2">
                            <p className="leading-relaxed">{item.description}</p>
                            <button
                              onClick={() => {
                                sound.playFastInspect();
                                onInspectItem(item);
                              }}
                              className="w-full py-1 px-2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] flex items-center justify-center space-x-1.5 transition-colors"
                            >
                              <Zap className="w-3 h-3 text-amber-400" />
                              <span>Instant AI Lore Appraisal</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ALLIES / DRAMATIS PERSONAE */}
          {activeTab === 'allies' && (
            <div className="space-y-3">
              {charactersMet.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>You have not encountered any notable companions or figures yet.</p>
                </div>
              ) : (
                charactersMet.map((npc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-stone-800 bg-stone-900/40 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-stone-200">
                        {npc.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-mono ${
                          npc.relationship === 'companion'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : npc.relationship === 'friendly'
                            ? 'bg-blue-950 text-blue-300 border border-blue-700'
                            : npc.relationship === 'hostile'
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : 'bg-stone-800 text-stone-300 border border-stone-700'
                        }`}
                      >
                        {npc.relationship}
                      </span>
                    </div>
                    <div className="text-stone-400 text-[11px] font-medium">{npc.role}</div>
                    <p className="text-stone-300 text-[11px] leading-relaxed">{npc.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* CONSEQUENCES / FATE LEDGER */}
          {activeTab === 'consequences' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 text-xs text-stone-400 leading-relaxed">
                <div className="flex items-center space-x-1 text-amber-400 font-medium mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>World Memory Ledger</span>
                </div>
                Your actions have persistent butterfly effects. Every choice you made is recorded here and remembered by the AI.
              </div>

              {consequences.length === 0 ? (
                <p className="text-stone-500 text-center text-xs py-4">
                  No major consequence flags logged yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {consequences.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded border border-stone-800 bg-stone-950/60 text-xs text-stone-300 flex items-start space-x-2"
                    >
                      <span className="text-amber-500 font-bold shrink-0">❖</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
