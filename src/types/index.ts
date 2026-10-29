export interface AgentExecutionLog {
  timestamp: string;
  action: string;
  outcome: string;
  delta: string;
}

export interface AgentReport {
  agentModel: string;
  clearRate24h: string; // e.g. "94.2%"
  speedrunRecord: string; // e.g. "2m 14s"
  totalSimulatedRuns: number; // e.g. 520,000
  bestMetaBuild: string; // e.g. "Neon Katana + Lightning Dash + Overload Ring"
  bossMechanicCrackRate: string; // e.g. "98% Cracked"
  keyTactics: string[];
  recentExecutionLogs: AgentExecutionLog[];
  recommendedAction: string;
}

export type GameCategory = 
  | 'Action & Roguelike'
  | 'Strategy & Auto-Chess'
  | 'Tower Defense'
  | 'Shooter & Arena'
  | 'Casual & Puzzle'
  | 'Multiplayer & IO';

export interface GameItem {
  id: string;
  shortName?: string; // e.g. "cyber", "mecha", "td"
  name: string;
  category: GameCategory;
  tagline: string;
  description: string;
  heatRank: number;
  heatScore: number;
  activePlayers: number;
  rating: number; // e.g. 4.9
  difficulty?: 'Casual' | 'Tactical' | 'Hardcore' | 'Nightmare';
  crackProgress: number; // 0 - 100 percentage
  themeGradient: string; // CSS gradient for game cover
  badgeText?: string;
  emoji: string;
  isFeatured?: boolean;
  isHot?: boolean;
  isNew?: boolean;
  agentReport: AgentReport;
}

export interface AgentPerk {
  id: string;
  name: string;
  shortName?: string;
  gameId?: string;
  gameName?: string;
  gameEmoji?: string;
  description: string;
  unlocked: boolean;
  requiredLevel: number;
  skillLevel?: number;
  maxSkillLevel?: number;
  version?: string;
  updatedAt?: string;
  metricLabel?: string;
}

export type AgentAvatarId =
  | 'cyber-striker'
  | 'crimson-vanguard'
  | 'quantum-phantom'
  | 'aegis-titan'
  | 'void-overlord'
  | 'custom-prompt';

export interface CustomAvatarStyle {
  prompt: string;
  primaryColor: string;
  secondaryColor: string;
  chassisColor: string;
  hasHorns?: boolean;
  hasCrystal?: boolean;
  haloCount?: number; // 1 or 2
  particleCount?: number;
  rotationSpeed?: number;
  pulseRate?: number;
}

export interface AgentAvatarPreset {
  id: AgentAvatarId;
  name: string;
  code: string;
  primaryColor: string;
  badgeClass: string;
  description: string;
}

export interface UserAgent {
  name: string;
  avatarId: AgentAvatarId;
  customStyle?: CustomAvatarStyle;
  level: number;
  title: string;
  tacticalDepth: number; // 0 - 100
  microExecution: number;  // 0 - 100
  patternRecognition: number; // 0 - 100
  bossMechanicCracking: number;  // 0 - 100
  tacticalStyle: 'Defensive & Counter' | 'Balanced Adaptive' | 'Aggressive Rush';
  customDirectives: string[];
  perks: AgentPerk[];
}

export interface UserState {
  isRegistered: boolean;
  username: string;
  email: string;
  freeCreditClaimed: boolean;
  credits: number; // 1,000 Energy Coins
  agent: UserAgent;
}

export interface BehaviorTraceExample {
  id: string;
  recordSource?: 'autoplay' | 'follow';
  gameId: string;
  gameName: string;
  gameEmoji: string;
  title: string;
  capturedPattern: string;
  screenshotUrl: string;
  operationData: {
    keystrokes: string;
    apm: number;
    reactionMs: number;
    inputVectors: number;
  };
  framesCount: number;
  efficiencyScore: string;
  recordedAt: string;
  statBoost: {
    tacticalDepth?: number;
    microExecution?: number;
    patternRecognition?: number;
    bossMechanicCracking?: number;
  };
  trained: boolean;
}

export interface AgentResultEvent {
  id: string;
  title: string;
  resultSummary: string;
  type: 'Demo Trained' | 'Skill Upgraded' | 'Takeover Result';
  timestamp: string;
  metricDelta: string;
  relatedName?: string;
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  source: 'Copilot' | 'Autoplay' | 'Auto-Pilot' | 'Follow' | 'GameAPI' | 'System';
  message: string;
  detail?: string;
}

export interface ChatAttachment {
  id: string;
  type: 'game' | 'skill' | 'demo';
  name: string;
  subtitle: string;
  emoji?: string;
  screenshotUrl?: string;
  gameId?: string;
  gameName?: string;
}

export interface ChatConfirmPrompt {
  type: 'MULTI_GAME_TRAINING' | 'AGENT_ACTIVATION';
  title: string;
  description: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  games?: { id: string; name: string; emoji: string; count: number }[];
  traceIds?: string[];
  resolvedText?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  requiresAuth?: boolean;
  confirmPrompt?: ChatConfirmPrompt;
  tacticalSummary?: {
    winRate: string;
    apm: string;
    build: string;
  };
  actionPayload?: {
    type: 'LAUNCH_GAME' | 'STRATEGY_GENERATED' | 'SIMULATION_RESULT';
    gameId?: string;
    gameTitle?: string;
    details?: string;
    simulatedClearRate?: string;
    simulatedScore?: string;
  };
}

export interface ChatConversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}
