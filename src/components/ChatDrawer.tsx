import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  BrainCircuit,
  HelpCircle,
  X,
  Compass,
  Wand2,
  Scroll,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, botRole: string, modelChoice: string) => Promise<void>;
  isSending: boolean;
  adventureContext: {
    characterName: string;
    characterClass: string;
    genre: string;
    currentQuestTitle: string;
    currentQuestObjective: string;
    currentChapterTitle: string;
    hp: number;
    maxHp: number;
    inventoryCount: number;
  };
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isSending,
  adventureContext,
}) => {
  const [inputText, setInputText] = useState('');
  const [botRole, setBotRole] = useState<'storyteller' | 'companion' | 'oracle'>('storyteller');
  const [modelChoice, setModelChoice] = useState<'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const msg = inputText.trim();
    setInputText('');
    sound.playChoiceSelect();
    await onSendMessage(msg, botRole, modelChoice);
  };

  const quickPrompts = [
    'What clues might I have overlooked in this chamber?',
    'What are your tactical recommendations for our current quest?',
    'Tell me the deeper lore of our world and its ancient legends.',
    'What do my instincts sense about our immediate companions or rivals?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-stone-950 border-l border-stone-800 flex flex-col h-full shadow-2xl z-10">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 bg-stone-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-stone-100 text-sm">
                Chronicle Companion & Oracle
              </h3>
              <p className="text-[11px] text-stone-400">
                Multi-turn intelligence for tactical advice, lore, and in-game banter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona & Model Controls */}
        <div className="p-3 border-b border-stone-800 bg-stone-900/30 space-y-2 text-xs">
          {/* Role selector */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Chatbot Role:
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setBotRole('storyteller')}
                className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors ${
                  botRole === 'storyteller'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Scroll className="w-3 h-3" />
                <span>Story Master</span>
              </button>

              <button
                onClick={() => setBotRole('companion')}
                className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors ${
                  botRole === 'companion'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Compass className="w-3 h-3" />
                <span>In-World Companion</span>
              </button>

              <button
                onClick={() => setBotRole('oracle')}
                className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors ${
                  botRole === 'oracle'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Wand2 className="w-3 h-3" />
                <span>Arcane Oracle</span>
              </button>
            </div>
          </div>

          {/* Model selector (gemini-4-argon / gemini-3.8-flash / gemini-3.1-flash-lite) */}
          <div className="flex items-center justify-between pt-1 border-t border-stone-800/60">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center space-x-1">
              <span>Model:</span>
            </span>
            <div className="flex space-x-1 font-mono text-[11px]">
              <button
                onClick={() => setModelChoice('gemini-3.1-flash-lite')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  modelChoice === 'gemini-3.1-flash-lite'
                    ? 'bg-emerald-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="gemini-3.1-flash-lite: low-latency, fast responses"
              >
                3.1-lite (Fast)
              </button>

              <button
                onClick={() => setModelChoice('gemini-3.8-flash')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  modelChoice === 'gemini-3.8-flash'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="gemini-3.8-flash: general tasks, rich balanced responses"
              >
                3.8-flash (General)
              </button>

              <button
                onClick={() => setModelChoice('gemini-4-argon')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  modelChoice === 'gemini-4-argon'
                    ? 'bg-indigo-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="gemini-4-argon: complex tasks, deep reasoning and lore analysis"
              >
                4-argon (Complex)
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Chat History Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4 text-stone-400">
              <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-stone-200 text-sm">
                  Consult the Unseen
                </h4>
                <p className="text-xs text-stone-400 mt-1 max-w-xs">
                  Ask questions about lore, strategize your next move, or roleplay in-character with your traveling guide.
                </p>
              </div>

              {/* Quick Prompt Starters */}
              <div className="w-full space-y-1.5 pt-2">
                <p className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider">
                  Quick inquiries:
                </p>
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(q);
                    }}
                    className="w-full text-left p-2 rounded bg-stone-900/60 hover:bg-stone-800/80 border border-stone-800 text-[11px] text-stone-300 transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex space-x-2.5 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role !== 'user' && (
                  <div className="w-7 h-7 rounded-md bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed space-y-1 ${
                    m.role === 'user'
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-100 rounded-br-none'
                      : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                    <span className="font-medium">
                      {m.role === 'user'
                        ? adventureContext.characterName
                        : m.botRole === 'companion'
                        ? 'Companion'
                        : m.botRole === 'oracle'
                        ? 'Arcane Oracle'
                        : 'Game Master'}
                    </span>
                    {m.modelUsed && (
                      <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-stone-800 text-stone-400">
                        {m.modelUsed}
                      </span>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-md bg-amber-500/30 border border-amber-500/50 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {isSending && (
            <div className="flex space-x-2.5 items-center text-xs text-stone-400 p-2">
              <div className="w-7 h-7 rounded-md bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-stone-400">Consulting {modelChoice}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-stone-800 bg-stone-900/60">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${
                botRole === 'companion'
                  ? 'your traveling companion...'
                  : botRole === 'oracle'
                  ? 'the Oracle...'
                  : 'the Game Master...'
              }`}
              disabled={isSending}
              className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
