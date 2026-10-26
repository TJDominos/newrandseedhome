import React, { useState } from 'react';
import { UserAgent } from '../types';
import { AGENT_AVATAR_PRESETS } from '../data/games';
import { Bot, Zap, Check, Lock, PlayCircle } from 'lucide-react';

interface AgentNurserySectionProps {
  agent: UserAgent;
  onUpdateAgent: (updated: UserAgent) => void;
  onOpenWorkbench: () => void;
}

export const AgentNurserySection: React.FC<AgentNurserySectionProps> = ({
  agent,
  onUpdateAgent,
  onOpenWorkbench
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const currentAvatarPreset =
    AGENT_AVATAR_PRESETS.find((p) => p.id === agent.avatarId) || AGENT_AVATAR_PRESETS[0];

  // Train agent
  const handleTrainAgent = () => {
    setIsTraining(true);
    setTimeout(() => {
      const newLevel = agent.level + 1;
      const depthBoost = agent.tacticalDepth + 3;
      const microBoost = agent.microExecution + 3;

      const updatedPerks = agent.perks.map((p) => {
        if (p.requiredLevel <= newLevel) return { ...p, unlocked: true };
        return p;
      });

      onUpdateAgent({
        ...agent,
        level: newLevel,
        tacticalDepth: Math.min(99, depthBoost),
        microExecution: Math.min(99, microBoost),
        perks: updatedPerks
      });

      setIsTraining(false);
      setNotice(`${agent.name} neural weights & micro-execution upgraded!`);
      setTimeout(() => setNotice(null), 3000);
    }, 600);
  };

  return (
    <section id="agent-nursery" className="pt-4 pb-6 text-white border-t border-slate-900">
      {/* Compact Visual Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-black text-white">
            Agent 战术工坊与能力进化
          </h2>
        </div>

        <button
          onClick={onOpenWorkbench}
          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <PlayCircle className="w-4 h-4" />
          <span>进入实战测试</span>
        </button>
      </div>

      {/* Visual Character Sheet */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-center">
          
          {/* Left Avatar & Level */}
          <div className="xl:col-span-4 flex items-center gap-3.5 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${currentAvatarPreset.badgeClass} p-0.5 shadow-xl shrink-0`}
            >
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
                <Bot className="w-6 h-6" style={{ color: currentAvatarPreset.primaryColor }} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white truncate">{agent.name}</h3>
                <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white shrink-0">
                  Lv.{agent.level}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                {currentAvatarPreset.name} · {currentAvatarPreset.code}
              </span>
            </div>
          </div>

          {/* Middle: 4 Visual Progress Meters */}
          <div className="xl:col-span-5 grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 font-mono">
            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>🧠 战术推演</span>
                <span className="text-indigo-400 font-bold">{agent.tacticalDepth}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${agent.tacticalDepth}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>⚡ 毫秒微操</span>
                <span className="text-emerald-400 font-bold">{agent.microExecution}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${agent.microExecution}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>👁️ 模式识别</span>
                <span className="text-amber-400 font-bold">{agent.patternRecognition}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${agent.patternRecognition}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>🎯 Boss攻克</span>
                <span className="text-purple-400 font-bold">{agent.bossMechanicCracking}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${agent.bossMechanicCracking}%` }} />
              </div>
            </div>
          </div>

          {/* Right: Fast 1-Click Upgrade Button */}
          <div className="xl:col-span-3 space-y-2">
            <button
              onClick={handleTrainAgent}
              disabled={isTraining}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-current" />
              <span>{isTraining ? 'Training...' : 'Train Agent Capabilities'}</span>
            </button>

            {notice && (
              <div className="text-[11px] font-mono text-center text-emerald-400 animate-in fade-in">
                {notice}
              </div>
            )}
          </div>

        </div>

        {/* Quick Perks Icons Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-bold">已挂载模块:</span>
          <div className="flex flex-wrap gap-1.5">
            {agent.perks.map((p) => (
              <span
                key={p.id}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${
                  p.unlocked
                    ? 'bg-slate-950 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-950/40 text-slate-600 border-slate-800'
                }`}
              >
                {p.unlocked ? <Check className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                <span>{p.name.split(' (')[0]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
