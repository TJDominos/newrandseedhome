import React, { useState, useEffect, useRef } from 'react';
import {
  UserState,
  ChatMessage,
  ChatConversation,
  ChatAttachment,
  UserAgent,
  GameItem,
  BehaviorTraceExample,
  AgentResultEvent,
  AgentLogEntry
} from '../types';
import {
  INITIAL_GAMES,
  INITIAL_BEHAVIOR_TRACES,
  INITIAL_RESULT_EVENTS,
  INITIAL_AGENT_LOGS,
  createDemoScreenshotDataUrl
} from '../data/games';
import { ThreeAvatar, AvatarMood } from './ThreeAvatar';
import { AvatarCustomizationModal } from './AvatarCustomizationModal';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Zap,
  Cpu,
  MessageSquare,
  Maximize2,
  Minimize2,
  Sparkles,
  Check,
  Bot,
  Radio,
  Trophy,
  Play,
  Square,
  CheckSquare,
  Database,
  Plus,
  History,
  Trash2,
  ChevronDown,
  Gamepad2,
  Wrench,
  Film,
  Terminal,
  X,
  ArrowUpRight,
  ArrowUp,
  Camera,
  Edit2,
  Download,
  Share2,
  Copy,
  AtSign
} from 'lucide-react';

export type AgentPanelTab = 'chat' | 'evolution' | 'achievements' | 'log';

interface HumanoidAgentProps {
  userState: UserState;
  conversations: ChatConversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onUpdateMessage?: (messageId: string, updater: (msg: ChatMessage) => ChatMessage) => void;
  onQuickActivateInAgent?: () => void;
  onUpdateAgent: (updated: UserAgent) => void;
  onOpenAuth: () => void;
  onCommandSubmitted: (commandText: string, attachments?: ChatAttachment[]) => void;
  isThinking: boolean;
  activeTab: AgentPanelTab;
  onChangeTab: (tab: AgentPanelTab) => void;
  games?: GameItem[];
  activeGame?: GameItem;
  onLaunchGame?: (game: GameItem, mode: 'auto' | 'copilot' | 'manual') => void;
  resultEvents: AgentResultEvent[];
  onAddResultEvent: (evt: Omit<AgentResultEvent, 'id' | 'timestamp'>) => void;
  agentLogs: AgentLogEntry[];
  onAddAgentLog: (source: AgentLogEntry['source'], message: string, detail?: string) => void;
}

const STORAGE_KEY_TRACES = 'randseed_agent_demos_v3';

export const HumanoidAgent: React.FC<HumanoidAgentProps> = ({
  userState,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onUpdateMessage,
  onQuickActivateInAgent,
  onUpdateAgent,
  onOpenAuth,
  onCommandSubmitted,
  isThinking,
  activeTab,
  onChangeTab,
  games = INITIAL_GAMES,
  activeGame = INITIAL_GAMES[0],
  onLaunchGame,
  resultEvents,
  onAddResultEvent,
  agentLogs,
  onAddAgentLog
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Default Voice Broadcast (TTS) is enabled (true)
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [agentMood, setAgentMood] = useState<AvatarMood>('idle');
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

  // Conversation History Drawer toggle inside Chat tab + in-Agent delete confirmation
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [confirmDeleteConvId, setConfirmDeleteConvId] = useState<string | null>(null);

  // + Attachment Menu state (left of Microphone button)
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [attachTab, setAttachTab] = useState<'game' | 'skill' | 'demo'>('game');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);

  // Copilot & Autoplay (Split from Auto-Pilot -> 3 Black buttons with identical LIVE effect when active)
  const [isCopilot, setIsCopilot] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPilotTargetGameId, setAutoPilotTargetGameId] = useState<string>(activeGame.id);
  const [autoPilotTicks, setAutoPilotTicks] = useState(0);
  const [autoPilotApm, setAutoPilotApm] = useState(442);

  // Follow Mode (Black button with LIVE effect when active; captures screenshot + operation behavior via game interface)
  const [isFollowing, setIsFollowing] = useState(false);
  const [followTargetGameId, setFollowTargetGameId] = useState<string>(activeGame.id);
  const [capturedFrames, setCapturedFrames] = useState(0);
  const [liveKeystrokeStream, setLiveKeystrokeStream] = useState('W+D hold -> Space dash (39ms)');
  const [behaviorTraces, setBehaviorTraces] = useState<BehaviorTraceExample[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRACES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return INITIAL_BEHAVIOR_TRACES;
  });
  const [selectedTraceIds, setSelectedTraceIds] = useState<string[]>([
    'demo-autoplay-1',
    'demo-autoplay-2',
    'demo-1',
    'demo-2'
  ]);

  // Recent Result Event Toast banner
  const [recentEventToast, setRecentEventToast] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [showMultiGameConfirm, setShowMultiGameConfirm] = useState(false);

  // Game Records Category ('autoplay' vs 'follow') in dedicated Records tab
  const [recordSourceCategory, setRecordSourceCategory] = useState<'autoplay' | 'follow'>('autoplay');
  const [recordGameFilter, setRecordGameFilter] = useState<string>('all');
  const [recordStatusFilter, setRecordStatusFilter] = useState<'all' | 'untrained' | 'trained'>('all');
  const [selectedModel, setSelectedModel] = useState<string>('GPT-6 Luna');

  // Events tab optional raw logs drawer toggle
  const [showRawLogsInEvents, setShowRawLogsInEvents] = useState<boolean>(false);

  // Skill Custom Rename, Download, Share & Contextual Upgrade Modal states
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSkillName, setEditingSkillName] = useState<string>('');
  const [sharingSkillId, setSharingSkillId] = useState<string | null>(null);
  const [copiedShareSkillId, setCopiedShareSkillId] = useState<string | null>(null);
  const [upgradingSkillId, setUpgradingSkillId] = useState<string | null>(null);
  const [upgradeSelectedRecordIds, setUpgradeSelectedRecordIds] = useState<string[]>([]);

  // '@' Mention quick-link query state for input composer
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastSpokenMsgIdRef = useRef<string | null>('m1');

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const messages = activeConversation ? activeConversation.messages : [];

  // Persist Follow Demos
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRACES, JSON.stringify(behaviorTraces));
    } catch {
      // ignore
    }
  }, [behaviorTraces]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages.length, isThinking, activeTab, activeConversationId]);

  // Automatically voice-broadcast new agent replies in Chat when voiceEnabled is true
  useEffect(() => {
    if (!messages.length) return;
    const latest = messages[messages.length - 1];
    if (latest.sender === 'agent' && latest.id !== lastSpokenMsgIdRef.current) {
      lastSpokenMsgIdRef.current = latest.id;
      speakText(latest.text);
    }
  }, [messages, voiceEnabled]);

  useEffect(() => {
    if (isThinking || isTraining) {
      setAgentMood('thinking');
    } else if (isRecording || isFollowing) {
      setAgentMood('listening');
    } else if (isSpeaking) {
      setAgentMood('speaking');
    } else if (isCopilot || isAutoPlay) {
      setAgentMood('happy');
    } else {
      setAgentMood('idle');
    }
  }, [isThinking, isTraining, isRecording, isFollowing, isSpeaking, isCopilot, isAutoPlay]);

  // Copilot / Autoplay live telemetry ticker -> logs go to Log tab, never to Chat
  useEffect(() => {
    if (!isCopilot && !isAutoPlay) return;
    const interval = setInterval(() => {
      setAutoPilotTicks((prev) => prev + 1);
      setAutoPilotApm(432 + Math.floor(Math.random() * 36));
    }, 1000);
    return () => clearInterval(interval);
  }, [isCopilot, isAutoPlay]);

  // Follow mode live game interface screenshot & keystroke collector
  useEffect(() => {
    if (!isFollowing) return;
    const sampleStreams = [
      'W+D micro-stutter -> Space i-frame (36ms) -> LMB lock',
      'A+S kite vector -> E parry counter (41ms) -> Dash cancel',
      'Q skill burst -> Mouse(284,118) apex turn -> R overdrive',
      'Hex swap (B2->E4) -> Priority lock Boss Core -> Shield pulse'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setCapturedFrames((prev) => prev + Math.floor(32 + Math.random() * 26));
      idx = (idx + 1) % sampleStreams.length;
      setLiveKeystrokeStream(sampleStreams[idx]);
    }, 700);
    return () => clearInterval(interval);
  }, [isFollowing]);

  const showToast = (title: string) => {
    setRecentEventToast(title);
    setTimeout(() => {
      setRecentEventToast((curr) => (curr === title ? null : curr));
    }, 4000);
  };

  // Web Speech API for TTS Voice Broadcast
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.06;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setAgentMood('speaking');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setAgentMood('idle');
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setAgentMood('idle');
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  // Web Speech Recognition (STT)
  const toggleVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onAddAgentLog('System', 'Speech recognition not supported in this browser environment');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      setAgentMood('idle');
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setAgentMood('listening');
        onAddAgentLog('System', 'Microphone voice input listening started');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        setAgentMood('thinking');
        setInputText(transcript);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setAgentMood('idle');
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (agentMood === 'listening') setAgentMood('idle');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Add or remove attachment from + menu
  const handleToggleAttachment = (att: ChatAttachment) => {
    setPendingAttachments((prev) => {
      const exists = prev.some((item) => item.id === att.id && item.type === att.type);
      if (exists) {
        return prev.filter((item) => !(item.id === att.id && item.type === att.type));
      }
      return [...prev, att];
    });
  };

  // Submit user question + optional attachments to Chat
  const handleSend = (textToSend?: string) => {
    const rawText = (textToSend ?? inputText).trim();
    if (!rawText && pendingAttachments.length === 0) return;

    const finalPrompt =
      rawText ||
      `Analyze attached ${pendingAttachments.map((a) => `${a.type.toUpperCase()}: ${a.name}`).join(', ')}`;

    const attachmentsToSend =
      pendingAttachments.length > 0 ? [...pendingAttachments] : undefined;

    setInputText('');
    setPendingAttachments([]);
    setAttachMenuOpen(false);
    if (activeTab !== 'chat') onChangeTab('chat');
    setAgentMood('thinking');

    onCommandSubmitted(finalPrompt, attachmentsToSend);

    setTimeout(() => {
      setAgentMood('happy');
      setTimeout(() => setAgentMood('idle'), 1800);
    }, 500);
  };

  // Helper: Increment a version string like 'v3.0' -> 'v3.1' -> 'v3.2'
  const bumpVersionString = (ver?: string, fallbackLv = 1): string => {
    if (!ver) return `v${fallbackLv}.1`;
    const match = ver.match(/^v?(\d+)\.(\d+)$/);
    if (!match) return `v${fallbackLv}.1`;
    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10);
    if (minor >= 9) {
      return `v${major + 1}.0`;
    }
    return `v${major}.${minor + 1}`;
  };

  // Automatically evolve a Skill Version from Autoplay or Follow training (no manual Upgrade button)
  const triggerSkillEvolutionFromSource = (
    sourceLabel: 'Autoplay' | 'Follow Training',
    contextName: string,
    extraBoosts?: {
      tacticalDepth?: number;
      microExecution?: number;
      patternRecognition?: number;
      bossMechanicCracking?: number;
    }
  ) => {
    const perks = userState.agent.perks;
    if (!perks.length) return null;

    // Pick a skill deterministically based on context or lowest recently updated
    const skillIndex =
      Math.abs(
        contextName.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) +
          autoPilotTicks +
          selectedTraceIds.length
      ) % perks.length;
    const targetSkill = perks[skillIndex];
    const currentLv = targetSkill.skillLevel || 1;
    const prevVersion = targetSkill.version || `v${currentLv}.0`;
    const nextVersion = bumpVersionString(prevVersion, currentLv);

    const updatedPerks = perks.map((p, idx) =>
      idx === skillIndex
        ? {
            ...p,
            skillLevel: Math.min(p.maxSkillLevel || 5, currentLv + 1),
            version: nextVersion,
            updatedAt: 'Just now',
            unlocked: true
          }
        : p
    );

    onUpdateAgent({
      ...userState.agent,
      tacticalDepth: Math.min(
        99,
        userState.agent.tacticalDepth + (extraBoosts?.tacticalDepth || 1)
      ),
      microExecution: Math.min(
        99,
        userState.agent.microExecution + (extraBoosts?.microExecution || 1)
      ),
      patternRecognition: Math.min(
        99,
        userState.agent.patternRecognition + (extraBoosts?.patternRecognition || 1)
      ),
      bossMechanicCracking: Math.min(
        99,
        userState.agent.bossMechanicCracking + (extraBoosts?.bossMechanicCracking || 0)
      ),
      perks: updatedPerks
    });

    return {
      skillName: targetSkill.name,
      prevVersion,
      nextVersion,
      sourceLabel
    };
  };

  // Toggle Copilot (Black button #1 with LIVE effect; logs go to Log tab)
  const handleToggleCopilot = () => {
    const next = !isCopilot;
    setIsCopilot(next);
    const targetGame = games.find((g) => g.id === autoPilotTargetGameId) || activeGame;

    if (next) {
      setIsAutoPlay(false);
      setIsFollowing(false);
      setAutoPilotTicks(0);
      onAddAgentLog(
        'Copilot',
        `LIVE Copilot tactical assist started on ${targetGame.name}`,
        `Real-time trajectory overlay & micro-parry assist active at ${autoPilotApm} APM`
      );
    } else {
      onAddAgentLog(
        'Copilot',
        `LIVE Copilot stopped on ${targetGame.name}`,
        `Session duration: ${autoPilotTicks}s · Avg ${autoPilotApm} APM`
      );
    }
  };

  // Toggle Autoplay (Black button #2 with LIVE effect; stopping session saves an Autoplay Game Record & auto-upgrades skill version!)
  const handleToggleAutoPlay = () => {
    const next = !isAutoPlay;
    setIsAutoPlay(next);
    const targetGame = games.find((g) => g.id === autoPilotTargetGameId) || activeGame;

    if (next) {
      setIsCopilot(false);
      setIsFollowing(false);
      setAutoPilotTicks(0);
      onAddAgentLog(
        'Autoplay',
        `LIVE Autoplay takeover started on ${targetGame.name}`,
        `Executing autonomous full-control combat at ${autoPilotApm} APM`
      );
    } else {
      const frames = Math.max(480, autoPilotTicks * 60);
      const newAutoplayRecord: BehaviorTraceExample = {
        id: `demo-autoplay-${Date.now()}`,
        recordSource: 'autoplay',
        gameId: targetGame.id,
        gameName: targetGame.name,
        gameEmoji: targetGame.emoji,
        title: `${targetGame.name} · Autoplay #${behaviorTraces.filter((t) => t.recordSource === 'autoplay').length + 1}`,
        capturedPattern: `Autonomous combat execution @ ${autoPilotApm} APM`,
        screenshotUrl: createDemoScreenshotDataUrl(
          targetGame.name,
          '#10b981',
          `AUTOPLAY: [${autoPilotApm} APM] · ${frames} FRAMES`
        ),
        operationData: {
          keystrokes: `Auto-Vector -> Frame Parry (33ms) -> Burst Lock`,
          apm: autoPilotApm,
          reactionMs: 33,
          inputVectors: frames
        },
        framesCount: frames,
        efficiencyScore: '98.8%',
        recordedAt: 'Just now',
        statBoost: {
          microExecution: 2,
          tacticalDepth: 2
        },
        trained: true
      };
      setBehaviorTraces((prev) => [newAutoplayRecord, ...prev]);
      setRecordSourceCategory('autoplay');

      // Stopping an active Autoplay session automatically evolves the combat skill version!
      const evolved = triggerSkillEvolutionFromSource('Autoplay', targetGame.name, {
        microExecution: 1,
        tacticalDepth: 1
      });
      if (evolved) {
        const evtTitle = `Skill Upgraded (Autoplay) · ${evolved.skillName} ${evolved.nextVersion}`;
        onAddResultEvent({
          title: evtTitle,
          resultSummary: `Autoplay combat telemetry on ${targetGame.name} (${Math.max(1, autoPilotTicks)}s @ ${autoPilotApm} APM) auto-upgraded ${evolved.skillName}.`,
          type: 'Skill Upgraded',
          metricDelta: `Version ${evolved.prevVersion} → ${evolved.nextVersion} · Updated Just now`,
          relatedName: evolved.skillName
        });
        showToast(evtTitle);
      }
      onAddAgentLog(
        'Autoplay',
        `LIVE Autoplay stopped on ${targetGame.name}`,
        `Session duration: ${autoPilotTicks}s · Avg ${autoPilotApm} APM${
          evolved ? ` · Auto-upgraded ${evolved.skillName} to ${evolved.nextVersion}` : ''
        }`
      );
    }
  };

  // Toggle Follow (Black button #3 with LIVE effect; captures screenshot + operation data from game interface)
  const handleToggleFollow = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    const targetGame = games.find((g) => g.id === followTargetGameId) || activeGame;

    if (next) {
      setIsCopilot(false);
      setIsAutoPlay(false);
      setCapturedFrames(64);
      onAddAgentLog(
        'Follow',
        `LIVE Follow hooked into ${targetGame.name} game interface`,
        'Sampling real-time canvas screenshots + keystroke/mouse vector telemetry'
      );
    } else {
      if (capturedFrames > 0) {
        handleSaveCapturedDemo();
      }
    }
  };

  // Save the captured Follow Game Record (with screenshot + operation behavior data)
  const handleSaveCapturedDemo = () => {
    const targetGame = games.find((g) => g.id === followTargetGameId) || activeGame;
    const frames = Math.max(360, capturedFrames);
    const apmSample = 340 + (frames % 95);
    const reactionSample = 34 + (frames % 18);
    const colors = ['#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
    const accent = colors[behaviorTraces.length % colors.length];

    const newDemo: BehaviorTraceExample = {
      id: `demo-${Date.now()}`,
      recordSource: 'follow',
      gameId: targetGame.id,
      gameName: targetGame.name,
      gameEmoji: targetGame.emoji,
      title: `${targetGame.name} · Follow #${behaviorTraces.filter((t) => (t.recordSource || 'follow') === 'follow').length + 1}`,
      capturedPattern: `Game interface snapshot + ${liveKeystrokeStream}`,
      screenshotUrl: createDemoScreenshotDataUrl(
        targetGame.name,
        accent,
        `FOLLOW: ${liveKeystrokeStream.slice(0, 36)} · ${apmSample} APM`
      ),
      operationData: {
        keystrokes: liveKeystrokeStream,
        apm: apmSample,
        reactionMs: reactionSample,
        inputVectors: frames
      },
      framesCount: frames,
      efficiencyScore: `${(95 + (frames % 4) + 0.2).toFixed(1)}%`,
      recordedAt: 'Just now',
      statBoost: {
        microExecution: 2,
        patternRecognition: 2,
        tacticalDepth: 2
      },
      trained: false
    };

    setBehaviorTraces((prev) => [newDemo, ...prev]);
    setSelectedTraceIds((prev) => Array.from(new Set([newDemo.id, ...prev])));
    setRecordSourceCategory('follow');
    setIsFollowing(false);
    setCapturedFrames(0);

    onAddAgentLog(
      'Follow',
      `Saved Follow Game Record "${newDemo.title}" from game interface`,
      `Screenshot captured · ${frames} input vectors · ${apmSample} APM · ${reactionSample}ms reaction`
    );
  };

  // Toggle selection of a stored Game Record
  const handleToggleSelectTrace = (traceId: string) => {
    setSelectedTraceIds((prev) =>
      prev.includes(traceId) ? prev.filter((id) => id !== traceId) : [...prev, traceId]
    );
  };

  // Selected Game Records & Distinct Games check for Multi-Game Training confirmation
  const selectedDemos = behaviorTraces.filter((t) => selectedTraceIds.includes(t.id));
  const distinctSelectedGames = Array.from(
    new Map(
      selectedDemos.map((t) => [
        t.gameId,
        {
          id: t.gameId,
          name: t.gameName,
          emoji: t.gameEmoji,
          count: selectedDemos.filter((d) => d.gameId === t.gameId).length
        }
      ])
    ).values()
  );

  // Execute neural training on a validated list of Game Records
  const executeTrainSelectedDemos = (
    demosToTrain: BehaviorTraceExample[],
    isMultiGameJoint = false
  ) => {
    if (demosToTrain.length === 0) return;

    setShowMultiGameConfirm(false);
    setIsTraining(true);

    const gamesInBatch = Array.from(new Set(demosToTrain.map((d) => d.gameName)));
    onAddAgentLog(
      'System',
      isMultiGameJoint
        ? `Starting Multi-Game Simultaneous Training across ${gamesInBatch.length} games (${demosToTrain.length} records)`
        : `Starting neural imitation training on ${demosToTrain.length} Game Record(s)`,
      demosToTrain.map((d) => `${d.gameEmoji} ${d.title}`).join(' · ')
    );

    setTimeout(() => {
      const totalBoosts = {
        tacticalDepth: 0,
        microExecution: 0,
        patternRecognition: 0,
        bossMechanicCracking: 0
      };

      demosToTrain.forEach((ex) => {
        totalBoosts.tacticalDepth += ex.statBoost.tacticalDepth || 1;
        totalBoosts.microExecution += ex.statBoost.microExecution || 1;
        totalBoosts.patternRecognition += ex.statBoost.patternRecognition || 1;
        totalBoosts.bossMechanicCracking += ex.statBoost.bossMechanicCracking || 1;
      });

      const trainedIdSet = new Set(demosToTrain.map((d) => d.id));
      setBehaviorTraces((prev) =>
        prev.map((t) => (trainedIdSet.has(t.id) ? { ...t, trained: true } : t))
      );

      const leadDemo = demosToTrain[0];
      const sourceLabel = leadDemo.recordSource === 'autoplay' ? 'Autoplay' : 'Follow Training';

      // Automatically upgrade the corresponding Skill Version!
      const evolved = triggerSkillEvolutionFromSource(
        sourceLabel,
        demosToTrain.map((d) => d.gameName + d.title).join(' '),
        totalBoosts
      );

      const eventTitle = isMultiGameJoint
        ? `Multi-Game Joint Training (${gamesInBatch.length} Games) · ${
            evolved ? `${evolved.skillName} ${evolved.nextVersion}` : leadDemo.title
          }`
        : evolved
        ? `Skill Upgraded (${leadDemo.recordSource === 'autoplay' ? 'Autoplay' : 'Follow'}) · ${evolved.skillName} ${evolved.nextVersion}`
        : `AI Trained Record · ${leadDemo.title}`;

      onAddResultEvent({
        title: eventTitle,
        resultSummary: isMultiGameJoint
          ? `Simultaneously trained ${demosToTrain.length} Game Records across ${gamesInBatch.join(
              ' + '
            )}${evolved ? ` and upgraded ${evolved.skillName} to ${evolved.nextVersion}.` : '.'}`
          : `Trained ${demosToTrain.length} Game Record(s) (${leadDemo.operationData.keystrokes})${
              evolved ? ` and upgraded ${evolved.skillName} to ${evolved.nextVersion}.` : '.'
            }`,
        type: 'Skill Upgraded',
        metricDelta: evolved
          ? `Version ${evolved.prevVersion} → ${evolved.nextVersion} · Micro-Exec +${totalBoosts.microExecution}%`
          : `Micro-Exec +${totalBoosts.microExecution}% · Pattern Recog +${totalBoosts.patternRecognition}%`,
        relatedName: isMultiGameJoint
          ? gamesInBatch.join(' · ')
          : evolved
          ? evolved.skillName
          : leadDemo.gameName
      });

      onAddAgentLog(
        'System',
        `Completed Game Record Training: ${eventTitle}`,
        `Weights updated · ${
          evolved ? `${evolved.skillName} ${evolved.prevVersion} -> ${evolved.nextVersion}` : ''
        }`
      );

      setIsTraining(false);
      showToast(eventTitle);
    }, 500);
  };

  // Train selected Game Records with AI -> Checks if records belong to different games first!
  const handleTrainSelectedDemos = () => {
    if (selectedDemos.length === 0) return;

    // If selected records come from more than 1 distinct game, prompt user to confirm multi-game simultaneous training
    if (distinctSelectedGames.length > 1) {
      setShowMultiGameConfirm(true);
      onAddAgentLog(
        'System',
        `Multi-game records detected (${distinctSelectedGames.map((g) => g.name).join(', ')})`,
        'Awaiting user confirmation for simultaneous multi-game training'
      );
      return;
    }

    executeTrainSelectedDemos(selectedDemos, false);
  };

  // Filter selection to a single game and train immediately
  const handleTrainSingleGameOnly = (targetGameId: string) => {
    const singleGameDemos = selectedDemos.filter((d) => d.gameId === targetGameId);
    setSelectedTraceIds(singleGameDemos.map((d) => d.id));
    executeTrainSelectedDemos(singleGameDemos, false);
  };

  // Helper: Resolve shortName for a GameItem (e.g. "cyber", "mecha", "fortress", "ronin")
  const getGameShortName = (game: Pick<GameItem, 'id' | 'name' | 'shortName'>): string => {
    if (game.shortName) return game.shortName.toLowerCase();
    const map: Record<string, string> = {
      'cyber-survivor': 'cyber',
      'mecha-siege': 'mecha',
      'citadel-defense': 'fortress',
      'blade-souls': 'ronin',
      'deep-space-mining': 'asteroid',
      'neon-arena': 'neon'
    };
    if (map[game.id]) return map[game.id];
    return game.name.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  // Helper: Resolve associated Game for a Skill
  const getSkillAssociatedGame = (skillId: string, explicitGameId?: string) => {
    const fallbackMap: Record<string, string> = {
      'skill-kiting': 'cyber-survivor',
      'skill-parry': 'blade-souls',
      'skill-heatmap': 'cyber-survivor',
      'skill-synergy': 'mecha-siege',
      'skill-swarm': 'citadel-defense'
    };
    const resolvedId = explicitGameId || fallbackMap[skillId] || 'cyber-survivor';
    const found = games.find((g) => g.id === resolvedId);
    if (found) {
      return {
        ...found,
        shortName: getGameShortName(found)
      };
    }
    return {
      id: resolvedId,
      name: 'Cyber Survivor',
      emoji: '⚡',
      category: 'Action & Roguelike' as const,
      shortName: getGameShortName({ id: resolvedId, name: 'Cyber Survivor' })
    };
  };

  // Save custom renamed Skill
  const handleSaveSkillName = (skillId: string) => {
    const trimmed = editingSkillName.trim();
    if (!trimmed) {
      setEditingSkillId(null);
      return;
    }
    const updatedPerks = userState.agent.perks.map((p) =>
      p.id === skillId ? { ...p, name: trimmed, updatedAt: 'Just now' } : p
    );
    onUpdateAgent({
      ...userState.agent,
      perks: updatedPerks
    });
    setEditingSkillId(null);
    showToast(`Renamed Skill to "${trimmed}"`);
  };

  // Download Skill as JSON configuration file
  const handleDownloadSkill = (skill: UserAgent['perks'][0]) => {
    const assocGame = getSkillAssociatedGame(skill.id, skill.gameId);
    const payload = {
      schema: 'randseed.agent.skill/v1',
      id: skill.id,
      name: skill.name,
      version: skill.version || `v${skill.skillLevel || 1}.0`,
      updatedAt: skill.updatedAt || 'Just now',
      associatedGame: {
        id: assocGame.id,
        name: assocGame.name,
        shortName: 'id' in assocGame ? getGameShortName(assocGame as GameItem) : 'cyber'
      },
      metricLabel: skill.metricLabel || 'Tactical Boost',
      description: skill.description,
      agentAuthor: userState.agent.name,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.href = url;
    a.download = `${slug}-${skill.version || 'v1.0'}.skill.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${skill.name} (${skill.version || 'v1.0'})`);
  };

  // Open Skill Upgrade Modal -> Pre-selects all untrained records for this Skill's associated game by default
  const handleOpenSkillUpgradeModal = (skill: UserAgent['perks'][0]) => {
    const assocGame = getSkillAssociatedGame(skill.id, skill.gameId);
    const gameRecords = behaviorTraces.filter((r) => r.gameId === assocGame.id);
    const untrainedIds = gameRecords.filter((r) => !r.trained).map((r) => r.id);
    // Default select all untrained records (if all are already trained, select all records for that game so user can re-train)
    setUpgradeSelectedRecordIds(
      untrainedIds.length > 0 ? untrainedIds : gameRecords.map((r) => r.id)
    );
    setUpgradingSkillId(skill.id);
  };

  // Confirm upgrading a specific Skill with selected Game Records (Autoplay & Follow)
  const handleConfirmSkillUpgrade = () => {
    if (!upgradingSkillId || upgradeSelectedRecordIds.length === 0) return;
    const targetSkill = userState.agent.perks.find((p) => p.id === upgradingSkillId);
    if (!targetSkill) return;

    const recordsToTrain = behaviorTraces.filter((r) => upgradeSelectedRecordIds.includes(r.id));
    if (recordsToTrain.length === 0) return;

    setIsTraining(true);
    const skillToUpgradeId = upgradingSkillId;
    setUpgradingSkillId(null);

    setTimeout(() => {
      const currentLv = targetSkill.skillLevel || 1;
      const prevVersion = targetSkill.version || `v${currentLv}.0`;
      const nextVersion = bumpVersionString(prevVersion, currentLv);

      const trainedSet = new Set(recordsToTrain.map((r) => r.id));
      setBehaviorTraces((prev) =>
        prev.map((t) => (trainedSet.has(t.id) ? { ...t, trained: true } : t))
      );

      const updatedPerks = userState.agent.perks.map((p) =>
        p.id === skillToUpgradeId
          ? {
              ...p,
              skillLevel: Math.min(p.maxSkillLevel || 5, currentLv + 1),
              version: nextVersion,
              updatedAt: 'Just now',
              unlocked: true
            }
          : p
      );

      onUpdateAgent({
        ...userState.agent,
        tacticalDepth: Math.min(99, userState.agent.tacticalDepth + recordsToTrain.length),
        microExecution: Math.min(99, userState.agent.microExecution + recordsToTrain.length),
        perks: updatedPerks
      });

      const autoplayCount = recordsToTrain.filter((r) => r.recordSource === 'autoplay').length;
      const followCount = recordsToTrain.length - autoplayCount;
      const sourceBreakdown = [
        autoplayCount > 0 ? `${autoplayCount} Autoplay` : '',
        followCount > 0 ? `${followCount} Follow` : ''
      ]
        .filter(Boolean)
        .join(' + ');

      const evtTitle = `Skill Upgraded · ${targetSkill.name} ${nextVersion}`;
      onAddResultEvent({
        title: evtTitle,
        resultSummary: `Upgraded ${targetSkill.name} (${prevVersion} → ${nextVersion}) using ${recordsToTrain.length} Game Record(s) (${sourceBreakdown}).`,
        type: 'Skill Upgraded',
        metricDelta: `Version ${prevVersion} → ${nextVersion} · Updated Just now`,
        relatedName: targetSkill.name
      });

      onAddAgentLog(
        'System',
        `Upgraded Skill "${targetSkill.name}" to ${nextVersion}`,
        `Trained on ${recordsToTrain.length} Game Records (${sourceBreakdown})`
      );

      setIsTraining(false);
      showToast(evtTitle);
    }, 400);
  };

  // Input composer change handler: detects '@' to open '+' attachment menu and filter by shortname
  const handleInputChangeWithMention = (val: string) => {
    setInputText(val);
    const match = val.match(/(?:^|\s)@([a-zA-Z0-9_-]*)$/);
    if (match) {
      const q = match[1].toLowerCase();
      setMentionQuery(q);
      setAttachMenuOpen(true);
      setAttachTab('game');
    } else if (mentionQuery !== null) {
      setMentionQuery(null);
    }
  };

  // Attach item from '+' or '@shortname' and strip trailing '@query' from inputText
  const handleSelectAttachmentWithMentionCleanup = (att: ChatAttachment) => {
    handleToggleAttachment(att);
    if (mentionQuery !== null) {
      setInputText((prev) => prev.replace(/(?:^|\s)@([a-zA-Z0-9_-]*)$/, ' ').trimStart());
      setMentionQuery(null);
      setAttachMenuOpen(false);
    }
  };

  // Filtered games for '+' / '@shortname' menu
  const mentionFilteredGames = games.filter((g) => {
    if (!mentionQuery) return true;
    const q = mentionQuery.toLowerCase();
    const short = getGameShortName(g);
    return (
      short.includes(q) ||
      g.name.toLowerCase().includes(q) ||
      g.id.toLowerCase().includes(q)
    );
  });

  // Filtered Game Records by Category ('autoplay' | 'follow') + Game + Status
  const autoplayRecordsCount = behaviorTraces.filter((t) => t.recordSource === 'autoplay').length;
  const followRecordsCount = behaviorTraces.filter(
    (t) => (t.recordSource || 'follow') === 'follow'
  ).length;
  const untrainedTotalCount = behaviorTraces.filter((t) => !t.trained).length;

  const categoryRecords = behaviorTraces.filter(
    (trace) => (trace.recordSource || 'follow') === recordSourceCategory
  );
  const uniqueRecordGames = Array.from(
    new Map(
      categoryRecords.map((t) => [t.gameId, { id: t.gameId, name: t.gameName, emoji: t.gameEmoji }])
    ).values()
  );
  const filteredGameRecords = categoryRecords.filter((trace) => {
    if (recordGameFilter !== 'all' && trace.gameId !== recordGameFilter) return false;
    if (recordStatusFilter === 'untrained' && trace.trained) return false;
    if (recordStatusFilter === 'trained' && !trace.trained) return false;
    return true;
  });

  return (
    <>
      <aside
        id="agent-console"
        className={`relative w-full flex flex-col rounded-3xl bg-white border border-slate-200/90 shadow-lg overflow-hidden transition-all duration-200 ${
          isMobileExpanded || activeTab !== 'chat' || isCopilot || isAutoPlay || isFollowing
            ? 'h-[600px] lg:h-[calc(100vh-5rem)]'
            : 'h-[450px] sm:h-[490px] lg:h-[calc(100vh-5rem)]'
        }`}
      >
        {/* 1. AGENT HEADER: Clickable 3D Avatar + Name + TTS + 3 Black LIVE Buttons (Copilot, Autoplay, Follow) */}
        <div className="p-4 bg-white border-b border-slate-100 shrink-0 space-y-3">
          <div className="flex items-center gap-3">
            {/* 3D Interactive Avatar: CLICKING THIS DIRECTLY OPENS CUSTOMIZATION MODAL */}
            <div
              onClick={() => setIsCustomizationOpen(true)}
              title="Click to customize 3D Avatar & Name"
              className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-indigo-500/30 p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-all hover:border-indigo-500 hover:scale-105 active:scale-95 ${
                isThinking || isRecording || isSpeaking || isCopilot || isAutoPlay || isFollowing
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : ''
              }`}
            >
              <ThreeAvatar
                avatarId={userState.agent.avatarId}
                customStyle={userState.agent.customStyle}
                mood={agentMood}
                isThinking={isThinking || isTraining}
                isSpeaking={isSpeaking}
                isListening={isRecording || isFollowing}
                gameProgress={85}
                interactive={false}
                className="w-full h-full pointer-events-none"
              />
              <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-[9px] font-mono font-black text-white bg-slate-900/80 px-1.5 py-0.5 rounded shadow">
                  EDIT
                </span>
              </div>
            </div>

            {/* Agent Name & Voice Broadcast Control */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div
                  onClick={() => setIsCustomizationOpen(true)}
                  className="flex items-center gap-2 min-w-0 cursor-pointer group"
                  title="Click to customize 3D Avatar & Name"
                >
                  <h2 className="text-base font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {userState.agent.name}
                  </h2>
                </div>

                {/* Volume / TTS Voice Broadcast Button + Mobile Height Toggle */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !voiceEnabled;
                      setVoiceEnabled(next);
                      if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        setIsSpeaking(false);
                      }
                    }}
                    className={`px-2 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      voiceEnabled
                        ? 'bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200/80'
                    }`}
                    title={
                      voiceEnabled
                        ? 'Agent Voice Broadcast (TTS): ON by default — Speaks Agent replies in Chat aloud. Click to mute.'
                        : 'Agent Voice Broadcast (TTS): Muted — Click to enable voice broadcast.'
                    }
                  >
                    {voiceEnabled ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-bold">TTS On</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] font-bold">Muted</span>
                      </>
                    )}
                  </button>

                  {/* Mobile Expand/Collapse Height Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                    className="lg:hidden p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors"
                    title={isMobileExpanded ? 'Collapse Height' : 'Expand Height'}
                  >
                    {isMobileExpanded ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 3 BLACK BUTTONS WITH IDENTICAL 'LIVE' EFFECT: Copilot | Autoplay | Follow */}
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {/* 1. Copilot Black LIVE Button */}
                <button
                  type="button"
                  onClick={handleToggleCopilot}
                  className={`relative overflow-hidden py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer bg-slate-950 hover:bg-black text-white ${
                    isCopilot
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-950/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  title="Copilot: Real-time AI tactical assist alongside player control"
                >
                  {isCopilot ? (
                    <>
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      <span className="truncate">Copilot</span>
                      <span className="px-1 py-0.5 text-[8px] font-mono font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded leading-none">
                        LIVE
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">Copilot</span>
                    </>
                  )}
                </button>

                {/* 2. Autoplay Black LIVE Button */}
                <button
                  type="button"
                  onClick={handleToggleAutoPlay}
                  className={`relative overflow-hidden py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer bg-slate-950 hover:bg-black text-white ${
                    isAutoPlay
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-950/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  title="Autoplay: Agent takes full autonomous control & auto-upgrades skill versions"
                >
                  {isAutoPlay ? (
                    <>
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      <span className="truncate">Autoplay</span>
                      <span className="px-1 py-0.5 text-[8px] font-mono font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded leading-none">
                        LIVE
                      </span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-slate-300 shrink-0" />
                      <span className="truncate">Autoplay</span>
                    </>
                  )}
                </button>

                {/* 3. Follow Black LIVE Button */}
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`relative overflow-hidden py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer bg-slate-950 hover:bg-black text-white ${
                    isFollowing
                      ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-md shadow-rose-950/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  title="Follow Mode: Capture live Game Records (screenshots & operation behavior) for AI skill training"
                >
                  {isFollowing ? (
                    <>
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                      </span>
                      <span className="truncate">Follow</span>
                      <span className="px-1 py-0.5 text-[8px] font-mono font-black uppercase tracking-wider bg-rose-500/25 text-rose-300 border border-rose-500/40 rounded leading-none">
                        LIVE
                      </span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">Follow</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Live Copilot or Autoplay Telemetry Drawer */}
          {(isCopilot || isAutoPlay) && (
            <div className="p-3 rounded-2xl bg-slate-950 text-white border border-emerald-500/40 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>
                    {isCopilot ? 'LIVE COPILOT TACTICAL ASSIST' : 'LIVE AUTOPLAY TAKEOVER'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-emerald-400">
                  {autoPilotApm} APM · {autoPilotTicks}s
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  value={autoPilotTargetGameId}
                  onChange={(e) => setAutoPilotTargetGameId(e.target.value)}
                  className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none flex-1 min-w-0"
                >
                  {games.slice(0, 8).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.emoji} {g.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const targetGame =
                      games.find((g) => g.id === autoPilotTargetGameId) || activeGame;
                    onLaunchGame?.(targetGame, isCopilot ? 'copilot' : 'auto');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isCopilot ? 'Launch Copilot' : 'Watch Live'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Follow Game Interface Capture Drawer (Captures Screenshot + Operation Telemetry) */}
          {isFollowing && (
            <div className="p-3 rounded-2xl bg-slate-950 text-white border border-rose-500/40 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  <span>LIVE FOLLOW · GAME RECORD CAPTURE</span>
                </div>
                <span className="font-mono text-[11px] text-rose-300 flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  {capturedFrames} frames
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-300 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 truncate">
                Op Stream: {liveKeystrokeStream}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={followTargetGameId}
                  onChange={(e) => setFollowTargetGameId(e.target.value)}
                  className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none flex-1 min-w-0"
                >
                  {games.slice(0, 8).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.emoji} {g.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const targetGame =
                      games.find((g) => g.id === followTargetGameId) || activeGame;
                    onLaunchGame?.(targetGame, 'manual');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs shrink-0 transition-colors cursor-pointer"
                  title="Open Game Arena while Follow captures screenshots & operation data"
                >
                  Play
                </button>

                <button
                  type="button"
                  onClick={handleSaveCapturedDemo}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <Database className="w-3 h-3" />
                  <span>Save Record</span>
                </button>
              </div>
            </div>
          )}

          {/* Result Event Toast Banner (without any +EXP) */}
          {recentEventToast && (
            <div
              onClick={() => onChangeTab('achievements')}
              className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-2 text-xs cursor-pointer animate-in fade-in"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="font-bold">New Event: </span>
                  <span>{recentEventToast}</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 shrink-0">View →</span>
            </div>
          )}

          {/* 4-Tab Segmented Switcher: Chat | Events | Skills | Records */}
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => onChangeTab('chat')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Chat</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('achievements')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'achievements'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Events ({resultEvents.length})</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('evolution')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'evolution'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Skills ({userState.agent.perks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('log')}
              className={`relative py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'log'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Game Records (Autoplay & Follow training materials)"
            >
              <Film className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Records ({behaviorTraces.length})</span>
              {untrainedTotalCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* 2. BODY AREA */}
        {/* TAB 1: CHAT (Strictly user questions & agent replies + Conversation History Management) */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70">
            {/* Conversation Management Sub-Toolbar */}
            <div className="px-4 py-2 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0 relative">
              <button
                type="button"
                onClick={() => setShowHistoryList((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-indigo-600 bg-slate-100/80 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl transition-colors min-w-0 cursor-pointer"
                title="Manage Conversation History"
              >
                <History className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate max-w-[150px]">
                  {activeConversation?.title || 'Current Chat'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  ({conversations.length})
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowHistoryList(false);
                  onNewConversation();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                title="Create New Conversation"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>

              {/* Dropdown Drawer for Historical Conversations */}
              {showHistoryList && (
                <div className="absolute left-3 right-3 top-full mt-1 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1 max-h-56 overflow-y-auto animate-in fade-in duration-150">
                  <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Conversation History</span>
                    <button
                      type="button"
                      onClick={() => setShowHistoryList(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {conversations.map((conv) => {
                    const isCurrent = conv.id === activeConversation?.id;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          onSelectConversation(conv.id);
                          setShowHistoryList(false);
                        }}
                        className={`px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{conv.title}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {conv.messages.length} msgs · {conv.updatedAt}
                          </div>
                        </div>
                        {conversations.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteConvId(conv.id);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Strictly User Questions & Agent Replies Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
                      <span className="font-bold text-slate-700">
                        {isUser ? userState.username : userState.agent.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Replay voice broadcast for this reply"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div
                      className={`max-w-[92%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-xs space-y-2.5 ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      {/* Render associated Game / Skill / Demo attachments if present */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="space-y-1.5 pb-1 border-b border-white/15">
                          <div className="flex flex-wrap gap-1.5">
                            {msg.attachments.map((att) => (
                              <div
                                key={`${att.type}-${att.id}`}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                                  isUser
                                    ? 'bg-indigo-700/90 text-indigo-100 border border-indigo-400/30'
                                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                                }`}
                              >
                                <span className="font-mono uppercase text-[10px] opacity-80">
                                  [{att.type === 'demo' ? 'record' : att.type}]
                                </span>
                                <span className="font-bold">{att.name}</span>
                              </div>
                            ))}
                          </div>

                          {/* If a Game Record with screenshot was attached, display the captured frame snapshot */}
                          {msg.attachments
                            .filter((a) => a.type === 'demo' && a.screenshotUrl)
                            .map((demoAtt) => (
                              <div
                                key={demoAtt.id}
                                className="rounded-xl overflow-hidden border border-white/20 bg-slate-950"
                              >
                                <img
                                  src={demoAtt.screenshotUrl}
                                  alt={demoAtt.name}
                                  className="w-full h-24 object-cover"
                                />
                                <div className="px-2.5 py-1 text-[10px] font-mono text-slate-300 truncate">
                                  {demoAtt.subtitle}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                      {/* In-Agent Interactive Confirmation Card inside Agent Reply Bubble */}
                      {!isUser && msg.confirmPrompt && (
                        <div className="p-3 rounded-xl bg-slate-900 text-white border border-indigo-500/40 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span>{msg.confirmPrompt.title}</span>
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                msg.confirmPrompt.status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : msg.confirmPrompt.status === 'cancelled'
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {msg.confirmPrompt.status === 'confirmed'
                                ? 'Confirmed ✓'
                                : msg.confirmPrompt.status === 'cancelled'
                                ? 'Cancelled'
                                : 'Action Required'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {msg.confirmPrompt.resolvedText || msg.confirmPrompt.description}
                          </p>

                          {msg.confirmPrompt.games && msg.confirmPrompt.games.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {msg.confirmPrompt.games.map((g) => (
                                <span
                                  key={g.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-200"
                                >
                                  <span>{g.emoji}</span>
                                  <span>{g.name}</span>
                                  <span className="font-mono text-indigo-400">×{g.count}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {msg.confirmPrompt.status === 'pending' && (
                            <div className="space-y-1.5 pt-1">
                              {msg.confirmPrompt.type === 'MULTI_GAME_TRAINING' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const traceIdsToTrain = msg.confirmPrompt?.traceIds || [];
                                      const demos = behaviorTraces.filter((t) =>
                                        traceIdsToTrain.includes(t.id)
                                      );
                                      executeTrainSelectedDemos(
                                        demos.length > 0 ? demos : selectedDemos,
                                        true
                                      );
                                      onUpdateMessage?.(msg.id, (prevMsg) => ({
                                        ...prevMsg,
                                        confirmPrompt: prevMsg.confirmPrompt
                                          ? {
                                              ...prevMsg.confirmPrompt,
                                              status: 'confirmed',
                                              resolvedText:
                                                'Confirmed Multi-Game Simultaneous Training. Skills upgraded and logged to Events.'
                                            }
                                          : undefined
                                      }));
                                    }}
                                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Confirm Multi-Game Training (确认多游戏同时训练)</span>
                                  </button>

                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    {msg.confirmPrompt.games?.map((g) => (
                                      <button
                                        key={g.id}
                                        type="button"
                                        onClick={() => {
                                          const singleDemos = behaviorTraces.filter(
                                            (t) =>
                                              (msg.confirmPrompt?.traceIds?.includes(t.id) ||
                                                selectedTraceIds.includes(t.id)) &&
                                              (t.gameId === g.id || t.gameName === g.name)
                                          );
                                          if (singleDemos.length > 0) {
                                            executeTrainSelectedDemos(singleDemos, false);
                                          }
                                          onUpdateMessage?.(msg.id, (prevMsg) => ({
                                            ...prevMsg,
                                            confirmPrompt: prevMsg.confirmPrompt
                                              ? {
                                                  ...prevMsg.confirmPrompt,
                                                  status: 'confirmed',
                                                  resolvedText: `Trained single game only: ${g.emoji} ${g.name}.`
                                                }
                                              : undefined
                                          }));
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                                      >
                                        Only {g.emoji} {g.name}
                                      </button>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onUpdateMessage?.(msg.id, (prevMsg) => ({
                                          ...prevMsg,
                                          confirmPrompt: prevMsg.confirmPrompt
                                            ? {
                                                ...prevMsg.confirmPrompt,
                                                status: 'cancelled',
                                                resolvedText: 'Training cancelled by user.'
                                              }
                                            : undefined
                                        }));
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer ml-auto"
                                    >
                                      Cancel (取消)
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onQuickActivateInAgent?.();
                                      onUpdateMessage?.(msg.id, (prevMsg) => ({
                                        ...prevMsg,
                                        requiresAuth: false,
                                        confirmPrompt: prevMsg.confirmPrompt
                                          ? {
                                              ...prevMsg.confirmPrompt,
                                              status: 'confirmed',
                                              resolvedText: 'Agent session activated inside Agent panel.'
                                            }
                                          : undefined
                                      }));
                                    }}
                                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Confirm &amp; Activate (点击确认)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateMessage?.(msg.id, (prevMsg) => ({
                                        ...prevMsg,
                                        confirmPrompt: prevMsg.confirmPrompt
                                          ? {
                                              ...prevMsg.confirmPrompt,
                                              status: 'cancelled'
                                            }
                                          : undefined
                                      }));
                                    }}
                                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isThinking && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-mono">
                  <Cpu className="w-4 h-4 animate-spin shrink-0" />
                  <span>{userState.agent.name} is synthesizing tactical response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS (Dedicated & Clean Skill Management: Rename, Download, Share, and Conditional Upgrade via Game Records) */}
        {activeTab === 'evolution' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-black text-slate-900">Agent Tactical Skills</h3>
                <p className="text-xs text-slate-500">
                  Customize skill names, download or share packages, or upgrade when Game Records are available
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChangeTab('log')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-xl border border-indigo-200/80 transition-colors shrink-0 cursor-pointer"
              >
                Records ({behaviorTraces.length}) →
              </button>
            </div>

            <div className="space-y-2.5">
              {userState.agent.perks.map((skill) => {
                const sLv = skill.skillLevel || 1;
                const versionLabel = skill.version || `v${sLv}.0`;
                const updatedLabel = skill.updatedAt || '2h ago';
                const assocGame = getSkillAssociatedGame(skill.id, skill.gameId);
                const associatedRecords = behaviorTraces.filter(
                  (r) => r.gameId === assocGame.id
                );
                const untrainedRecordsCount = associatedRecords.filter((r) => !r.trained).length;
                const isEditing = editingSkillId === skill.id;

                return (
                  <div
                    key={skill.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 transition-all hover:border-slate-300"
                  >
                    {/* Top Row: Skill Name (Inline Editable) + Version + Actions (Rename, Download, Share) */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingSkillName}
                              onChange={(e) => setEditingSkillName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveSkillName(skill.id);
                                if (e.key === 'Escape') setEditingSkillId(null);
                              }}
                              autoFocus
                              className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-slate-50 border border-indigo-400 rounded-lg focus:outline-none flex-1 min-w-0"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveSkillName(skill.id)}
                              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shrink-0"
                              title="Save Skill Name"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSkillId(null)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {skill.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSkillId(skill.id);
                                setEditingSkillName(skill.name);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Customize Skill Name"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-mono font-bold">
                              {versionLabel}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              · {updatedLabel}
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {skill.description}
                        </p>
                      </div>

                      {/* Skill Actions: Download & Share */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDownloadSkill(skill)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Download Skill (.skill.json)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSharingSkillId(skill.id)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Share Skill"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Associated Game + Metric Badge + Conditional Upgrade Button */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          <span>{assocGame.emoji}</span>
                          <span>{assocGame.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            @{assocGame.shortName}
                          </span>
                        </span>

                        {skill.metricLabel && (
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {skill.metricLabel}
                          </span>
                        )}
                      </div>

                      {/* Conditional Upgrade Button: Shown when the associated game has training records */}
                      {associatedRecords.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenSkillUpgradeModal(skill)}
                          disabled={isTraining}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                            untrainedRecordsCount > 0
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                              : 'bg-slate-900 hover:bg-indigo-600 text-white'
                          }`}
                          title="Select Autoplay & Follow Game Records to upgrade this Skill"
                        >
                          <Zap className="w-3 h-3 text-amber-300 fill-current" />
                          <span>Upgrade</span>
                          {untrainedRecordsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-300 text-slate-950 font-mono text-[10px] font-black">
                              {untrainedRecordsCount} new
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: EVENTS (Switches between Result Events list and Raw Logs list when Raw Logs is clicked) */}
        {activeTab === 'achievements' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
            <div className="flex items-center justify-between gap-2 px-1">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {showRawLogsInEvents ? 'Agent Runtime Logs' : 'Result Events'}
                </h3>
                <p className="text-xs text-slate-500">
                  {showRawLogsInEvents
                    ? 'Real-time Copilot, Autoplay & Follow execution logs'
                    : 'Outcome milestones from Autoplay & Follow Skill Upgrades'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRawLogsInEvents((prev) => !prev)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-colors cursor-pointer shrink-0 ${
                  showRawLogsInEvents
                    ? 'bg-slate-950 text-emerald-400 border-slate-900'
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                }`}
                title={showRawLogsInEvents ? 'Switch back to Result Events' : 'View Raw Logs only'}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Raw Logs ({agentLogs.length})</span>
              </button>
            </div>

            {showRawLogsInEvents ? (
              <div className="p-3 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs space-y-2 border border-slate-800 animate-in fade-in duration-150">
                {agentLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span
                        className={`font-bold ${
                          entry.source === 'Copilot' ||
                          entry.source === 'Autoplay' ||
                          entry.source === 'Auto-Pilot'
                            ? 'text-emerald-400'
                            : entry.source === 'Follow'
                            ? 'text-rose-400'
                            : entry.source === 'GameAPI'
                            ? 'text-cyan-400'
                            : 'text-indigo-400'
                        }`}
                      >
                        [{entry.source}]
                      </span>
                      <span className="text-slate-500">{entry.timestamp}</span>
                    </div>
                    <div className="text-slate-200 text-xs leading-snug">{entry.message}</div>
                    {entry.detail && (
                      <div className="text-[11px] text-slate-400 truncate">{entry.detail}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {resultEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <h4 className="text-xs font-bold text-slate-900 truncate">{evt.title}</h4>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {evt.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{evt.resultSummary}</p>

                    <div className="pt-1 flex items-center gap-1.5 text-xs font-mono text-slate-500">
                      <span className="text-indigo-600 font-bold">{evt.type}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-600 font-bold">{evt.metricDelta}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RECORDS (Dedicated Game Records Tab for Autoplay & Follow Training Materials) */}
        {activeTab === 'log' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">Game Records</h3>
                    <span className="text-xs font-mono font-bold text-indigo-600">
                      ({filteredGameRecords.length})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Autoplay &amp; Follow training materials for upgrading Agent Skills
                  </p>
                </div>

                {/* 2-Category Switcher: Autoplay | Follow */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setRecordSourceCategory('autoplay')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                      recordSourceCategory === 'autoplay'
                        ? 'bg-slate-950 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Bot className="w-3 h-3 shrink-0" />
                    <span>Autoplay ({autoplayRecordsCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordSourceCategory('follow')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                      recordSourceCategory === 'follow'
                        ? 'bg-slate-950 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Radio className="w-3 h-3 shrink-0" />
                    <span>Follow ({followRecordsCount})</span>
                  </button>
                </div>
              </div>

              {/* Filter Bar (Game filter + Untrained/Trained filter) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <select
                    value={recordGameFilter}
                    onChange={(e) => setRecordGameFilter(e.target.value)}
                    className="bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg px-2 py-1 border border-slate-200 focus:outline-none"
                  >
                    <option value="all">All Games ({categoryRecords.length})</option>
                    {uniqueRecordGames.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.emoji} {g.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
                    {(['all', 'untrained', 'trained'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setRecordStatusFilter(status)}
                        className={`px-2 py-0.5 rounded-md capitalize transition-colors cursor-pointer ${
                          recordStatusFilter === status
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const untrainedIds = filteredGameRecords
                      .filter((r) => !r.trained)
                      .map((r) => r.id);
                    if (untrainedIds.length > 0) {
                      setSelectedTraceIds(untrainedIds);
                    } else {
                      setSelectedTraceIds(filteredGameRecords.map((r) => r.id));
                    }
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Select Untrained
                </button>
              </div>

              {/* Full Game Records List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
                {filteredGameRecords.map((trace) => {
                  const isSelected = selectedTraceIds.includes(trace.id);
                  return (
                    <div
                      key={trace.id}
                      onClick={() => handleToggleSelectTrace(trace.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/50 border-indigo-400 shadow-2xs'
                          : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectTrace(trace.id);
                          }}
                          className="mt-0.5 text-indigo-600 shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <img
                          src={trace.screenshotUrl}
                          alt={trace.title}
                          className="w-16 h-11 rounded-lg object-cover border border-slate-700 bg-slate-950 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {trace.gameEmoji} {trace.title}
                            </span>
                            {trace.trained ? (
                              <span className="text-[11px] font-mono font-bold text-emerald-600 shrink-0">
                                Trained ✓
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono font-bold text-amber-600 shrink-0">
                                Untrained
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 mt-0.5 truncate font-mono">
                            {trace.operationData.keystrokes}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                            <span className="text-indigo-600 font-bold uppercase">
                              [{trace.recordSource || 'follow'}]
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{trace.operationData.apm} APM</span>
                            <span aria-hidden="true">·</span>
                            <span>{trace.operationData.reactionMs}ms</span>
                            <span aria-hidden="true">·</span>
                            <span>{trace.framesCount} frames</span>
                            <span aria-hidden="true">·</span>
                            <span>{trace.recordedAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Games Summary & Multi-Game Simultaneous Training Notice */}
              {distinctSelectedGames.length > 0 && (
                <div
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    distinctSelectedGames.length > 1
                      ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      {distinctSelectedGames.length > 1
                        ? `Multi-Game Selected (${distinctSelectedGames.length} Games · ${selectedDemos.length} Records)`
                        : `Single Game Selected (${distinctSelectedGames[0].name})`}
                    </span>
                    {distinctSelectedGames.length > 1 && (
                      <span className="text-[11px] font-mono font-bold text-amber-700">
                        Cross-Game Check
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {distinctSelectedGames.map((g) => (
                      <span
                        key={g.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-800"
                      >
                        <span>{g.emoji}</span>
                        <span>{g.name}</span>
                        <span className="font-mono text-indigo-600">×{g.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleTrainSelectedDemos}
                disabled={isTraining || selectedTraceIds.length === 0}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-current" />
                <span>
                  {isTraining
                    ? 'Training Records & Upgrading Skill Version...'
                    : distinctSelectedGames.length > 1
                    ? `Train Selected Records (${selectedDemos.length} across ${distinctSelectedGames.length} Games)`
                    : `Train Selected Records to Upgrade Skills (${selectedDemos.length})`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 3. BOTTOM INPUT DOCK WITH '+' ATTACHMENT MENU & '@SHORTNAME' QUICK-LINK */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 shrink-0 relative">
          {/* Popover Menu for '+' Button or '@' Trigger: Link Game (by shortname) | Link Skill | Link Game Record */}
          {attachMenuOpen && (
            <div className="absolute left-3 right-3 bottom-full mb-2 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAttachTab('game')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                      attachTab === 'game'
                        ? 'bg-white text-indigo-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>
                      Game {mentionQuery ? `(@${mentionQuery})` : ''}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachTab('skill')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                      attachTab === 'skill'
                        ? 'bg-white text-indigo-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Skill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachTab('demo')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                      attachTab === 'demo'
                        ? 'bg-white text-indigo-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Records ({behaviorTraces.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAttachMenuOpen(false);
                    setMentionQuery(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab 1: Associate Game (Supports @shortname quick filter) */}
              {attachTab === 'game' && (
                <div className="max-h-44 overflow-y-auto space-y-1 pr-0.5">
                  {mentionQuery !== null && (
                    <div className="px-2 py-1 text-[11px] font-mono text-indigo-600 bg-indigo-50/70 rounded-lg flex items-center justify-between">
                      <span>
                        Filtering by shortname: <strong>@{mentionQuery || '...'}</strong>
                      </span>
                      <span className="text-[10px] text-slate-400">Enter / Click to link</span>
                    </div>
                  )}
                  {mentionFilteredGames.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No games matching "@{mentionQuery}"
                    </div>
                  ) : (
                    mentionFilteredGames.slice(0, 8).map((g, idx) => {
                      const isLinked = pendingAttachments.some(
                        (a) => a.type === 'game' && a.id === g.id
                      );
                      const shortName = getGameShortName(g);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() =>
                            handleSelectAttachmentWithMentionCleanup({
                              id: g.id,
                              type: 'game',
                              name: g.name,
                              subtitle: `@${shortName} · ${g.category}`,
                              emoji: g.emoji,
                              gameId: g.id,
                              gameName: g.name
                            })
                          }
                          className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isLinked
                              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                              : mentionQuery !== null && idx === 0
                              ? 'bg-slate-100 text-slate-900 font-semibold'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span>{g.emoji}</span>
                            <span className="truncate font-bold">{g.name}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono text-[10px]">
                              @{shortName}
                            </span>
                          </div>
                          {isLinked && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 2: Associate Skill */}
              {attachTab === 'skill' && (
                <div className="max-h-44 overflow-y-auto space-y-1 pr-0.5">
                  {userState.agent.perks.map((sk) => {
                    const isLinked = pendingAttachments.some(
                      (a) => a.type === 'skill' && a.id === sk.id
                    );
                    const skVersion = sk.version || `v${sk.skillLevel || 1}.0`;
                    const skUpdated = sk.updatedAt || '2h ago';
                    return (
                      <button
                        key={sk.id}
                        type="button"
                        onClick={() =>
                          handleSelectAttachmentWithMentionCleanup({
                            id: sk.id,
                            type: 'skill',
                            name: `${sk.name} (${skVersion})`,
                            subtitle: sk.metricLabel || sk.description
                          })
                        }
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isLinked
                            ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-bold truncate">
                            {sk.name} · Version {skVersion} · Updated {skUpdated}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {sk.description}
                          </div>
                        </div>
                        {isLinked && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tab 3: Associate Game Record (with Screenshot, Game ID & Operation Behavior Telemetry) */}
              {attachTab === 'demo' && (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5">
                  {behaviorTraces.map((demo) => {
                    const isLinked = pendingAttachments.some(
                      (a) => a.type === 'demo' && a.id === demo.id
                    );
                    return (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() =>
                          handleSelectAttachmentWithMentionCleanup({
                            id: demo.id,
                            type: 'demo',
                            name: demo.title,
                            subtitle: `${demo.operationData.keystrokes} · ${demo.operationData.apm} APM`,
                            emoji: demo.gameEmoji,
                            screenshotUrl: demo.screenshotUrl,
                            gameId: demo.gameId,
                            gameName: demo.gameName
                          })
                        }
                        className={`w-full p-2 rounded-xl text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                          isLinked
                            ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                            : 'hover:bg-slate-100 text-slate-800 border border-transparent'
                        }`}
                      >
                        <img
                          src={demo.screenshotUrl}
                          alt={demo.title}
                          className="w-16 h-10 rounded-lg object-cover bg-slate-950 border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold truncate">
                            {demo.gameEmoji} {demo.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            {demo.operationData.keystrokes} · {demo.operationData.apm} APM
                          </div>
                        </div>
                        {isLinked && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Selected Attachment Chips above Input */}
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {pendingAttachments.map((att) => (
                <span
                  key={`${att.type}-${att.id}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold"
                >
                  <span className="text-[10px] font-mono uppercase text-indigo-500">
                    {att.type}:
                  </span>
                  <span className="truncate max-w-[140px]">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAttachment(att)}
                    className="text-indigo-400 hover:text-indigo-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Reference 2-Row Composer Layout:
              Row 1: Full-width Input ("Chat with <Agent Name>" · Type @shortname to link game)
              Row 2: Left: [+] + [Model] | Right: [Mic] [ArrowUp] */}
          <div className="rounded-2xl bg-[#F3F4F6]/90 border border-slate-200/80 focus-within:border-slate-300 focus-within:bg-[#F3F4F6] px-3.5 pt-3 pb-2.5 transition-all">
            {/* Top Row: Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => handleInputChangeWithMention(e.target.value)}
              onKeyDown={(e) => {
                if (
                  (e.key === 'Enter' || e.key === 'Tab') &&
                  mentionQuery !== null &&
                  attachMenuOpen &&
                  attachTab === 'game' &&
                  mentionFilteredGames.length > 0
                ) {
                  e.preventDefault();
                  const topGame = mentionFilteredGames[0];
                  const shortName = getGameShortName(topGame);
                  handleSelectAttachmentWithMentionCleanup({
                    id: topGame.id,
                    type: 'game',
                    name: topGame.name,
                    subtitle: `@${shortName} · ${topGame.category}`,
                    emoji: topGame.emoji,
                    gameId: topGame.id,
                    gameName: topGame.name
                  });
                  return;
                }
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isRecording
                  ? 'Listening to speech...'
                  : `Chat with ${userState.agent.name} (type @ to link game)`
              }
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />

            {/* Bottom Row: Toolbar Controls */}
            <div className="mt-3 flex items-center justify-between gap-2">
              {/* Left Controls: [+] (without Agent beside it) + Model */}
              <div className="flex items-center gap-2.5 min-w-0">
                {/* '+' Attachment Button */}
                <button
                  type="button"
                  onClick={() => setAttachMenuOpen((prev) => !prev)}
                  className={`p-1 rounded-lg flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                    attachMenuOpen || pendingAttachments.length > 0
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                  title="Attach Game (@shortname), Skill, or Game Record"
                >
                  <Plus className="w-4 h-4 stroke-[1.75]" />
                </button>

                {/* Model Selector (e.g. GPT-6 Luna) */}
                <button
                  type="button"
                  onClick={() => {
                    const models = ['GPT-6 Luna', 'GPT-6 Pro', 'Neural-X2'];
                    const nextIdx = (models.indexOf(selectedModel) + 1) % models.length;
                    setSelectedModel(models[nextIdx]);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors truncate cursor-pointer"
                  title="Click to switch model"
                >
                  <Cpu className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{selectedModel}</span>
                </button>
              </div>

              {/* Right Controls: [Mic] + [Up Arrow Send] */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`p-1.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                  title={isRecording ? 'Stop Voice Recording' : 'Voice Microphone Input'}
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4 stroke-[1.75]" />
                  ) : (
                    <Mic className="w-4 h-4 stroke-[1.75]" />
                  )}
                </button>

                <button
                  type="button"
                  disabled={!inputText.trim() && pendingAttachments.length === 0 && !isRecording}
                  onClick={() => handleSend()}
                  className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    inputText.trim() || pendingAttachments.length > 0 || isRecording
                      ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-2xs'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. IN-AGENT OVERLAY MODALS (Displayed strictly inside #agent-console, NEVER full-browser) */}

        {/* In-Agent Modal A: Multi-Game Simultaneous Training Confirmation */}
        {showMultiGameConfirm && distinctSelectedGames.length > 1 && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-white truncate">
                      Multi-Game Training Check
                    </h4>
                    <p className="text-[11px] text-slate-300 truncate">
                      是否开启多游戏同时训练？
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMultiGameConfirm(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 text-xs text-slate-700">
                <p className="leading-relaxed">
                  You selected <span className="font-bold text-slate-900">{selectedDemos.length} Game Records</span> from{' '}
                  <span className="font-bold text-indigo-600">
                    {distinctSelectedGames.length} different games
                  </span>
                  . Please confirm whether to run simultaneous multi-game joint training:
                </p>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                    Selected Games Breakdown
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {distinctSelectedGames.map((g) => (
                      <span
                        key={g.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        <span>{g.emoji}</span>
                        <span>{g.name}</span>
                        <span className="font-mono text-indigo-600">×{g.count}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => executeTrainSelectedDemos(selectedDemos, true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      Confirm Multi-Game Training (确认多游戏同时训练)
                    </span>
                  </button>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="block text-[11px] font-semibold text-slate-500">
                      Or train a single game only (仅训练单款游戏):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {distinctSelectedGames.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => handleTrainSingleGameOnly(g.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Only {g.emoji} {g.name} ({g.count})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowMultiGameConfirm(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel (取消)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-Agent Modal B: Delete Conversation Confirmation */}
        {confirmDeleteConvId && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-xs rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between gap-2">
                <span className="text-xs font-black flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Conversation?</span>
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteConvId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 text-xs text-slate-600 leading-relaxed">
                Confirm deleting conversation{' '}
                <span className="font-bold text-slate-900">
                  "{conversations.find((c) => c.id === confirmDeleteConvId)?.title || 'Chat'}"
                </span>
                ?
              </div>

              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteConvId(null)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteConversation(confirmDeleteConvId);
                    setConfirmDeleteConvId(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-Agent Modal C: Skill Upgrade Selector (Select Autoplay & Follow Game Records, Untrained pre-selected by default) */}
        {upgradingSkillId && (() => {
          const targetSkill = userState.agent.perks.find((p) => p.id === upgradingSkillId);
          if (!targetSkill) return null;
          const assocGame = getSkillAssociatedGame(targetSkill.id, targetSkill.gameId);
          const gameRecords = behaviorTraces.filter((r) => r.gameId === assocGame.id);
          const currentVersion = targetSkill.version || `v${targetSkill.skillLevel || 1}.0`;
          const nextVersion = bumpVersionString(currentVersion, targetSkill.skillLevel || 1);

          return (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90%]">
                <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-amber-300 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate">
                        Upgrade Skill · {targetSkill.name}
                      </h4>
                      <p className="text-[11px] text-slate-300 truncate">
                        {assocGame.emoji} {assocGame.name} · {currentVersion} → {nextVersion}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUpgradingSkillId(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 font-semibold">
                      Select Game Records (Untrained pre-selected):
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const untrained = gameRecords.filter((r) => !r.trained).map((r) => r.id);
                          setUpgradeSelectedRecordIds(untrained);
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        Untrained Only
                      </button>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={() => setUpgradeSelectedRecordIds(gameRecords.map((r) => r.id))}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        All ({gameRecords.length})
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                    {gameRecords.map((rec) => {
                      const isChecked = upgradeSelectedRecordIds.includes(rec.id);
                      return (
                        <div
                          key={rec.id}
                          onClick={() => {
                            setUpgradeSelectedRecordIds((prev) =>
                              prev.includes(rec.id)
                                ? prev.filter((id) => id !== rec.id)
                                : [...prev, rec.id]
                            );
                          }}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-indigo-50/60 border-indigo-400 shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="mt-0.5 text-indigo-600 shrink-0">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <img
                            src={rec.screenshotUrl}
                            alt={rec.title}
                            className="w-14 h-10 rounded-lg object-cover bg-slate-950 border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-bold text-slate-900 truncate">
                                {rec.title}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                  rec.trained
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {rec.trained ? 'Trained' : 'Untrained'}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                              <span className="text-indigo-600 font-bold uppercase">
                                [{rec.recordSource || 'follow'}]
                              </span>
                              <span>·</span>
                              <span>{rec.operationData.apm} APM</span>
                              <span>·</span>
                              <span>{rec.recordedAt}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setUpgradingSkillId(null)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={upgradeSelectedRecordIds.length === 0}
                    onClick={handleConfirmSkillUpgrade}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
                    <span>
                      Upgrade with {upgradeSelectedRecordIds.length} Record(s)
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* In-Agent Modal D: Share Skill Card */}
        {sharingSkillId && (() => {
          const shareSkill = userState.agent.perks.find((p) => p.id === sharingSkillId);
          if (!shareSkill) return null;
          const assocGame = getSkillAssociatedGame(shareSkill.id, shareSkill.gameId);
          const versionLabel = shareSkill.version || `v${shareSkill.skillLevel || 1}.0`;
          const shareCode = `nexus://skill/${shareSkill.id}?name=${encodeURIComponent(
            shareSkill.name
          )}&v=${encodeURIComponent(versionLabel)}&game=${assocGame.shortName}`;

          return (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between gap-2">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Share Tactical Skill</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSharingSkillId(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-white">{shareSkill.name}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono text-[10px] font-bold">
                        {versionLabel}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">{shareSkill.description}</p>
                    <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>
                        {assocGame.emoji} {assocGame.name} (@{assocGame.shortName})
                      </span>
                      <span className="text-emerald-400">{shareSkill.metricLabel}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500">
                      Skill Share URI:
                    </span>
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-700 break-all">
                      {shareCode}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleAttachment({
                        id: shareSkill.id,
                        type: 'skill',
                        name: `${shareSkill.name} (${versionLabel})`,
                        subtitle: shareSkill.metricLabel || shareSkill.description
                      });
                      setSharingSkillId(null);
                      onChangeTab('chat');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Attach to Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(shareCode).catch(() => {});
                      }
                      showToast(`Copied Share URI for ${shareSkill.name}`);
                      setSharingSkillId(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Share Link</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* In-Agent Modal E: 3D Avatar & Name Customization Panel (Inside #agent-console) */}
        <AvatarCustomizationModal
          isOpen={isCustomizationOpen}
          onClose={() => setIsCustomizationOpen(false)}
          agent={userState.agent}
          onSave={(updated) => {
            onUpdateAgent(updated);
          }}
        />
      </aside>
    </>
  );
};
