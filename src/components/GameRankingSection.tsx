import React, { useState, useMemo } from 'react';
import { GameItem, GameCategory } from '../types';
import { GameCard } from './GameCard';
import { Search, Sparkles, Flame, LayoutGrid, RectangleHorizontal } from 'lucide-react';

interface GameRankingSectionProps {
  games: GameItem[];
  onLaunchGame: (game: GameItem, mode: 'auto' | 'copilot' | 'manual') => void;
  externalSearchQuery?: string;
}

export const GameRankingSection: React.FC<GameRankingSectionProps> = ({
  games,
  onLaunchGame,
  externalSearchQuery = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardLayout, setCardLayout] = useState<'card-box' | 'square-1x1'>('card-box');

  const effectiveSearch = externalSearchQuery || searchQuery;

  const filteredGames = useMemo(() => {
    let list = [...games];

    if (selectedCategory !== 'all') {
      list = list.filter((g) => g.category === selectedCategory);
    }

    if (effectiveSearch.trim()) {
      const q = effectiveSearch.toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.tagline.toLowerCase().includes(q)
      );
    }

    return list;
  }, [games, selectedCategory, effectiveSearch]);

  return (
    <section
      id="games-ranking"
      className="ranking-container w-full lg:h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-2 pb-24 lg:pb-8 text-slate-900"
    >
      <div className="w-full max-w-[1600px]">
        {/* 1. Sticky Category Filter & Search Panel */}
        <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md pb-3 pt-1 border-b border-slate-200/80 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: '🔥 All Popular' },
                { id: 'Action & Roguelike', label: '⚡ Action & Roguelike' },
                { id: 'Strategy & Auto-Chess', label: '♟️ Strategy & Auto-Chess' },
                { id: 'Tower Defense', label: '🏰 Tower Defense' },
                { id: 'Multiplayer & IO', label: '🚀 Multiplayer & IO' },
                { id: 'Shooter & Arena', label: '🛸 Shooter & Arena' },
                { id: 'Casual & Puzzle', label: '🧪 Casual & Puzzle' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as 'all' | GameCategory)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-48 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-full focus:outline-none focus:border-indigo-500 text-slate-900 placeholder-slate-400 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* 2. Proportional Hero Banners (Container-Query 2-col -> 3-col + Locked 16:7.2 Aspect Ratio = Zero Distortion) */}
        <div className="mb-6">
          <div className="hero-banner-grid">
            
            {/* Hero 1: Play with Bonus Credits & Co-Pilot */}
            <div
              onClick={() => games[0] && onLaunchGame(games[0], 'copilot')}
              className="group relative aspect-[16/7.2] rounded-2xl overflow-hidden cursor-pointer border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-5 flex flex-col justify-between select-none"
            >
              <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute right-4 bottom-3 flex items-center gap-2 pointer-events-none">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl sm:text-3xl shadow-lg transform -rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-all">
                  ⚡
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-300/30 flex items-center justify-center text-2xl sm:text-3xl shadow-lg transform rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-all">
                  💎
                </div>
              </div>

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/25 border border-blue-400/30 text-[10px] font-mono font-bold text-blue-200">
                  <Flame className="w-3 h-3 text-amber-400 fill-current" />
                  FEATURED #1 · 94.2% CLEAR RATE
                </span>
                <h2 className="mt-2 text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                  Play with Free Credits.{' '}
                  <span className="text-amber-300">Co-Pilot Arena</span>
                </h2>
                <p className="mt-1 text-xs text-blue-100/80 max-w-[78%] line-clamp-1">
                  {games[0]?.name} · Zero-latency bullet-hell evasion & hitless clears
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-emerald-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  Instant Play · 1,000 Credits Active
                </span>
              </div>
            </div>

            {/* Hero 2: Boost Your Play with Agent Evolution */}
            <div
              onClick={() => games[1] && onLaunchGame(games[1], 'auto')}
              className="group relative aspect-[16/7.2] rounded-2xl overflow-hidden cursor-pointer border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-5 flex flex-col justify-between select-none"
            >
              <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-emerald-500/25 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute right-4 bottom-3 flex items-center gap-2 pointer-events-none">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl sm:text-3xl shadow-lg transform -rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-all">
                  🤖
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-400/20 backdrop-blur-md border border-emerald-300/30 flex items-center justify-center text-2xl sm:text-3xl shadow-lg transform rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-all">
                  ♟️
                </div>
              </div>

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-[10px] font-mono font-bold text-emerald-200">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  AUTO-PILOT META · 840K SIMULATIONS
                </span>
                <h2 className="mt-2 text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                  Boost Your Play{' '}
                  <span className="text-emerald-300">with Neural Agent</span>
                </h2>
                <p className="mt-1 text-xs text-emerald-100/80 max-w-[78%] line-clamp-1">
                  {games[1]?.name} · Millions of simulated runs & full auto-play
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-amber-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  Launch Auto-Pilot Simulation
                </span>
              </div>
            </div>

            {/* Hero 3 (Shown in 3rd column when container >= 1080px, e.g. >=1600px/1800px screens) */}
            <div
              onClick={() => (games[2] || games[0]) && onLaunchGame(games[2] || games[0], 'copilot')}
              className="hero-banner-third group relative aspect-[16/7.2] rounded-2xl overflow-hidden cursor-pointer border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-900 via-violet-900 to-slate-900 p-5 flex-col justify-between select-none"
            >
              <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-purple-500/25 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute right-4 bottom-3 flex items-center gap-2 pointer-events-none">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl sm:text-3xl shadow-lg transform -rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-all">
                  🧬
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-400/20 backdrop-blur-md border border-purple-300/30 flex items-center justify-center text-2xl sm:text-3xl shadow-lg transform rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-all">
                  🏰
                </div>
              </div>

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/25 border border-purple-400/30 text-[10px] font-mono font-bold text-purple-200">
                  <Sparkles className="w-3 h-3 text-purple-300" />
                  SKILL NURSERY · CROSS-GAME SYNC
                </span>
                <h2 className="mt-2 text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                  Train Game Records{' '}
                  <span className="text-purple-300">&amp; Evolve Skills</span>
                </h2>
                <p className="mt-1 text-xs text-purple-100/80 max-w-[78%] line-clamp-1">
                  {games[2]?.name || 'Tower Maze Infinite'} · Assimilate Autoplay &amp; Follow traces
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-purple-200 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  Cross-Game Skill Transfer Ready
                </span>
              </div>
            </div>

          </div>

          {/* Carousel indicator dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <div className="w-6 h-1.5 rounded-full bg-slate-900 transition-all" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 transition-all" />
          </div>
        </div>

        {/* 3. Section Header + Layout Switch */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {selectedCategory === 'all' ? 'Rand Game' : selectedCategory}
          </h2>
          <div className="inline-flex items-center bg-slate-200/70 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setCardLayout('card-box')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                cardLayout === 'card-box'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Put 1:1 icon & info inside the 16:10 card frame"
            >
              <RectangleHorizontal className="w-3.5 h-3.5" />
              <span>In-Box</span>
            </button>
            <button
              type="button"
              onClick={() => setCardLayout('square-1x1')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                cardLayout === 'square-1x1'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="1:1 Square Card Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>1:1 Grid</span>
            </button>
          </div>
        </div>

        {/* 4. 16 Games Grid */}
        <div
          className={cardLayout === 'square-1x1' ? 'games-grid-square' : 'games-grid-inbox'}
        >
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              rank={game.heatRank}
              layoutMode={cardLayout}
              onLaunchGame={onLaunchGame}
            />
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No games found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
};

