/**
 * Generates rich, atmospheric SVG illustrations matching the genre and chapter theme.
 * Serves as an instant, zero-latency visual fallback when external AI image quotas are limited.
 */
export function generateAtmosphericSvg(
  genre: string = 'Dark Fantasy',
  title: string = 'The Journey',
  characterName: string = 'Hero'
): string {
  const g = genre.toLowerCase();

  let background = '<rect width="1280" height="720" fill="#09080d"/>';
  let elements = '';

  if (g.includes('cyber') || g.includes('neon') || g.includes('2099')) {
    // Cyberpunk Neon Noir
    background = `
      <defs>
        <linearGradient id="cyberSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#04020a"/>
          <stop offset="50%" stop-color="#140624"/>
          <stop offset="100%" stop-color="#05192d"/>
        </linearGradient>
        <linearGradient id="neonGlow1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#00f3ff" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#ff007f" stop-opacity="0.8"/>
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#cyberSky)"/>
    `;
    elements = `
      <!-- Grid Floor -->
      <g stroke="#00f3ff" stroke-opacity="0.15" stroke-width="1.5">
        <line x1="0" y1="560" x2="1280" y2="560"/>
        <line x1="0" y1="600" x2="1280" y2="600"/>
        <line x1="0" y1="650" x2="1280" y2="650"/>
        <line x1="0" y1="710" x2="1280" y2="710"/>
        <line x1="640" y1="520" x2="0" y2="720"/>
        <line x1="640" y1="520" x2="300" y2="720"/>
        <line x1="640" y1="520" x2="640" y2="720"/>
        <line x1="640" y1="520" x2="980" y2="720"/>
        <line x1="640" y1="520" x2="1280" y2="720"/>
      </g>
      <!-- Megacity Skyscrapers -->
      <rect x="120" y="240" width="160" height="380" fill="#0b0817" stroke="#ff007f" stroke-opacity="0.4"/>
      <rect x="240" y="160" width="180" height="460" fill="#060410" stroke="#00f3ff" stroke-opacity="0.5"/>
      <rect x="520" y="200" width="220" height="420" fill="#0e071e" stroke="#7928ca" stroke-opacity="0.5"/>
      <rect x="820" y="140" width="190" height="480" fill="#050814" stroke="#ff007f" stroke-opacity="0.4"/>
      <rect x="980" y="260" width="180" height="360" fill="#0b0817" stroke="#00f3ff" stroke-opacity="0.3"/>
      <!-- Window light dots -->
      <g fill="#00f3ff" fill-opacity="0.6">
        <rect x="260" y="180" width="6" height="4"/><rect x="280" y="180" width="6" height="4"/><rect x="320" y="210" width="6" height="4"/>
        <rect x="540" y="220" width="8" height="4"/><rect x="580" y="260" width="8" height="4"/><rect x="620" y="300" width="8" height="4"/>
        <rect x="840" y="160" width="8" height="4"/><rect x="880" y="220" width="8" height="4"/>
      </g>
      <!-- Holographic billboards -->
      <rect x="550" y="240" width="100" height="40" fill="#ff007f" fill-opacity="0.2" stroke="#ff007f" stroke-width="2"/>
      <text x="600" y="265" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ff007f" text-anchor="middle" letter-spacing="4">SYSTEM//ON</text>
      <!-- Protagonist Silhouette with Glowing Optics -->
      <path d="M 620 540 Q 640 500 660 540 L 670 660 L 610 660 Z" fill="#020108"/>
      <circle cx="640" cy="495" r="14" fill="#020108"/>
      <circle cx="644" cy="495" r="2.5" fill="#00f3ff"/>
    `;
  } else if (g.includes('solarpunk') || g.includes('sky')) {
    // Solarpunk Sky Archipelago
    background = `
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e3a8a"/>
          <stop offset="50%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#fef08a"/>
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#skyGrad)"/>
    `;
    elements = `
      <!-- Golden Sun -->
      <circle cx="640" cy="380" r="160" fill="#fef08a" fill-opacity="0.5"/>
      <circle cx="640" cy="380" r="90" fill="#ffffff" fill-opacity="0.7"/>
      <!-- Floating Island 1 -->
      <path d="M 200 420 Q 380 400 480 430 Q 420 560 340 580 Q 240 540 200 420 Z" fill="#14532d"/>
      <path d="M 220 425 Q 360 410 460 435 L 430 460 L 230 450 Z" fill="#22c55e"/>
      <!-- Floating Island Center -->
      <path d="M 520 460 Q 720 430 860 470 Q 780 620 680 640 Q 560 600 520 460 Z" fill="#0f3d23"/>
      <path d="M 540 465 Q 700 440 840 475 L 800 500 L 550 490 Z" fill="#4ade80"/>
      <!-- Ancient Spire on Island -->
      <polygon points="680,340 670,450 690,450" fill="#fef3c7"/>
      <circle cx="680" cy="335" r="6" fill="#38bdf8"/>
      <!-- Soft Clouds -->
      <ellipse cx="260" cy="220" rx="140" ry="40" fill="#ffffff" fill-opacity="0.4"/>
      <ellipse cx="940" cy="260" rx="160" ry="45" fill="#ffffff" fill-opacity="0.35"/>
      <!-- Airship Silhouette -->
      <ellipse cx="440" cy="280" rx="55" ry="18" fill="#1e293b"/>
      <polygon points="440,298 430,306 450,306" fill="#d97706"/>
    `;
  } else if (g.includes('space') || g.includes('derelict')) {
    // Deep Space
    background = `
      <defs>
        <radialGradient id="nebula" cx="70%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#831843" stop-opacity="0.6"/>
          <stop offset="50%" stop-color="#1e1b4b" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#030712"/>
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#nebula)"/>
    `;
    elements = `
      <!-- Star cluster -->
      <g fill="#ffffff">
        <circle cx="100" cy="80" r="1.5"/><circle cx="240" cy="190" r="1.2"/><circle cx="360" cy="90" r="2"/>
        <circle cx="580" cy="140" r="1.5"/><circle cx="720" cy="70" r="1"/><circle cx="890" cy="160" r="2"/>
        <circle cx="1100" cy="95" r="1.5"/><circle cx="1040" cy="260" r="1.2"/><circle cx="1180" cy="380" r="1.8"/>
        <circle cx="150" cy="420" r="1"/><circle cx="280" cy="510" r="1.6"/><circle cx="90" cy="620" r="1.4"/>
      </g>
      <!-- Giant Gas Planet Arc -->
      <circle cx="1200" cy="680" r="420" fill="#1e1b4b" stroke="#6366f1" stroke-width="3" stroke-opacity="0.5"/>
      <!-- Derelict Spacecraft Hull -->
      <polygon points="320,380 580,320 680,390 560,450 380,440" fill="#111827" stroke="#475569" stroke-width="3"/>
      <!-- Airlock with Amber Beacon -->
      <rect x="440" y="380" width="30" height="40" fill="#0f172a" stroke="#d97706" stroke-width="2"/>
      <circle cx="455" cy="370" r="5" fill="#f59e0b"/>
    `;
  } else {
    // Default: Eldritch Dark Fantasy / Gothic Occult
    background = `
      <defs>
        <linearGradient id="darkBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#06050a"/>
          <stop offset="60%" stop-color="#140f1c"/>
          <stop offset="100%" stop-color="#0a080e"/>
        </linearGradient>
        <radialGradient id="portalGlow" cx="50%" cy="55%" r="45%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45"/>
          <stop offset="40%" stop-color="#7c2d12" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#06050a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#darkBg)"/>
      <rect width="1280" height="720" fill="url(#portalGlow)"/>
    `;
    elements = `
      <!-- Full Crimson / Pale Moon -->
      <circle cx="640" cy="240" r="95" fill="#fef3c7" fill-opacity="0.85"/>
      <circle cx="640" cy="240" r="125" fill="#f59e0b" fill-opacity="0.15"/>
      <!-- Jagged Catacomb / Mountain Silhouette -->
      <polygon points="0,720 0,460 180,380 320,440 460,350 640,430 820,340 980,420 1140,360 1280,440 1280,720" fill="#0b0811"/>
      <polygon points="0,720 0,540 220,490 420,530 640,470 860,520 1080,480 1280,530 1280,720" fill="#050408"/>
      <!-- Ancient Megalithic Archway / Sunken Crypt Portal -->
      <rect x="520" y="360" width="40" height="260" fill="#120e1a" stroke="#d97706" stroke-opacity="0.5" stroke-width="2"/>
      <rect x="720" y="360" width="40" height="260" fill="#120e1a" stroke="#d97706" stroke-opacity="0.5" stroke-width="2"/>
      <rect x="490" y="330" width="300" height="40" fill="#181324" stroke="#d97706" stroke-opacity="0.6" stroke-width="2"/>
      <!-- Crypt Void Aperture -->
      <path d="M 560 620 L 560 440 Q 640 400 720 440 L 720 620 Z" fill="#020104" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="8 4"/>
      <!-- Floating Runic Glyphs -->
      <text x="640" y="520" font-family="serif" font-size="28" font-weight="bold" fill="#f59e0b" text-anchor="middle" fill-opacity="0.75">ᚱ ᛟ ᛋ</text>
      <!-- Protagonist Silhouette with Broadsword & Raven -->
      <path d="M 625 580 Q 640 520 655 580 L 665 670 L 615 670 Z" fill="#030206"/>
      <circle cx="640" cy="510" r="12" fill="#030206"/>
      <!-- Notched Broadsword -->
      <line x1="662" y1="520" x2="685" y2="650" stroke="#94a3b8" stroke-width="3"/>
      <!-- Perched Spirit Raven -->
      <path d="M 648 525 Q 658 518 662 522 Q 656 532 648 528 Z" fill="#38bdf8"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
      ${background}
      ${elements}
      <!-- Atmospheric Vignette Frame -->
      <rect width="1280" height="720" fill="none" stroke="#292524" stroke-width="4" stroke-opacity="0.4"/>
      <!-- Subtle Chapter Watermark -->
      <text x="40" y="685" font-family="serif" font-size="16" font-weight="600" fill="#78716c" letter-spacing="3" text-transform="uppercase">
        ${genre.toUpperCase()} • ${title.toUpperCase()}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
