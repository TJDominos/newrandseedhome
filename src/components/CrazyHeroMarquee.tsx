import React from 'react';
import { GameItem, UserState } from '../types';
import { Play, Zap, Bot, Star, Flame } from 'lucide-react';

interface CrazyHeroMarqueeProps {
  featuredGame: GameItem;
  userState: UserState;
  onLaunchGame: (game: GameItem, mode: 'auto' | 'copilot' | 'manual') => void;
}

export const CrazyHeroMarquee: React.FC<CrazyHeroMarqueeProps> = ({
  featuredGame,
  userState,
  onLaunchGame
}) => {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 shadow-2xl p-5 sm:p-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-center">
        
        {/* Left Action Area */}
        <div className="xl:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black flex items-center gap-1 uppercase">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>HOT #1 TRENDING</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-emerald-400 border border-slate-700 flex items-center gap-1">
              <Bot className="w-3 h-3" />
              <span>{featuredGame.activePlayers.toLocaleString()} AGENTS ACTIVE</span>
            </span>

            <span className="px-2 py-0.5 rounded-full bg-black/60 text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current text-amber-400" />
              {featuredGame.rating}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            {featuredGame.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 line-clamp-1">
            当前出战机体: <strong className="text-emerald-400 font-mono">{userState.agent.name} (Lv.{userState.agent.level})</strong> · 24h 通关率 {featuredGame.agentReport.clearRate24h}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => onLaunchGame(featuredGame, 'copilot')}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>⚡ 人机协同闯关 (Co-Pilot)</span>
            </button>

            <button
              onClick={() => onLaunchGame(featuredGame, 'auto')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>🤖 {userState.agent.name} 全自动代打</span>
            </button>

            <button
              onClick={() => onLaunchGame(featuredGame, 'manual')}
              className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              🎮 纯手动操作
            </button>
          </div>
        </div>

        {/* Right Visual Cover Thumbnail */}
        <div className="xl:col-span-5 flex justify-center">
          <div
            onClick={() => onLaunchGame(featuredGame, 'copilot')}
            className="relative w-full max-w-xs aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer border border-indigo-500/40 shadow-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-4 flex flex-col justify-between group hover:scale-[1.03] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black bg-black/60 px-2 py-0.5 rounded-full text-emerald-400 border border-emerald-500/30">
                RECORD: {featuredGame.agentReport.speedrunRecord}
              </span>
              <span className="text-2xl">{featuredGame.emoji}</span>
            </div>

            <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>

            <div className="text-center">
              <span className="text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md">
                CLICK TO INSTANT PLAY
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
