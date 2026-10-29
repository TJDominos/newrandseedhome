import {
  GameItem,
  UserAgent,
  AgentAvatarPreset,
  BehaviorTraceExample,
  AgentResultEvent,
  AgentLogEntry
} from '../types';

export const AGENT_AVATAR_PRESETS: AgentAvatarPreset[] = [
  {
    id: 'cyber-striker',
    name: 'Cyber Striker',
    code: 'STRIKER-01',
    primaryColor: '#06b6d4',
    badgeClass: 'from-cyan-500 to-indigo-600',
    description: 'High-frequency micro-execution & bullet-hell evasion core'
  },
  {
    id: 'crimson-vanguard',
    name: 'Crimson Vanguard',
    code: 'VANGUARD-X',
    primaryColor: '#f43f5e',
    badgeClass: 'from-rose-500 to-orange-600',
    description: 'Dual V-crest mecha · Burst damage & armor-breaking assault'
  },
  {
    id: 'quantum-phantom',
    name: 'Quantum Phantom',
    code: 'PHANTOM-Q',
    primaryColor: '#10b981',
    badgeClass: 'from-emerald-500 to-teal-600',
    description: 'Dual orbital halo · Zero-latency pathfinding & stealth compute'
  },
  {
    id: 'aegis-titan',
    name: 'Aegis Titan',
    code: 'TITAN-7',
    primaryColor: '#f59e0b',
    badgeClass: 'from-amber-400 to-yellow-600',
    description: 'Command crown barrier · Optimal auto-chess & tower defense strategy'
  },
  {
    id: 'void-overlord',
    name: 'Void Overlord',
    code: 'OVERLORD-Z',
    primaryColor: '#a855f7',
    badgeClass: 'from-purple-500 to-fuchsia-600',
    description: 'Levitating prism core · Deep learning & boss mechanic deconstruction'
  }
];

export const INITIAL_GAMES: GameItem[] = [
  {
    id: 'cyber-survivor',
    name: 'Cyber Survivor',
    category: 'Action & Roguelike',
    tagline: 'Extreme bullet-hell evasion · 450 APM automated kiting & mowing',
    description: 'Fast-paced cyber roguelike survival. Train your Agent to dodge dense bullet hell with 0ms delay and auto-craft superweapons.',
    heatRank: 1,
    heatScore: 184500,
    activePlayers: 54200,
    rating: 4.9,
    difficulty: 'Hardcore',
    crackProgress: 98,
    isFeatured: true,
    isHot: true,
    themeGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    emoji: '⚡',
    agentReport: {
      agentModel: 'CyberStriker-v6.2',
      clearRate24h: '94.2%',
      speedrunRecord: '2m 14s',
      totalSimulatedRuns: 840000,
      bestMetaBuild: 'Thunder Laser + Swift Dash + Overload Ring',
      bossMechanicCrackRate: '98% Cracked',
      keyTactics: [
        'Diagonal i-frame dash perfectly dodges 360° laser sweep',
        'Maintain 7m safety radius for high-frequency hit-and-run'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to launch Agent co-pilot or auto-play'
    }
  },
  {
    id: 'mecha-siege',
    name: 'Tactical Mecha Chess',
    category: 'Strategy & Auto-Chess',
    tagline: '1M+ simulation runs · Zero-mistake economy & hexagonal counter-positioning',
    description: 'Mecha strategy auto-battler. Agent calculates real-time roll odds and optimal hexagonal deployment.',
    heatRank: 2,
    heatScore: 152100,
    activePlayers: 41800,
    rating: 4.8,
    difficulty: 'Tactical',
    crackProgress: 93,
    isFeatured: true,
    isHot: true,
    themeGradient: 'from-blue-600 via-cyan-600 to-teal-500',
    emoji: '🤖',
    agentReport: {
      agentModel: 'ChessNet-v4.8',
      clearRate24h: '88.6%',
      speedrunRecord: 'Round 28 Full HP',
      totalSimulatedRuns: 620000,
      bestMetaBuild: '6 Heavy Mecha + 3 Quantum Snipers + Plasma Core',
      bossMechanicCrackRate: '93% Cracked',
      keyTactics: [
        'Round 4 interest stabilization, rush Level 8 two rounds early',
        'Dynamic mirror repositioning against backline assassins'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to simulate optimal auto-battler synergy'
    }
  },
  {
    id: 'citadel-defense',
    name: 'Fortress Matrix TD',
    category: 'Tower Defense',
    tagline: 'Dynamic maze routing · Pixel-perfect overlapping firepower coverage',
    description: 'Hardcore strategy tower defense. Agent builds maximum-length winding mazes with continuous slow & armor shred.',
    heatRank: 3,
    heatScore: 138400,
    activePlayers: 36500,
    rating: 4.9,
    difficulty: 'Tactical',
    crackProgress: 96,
    isHot: true,
    isNew: true,
    themeGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    emoji: '🏰',
    agentReport: {
      agentModel: 'MazeArchitect-v5.1',
      clearRate24h: '96.4%',
      speedrunRecord: 'Wave 100 Flawless',
      totalSimulatedRuns: 510000,
      bestMetaBuild: 'Glacial Tower + Railgun + Fusion Core',
      bossMechanicCrackRate: '96% Cracked',
      keyTactics: [
        'S-curve labyrinth extends enemy creep route by 340%',
        'Railguns prioritize armor-reinforced heavy titan boss units'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to inspect Agent zero-leak maze blueprint'
    }
  },
  {
    id: 'blade-souls',
    name: 'Shadow Ronin Duel',
    category: 'Action & Roguelike',
    tagline: '0.04s frame-perfect parrying · Flawless soulslike boss deconstruction',
    description: 'High-difficulty precision melee action. Agent identifies windup animations at the 3rd frame for 100% parry success.',
    heatRank: 4,
    heatScore: 125900,
    activePlayers: 31200,
    rating: 4.9,
    difficulty: 'Nightmare',
    crackProgress: 91,
    isHot: true,
    themeGradient: 'from-rose-600 via-red-600 to-orange-600',
    emoji: '⚔️',
    agentReport: {
      agentModel: 'ReflexBlade-v7.0',
      clearRate24h: '91.0%',
      speedrunRecord: '1m 08s Hitless',
      totalSimulatedRuns: 930000,
      bestMetaBuild: 'Scarlet Katana + Mirage Step + Stance Breaker',
      bossMechanicCrackRate: '91% Cracked',
      keyTactics: [
        'Detect 3rd frame of boss telegraph to trigger parry counter',
        'Triple-backstep counter against Phase 2 frenzy whirlwind'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to witness flawless blade boss fight'
    }
  },
  {
    id: 'deep-space-mining',
    name: 'Asteroid Excavator IO',
    category: 'Multiplayer & IO',
    tagline: 'Competitive territory expansion · Dynamic magnetic energy absorption',
    description: 'Multiplayer space arena IO. Agent navigates gravitational pulls to encircle resource clusters and conquer sector dominance.',
    heatRank: 5,
    heatScore: 112000,
    activePlayers: 28900,
    rating: 4.7,
    difficulty: 'Casual',
    crackProgress: 99,
    isNew: true,
    themeGradient: 'from-violet-600 via-purple-600 to-indigo-800',
    emoji: '🌌',
    agentReport: {
      agentModel: 'GravityPilot-v3.3',
      clearRate24h: '98.5%',
      speedrunRecord: 'Rank 1 Global Dominance',
      totalSimulatedRuns: 430000,
      bestMetaBuild: 'Gravity Well + Turbo Booster + Magnetic Scoop',
      bossMechanicCrackRate: '99% Cracked',
      keyTactics: [
        'Orbit outer perimeter to amass early mass before inward sweep',
        'Reverse thruster brake baiting pursuers into asteroid fields'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to launch multiplayer arena auto-play'
    }
  },
  {
    id: 'pixel-dungeon-crawler',
    name: 'Chrono Crypt Crawler',
    category: 'Action & Roguelike',
    tagline: 'Procedural dungeon mapping · High-yield risk/reward path generation',
    description: 'Retro pixel dungeon crawler. Agent calculates risk-adjusted path trees and solves lethal environmental trap rooms.',
    heatRank: 6,
    heatScore: 104200,
    activePlayers: 25400,
    rating: 4.8,
    difficulty: 'Hardcore',
    crackProgress: 94,
    isNew: true,
    themeGradient: 'from-amber-600 via-orange-600 to-red-700',
    emoji: '🗝️',
    agentReport: {
      agentModel: 'DungeonNet-v2.9',
      clearRate24h: '92.4%',
      speedrunRecord: 'Floor 50 Clear',
      totalSimulatedRuns: 370000,
      bestMetaBuild: 'Vampiric Dagger + Stealth Cloak + Chrono Amulet',
      bossMechanicCrackRate: '94% Cracked',
      keyTactics: [
        'Prioritize treasure vault route branches under 15% risk threshold',
        'Conserve i-frame roll for spikes and hidden pressure plates'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to enter dungeon with AI tactical map'
    }
  },
  {
    id: 'stellar-fleet-command',
    name: 'Starfall Armada RTS',
    category: 'Strategy & Auto-Chess',
    tagline: 'Macro resource allocation · 3D fleet formation & micro skirmishing',
    description: 'Grand space armada RTS. Agent controls hundreds of dreadnoughts and fighter wings simultaneously with split-second precision.',
    heatRank: 7,
    heatScore: 98700,
    activePlayers: 22100,
    rating: 4.9,
    difficulty: 'Tactical',
    crackProgress: 89,
    isHot: true,
    themeGradient: 'from-blue-700 via-indigo-800 to-slate-900',
    emoji: '🚀',
    agentReport: {
      agentModel: 'ArmadaBrain-v8.1',
      clearRate24h: '89.7%',
      speedrunRecord: '6m 12s Sector Clear',
      totalSimulatedRuns: 710000,
      bestMetaBuild: '3 Carrier Wings + 12 Aegis Frigates + Ion Cannon',
      bossMechanicCrackRate: '89% Cracked',
      keyTactics: [
        'Flank flankers using stealth corvettes to disrupt supply lines',
        'Focus-fire enemy flagships with coordinated warp-in strikes'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to observe fleet armada macro execution'
    }
  },
  {
    id: 'neon-synth-racer',
    name: 'Neon Velocity 2099',
    category: 'Casual & Puzzle',
    tagline: 'Perfect apex cornering · Microsecond drift boosts & rhythm alignment',
    description: 'High-speed synthwave antigravity racer. Agent calculates optimal racing lines and micro-drifts at 900 km/h.',
    heatRank: 8,
    heatScore: 92300,
    activePlayers: 19800,
    rating: 4.8,
    difficulty: 'Casual',
    crackProgress: 97,
    isNew: true,
    themeGradient: 'from-fuchsia-600 via-pink-600 to-rose-500',
    emoji: '🏎️',
    agentReport: {
      agentModel: 'ApexRacer-v4.2',
      clearRate24h: '97.1%',
      speedrunRecord: 'Lap Record 42.18s',
      totalSimulatedRuns: 590000,
      bestMetaBuild: 'Plasma Overdrive + Magnetic Tires + Aero Foil',
      bossMechanicCrackRate: '97% Cracked',
      keyTactics: [
        'Clip inner curb at 45° angle to maintain 100% boost chain',
        'Draft behind rival slipstreams for instant overtaking'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to test AI lap time records'
    }
  },
  {
    id: 'elemental-alchemist',
    name: 'Spellbound Alchemy Lab',
    category: 'Casual & Puzzle',
    tagline: 'Complex chain-reaction synthesis · 12-combo cascade formulas',
    description: 'Enchanting puzzle alchemy game. Agent pre-computes 8 steps ahead to trigger screen-clearing elemental chain reactions.',
    heatRank: 9,
    heatScore: 86400,
    activePlayers: 17600,
    rating: 4.7,
    difficulty: 'Casual',
    crackProgress: 99,
    themeGradient: 'from-teal-500 via-emerald-600 to-green-700',
    emoji: '🧪',
    agentReport: {
      agentModel: 'AlchemyLogic-v3.0',
      clearRate24h: '99.1%',
      speedrunRecord: 'Score 1,420,000',
      totalSimulatedRuns: 450000,
      bestMetaBuild: 'Catalyst Flask + Prism Gem + Storm Essence',
      bossMechanicCrackRate: '99% Cracked',
      keyTactics: [
        'Anchor fire/water combinations at the base row for cascade loops',
        'Trigger super-reagents during multiplier frenzy windows'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to simulate 12-chain puzzle cascade'
    }
  },
  {
    id: 'quantum-shatter',
    name: 'Vortex Bullet Storm',
    category: 'Shooter & Arena',
    tagline: 'Hypersonic twin-stick shooting · Spatial warping & boss target locks',
    description: 'Relentless arena bullet-hell shooter. Agent utilizes sub-pixel positioning and continuous directional burst fire.',
    heatRank: 10,
    heatScore: 81200,
    activePlayers: 16100,
    rating: 4.9,
    difficulty: 'Hardcore',
    crackProgress: 93,
    isHot: true,
    themeGradient: 'from-purple-700 via-violet-600 to-indigo-600',
    emoji: '🛸',
    agentReport: {
      agentModel: 'StormPilot-v5.5',
      clearRate24h: '93.8%',
      speedrunRecord: 'Wave 80 Endless',
      totalSimulatedRuns: 820000,
      bestMetaBuild: 'Spread Laser + Phase Cloak + EMP Overcharger',
      bossMechanicCrackRate: '93% Cracked',
      keyTactics: [
        'Circle outer perimeter clock-wise to funnel enemy swarms',
        'Save EMP pulse exclusively for homing missile volleys'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to watch AI conquer bullet storm'
    }
  },
  {
    id: 'cyber-heist-matrix',
    name: 'Neural Breach 0x',
    category: 'Casual & Puzzle',
    tagline: 'Cryptographic node cracking · Optimal path traversal in sub-seconds',
    description: 'Cyberpunk node infiltration game. Agent decodes memory matrices and bypasses corporate firewalls in milliseconds.',
    heatRank: 11,
    heatScore: 75600,
    activePlayers: 14900,
    rating: 4.8,
    difficulty: 'Tactical',
    crackProgress: 95,
    isNew: true,
    themeGradient: 'from-cyan-600 via-blue-600 to-slate-900',
    emoji: '💾',
    agentReport: {
      agentModel: 'BreachNet-v4.0',
      clearRate24h: '95.6%',
      speedrunRecord: '0.84s Hack Time',
      totalSimulatedRuns: 610000,
      bestMetaBuild: 'Brute Force Worm + Ghost Protocol + Bit Shifter',
      bossMechanicCrackRate: '95% Cracked',
      keyTactics: [
        'Calculate shortest Hamiltonian path across security clusters',
        'Inject zero-day exploits before ICE triggers countermeasures'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to watch sub-second node breach'
    }
  },
  {
    id: 'mech-brawler-arena',
    name: 'Titan Clash Champions',
    category: 'Shooter & Arena',
    tagline: 'Physics-based mecha arena combat · Seismic shockwave combos',
    description: '3D physics arena brawl. Agent times wall-bounces and energy shield deflections to deliver crushing knockout finishers.',
    heatRank: 12,
    heatScore: 69800,
    activePlayers: 13200,
    rating: 4.7,
    difficulty: 'Hardcore',
    crackProgress: 90,
    themeGradient: 'from-red-600 via-orange-600 to-amber-600',
    emoji: '🥊',
    agentReport: {
      agentModel: 'BrawlerBot-v6.0',
      clearRate24h: '90.2%',
      speedrunRecord: '24 Consecutive KOs',
      totalSimulatedRuns: 540000,
      bestMetaBuild: 'Rocket Fist + Kinetic Plating + Shockwave Stomp',
      bossMechanicCrackRate: '90% Cracked',
      keyTactics: [
        'Buffer dash attacks to cancel heavy recovery frames',
        'Wall-pin opponents to prevent evasive tech rolls'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to start arena knockout gauntlet'
    }
  },
  {
    id: 'valkyrie-sky-battle',
    name: 'Valkyrie Aerial Assault',
    category: 'Shooter & Arena',
    tagline: 'High-altitude dogfighting · Dynamic lock-on missile saturation',
    description: 'Vertical arcade shoot-em-up. Agent calculates barrel-roll evasion vectors through massive airborne boss battle cruisers.',
    heatRank: 13,
    heatScore: 62400,
    activePlayers: 12000,
    rating: 4.8,
    difficulty: 'Tactical',
    crackProgress: 92,
    isNew: true,
    themeGradient: 'from-sky-500 via-indigo-600 to-blue-700',
    emoji: '✈️',
    agentReport: {
      agentModel: 'AceValkyrie-v5.0',
      clearRate24h: '92.1%',
      speedrunRecord: 'No Damage Victory',
      totalSimulatedRuns: 480000,
      bestMetaBuild: 'Homing Missiles + Afterburner + Mirror Shield',
      bossMechanicCrackRate: '92% Cracked',
      keyTactics: [
        'Hover at top-left screen quadrant during boss missile barrage',
        'Focus lock-on pods on the flagship core reactor'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to enter aerial dogfight'
    }
  },
  {
    id: 'nano-colony-sim',
    name: 'Nano Swarm Evolution',
    category: 'Multiplayer & IO',
    tagline: 'Self-replicating cellular conquest · Collective hivemind behavior',
    description: 'Microscopic cellular arena. Agent divides cells tactically to engulf smaller swarms while baiting apex predators.',
    heatRank: 14,
    heatScore: 56100,
    activePlayers: 10800,
    rating: 4.7,
    difficulty: 'Casual',
    crackProgress: 97,
    themeGradient: 'from-lime-500 via-emerald-600 to-teal-700',
    emoji: '🦠',
    agentReport: {
      agentModel: 'SwarmMind-v3.1',
      clearRate24h: '97.4%',
      speedrunRecord: 'Full Map Absorbed',
      totalSimulatedRuns: 390000,
      bestMetaBuild: 'Mitosis Surge + Cytoplasm Armor + Spore Spray',
      bossMechanicCrackRate: '97% Cracked',
      keyTactics: [
        'Split into 4 sub-swarms for rapid resource harvesting',
        'Recombine instantly when approaching rival cellular clusters'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to spawn nano swarm auto-play'
    }
  },
  {
    id: 'rogue-deck-builder',
    name: 'Infinite Deck Protocol',
    category: 'Strategy & Auto-Chess',
    tagline: 'Infinite card draw engine · Turn-1 OTK deck architecture',
    description: 'Roguelike deckbuilder. Agent calculates draw pile probabilities, culling dead cards to construct 1-turn kill infinite loops.',
    heatRank: 15,
    heatScore: 48900,
    activePlayers: 9400,
    rating: 4.9,
    difficulty: 'Tactical',
    crackProgress: 95,
    isHot: true,
    themeGradient: 'from-amber-600 via-red-600 to-rose-700',
    emoji: '🃏',
    agentReport: {
      agentModel: 'DeckZero-v5.0',
      clearRate24h: '95.2%',
      speedrunRecord: 'Ascension 20 Turn-1 Kill',
      totalSimulatedRuns: 690000,
      bestMetaBuild: '0-Cost Draw Engine + Energy Multiplier Core',
      bossMechanicCrackRate: '95% Cracked',
      keyTactics: [
        'Trim deck down to 8 core cards for 100% infinite draw cycle',
        'Stack artifact multipliers before activating burst damage'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to launch infinite deck simulation'
    }
  },
  {
    id: 'gravity-jump',
    name: 'Zero-G Parkour Rush',
    category: 'Action & Roguelike',
    tagline: 'Antigravity high-speed parkour · Frame-perfect grappling speedruns',
    description: 'Fast-paced physics platformer. Agent utilizes grappling hook momentum and zero-G shifts to vault across laser obstacle courses.',
    heatRank: 16,
    heatScore: 44200,
    activePlayers: 8500,
    rating: 4.7,
    difficulty: 'Hardcore',
    crackProgress: 96,
    themeGradient: 'from-indigo-500 via-cyan-500 to-emerald-400',
    emoji: '🏃',
    agentReport: {
      agentModel: 'MomentumAI-v3.5',
      clearRate24h: '96.1%',
      speedrunRecord: '0m 48s World Record',
      totalSimulatedRuns: 380000,
      bestMetaBuild: 'Quantum Grapple + Blink Boots',
      bossMechanicCrackRate: '96% Cracked',
      keyTactics: [
        'Release grapple at tangent apex for +220% initial kinetic speed',
        'Wall-slide cancel to bypass gravitational friction zones'
      ],
      recentExecutionLogs: [],
      recommendedAction: 'Click to watch parkour speedrun'
    }
  }
];

export function createDemoScreenshotDataUrl(
  gameName: string,
  accentColor = '#6366f1',
  patternLabel = 'WASD Micro-Dodge + Dash Vector'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="200" viewBox="0 0 360 200">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect width="360" height="200" fill="url(#bg)"/>
    <g stroke="rgba(99,102,241,0.14)" stroke-width="1">
      <line x1="0" y1="40" x2="360" y2="40"/>
      <line x1="0" y1="80" x2="360" y2="80"/>
      <line x1="0" y1="120" x2="360" y2="120"/>
      <line x1="0" y1="160" x2="360" y2="160"/>
      <line x1="60" y1="0" x2="60" y2="200"/>
      <line x1="120" y1="0" x2="120" y2="200"/>
      <line x1="180" y1="0" x2="180" y2="200"/>
      <line x1="240" y1="0" x2="240" y2="200"/>
      <line x1="300" y1="0" x2="300" y2="200"/>
    </g>
    <!-- Recorded trajectory path -->
    <path d="M 55 145 Q 115 65 185 110 T 295 62" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-dasharray="5,4"/>
    <circle cx="55" cy="145" r="5" fill="#10b981"/>
    <circle cx="185" cy="110" r="7" fill="${accentColor}"/>
    <circle cx="185" cy="110" r="16" fill="none" stroke="#10b981" stroke-width="1.2" stroke-dasharray="3,3"/>
    <!-- Boss threat nodes -->
    <circle cx="265" cy="88" r="12" fill="#f43f5e" fill-opacity="0.85"/>
    <circle cx="135" cy="68" r="8" fill="#a855f7" fill-opacity="0.85"/>
    <circle cx="230" cy="142" r="9" fill="#f59e0b" fill-opacity="0.85"/>
    <!-- HUD Frame Overlay -->
    <rect x="10" y="10" width="175" height="22" rx="5" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.15)"/>
    <circle cx="21" cy="21" r="4" fill="#ef4444"/>
    <text x="31" y="25" fill="#f8fafc" font-family="monospace" font-size="10" font-weight="bold">FOLLOW SNAPSHOT · ${gameName.slice(0, 14)}</text>
    <rect x="10" y="166" width="340" height="24" rx="5" fill="rgba(15,23,42,0.88)" stroke="rgba(99,102,241,0.3)"/>
    <text x="18" y="182" fill="#a5b4fc" font-family="monospace" font-size="10">${patternLabel.slice(0, 44)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_USER_AGENT: UserAgent = {
  name: 'Striker-01',
  avatarId: 'cyber-striker',
  level: 4,
  title: 'Apex Esports Combat Agent',
  tacticalDepth: 88,
  microExecution: 94,
  patternRecognition: 85,
  bossMechanicCracking: 82,
  tacticalStyle: 'Balanced Adaptive',
  customDirectives: [
    'Always prioritize evasion against boss frenzy ultimates, never overextend',
    'In auto-battlers and grid tactics, always counter enemy flankers first',
    'Automatically initiate maximum-range hit-and-run when health falls below 30%'
  ],
  perks: [
    {
      id: 'skill-kiting',
      name: 'Micro-Kiting Thruster',
      shortName: 'kiting',
      gameId: 'cyber-survivor',
      gameName: 'Cyber Survivor',
      gameEmoji: '⚡',
      description: 'Maintain maximum effective range while moving and firing at full speed',
      unlocked: true,
      requiredLevel: 1,
      skillLevel: 3,
      maxSkillLevel: 5,
      version: 'v3.0',
      updatedAt: '2h ago',
      metricLabel: '450 APM Kiting'
    },
    {
      id: 'skill-parry',
      name: '0.04s Frame-Perfect Parry',
      shortName: 'parry',
      gameId: 'blade-souls',
      gameName: 'Shadow Ronin Duel',
      gameEmoji: '⚔️',
      description: 'Detect opponent windups at the frame level and nullify damage with i-frames',
      unlocked: true,
      requiredLevel: 2,
      skillLevel: 2,
      maxSkillLevel: 5,
      version: 'v2.0',
      updatedAt: '5h ago',
      metricLabel: '3-Frame Counter'
    },
    {
      id: 'skill-heatmap',
      name: 'Boss Telegraph Heatmap',
      shortName: 'heatmap',
      gameId: 'cyber-survivor',
      gameName: 'Cyber Survivor',
      gameEmoji: '⚡',
      description: 'Project real-time bullet-hell trajectories and safe blindspots on screen',
      unlocked: true,
      requiredLevel: 3,
      skillLevel: 3,
      maxSkillLevel: 5,
      version: 'v3.0',
      updatedAt: '1d ago',
      metricLabel: '98.2% Evasion'
    },
    {
      id: 'skill-synergy',
      name: 'Synergy Overload',
      shortName: 'synergy',
      gameId: 'mecha-siege',
      gameName: 'Tactical Mecha Chess',
      gameEmoji: '🤖',
      description: 'Dynamically adapt gear and synergy trees mid-fight, boosting burst output by 40%',
      unlocked: true,
      requiredLevel: 4,
      skillLevel: 2,
      maxSkillLevel: 5,
      version: 'v2.0',
      updatedAt: '2d ago',
      metricLabel: '+40% Burst DPS'
    },
    {
      id: 'skill-swarm',
      name: 'Neural Swarm Link',
      shortName: 'swarm',
      gameId: 'citadel-defense',
      gameName: 'Fortress Matrix TD',
      gameEmoji: '🏰',
      description: 'Deconstruct unfamiliar boss mechanics in real time using multi-path simulation',
      unlocked: true,
      requiredLevel: 5,
      skillLevel: 1,
      maxSkillLevel: 5,
      version: 'v1.0',
      updatedAt: '3d ago',
      metricLabel: 'Zero-Latency Sync'
    }
  ]
};

export const INITIAL_BEHAVIOR_TRACES: BehaviorTraceExample[] = [
  {
    id: 'demo-autoplay-1',
    recordSource: 'autoplay',
    gameId: 'cyber-survivor',
    gameName: 'Cyber Survivor',
    gameEmoji: '⚡',
    title: 'Autoplay Wave 30 Boss Flawless Clear',
    capturedPattern: 'Autonomous 448 APM kiting vector + zero-hit laser sweep evasion',
    screenshotUrl: createDemoScreenshotDataUrl('Cyber Survivor', '#10b981', 'AUTOPLAY: [448 APM] BOSS CLEAR · 0 DMG TAKEN'),
    operationData: {
      keystrokes: 'Auto-Vector(360°) -> Frame Parry (34ms) -> Burst Lock',
      apm: 448,
      reactionMs: 34,
      inputVectors: 1840
    },
    framesCount: 1840,
    efficiencyScore: '98.9%',
    recordedAt: '8m ago',
    statBoost: { microExecution: 4, bossMechanicCracking: 3 },
    trained: false
  },
  {
    id: 'demo-autoplay-2',
    recordSource: 'autoplay',
    gameId: 'neon-arena',
    gameName: 'Neon Cyber Arena',
    gameEmoji: '🔫',
    title: 'Autoplay 1v3 Clutch & Railgun Snap',
    capturedPattern: 'Autonomous flick-aim lock + shield parry counter under crossfire',
    screenshotUrl: createDemoScreenshotDataUrl('Neon Arena', '#8b5cf6', 'AUTOPLAY: [436 APM] 1v3 CLUTCH · 99.1% ACC'),
    operationData: {
      keystrokes: 'AimLock(192,84) -> Slide Cancel -> Railgun Headshot',
      apm: 436,
      reactionMs: 31,
      inputVectors: 1560
    },
    framesCount: 1560,
    efficiencyScore: '99.1%',
    recordedAt: '35m ago',
    statBoost: { microExecution: 3, tacticalDepth: 3 },
    trained: true
  },
  {
    id: 'demo-1',
    recordSource: 'follow',
    gameId: 'cyber-survivor',
    gameName: 'Cyber Survivor',
    gameEmoji: '⚡',
    title: 'Diagonal i-Frame Dodge & Edge Kiting',
    capturedPattern: 'WASD micro-stutter + 0.04s dash cancel around 360° boss laser sweep',
    screenshotUrl: createDemoScreenshotDataUrl('Cyber Survivor', '#06b6d4', 'FOLLOW: [W+D] 412 APM · SPACE DASH @ 38ms'),
    operationData: {
      keystrokes: 'W+D hold -> Space i-frame (38ms) -> LMB burst',
      apm: 412,
      reactionMs: 38,
      inputVectors: 1420
    },
    framesCount: 1420,
    efficiencyScore: '96.4%',
    recordedAt: '12m ago',
    statBoost: { microExecution: 3, patternRecognition: 2 },
    trained: false
  },
  {
    id: 'demo-2',
    recordSource: 'follow',
    gameId: 'mecha-siege',
    gameName: 'Tactical Mecha Chess',
    gameEmoji: '🤖',
    title: 'Round 4 Eco Roll & Hex Flank Counter',
    capturedPattern: '50-gold interest lock + last-second backline sniper hex swap',
    screenshotUrl: createDemoScreenshotDataUrl('Mecha Chess', '#3b82f6', 'FOLLOW: [D-Roll x4] -> HEX(B4->F2) @ 120ms'),
    operationData: {
      keystrokes: 'Key[D] roll x4 -> Drag(B4->F2) -> Lock Shop',
      apm: 265,
      reactionMs: 52,
      inputVectors: 860
    },
    framesCount: 860,
    efficiencyScore: '94.1%',
    recordedAt: '1h ago',
    statBoost: { tacticalDepth: 4, patternRecognition: 2 },
    trained: false
  },
  {
    id: 'demo-3',
    recordSource: 'follow',
    gameId: 'citadel-defense',
    gameName: 'Fortress Matrix TD',
    gameEmoji: '🏰',
    title: 'Spiral Chokepoint Slow-Grid Routing',
    capturedPattern: 'Overlapping cryo-tower placement maximizing enemy path length by 310%',
    screenshotUrl: createDemoScreenshotDataUrl('Fortress Matrix', '#10b981', 'FOLLOW: GRID[C3,D4,E3] CRYO+RAIL OVERLAP'),
    operationData: {
      keystrokes: 'Build[Q] @ C3,D4 -> Upgrade[E] Railgun Priority',
      apm: 218,
      reactionMs: 64,
      inputVectors: 640
    },
    framesCount: 640,
    efficiencyScore: '97.8%',
    recordedAt: 'Yesterday',
    statBoost: { tacticalDepth: 3, bossMechanicCracking: 3 },
    trained: true
  }
];

export const INITIAL_RESULT_EVENTS: AgentResultEvent[] = [
  {
    id: 'evt-1',
    title: 'AI Trained Demo · Spiral Chokepoint Slow-Grid',
    resultSummary: 'Assimilated 640 operation frames & screenshot telemetry from Fortress Matrix TD.',
    type: 'Demo Trained',
    timestamp: 'Yesterday',
    metricDelta: 'Tactical Depth +3% · Boss Cracking +3%',
    relatedName: 'Fortress Matrix TD'
  },
  {
    id: 'evt-2',
    title: 'Skill Upgraded · Micro-Kiting Thruster v3.0',
    resultSummary: 'Upgraded kiting vector weights using live arena telemetry.',
    type: 'Skill Upgraded',
    timestamp: '2h ago',
    metricDelta: 'Version v2.0 → v3.0 · 450 APM Locked',
    relatedName: 'Micro-Kiting Thruster'
  }
];

export const INITIAL_AGENT_LOGS: AgentLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '10:14:22',
    source: 'System',
    message: '3D Neural Core & Web Speech TTS broadcast initialized',
    detail: 'Voice output active (en-US · Rate 1.06x)'
  },
  {
    id: 'log-2',
    timestamp: '10:18:05',
    source: 'GameAPI',
    message: 'Connected to RandSeed Game Telemetry Hook v2.4',
    detail: 'Ready for Follow frame capture & Auto-Pilot input injection'
  },
  {
    id: 'log-3',
    timestamp: '10:25:40',
    source: 'Follow',
    message: 'Captured demo snapshot & 1,420 input vectors in Cyber Survivor',
    detail: 'Keystrokes: W+D hold -> Space i-frame (38ms) · 412 APM'
  }
];


