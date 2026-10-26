import React from 'react';
import { GameItem } from '../types';
import { Bot } from 'lucide-react';

interface AgentReportPopoverProps {
  game: GameItem;
}

export const AgentReportPopover: React.FC<AgentReportPopoverProps> = ({
  game
}) => {
  const { agentReport } = game;

  return (
    <div className="w-[280px] sm:w-[300px] bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-3.5 space-y-2.5 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">{game.emoji}</span>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-slate-900 truncate">{game.name}</h4>
            <span className="text-[10px] text-indigo-600 font-mono flex items-center gap-1">
              <Bot className="w-3 h-3" />
              {agentReport.agentModel}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
          {game.crackProgress}% Cracked
        </span>
      </div>

      {/* 3 Quick Result Metrics */}
      <div className="grid grid-cols-3 gap-1.5 text-center bg-slate-50 rounded-xl p-2 border border-slate-200/80">
        <div>
          <span className="text-[10px] text-slate-500 block">24h Win Rate</span>
          <span className="text-xs font-black font-mono text-emerald-600 tabular-nums">
            {agentReport.clearRate24h}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Best Record</span>
          <span className="text-xs font-black font-mono text-indigo-600 tabular-nums">
            {agentReport.speedrunRecord.split(' ')[0]}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Simulations</span>
          <span className="text-xs font-black font-mono text-slate-800 tabular-nums">
            {(agentReport.totalSimulatedRuns / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Best Meta Build */}
      <div className="bg-amber-50/70 px-2.5 py-1.5 rounded-lg border border-amber-200/70 flex items-center justify-between text-[11px]">
        <span className="text-slate-600 shrink-0">Meta Build:</span>
        <span className="font-mono text-amber-700 font-bold truncate max-w-[180px]">
          {agentReport.bestMetaBuild}
        </span>
      </div>

    </div>
  );
};
