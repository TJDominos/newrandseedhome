import React, { useState } from 'react';
import { UserAgent, AgentAvatarId, CustomAvatarStyle } from '../types';
import { AGENT_AVATAR_PRESETS } from '../data/games';
import { ThreeAvatar } from './ThreeAvatar';
import { X, Sparkles, Check, Wand2, RotateCw, Palette, Bot } from 'lucide-react';

interface AvatarCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: UserAgent;
  onSave: (updated: UserAgent) => void;
}

// Procedural prompt parser for 3D dynamic avatar generation
function generateStyleFromPrompt(promptText: string): {
  avatarId: AgentAvatarId;
  style: CustomAvatarStyle;
} {
  const p = promptText.toLowerCase();

  let primaryColor = '#06b6d4';
  let secondaryColor = '#4f46e5';
  let chassisColor = '#11162b';
  let hasHorns = false;
  let hasCrystal = false;
  let haloCount = 1;
  let particleCount = 48;
  let rotationSpeed = 1.0;
  let pulseRate = 1.0;

  // Color keywords
  if (p.includes('gold') || p.includes('amber') || p.includes('solar') || p.includes('yellow')) {
    primaryColor = '#f59e0b';
    secondaryColor = '#d97706';
    chassisColor = '#241a08';
  } else if (p.includes('red') || p.includes('crimson') || p.includes('flame') || p.includes('fire')) {
    primaryColor = '#f43f5e';
    secondaryColor = '#ea580c';
    chassisColor = '#260b12';
    hasHorns = true;
  } else if (p.includes('green') || p.includes('emerald') || p.includes('quantum') || p.includes('matrix')) {
    primaryColor = '#10b981';
    secondaryColor = '#0d9488';
    chassisColor = '#061f1a';
    haloCount = 2;
  } else if (p.includes('purple') || p.includes('void') || p.includes('shadow') || p.includes('dark')) {
    primaryColor = '#a855f7';
    secondaryColor = '#c026d3';
    chassisColor = '#190b28';
    hasCrystal = true;
  } else if (p.includes('cyan') || p.includes('neon') || p.includes('ice') || p.includes('frost')) {
    primaryColor = '#06b6d4';
    secondaryColor = '#3b82f6';
    chassisColor = '#0f172a';
  }

  // Morphology keywords
  if (p.includes('horn') || p.includes('crest') || p.includes('v-fin') || p.includes('mecha')) {
    hasHorns = true;
  }
  if (p.includes('crystal') || p.includes('prism') || p.includes('core') || p.includes('levitat')) {
    hasCrystal = true;
  }
  if (p.includes('dual') || p.includes('double') || p.includes('orbital') || p.includes('ring')) {
    haloCount = 2;
  }
  if (p.includes('fast') || p.includes('storm') || p.includes('overdrive') || p.includes('frenzy')) {
    rotationSpeed = 1.8;
    pulseRate = 1.6;
    particleCount = 64;
  }

  return {
    avatarId: 'custom-prompt',
    style: {
      prompt: promptText,
      primaryColor,
      secondaryColor,
      chassisColor,
      hasHorns,
      hasCrystal,
      haloCount,
      particleCount,
      rotationSpeed,
      pulseRate
    }
  };
}

export const AvatarCustomizationModal: React.FC<AvatarCustomizationModalProps> = ({
  isOpen,
  onClose,
  agent,
  onSave
}) => {
  const [draftName, setDraftName] = useState(agent.name);
  const [draftAvatarId, setDraftAvatarId] = useState<AgentAvatarId>(agent.avatarId);
  const [customStyle, setCustomStyle] = useState<CustomAvatarStyle | undefined>(agent.customStyle);
  const [promptInput, setPromptInput] = useState(agent.customStyle?.prompt || '');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: AgentAvatarId) => {
    setDraftAvatarId(presetId);
    setCustomStyle(undefined);
  };

  const handleGenerateFromPrompt = (promptText?: string) => {
    const textToUse = (promptText || promptInput).trim();
    if (!textToUse) return;

    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateStyleFromPrompt(textToUse);
      setDraftAvatarId(generated.avatarId);
      setCustomStyle(generated.style);
      setIsGenerating(false);
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = draftName.trim() || 'Striker-01';
    onSave({
      ...agent,
      name: finalName,
      avatarId: draftAvatarId,
      customStyle: draftAvatarId === 'custom-prompt' ? customStyle : undefined
    });
    onClose();
  };

  const PROMPT_SUGGESTIONS = [
    'Solar Golden Titan with dual orbital rings',
    'Crimson Mecha Vanguard with razor combat horns',
    'Quantum Emerald Phantom with matrix scan aura',
    'Void Overlord with levitating dark matter crystal',
    'Neon Frost Striker with high-speed particle storm'
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full h-full max-h-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 truncate">
                Agent 3D Avatar &amp; Customization
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                Drag 3D model · Synthesize style &amp; click Confirm
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable inside Agent panel) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Top Section: 3D Live Interactive Stage & Name Input */}
          <div className="flex items-center gap-3.5">
            {/* 3D Model Display (Interactive Drag to Spin) */}
            <div className="relative w-28 h-28 rounded-2xl bg-slate-950 border-2 border-indigo-500/40 p-1 shadow-lg flex items-center justify-center overflow-hidden shrink-0">
              <ThreeAvatar
                avatarId={draftAvatarId}
                customStyle={customStyle}
                mood="idle"
                isThinking={isGenerating}
                isSpeaking={false}
                isListening={false}
                interactive={true}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              />
              <div className="absolute bottom-1 left-1 right-1 text-center pointer-events-none">
                <span className="text-[9px] font-mono font-bold text-white/80 bg-black/60 px-1.5 py-0.5 rounded-full">
                  360° Drag
                </span>
              </div>
            </div>

            {/* Agent Name Configuration */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Agent Call Name
                </label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  maxLength={24}
                  placeholder="e.g. Striker-01..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-mono block">Active Chassis</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {draftAvatarId === 'custom-prompt' ? 'Neural Prompt' : draftAvatarId}
                  </span>
                </div>
                {customStyle && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 shrink-0">
                    Shader
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Prompt-Based 3D Avatar Synthesizer */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white border border-indigo-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Prompt 3D Synthesis</span>
              </label>
              <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-100/70 px-2 py-0.5 rounded-full">
                Procedural
              </span>
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerateFromPrompt();
                  }
                }}
                placeholder="Describe 3D avatar (e.g. Golden titan)..."
                className="flex-1 min-w-0 px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <button
                type="button"
                disabled={!promptInput.trim() || isGenerating}
                onClick={() => handleGenerateFromPrompt()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                {isGenerating ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{isGenerating ? '...' : 'Synthesize'}</span>
              </button>
            </div>

            {/* Quick Prompt Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PROMPT_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPromptInput(sug);
                    handleGenerateFromPrompt(sug);
                  }}
                  className="px-2 py-1 rounded-lg bg-white/90 hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-300 text-[11px] font-medium text-slate-700 whitespace-nowrap transition-colors shrink-0 cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Elite 3D Chassis Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span>Elite Chassis Presets</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {AGENT_AVATAR_PRESETS.map((preset) => {
                const isSelected = draftAvatarId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white shadow-xs shrink-0"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {preset.code} · {preset.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions inside Agent Panel */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirm &amp; Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
