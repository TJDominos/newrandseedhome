/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserState,
  GameItem,
  ChatMessage,
  ChatConversation,
  ChatAttachment,
  UserAgent,
  AgentResultEvent,
  AgentLogEntry
} from './types';
import {
  INITIAL_GAMES,
  INITIAL_USER_AGENT,
  INITIAL_RESULT_EVENTS,
  INITIAL_AGENT_LOGS
} from './data/games';
import { AppHeader, PlatformPlayerState } from './components/AppHeader';
import { HumanoidAgent, AgentPanelTab } from './components/HumanoidAgent';
import { GameRankingSection } from './components/GameRankingSection';
import { PersonalCenterSidebar } from './components/PersonalCenterSidebar';
import { BottomActionBar } from './components/BottomActionBar';
import { AuthModal } from './components/AuthModal';
import { ArcadeGameModal } from './components/ArcadeGameModal';
import { Bot, ChevronRight, GripVertical } from 'lucide-react';

const STORAGE_KEY_CONVERSATIONS = 'randseed_agent_conversations_v2';
const STORAGE_KEY_EVENTS = 'randseed_agent_result_events_v2';
const STORAGE_KEY_LOGS = 'randseed_agent_logs_v2';
const STORAGE_KEY_AGENT_WIDTH = 'randseed_agent_width_v2';

const MIN_AGENT_WIDTH = 360;
const MAX_AGENT_WIDTH = 680;
const DEFAULT_AGENT_WIDTH = 448;

const DEFAULT_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    title: 'Cyber Survivor Tactics',
    updatedAt: 'Just now',
    messages: [
      {
        id: 'm1',
        sender: 'agent',
        text: 'Ready for deployment. Ask me any tactical question or use the "+" button next to the microphone to link a Game, Skill, or Follow Demo.',
        timestamp: 'Just now'
      }
    ]
  },
  {
    id: 'conv-2',
    title: 'Mecha Chess Hex Positioning',
    updatedAt: 'Yesterday',
    messages: [
      {
        id: 'm2-1',
        sender: 'user',
        text: 'How should I position backline snipers against assassins in Round 4?',
        timestamp: 'Yesterday'
      },
      {
        id: 'm2-2',
        sender: 'agent',
        text: 'Place two decoy heavy mechs on hexes A2 and F2 while shifting your Quantum Snipers to C1. This forces enemy assassins to aggro the tanks first.',
        timestamp: 'Yesterday'
      }
    ]
  }
];

export default function App() {
  const [userState, setUserState] = useState<UserState>({
    isRegistered: true,
    username: 'Commander',
    email: 'commander@randseed.ai',
    freeCreditClaimed: true,
    credits: 1000,
    agent: INITIAL_USER_AGENT
  });

  const [games] = useState<GameItem[]>(INITIAL_GAMES);
  const [agentTab, setAgentTab] = useState<AgentPanelTab>('chat');
  const [personalCenterOpen, setPersonalCenterOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);

  // Left Sidebar is the Agent: default expanded (true)
  const [isAgentOpen, setIsAgentOpen] = useState<boolean>(true);
  const [agentWidth, setAgentWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AGENT_WIDTH);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!Number.isNaN(parsed)) {
          return Math.min(MAX_AGENT_WIDTH, Math.max(MIN_AGENT_WIDTH, parsed));
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_AGENT_WIDTH;
  });
  const [isResizingAgent, setIsResizingAgent] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AGENT_WIDTH, String(agentWidth));
    } catch {
      // ignore
    }
  }, [agentWidth]);

  const handleStartResizeAgent = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = agentWidth;
    setIsResizingAgent(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const dynamicMax = Math.min(MAX_AGENT_WIDTH, Math.floor(window.innerWidth * 0.55));
      const effectiveMax = Math.max(MIN_AGENT_WIDTH, dynamicMax);
      const nextWidth = Math.min(effectiveMax, Math.max(MIN_AGENT_WIDTH, startWidth + deltaX));
      setAgentWidth(nextWidth);
    };

    const handlePointerUp = () => {
      setIsResizingAgent(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Active Arcade Game Modal state
  const [arcadeGameOpen, setArcadeGameOpen] = useState<boolean>(false);
  const [activeGame, setActiveGame] = useState<GameItem>(INITIAL_GAMES[0]);
  const [activeGameMode, setActiveGameMode] = useState<'auto' | 'copilot' | 'manual'>('copilot');

  // Historical Conversations State (Strictly User Questions & Agent Replies)
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_CONVERSATIONS;
  });
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');

  // Result Events State (Strictly Outcome Milestones: AI Trained Demo, Skill Upgraded)
  const [resultEvents, setResultEvents] = useState<AgentResultEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_RESULT_EVENTS;
  });

  // Agent Telemetry Log State (All non-chat, non-event logs)
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_AGENT_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    } catch {
      // ignore
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(resultEvents));
    } catch {
      // ignore
    }
  }, [resultEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(agentLogs));
    } catch {
      // ignore
    }
  }, [agentLogs]);

  // Add a runtime telemetry log entry (goes to Log tab, never to Chat)
  const handleAddAgentLog = (
    source: AgentLogEntry['source'],
    message: string,
    detail?: string
  ) => {
    const nowStr = new Date().toTimeString().slice(0, 8);
    setAgentLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: nowStr,
        source,
        message,
        detail
      },
      ...prev
    ]);
  };

  // Add an outcome Result Event (goes to Events tab)
  const handleAddResultEvent = (evt: Omit<AgentResultEvent, 'id' | 'timestamp'>) => {
    setResultEvents((prev) => [
      {
        ...evt,
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: 'Just now'
      },
      ...prev
    ]);
  };

  // Create a new Conversation
  const handleNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: ChatConversation = {
      id: newId,
      title: `New Conversation #${conversations.length + 1}`,
      updatedAt: 'Just now',
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'agent',
          text: `New tactical conversation initialized. Use "+" to link a Game, Skill, or Game Record, or ask me directly.`,
          timestamp: 'Just now'
        }
      ]
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    handleAddAgentLog('System', `Created new conversation "${newConv.title}"`);
  };

  // Delete a Conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) return DEFAULT_CONVERSATIONS;
      if (id === activeConversationId) {
        setActiveConversationId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Append a message to the active conversation
  const appendMessageToActiveConversation = (msg: ChatMessage, newTitleCandidate?: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== activeConversationId) return conv;
        const shouldUpdateTitle =
          newTitleCandidate &&
          conv.title.startsWith('New Conversation') &&
          conv.messages.length <= 2;
        return {
          ...conv,
          title: shouldUpdateTitle ? newTitleCandidate.slice(0, 28) : conv.title,
          updatedAt: 'Just now',
          messages: [...conv.messages, msg]
        };
      })
    );
  };

  // Update a message inside the active conversation (e.g., when user clicks Confirm on an in-Agent prompt card)
  const handleUpdateMessageInActiveConversation = (
    messageId: string,
    updater: (msg: ChatMessage) => ChatMessage
  ) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== activeConversationId) return conv;
        return {
          ...conv,
          updatedAt: 'Just now',
          messages: conv.messages.map((m) => (m.id === messageId ? updater(m) : m))
        };
      })
    );
  };

  // Launch instant play game
  const handleLaunchGame = (
    game: GameItem,
    mode: 'auto' | 'copilot' | 'manual' = 'copilot'
  ) => {
    setActiveGame(game);
    setActiveGameMode(mode);
    setArcadeGameOpen(true);
    handleAddAgentLog(
      'GameAPI',
      `Launched ${game.name} in ${mode.toUpperCase()} mode`,
      `Telemetry hook active · Frame & input capture ready`
    );
  };

  // Handle game session completion
  const handleGameVictory = (scoreGained: number) => {
    setUserState((prev) => ({
      ...prev,
      credits: prev.credits + Math.floor(scoreGained / 20)
    }));
    handleAddAgentLog(
      'GameAPI',
      `Completed combat session in ${activeGame.name}`,
      `Final Score: ${scoreGained.toLocaleString()}`
    );
  };

  // Handle user question submission in Chat (with optional Game / Skill / Demo attachments)
  // All prompts/confirmations stay strictly inside the Agent panel — never opens a browser-wide modal.
  const handleSendMessage = (text: string, attachments?: ChatAttachment[]) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
      attachments
    };

    appendMessageToActiveConversation(userMsg, text);
    setIsAgentThinking(true);

    const linkedDemos = attachments?.filter((a) => a.type === 'demo') || [];
    const linkedSkills = attachments?.filter((a) => a.type === 'skill') || [];
    const linkedGames = attachments?.filter((a) => a.type === 'game') || [];

    // Check if attached Game Records come from multiple distinct games
    const distinctDemoGames = Array.from(
      new Map(
        linkedDemos.map((d) => {
          const gKey = d.gameId || d.name.split('·')[0].trim();
          const gName = d.gameName || d.name.split('·')[0].trim();
          return [
            gKey,
            {
              id: gKey,
              name: gName,
              emoji: d.emoji || '🎮',
              count: linkedDemos.filter(
                (item) => (item.gameId || item.name.split('·')[0].trim()) === gKey
              ).length
            }
          ];
        })
      ).values()
    );

    if (!userState.isRegistered) {
      setPendingPrompt(text);
      setTimeout(() => {
        setIsAgentThinking(false);
        const authReqMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'agent',
          text: `Received your directive: "${text}". Click Confirm below inside the Agent panel to activate your tactical session.`,
          timestamp: 'Just now',
          requiresAuth: true,
          confirmPrompt: {
            type: 'AGENT_ACTIVATION',
            title: 'Confirm Agent Activation (确认激活 Agent)',
            description: 'Activate full neural tactical synthesis and skill evolution inside the Agent.',
            status: 'pending'
          }
        };
        appendMessageToActiveConversation(authReqMsg);
      }, 350);
      return;
    }

    // If user attached Game Records from multiple different games in Chat, prompt inside Agent to confirm Multi-Game Simultaneous Training
    if (distinctDemoGames.length > 1) {
      setTimeout(() => {
        setIsAgentThinking(false);
        const multiGameConfirmMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'agent',
          text: `Detected ${linkedDemos.length} Game Records across ${distinctDemoGames.length} different games (${distinctDemoGames
            .map((g) => `${g.emoji} ${g.name}`)
            .join(', ')}). Please confirm below whether to run simultaneous multi-game training:`,
          timestamp: 'Just now',
          confirmPrompt: {
            type: 'MULTI_GAME_TRAINING',
            title: 'Multi-Game Simultaneous Training? (是否多游戏同时训练)',
            description: `Train ${linkedDemos.length} records from ${distinctDemoGames
              .map((g) => g.name)
              .join(' + ')} simultaneously to upgrade tactical skills.`,
            status: 'pending',
            games: distinctDemoGames,
            traceIds: linkedDemos.map((d) => d.id)
          }
        };
        appendMessageToActiveConversation(multiGameConfirmMsg);
      }, 350);
      return;
    }

    setTimeout(() => {
      setIsAgentThinking(false);

      let replyParts: string[] = [];
      if (linkedGames.length > 0) {
        replyParts.push(
          `Linked Game [${linkedGames.map((g) => g.name).join(', ')}]: Loaded boss telegraph heatmaps and optimal speedrun routing.`
        );
      }
      if (linkedSkills.length > 0) {
        replyParts.push(
          `Linked Skill [${linkedSkills.map((s) => s.name).join(', ')}]: Calibrated execution timing and upgraded skill priority weights.`
        );
        handleAddResultEvent({
          title: `Skill Upgraded · ${linkedSkills[0].name}`,
          resultSummary: `Tuned skill weights via Chat directive: "${text.slice(0, 48)}"`,
          type: 'Skill Upgraded',
          metricDelta: 'Execution Precision +1.8%',
          relatedName: linkedSkills[0].name
        });
      }
      if (linkedDemos.length > 0) {
        replyParts.push(
          `Linked Game Record [${linkedDemos.map((d) => d.name).join(', ')}]: Analyzed captured screenshot frames & input vectors (${linkedDemos[0].subtitle}). Assimilated into neural model.`
        );
        handleAddResultEvent({
          title: `AI Trained Record · ${linkedDemos[0].name}`,
          resultSummary: `Trained on Game Record screenshot & input telemetry (${linkedDemos[0].subtitle}).`,
          type: 'Demo Trained',
          metricDelta: 'Micro-Execution +2% · Pattern Recog +2%',
          relatedName: linkedDemos[0].name
        });
      }

      if (replyParts.length === 0) {
        replyParts.push(
          `Understood: "${text}". I have adjusted my kiting radius and counter-timing weights (simulated clear rate 96.8%).`
        );
      }

      const agentReply: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'agent',
        text: replyParts.join(' '),
        timestamp: 'Just now'
      };
      appendMessageToActiveConversation(agentReply);
    }, 450);
  };

  const handleRegisterSuccess = (username: string, email: string) => {
    setUserState((prev) => ({
      ...prev,
      isRegistered: true,
      username,
      email,
      freeCreditClaimed: true,
      credits: 1000
    }));

    handleAddAgentLog('System', `User account "${username}" authenticated & activated`);

    if (pendingPrompt) {
      const promptToRun = pendingPrompt;
      setPendingPrompt(null);
      setTimeout(() => {
        const fulfilledMsg: ChatMessage = {
          id: `a-fulfill-${Date.now()}`,
          sender: 'agent',
          text: `Account activated. Tactical synthesis completed for "${promptToRun}". Ready for deployment.`,
          timestamp: 'Just now'
        };
        appendMessageToActiveConversation(fulfilledMsg);
      }, 300);
    }
  };

  const handleSignOut = () => {
    setUserState({
      isRegistered: false,
      username: 'Guest Player',
      email: '',
      freeCreditClaimed: false,
      credits: 1000,
      agent: INITIAL_USER_AGENT
    });
    handleAddAgentLog('System', 'User signed out; switched to Guest session');
  };

  const handleUpdateAgent = (updated: UserAgent) => {
    setUserState((prev) => ({
      ...prev,
      agent: updated
    }));
  };

  const handleUpdateUsername = (newName: string) => {
    setUserState((prev) => ({
      ...prev,
      username: newName
    }));
  };

  // Platform Player Header State
  const platformHeaderState: PlatformPlayerState = {
    session: {
      status: userState.isRegistered ? 'authenticated' : 'anonymous',
      user: userState.isRegistered
        ? { displayName: userState.username, avatarUrl: null }
        : null
    },
    notifications: { unreadCount: userState.isRegistered ? 0 : 1 }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Header as independent component: AppHeader without search */}
      <AppHeader
        agentOpen={isAgentOpen}
        onToggleAgent={() => setIsAgentOpen((prev) => !prev)}
        state={platformHeaderState}
        onSignIn={() => setAuthModalOpen(true)}
        signInPending={false}
        onSignOut={handleSignOut}
        onOpenNotifications={() => setPersonalCenterOpen(true)}
      />

      {/* 2. Main Responsive Workspace: global padding 16px (px-4 pt-4), left-aligned with Header sidebar toggle button */}
      <main className="flex-1 w-full mx-auto px-4 pt-4 lg:overflow-hidden flex flex-col">
        {/* If agent is collapsed on mobile or desktop, provide a quick reopen button bar */}
        {!isAgentOpen && (
          <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 mb-3 shadow-xs transition-all">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Bot className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">
                Agent Console ({userState.agent.name}) is collapsed
              </span>
            </div>
            <button
              onClick={() => setIsAgentOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Expand Agent</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-stretch h-full min-h-0 gap-6 lg:gap-0">
          
          {/* LEFT COLUMN / SIDEBAR: Resizable Agent Console (min 340px, max 680px) */}
          {isAgentOpen && (
            <>
              <div
                style={
                  {
                    '--agent-width': `${agentWidth}px`,
                    '--agent-min-width': `${MIN_AGENT_WIDTH}px`,
                    '--agent-max-width': `${MAX_AGENT_WIDTH}px`
                  } as React.CSSProperties
                }
                className="w-full lg:w-[var(--agent-width)] lg:min-w-[var(--agent-min-width)] lg:max-w-[var(--agent-max-width)] lg:shrink-0 h-full min-h-0"
              >
                <HumanoidAgent
                  userState={userState}
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={setActiveConversationId}
                  onNewConversation={handleNewConversation}
                  onDeleteConversation={handleDeleteConversation}
                  onUpdateMessage={handleUpdateMessageInActiveConversation}
                  onQuickActivateInAgent={() => handleRegisterSuccess('Commander', 'commander@randseed.ai')}
                  onUpdateAgent={handleUpdateAgent}
                  onOpenAuth={() => setAuthModalOpen(true)}
                  onCommandSubmitted={handleSendMessage}
                  isThinking={isAgentThinking}
                  activeTab={agentTab}
                  onChangeTab={setAgentTab}
                  games={games}
                  activeGame={activeGame}
                  onLaunchGame={handleLaunchGame}
                  resultEvents={resultEvents}
                  onAddResultEvent={handleAddResultEvent}
                  agentLogs={agentLogs}
                  onAddAgentLog={handleAddAgentLog}
                />
              </div>

              {/* DRAGGABLE SPLITTER BAR (Desktop lg+) */}
              <div
                onPointerDown={handleStartResizeAgent}
                onDoubleClick={() => setAgentWidth(DEFAULT_AGENT_WIDTH)}
                title={`Drag left/right to resize Agent (${MIN_AGENT_WIDTH}px – ${MAX_AGENT_WIDTH}px). Double-click to reset.`}
                className="hidden lg:flex w-6 shrink-0 flex-col items-center justify-center cursor-col-resize group select-none relative z-20"
              >
                {/* Vertical guide line */}
                <div
                  className={`w-[2px] h-[calc(100%-2rem)] rounded-full transition-colors duration-150 ${
                    isResizingAgent
                      ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                      : 'bg-slate-200 group-hover:bg-indigo-400'
                  }`}
                />
                {/* Upper grip pill (visible near top fold & banners) */}
                <div
                  className={`absolute top-28 w-4 h-9 rounded-full border flex items-center justify-center transition-all shadow-2xs ${
                    isResizingAgent
                      ? 'bg-indigo-600 border-indigo-600 text-white scale-110'
                      : 'bg-white border-slate-300 text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-600'
                  }`}
                >
                  <GripVertical className="w-3 h-3" />
                </div>
                {/* Width tooltip badge shown while resizing or hovering */}
                <div
                  className={`absolute top-16 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold whitespace-nowrap pointer-events-none transition-opacity shadow-sm ${
                    isResizingAgent
                      ? 'opacity-100 bg-indigo-600 text-white'
                      : 'opacity-0 group-hover:opacity-100 bg-slate-900 text-white'
                  }`}
                >
                  {agentWidth}px
                </div>
              </div>
            </>
          )}

          {/* RIGHT COLUMN: Independently Scrollable Game Heat Ranking Grid (16 Games) */}
          <div className="flex-1 min-w-0 h-full">
            <GameRankingSection
              games={games}
              onLaunchGame={handleLaunchGame}
            />
          </div>

        </div>
      </main>

      {/* Pinned White Bottom Bar on Mobile */}
      <BottomActionBar
        userState={userState}
        onScrollToAgent={() => {
          setIsAgentOpen(true);
          setTimeout(() => {
            const el = document.getElementById('agent-console');
            el?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        onScrollToGames={() => {
          const el = document.getElementById('games-ranking');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenPersonalCenter={() => setPersonalCenterOpen(true)}
      />

      {/* Right Slide-Over Personal Center Sidebar */}
      <PersonalCenterSidebar
        isOpen={personalCenterOpen}
        onClose={() => setPersonalCenterOpen(false)}
        userState={userState}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onUpdateUsername={handleUpdateUsername}
        onOpenAgentTab={(tab) => setAgentTab(tab)}
      />

      {/* Auth Modal for Visitor Registration */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        initialPromptPending={pendingPrompt}
      />

      {/* Instant Play Arcade Game Modal */}
      <ArcadeGameModal
        isOpen={arcadeGameOpen}
        onClose={() => setArcadeGameOpen(false)}
        game={activeGame}
        agent={userState.agent}
        onGameVictory={handleGameVictory}
        initialMode={activeGameMode}
      />

    </div>
  );
}
