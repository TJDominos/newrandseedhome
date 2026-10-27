import React from 'react';
import { Flame, Sparkles, Star, Users, Play } from 'lucide-react';
import { GameItem } from '../types';

interface GameCardProps {
  game: GameItem;
  rank?: number;
  layoutMode?: 'card-box' | 'square-1x1';
  onLaunchGame: (game: GameItem, mode: 'auto' | 'copilot' | 'manual') => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  rank,
  layoutMode = 'card-box',
  onLaunchGame
}) => {
  const isHot = game.isHot ?? (rank !== undefined && rank <= 4);
  const isNew = game.isNew ?? false;

  // Mode 1: 1:1 Square Grid Layout (Matches reference 1:1 centered icon + title + 2-line tagline)
  if (layoutMode === 'square-1x1') {
    return (
      <div
        onClick={() => onLaunchGame(game, 'copilot')}
        className="group relative aspect-square flex flex-col items-center justify-center text-center cursor-pointer select-none rounded-2xl bg-[#EFF1F5]/90 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 overflow-hidden"
      >
        {/* Floating Top Badge Bar: HOT / NEW tags on left, Rate on right */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 z-10">
          <div className="flex items-center gap-1 min-w-0">
            {isHot && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-2xs">
                <Flame className="w-2.5 h-2.5 fill-current shrink-0" />
                <span>HOT</span>
              </span>
            )}
            {isNew && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500 text-white shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 fill-current shrink-0" />
                <span>NEW</span>
              </span>
            )}
          </div>

          {/* Game Rate Badge */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/90 text-slate-800 border border-slate-200/80 shadow-2xs shrink-0"
            title={`Game Rating: ${game.rating.toFixed(1)} / 5.0`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            <span className="tabular-nums">{game.rating.toFixed(1)}</span>
          </span>
        </div>

        {/* 1:1 Rounded-Square Game Icon */}
        <div
          className={`relative mt-3 w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-[20px] overflow-hidden shadow-md bg-gradient-to-tr ${game.themeGradient} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 border border-white/20`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.28),transparent_60%)] pointer-events-none" />
          <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none">
            {game.emoji}
          </span>
        </div>

        {/* Game Name & Tagline (title -> subtitle gap: 8px / mt-2) */}
        <div className="mt-3 w-full flex flex-col items-center px-1">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-full leading-tight">
            {game.name}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-snug max-w-[24ch]">
            {game.tagline}
          </p>
        </div>
      </div>
    );
  }

  // Mode 2: In-Box (16:9 Frame with 1:1 Game Icon & Info Inside)
  return (
    <div
      onClick={() => onLaunchGame(game, 'copilot')}
      className="group relative aspect-video flex flex-col justify-between cursor-pointer select-none rounded-2xl bg-[#EFF1F5]/90 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 overflow-hidden"
    >
      {/* Top Row: Badges & Rating */}
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isHot && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-2xs">
              <Flame className="w-2.5 h-2.5 fill-current shrink-0" />
              <span>HOT</span>
            </span>
          )}
          {isNew && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500 text-white shadow-2xs">
              <Sparkles className="w-2.5 h-2.5 fill-current shrink-0" />
              <span>NEW</span>
            </span>
          )}
          <span className="text-[11px] font-medium text-slate-500 truncate">
            {game.category}
          </span>
        </div>

        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/90 text-slate-800 border border-slate-200/80 shadow-2xs shrink-0"
          title={`Game Rating: ${game.rating.toFixed(1)} / 5.0`}
        >
          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
          <span className="tabular-nums">{game.rating.toFixed(1)}</span>
        </span>
      </div>

      {/* Middle Row: 1:1 Icon + Title & Tagline inside the 16:9 Box */}
      <div className="flex items-center gap-3.5 my-auto py-1">
        <div
          className={`relative w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-2xl overflow-hidden shadow-md bg-gradient-to-tr ${game.themeGradient} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 border border-white/20`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.28),transparent_60%)] pointer-events-none" />
          <span className="text-2xl sm:text-3xl filter drop-shadow-md select-none">
            {game.emoji}
          </span>
        </div>

        <div className="min-w-0 flex-1 text-left">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate leading-tight">
            {game.name}
          </h3>
          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-snug">
            {game.tagline}
          </p>
        </div>
      </div>

      {/* Bottom Row inside 16:9 Box: Players & Quick Play Action */}
      <div className="w-full flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 font-medium text-slate-600">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{game.activePlayers}</span>
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
          <span>Play Now</span>
          <Play className="w-3 h-3 fill-current" />
        </span>
      </div>
    </div>
  );
};



