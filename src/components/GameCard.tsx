import React from 'react';
import { Flame, Sparkles, Star } from 'lucide-react';
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

  return (
    <div
      onClick={() => onLaunchGame(game, 'copilot')}
      className={`group relative flex flex-col items-center justify-between text-center cursor-pointer select-none rounded-2xl bg-[#EFF1F5]/90 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 ${
        layoutMode === 'square-1x1' ? 'aspect-square' : 'min-h-[212px]'
      }`}
    >
      {/* Top Badge Bar: HOT / NEW tags on left, Rate on right */}
      <div className="w-full flex items-center justify-between gap-1.5 mb-2">
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
        className={`relative w-20 h-20 sm:w-[84px] sm:h-[84px] aspect-square rounded-[20px] overflow-hidden shadow-md bg-gradient-to-tr ${game.themeGradient} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 border border-white/20`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.28),transparent_60%)] pointer-events-none" />
        <span className="text-4xl sm:text-[42px] filter drop-shadow-md select-none">
          {game.emoji}
        </span>
      </div>

      {/* Game Name & Tagline inside the card container (title -> subtitle gap: 8px) */}
      <div className="mt-3 w-full flex flex-col items-center">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-full leading-snug">
          {game.name}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed max-w-[26ch]">
          {game.tagline}
        </p>
      </div>
    </div>
  );
};


