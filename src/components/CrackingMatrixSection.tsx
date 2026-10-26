import React from 'react';
import { GameItem } from '../types';
import { Percent, Swords, Cpu, Sparkles, CheckCircle2, Shield, Crosshair, Trophy } from 'lucide-react';

interface CrackingMatrixSectionProps {
  games: GameItem[];
  onSelectGameForCoPilot: (game: GameItem) => void;
}

export const CrackingMatrixSection: React.FC<CrackingMatrixSectionProps> = ({
  games,
  onSelectGameForCoPilot
}) => {
  return (
    <section id="cracking-matrix" className="py-12 bg-slate-950 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold mb-2 border border-indigo-500/30">
            <Crosshair className="w-3.5 h-3.5" />
            <span>High-Difficulty Mechanics &amp; Boss Cracking Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            通过 Agent 算法培养，攻破各大硬核游戏 Boss 机制
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            以往硬核动作游戏与深度策略游戏通关门槛极高；在 Randseed AI，玩家不仅能借由 Agent 自动推演探索最优解，更能在人机协同中掌握毫秒级操作与天梯战术！
          </p>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.slice(0, 6).map((game) => (
            <div
              key={game.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/80 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{game.emoji}</span>
                    <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">{game.name}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    {game.crackProgress}% Solved
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3 line-clamp-2 font-mono">
                  {game.agentReport.bestMetaBuild}
                </p>

                {/* Progress bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Boss机制突破度:</span>
                    <span className="font-mono text-emerald-400 tabular-nums">{game.crackProgress}% / 100%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
                      style={{ width: `${game.crackProgress}%` }}
                    />
                  </div>
                </div>

                {/* Key Insight Pill */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 mb-3 space-y-1">
                  <span className="font-bold text-indigo-400 block">Agent 核心攻克发现:</span>
                  <p className="leading-relaxed">
                    {game.agentReport.keyTactics[0]}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">
                  实战推演: <strong className="text-white">{(game.agentReport.totalSimulatedRuns / 1000).toFixed(0)}k 局</strong>
                </span>
                <button
                  onClick={() => onSelectGameForCoPilot(game)}
                  className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  <span>立即启动协同演练</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 4 Evolutionary Stages */}
        <div className="mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black">游戏 Agent 战术进化四阶法则 (Evolution Roadmap)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            你的 Agent 如何从萌新按键机器人成长为秒破一切 Boss 机制的高玩脑
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-mono font-bold block">STAGE 01</span>
              <h4 className="text-sm font-bold text-white">基础行动 · 规则跟随</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                掌握技能范围与冷却时间，严格执行玩家设定的安全血线与撤退策略。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-purple-400 font-mono font-bold block">STAGE 02</span>
              <h4 className="text-sm font-bold text-white">战术站位 · 威胁感知</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                解锁走位风筝引擎与危险预警热力图，自动拉扯仇恨，寻找输出真空期。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-amber-400 font-mono font-bold block">STAGE 03</span>
              <h4 className="text-sm font-bold text-white">帧级微操 · 连招爆发</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                利用 0.04s 毫秒级神经感知识别 Boss 抬手前摇，实现帧级弹刀与极限输出。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-mono font-bold block">STAGE 04</span>
              <h4 className="text-sm font-bold text-white">全局博弈 · 机制攻克</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                联通全网数万名 Agent 实战经验，瞬息解构任何新 Boss 与天梯版本防守阵型。
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
