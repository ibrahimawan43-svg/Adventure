import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

import { generateAtmosphericSvg } from './src/utils/proceduralArt.ts';

/**
 * Image generation using gemini-3-pro-image-preview as required,
 * supporting user-specified sizes: 1K, 2K, 4K.
 * Gracefully provides atmospheric procedural scene art when API quota is limited on Free Tier.
 */
async function generateSceneImage(
  prompt: string,
  artStyle: string,
  characterAnchor: string,
  imageSize: '1K' | '2K' | '4K' = '1K',
  genre: string = 'Dark Fantasy',
  chapterTitle: string = 'The Journey'
): Promise<{ imageUrl: string; quotaExceeded: boolean }> {
  const fullPrompt = `Masterpiece cinematic illustration. Art Style: ${artStyle}.
Protagonist visual appearance (maintain consistency): ${characterAnchor}.
Scene depiction: ${prompt}.
High aesthetic quality, atmospheric lighting, coherent composition, no text, no captions, no watermarks.`;

  const validSize = ['1K', '2K', '4K'].includes(imageSize) ? imageSize : '1K';

  // Primary model requested: gemini-3-pro-image-preview
  const modelsToTry = ['gemini-3-pro-image-preview', 'gemini-3-pro-image', 'gemini-3.1-flash-lite-image'];
  let quotaExceeded = false;

  for (const modelName of modelsToTry) {
    try {
      const config: any = {
        imageConfig: {
          aspectRatio: '16:9',
        },
      };

      // Only pro and nano models support imageSize parameter
      if (modelName !== 'gemini-3.1-flash-lite-image') {
        config.imageConfig.imageSize = validSize;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config,
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return {
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            quotaExceeded: false,
          };
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (
        err?.status === 429 ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('quota')
      ) {
        quotaExceeded = true;
        // On free tier, image models have limit: 0. Switch directly to procedural artwork fallback.
        break;
      }
    }
  }

  // Resilient atmospheric artwork fallback
  return {
    imageUrl: generateAtmosphericSvg(genre, chapterTitle, characterAnchor),
    quotaExceeded,
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Start a new adventure
app.post('/api/adventure/start', async (req, res) => {
  try {
    const {
      genre = 'Dark Fantasy & Ancient Relics',
      characterName = 'Theron Valen',
      characterClass = 'Rune Warden',
      characterAppearance = 'A weathered wanderer in etched bronze and boiled leather, silver runic hair clips, piercing grey eyes and a notched broadsword',
      artStyle = 'Oil painting with rich dramatic chiaroscuro and atmospheric fantasy realism',
      modelMode = 'standard', // fast | standard | deep
      imageSize = '1K', // 1K | 2K | 4K
      customPremise = '',
    } = req.body;

    const selectedModel =
      modelMode === 'fast'
        ? 'gemini-3.1-flash-lite'
        : modelMode === 'deep'
        ? 'gemini-4-argon'
        : 'gemini-3.8-flash';

    const systemInstruction = `You are the Master Storyteller of an infinite, deeply reactive Choose-Your-Own-Adventure game.
Every player decision genuinely reshapes future plotlines, NPC loyalties, world states, and hazards.
You strictly return valid JSON with no markdown wrapping outside the JSON.

Character Name: ${characterName}
Class/Role: ${characterClass}
Appearance: ${characterAppearance}
Setting/Genre: ${genre}
Visual Art Style: ${artStyle}
${customPremise ? `Custom Opening Premise: ${customPremise}` : ''}

You must construct an unforgettable, atmospheric opening chapter. Provide:
1. "chapterTitle": evocative title.
2. "narrative": 3-4 vivid, immersive paragraphs establishing high stakes, immediate dilemma, sensory details, and an urgent precipitating event.
3. "inventory": starting array of 3-4 items with:
   - "id": string
   - "name": string
   - "type": "weapon" | "armor" | "tool" | "consumable" | "relic" | "document"
   - "description": string
   - "icon": string (e.g., "sword", "shield", "potion", "scroll", "key", "gem", "compass", "book")
   - "rarity": "common" | "uncommon" | "rare" | "artifact"
4. "quest":
   - "title": string
   - "currentObjective": string
   - "stages": string[]
   - "progress": number (0-100)
   - "lore": string
5. "characterStatus":
   - "hp": number (e.g. 100)
   - "maxHp": number (e.g. 100)
   - "condition": string (e.g., "Healthy & Focused", "Frostbitten", "Cursed")
   - "statsSummary": string
6. "charactersMet": array of 1-2 initial NPCs or companions introduced, each with:
   - "name": string
   - "role": string
   - "relationship": "friendly" | "companion" | "neutral" | "hostile" | "mysterious"
   - "description": string
7. "consequences": string[] (initial background facts or choices made, e.g. "Exiled from the Sunken Citadel")
8. "choices": array of 4 genuinely distinct, divergent choices:
   - "id": string
   - "text": string (active first-person phrasing)
   - "riskLevel": "safe" | "moderate" | "perilous" | "heroic"
   - "consequenceHint": short preview of potential outcome or approach
9. "imagePrompt": a concise, visually rich scene description focusing on the climax or environment of this chapter, suited for consistent image generation.`;

    const prompt = `Begin the adventure now. Output strictly JSON matching the specified structure.`;

    const config: any = {
      systemInstruction,
      responseMimeType: 'application/json',
    };

    if (modelMode === 'fast') {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config,
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(cleanJsonString(rawText));

    // Real-time scene image generation using gemini-3-pro-image-preview
    let sceneImage: string | null = null;
    let imageQuotaExceeded = false;
    if (parsed.imagePrompt) {
      const imgResult = await generateSceneImage(
        parsed.imagePrompt,
        artStyle,
        characterAppearance,
        imageSize,
        genre,
        parsed.chapterTitle || 'The Journey Begins'
      );
      sceneImage = imgResult.imageUrl;
      imageQuotaExceeded = imgResult.quotaExceeded;
    }

    res.json({
      ...parsed,
      sceneImage,
      imageQuotaExceeded,
      turnNumber: 1,
    });
  } catch (error: any) {
    console.error('Error starting adventure:', error);
    res.status(500).json({
      error: 'Failed to start adventure',
      details: error?.message || 'Unknown error',
    });
  }
});

// Advance adventure turn (genuine plot branching + dynamic inventory/quest update)
app.post('/api/adventure/turn', async (req, res) => {
  try {
    const {
      action,
      turnNumber = 2,
      historySummary = '',
      lastChapter = '',
      inventory = [],
      quest = {},
      characterStatus = {},
      charactersMet = [],
      consequences = [],
      genre = 'Dark Fantasy',
      characterName = 'Hero',
      characterClass = 'Adventurer',
      characterAppearance = '',
      artStyle = '',
      modelMode = 'standard',
      imageSize = '1K',
    } = req.body;

    const selectedModel =
      modelMode === 'fast'
        ? 'gemini-3.1-flash-lite'
        : modelMode === 'deep'
        ? 'gemini-4-argon'
        : 'gemini-3.8-flash';

    const systemInstruction = `You are the Game Master of an infinite, unscripted Choose-Your-Own-Adventure.
The player has just taken an action: "${action}".
This was NOT a pre-scripted fork; you must dynamically simulate the true consequences in the world.
Characters remember actions. Physical laws and magical rules apply. Failure is possible and thrilling. Success may come with costs.

AUTOMATIC SIDEBAR SYNC REQUIREMENTS:
1. Inventory: If the player found, stole, crafted, bought, received, lost, broke, consumed, or traded an item in this turn, you MUST update the inventory!
   - Specify "inventoryAdded": array of new items with {id, name, type, description, icon, rarity}
   - Specify "inventoryRemovedIds": array of ids of items removed/consumed from inventory.
2. Current Quest: If the player advanced the quest, changed objectives, completed a stage, or discovered a twist, you MUST update "quest":
   - "title", "currentObjective", "stages", "progress", "lore"
3. Health / Status: Update "characterStatus":
   - "hp", "maxHp", "condition", "hpDelta" (negative for damage taken, positive for healing, 0 for neutral)
4. Characters Met: If an NPC was encountered, aided, betrayed, or changed relationship, update or append to "charactersMet".
5. Consequences: Add 1-2 new world memory consequence flags reflecting the ripple effect of this action.

Output strictly JSON with:
{
  "chapterTitle": string,
  "narrative": string (3-4 paragraphs of vivid prose depicting the direct outcome of the player's action and the ensuing scenario),
  "inventoryAdded": Array<{ id, name, type, description, icon, rarity }>,
  "inventoryRemovedIds": string[],
  "quest": { title, currentObjective, stages: string[], progress: number, lore: string },
  "characterStatus": { hp: number, maxHp: number, condition: string, hpDelta: number },
  "newCharacters": Array<{ name, role, relationship, description }>,
  "newConsequences": string[],
  "choices": Array<{ id: string, text: string, riskLevel: "safe" | "moderate" | "perilous" | "heroic", consequenceHint: string }>,
  "imagePrompt": string (focused scene prompt for consistent illustration)
}`;

    const promptContext = `
Context:
- Genre: ${genre}
- Protagonist: ${characterName} (${characterClass})
- Prior Story Summary: ${historySummary}
- Previous Chapter Excerpt: ${lastChapter.slice(-600)}
- Current Active Quest: ${JSON.stringify(quest)}
- Current Inventory: ${JSON.stringify(inventory.map((i: any) => i.name))}
- Current HP: ${characterStatus.hp}/${characterStatus.maxHp} (${characterStatus.condition})
- Known NPCs: ${JSON.stringify(charactersMet.map((c: any) => `${c.name} (${c.relationship})`))}
- Past Consequence Flags: ${JSON.stringify(consequences)}

Player's Action Taken: "${action}"

Generate the reactive continuation now.`;

    const config: any = {
      systemInstruction,
      responseMimeType: 'application/json',
    };

    if (modelMode === 'fast') {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: promptContext,
      config,
    });

    const parsed = JSON.parse(cleanJsonString(response.text || '{}'));

    // Real-time scene image generation using gemini-3-pro-image-preview
    let sceneImage: string | null = null;
    let imageQuotaExceeded = false;
    if (parsed.imagePrompt) {
      const imgResult = await generateSceneImage(
        parsed.imagePrompt,
        artStyle,
        characterAppearance,
        imageSize,
        genre,
        parsed.chapterTitle || `Chapter ${turnNumber + 1}`
      );
      sceneImage = imgResult.imageUrl;
      imageQuotaExceeded = imgResult.quotaExceeded;
    }

    res.json({
      ...parsed,
      sceneImage,
      imageQuotaExceeded,
      turnNumber: turnNumber + 1,
    });
  } catch (error: any) {
    console.error('Error advancing adventure:', error);
    res.status(500).json({
      error: 'Failed to advance adventure',
      details: error?.message || 'Unknown error',
    });
  }
});

// Dedicated on-demand image generation (supporting 1K, 2K, 4K resolution selection)
app.post('/api/adventure/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      artStyle = 'Oil painting with rich dramatic chiaroscuro',
      characterAppearance = '',
      imageSize = '1K',
      genre = 'Dark Fantasy',
      chapterTitle = 'The Scene',
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const { imageUrl, quotaExceeded } = await generateSceneImage(
      prompt,
      artStyle,
      characterAppearance,
      imageSize,
      genre,
      chapterTitle
    );

    res.json({
      imageUrl,
      imageSize,
      quotaExceeded,
      notice: quotaExceeded
        ? 'Gemini image generation models (1K/2K/4K) require a billing-enabled API key in Settings > Secrets. Displaying atmospheric procedural artwork.'
        : undefined,
    });
  } catch (error: any) {
    console.error('Error in on-demand image generation:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      details: error?.message || 'Unknown error',
    });
  }
});

/**
 * Low-latency instant evaluation using gemini-3.1-flash-lite
 * For quick item inspection, sensing danger, D20 tactical appraisal, or immediate whispers.
 */
app.post('/api/adventure/quick-action', async (req, res) => {
  try {
    const { actionType, targetName, targetContext, currentChapter, characterClass } = req.body;

    const systemInstruction = `You are an ultra-fast tactical game engine assistant. Provide immediate, punchy, atmospheric, and actionable feedback in 2-3 sentences max.
Target Action Type: ${actionType} ("inspect_item", "sense_danger", "tactical_assessment", "companion_whisper", "roll_d20")
Character: ${characterClass}
Environment/Context: ${currentChapter?.slice(-400) || 'Unknown area'}`;

    const prompt = `Target: ${targetName || 'Surroundings'}. Additional info: ${targetContext || 'None'}. Provide rapid evaluation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
      },
    });

    res.json({
      result: response.text || 'You sense nothing out of the ordinary.',
      latency: 'fast',
      model: 'gemini-3.1-flash-lite',
    });
  } catch (error: any) {
    console.error('Quick action error:', error);
    res.status(500).json({
      error: 'Failed to process quick action',
      details: error?.message || 'Unknown error',
    });
  }
});

/**
 * Multi-turn Chatbot with Gemini:
 * Supports dynamic roles:
 * - "storyteller": Game Master / Dungeon Master providing guidance, rules, lore hints
 * - "companion": In-world loyal companion roleplaying alongside the player
 * - "oracle": Mystical seer deciphering ancient prophecies and artifacts
 * Model selection: gemini-4-argon (complex), gemini-3.8-flash (general), gemini-3.1-flash-lite (fast)
 */
app.post('/api/adventure/chat', async (req, res) => {
  try {
    const {
      messages = [],
      botRole = 'storyteller',
      modelChoice = 'gemini-3.8-flash',
      adventureContext = {},
    } = req.body;

    const allowedModels = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    const model = allowedModels.includes(modelChoice) ? modelChoice : 'gemini-3.8-flash';

    let roleInstruction = '';
    if (botRole === 'companion') {
      roleInstruction = `You are the player's trusty in-game companion travel partner. Stay completely in-character. Speak in conversational dialogue, react emotionally to danger, share tactical ideas, banter, and offer loyalty. Never break the fourth wall.`;
    } else if (botRole === 'oracle') {
      roleInstruction = `You are the Arcane Oracle, an enigmatic cosmic entity observing the timeline. You speak in cryptic, poetic, and profound lore snippets, illuminating hidden truths, prophetic portents, and the secret histories of artifacts.`;
    } else {
      // storyteller / game master
      roleInstruction = `You are the Chronicler & Game Master. You assist the player with lore questions, creative tactical advice, explaining the rules of the world, reminding them of forgotten clues, and inspiring bold choices while preserving narrative mystery.`;
    }

    const contextSummary = `
Current Game State Context:
- Protagonist: ${adventureContext.characterName || 'Hero'} (${adventureContext.characterClass || 'Adventurer'})
- Genre: ${adventureContext.genre || 'Fantasy'}
- Current Quest: ${adventureContext.currentQuestTitle || 'Unknown'} - ${adventureContext.currentQuestObjective || 'Exploring'}
- Active Chapter: ${adventureContext.currentChapterTitle || 'The Journey'}
- Health: ${adventureContext.hp || 100}/${adventureContext.maxHp || 100}
- Inventory items: ${adventureContext.inventoryCount || 0} items
`;

    const systemInstruction = `${roleInstruction}\n\n${contextSummary}\nKeep responses engaging, evocative, and direct.`;

    // Map messages for multi-turn chat format
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text || '' }],
    }));

    const config: any = {
      systemInstruction,
    };

    if (model === 'gemini-3.1-flash-lite') {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
    }

    const response = await ai.models.generateContent({
      model,
      contents: formattedContents,
      config,
    });

    res.json({
      reply: response.text || '(Silence echoes)',
      modelUsed: model,
      botRole,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Chat generation failed',
      details: error?.message || 'Unknown error',
    });
  }
});

// Mount Vite or serve static dist
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Adventure Engine server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
