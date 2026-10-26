import React, { useState, useEffect } from 'react';
import { UserAgent } from '../types';
import { Bot, Play, RotateCcw, Zap, Sparkles, Award, Shield, Swords, Heart, Crosshair, ArrowRight } from 'lucide-react';

interface InteractiveWorkbenchProps {
  agent: UserAgent;
  credits: number;
  onUpdateCredits: (newCredits: number) => void;
  selectedGameId?: string;
}

type TileType = 'empty' | 'player' | 'enemy' | 'boss' | 'relic' | 'exit' | 'hazard';

interface GridTile {
  id: number;
  type: TileType;
  label: string;
  isHazard: boolean;
  agentRecommendedSafeRate: number; // 0 - 100%
  description?: string;
}

export const InteractiveWorkbench: React.FC<InteractiveWorkbenchProps> = ({
  agent,
  credits,
  onUpdateCredits,
  selectedGameId = 'cyber-dungeon'
}) => {
  const [playMode, setPlayMode] = useState<'copilot' | 'auto' | 'manual'>('copilot');
  const [energyCost, setEnergyCost] = useState<number>(50); // 50 energy
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  
  // Tactical Battle State
  const [playerPos, setPlayerPos] = useState<number>(0);
  const [bossPos, setBossPos] = useState<number>(24);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [bossHp, setBossHp] = useState<number>(300);
  const [comboCount, setComboCount] = useState<number>(0);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [grid, setGrid] = useState<GridTile[]>([]);
  const [agentLog, setAgentLog] = useState<string>('战术核心已就绪。点击“初始化地牢战场”让 Agent 测算最优清图路线。');

  // Initialize tactical 5x5 dungeon grid
  const initializeBattle = () => {
    // 25 tiles
    // Player starts at 0
    // Boss at 24
    // Enemies at 7, 13
    // Relic buff at 11, 18
    // Hazard AOE at 8, 14, 19
    const newGrid: GridTile[] = Array.from({ length: 25 }, (_, i) => {
      let type: TileType = 'empty';
      let label = '·';
      let isHazard = false;

      if (i === 0) {
        type = 'player';
        label = '🤖';
      } else if (i === 24) {
        type = 'boss';
        label = '👹';
      } else if (i === 7 || i === 13) {
        type = 'enemy';
        label = '👾';
      } else if (i === 11 || i === 18) {
        type = 'relic';
        label = '💎';
      } else if (i === 8 || i === 14 || i === 19) {
        type = 'hazard';
        label = '⚠️';
        isHazard = true;
      }

      // Compute Agent recommended route score based on agent attributes
      let safeRate = 85;
      if (isHazard) safeRate = 18;
      if (type === 'boss') safeRate = 62;
      if (type === 'relic') safeRate = 96;
      if (type === 'enemy') safeRate = 78;

      const noise = Math.floor(Math.random() * 8) - 4;
      const finalRate = Math.min(99, Math.max(10, safeRate + Math.floor(agent.tacticalDepth / 12) + noise));

      return {
        id: i,
        type,
        label,
        isHazard,
        agentRecommendedSafeRate: finalRate
      };
    });

    setGrid(newGrid);
    setPlayerPos(0);
    setBossPos(24);
    setPlayerHp(100);
    setBossHp(300);
    setComboCount(0);
    setTurnCount(0);
    setIsGameOver(false);
    setGameResult(null);
    setIsPlaying(true);
    setAgentLog(`地牢生成完成！消耗 ${energyCost} 点推演能量。检测到 2 处精英怪与 Boss 预警，已为玩家标示最高战术期望值走位。`);
  };

  // Start battle round
  const handleStartRound = () => {
    if (credits < energyCost) {
      setAgentLog('⚠️ 训练能量不足，请在导航栏领取 1,000 免费体验能量。');
      return;
    }
    onUpdateCredits(credits - energyCost);
    initializeBattle();
  };

  // Move player to tile
  const handleTileAction = (targetIndex: number) => {
    if (!isPlaying || isGameOver) return;

    // Check adjacency
    const currRow = Math.floor(playerPos / 5);
    const currCol = playerPos % 5;
    const targetRow = Math.floor(targetIndex / 5);
    const targetCol = targetIndex % 5;
    const dist = Math.abs(currRow - targetRow) + Math.abs(currCol - targetCol);

    if (dist > 1 && targetIndex !== playerPos) {
      setAgentLog(`⚠️ 目标距离过远。当前只能移动或打击相邻 1 格范围（当前位置: #${playerPos + 1}）。`);
      return;
    }

    const targetTile = grid[targetIndex];
    let newHp = playerHp;
    let newBossHp = bossHp;
    let newCombo = comboCount + 1;
    let logMsg = '';

    if (targetTile.type === 'enemy') {
      // Fight enemy
      const dmg = 80 + Math.floor(agent.microExecution * 0.5);
      newCombo += 1;
      logMsg = `⚔️ 突刺命中精英怪！触发暴击造成 ${dmg} 伤害，将其消灭！连击数: ${newCombo}x。`;
      targetTile.type = 'empty';
      targetTile.label = '·';
    } else if (targetTile.type === 'hazard') {
      // Step on hazard
      newHp = Math.max(0, newHp - 25);
      logMsg = `💥 误踩 Boss 地刺陷阱！承受 25 点灼烧伤害（当前生命: ${newHp}/100）。建议听取 Agent 绿色高胜率指引！`;
    } else if (targetTile.type === 'relic') {
      // Collect buff
      newHp = Math.min(100, newHp + 30);
      logMsg = `💎 拾取高阶战术能量石！生命值回复 +30，获得攻击力穿透增强！`;
      targetTile.type = 'empty';
      targetTile.label = '·';
    } else if (targetTile.type === 'boss') {
      // Attack boss
      const dmg = 120 + newCombo * 15 + Math.floor(agent.microExecution * 0.8);
      newBossHp = Math.max(0, newBossHp - dmg);
      logMsg = `🗡️ 破招爆发！打出致命硬直，Boss 损失 ${dmg} HP（剩余: ${newBossHp}/300）！`;

      if (newBossHp <= 0) {
        // Victory!
        setIsGameOver(true);
        setIsPlaying(false);
        setGameResult('win');
        const rewardEnergy = 120;
        onUpdateCredits(credits + rewardEnergy);
        setAgentLog(`🏆 BOSS 已被攻克！完成高难度地牢速通！获得 +${rewardEnergy} 训练能量与大量 Agent 经验！`);
        return;
      }
    } else {
      logMsg = `👣 走位至位置 #${targetIndex + 1}。战术机动拉扯中，规避了敌人远程弹道。`;
    }

    // Update player position
    const updatedGrid = [...grid];
    updatedGrid[playerPos].type = 'empty';
    updatedGrid[playerPos].label = '·';
    updatedGrid[targetIndex].type = 'player';
    updatedGrid[targetIndex].label = '🤖';

    // Check player death
    if (newHp <= 0) {
      setIsGameOver(true);
      setIsPlaying(false);
      setGameResult('loss');
      setAgentLog(`💀 特战特工倒下！Boss 狂暴击穿防线。可在战术工坊提升【微操与APM执行】后再来挑战！`);
    }

    setPlayerPos(targetIndex);
    setPlayerHp(newHp);
    setBossHp(newBossHp);
    setComboCount(newCombo);
    setTurnCount(turnCount + 1);
    setGrid(updatedGrid);
    setAgentLog(logMsg);
  };

  // Agent Auto-Step / Best Move Recommendation
  const handleAgentOptimalMove = () => {
    if (!isPlaying || isGameOver) return;

    const currRow = Math.floor(playerPos / 5);
    const currCol = playerPos % 5;
    const neighbors = [
      { r: currRow - 1, c: currCol },
      { r: currRow + 1, c: currCol },
      { r: currRow, c: currCol - 1 },
      { r: currRow, c: currCol + 1 }
    ].filter(pos => pos.r >= 0 && pos.r < 5 && pos.c >= 0 && pos.c < 5);

    const neighborIndices = neighbors.map(pos => pos.r * 5 + pos.c);
    const neighborTiles = neighborIndices.map(idx => grid[idx]);

    // Prioritize high agent recommended safe rate
    neighborTiles.sort((a, b) => b.agentRecommendedSafeRate - a.agentRecommendedSafeRate);
    const bestMove = neighborTiles[0];

    setAgentLog(`🤖 Agent 执行微操指令: 判定最佳落点为格 #${bestMove.id + 1} (${bestMove.agentRecommendedSafeRate}% 战术期望值)...`);
    handleTileAction(bestMove.id);
  };

  return (
    <section id="simulation-workbench" className="py-12 bg-slate-900 border-t border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Live Action &amp; Strategy Co-Pilot Sandbox (实操与协同演练)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            实操指导 Agent · 协同攻克赛博地牢 Boss
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            体验核心的 “人机协同” 玩法：在 Co-Pilot 模式下，Agent 会在网格上实时计算安全走位与 Boss 盲区；你既可以听从 Agent 战术，也可以随时亲自走位输出！
          </p>
        </div>

        {/* Workbench Card */}
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 5x5 Tactical Dungeon Grid */}
            <div className="lg:col-span-7 flex flex-col items-center">
              
              {/* Play Mode & Status Bar */}
              <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">玩法模式:</span>
                  <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setPlayMode('copilot')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        playMode === 'copilot' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🤖 Co-Pilot (Agent 战术辅助)
                    </button>
                    <button
                      onClick={() => setPlayMode('auto')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        playMode === 'auto' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚡ Agent 全托管
                    </button>
                    <button
                      onClick={() => setPlayMode('manual')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        playMode === 'manual' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      👤 纯手动
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                    <span className="text-slate-200 font-bold tabular-nums">{playerHp}/100</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-purple-300 font-bold tabular-nums">Boss: {bossHp}/300</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold tabular-nums">{comboCount}x Combo</span>
                  </div>
                </div>
              </div>

              {/* 5x5 Matrix Board */}
              <div className="relative p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl max-w-sm sm:max-w-md w-full aspect-square flex flex-col justify-center">
                
                {grid.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                      <Swords className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">赛博地牢战场尚未载入</h4>
                    <p className="text-xs text-slate-400">
                      点击右侧 “开始此局推演” 让 Agent 注入战术前瞻与路线指引
                    </p>
                    <button
                      onClick={handleStartRound}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>立即开始本轮演练</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2 w-full h-full p-2">
                    {grid.map((tile) => {
                      const isCurrentPlayer = tile.id === playerPos;
                      const isBoss = tile.id === bossPos;

                      return (
                        <button
                          key={tile.id}
                          disabled={!isPlaying || isGameOver}
                          onClick={() => handleTileAction(tile.id)}
                          className={`relative rounded-xl border font-bold text-sm sm:text-base flex flex-col items-center justify-center transition-all duration-200 select-none overflow-hidden ${
                            isCurrentPlayer
                              ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-400/50 scale-105 z-10'
                              : isBoss
                              ? 'bg-rose-950/80 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                              : tile.isHazard
                              ? 'bg-amber-950/40 border-amber-600/60 text-amber-300'
                              : tile.type === 'enemy'
                              ? 'bg-purple-950/60 border-purple-500 text-purple-300'
                              : tile.type === 'relic'
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                              : 'bg-slate-800 hover:bg-slate-700/90 border-slate-700 text-slate-200 hover:border-indigo-400/60 shadow-sm active:scale-95'
                          }`}
                        >
                          {/* Main Icon */}
                          <span className="text-lg sm:text-xl">
                            {tile.label}
                          </span>

                          {/* Co-Pilot Tactical Overlay */}
                          {playMode === 'copilot' && !isCurrentPlayer && (
                            <span
                              className={`text-[9px] font-mono leading-none tracking-tight block mt-0.5 ${
                                tile.agentRecommendedSafeRate >= 80
                                  ? 'text-emerald-400 font-bold'
                                  : tile.agentRecommendedSafeRate >= 60
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {tile.agentRecommendedSafeRate}%
                            </span>
                          )}

                          <span className="text-[10px] text-slate-500 opacity-60">
                            #{tile.id + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* In-game quick actions */}
              {isPlaying && (
                <div className="w-full flex items-center justify-between gap-3 mt-4 max-w-sm sm:max-w-md">
                  {playMode === 'copilot' && (
                    <button
                      onClick={handleAgentOptimalMove}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>采纳 Agent 最优战术步</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsGameOver(true);
                      setIsPlaying(false);
                      setAgentLog('战术重置完成，可再次发起挑战。');
                    }}
                    className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>撤出战场</span>
                  </button>
                </div>
              )}

            </div>

            {/* Right Control & Telemetry Panel */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Energy & Round Setup */}
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">可用 Agent 训练推演能量:</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                    {credits} Energy Points
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">单次推演消耗:</span>
                    <span className="text-indigo-300 font-mono font-semibold tabular-nums">
                      {energyCost} Energy
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[20, 50, 100, 200].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        disabled={isPlaying}
                        onClick={() => setEnergyCost(amt)}
                        className={`flex-1 py-1.5 rounded-md text-xs font-mono transition-colors ${
                          energyCost === amt
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {!isPlaying ? (
                  <button
                    onClick={handleStartRound}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md mt-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>开始新一局地牢协同推演</span>
                  </button>
                ) : (
                  <button
                    onClick={handleAgentOptimalMove}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md mt-2"
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>执行 Agent 推荐微操连招</span>
                  </button>
                )}
              </div>

              {/* Agent Real-Time Combat Log */}
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Agent 实时战况指挥日志</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    APM: {agent.microExecution * 4}
                  </span>
                </div>

                <div className="p-3 bg-black/60 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed min-h-[90px]">
                  {agentLog}
                </div>

                <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>生效天赋: 帧级闪避 + 走位风筝引擎 + 危险热力图</span>
                </div>
              </div>

              {/* Guiding Advice Card */}
              <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-900/60 text-xs text-indigo-200 space-y-1.5">
                <span className="font-semibold text-indigo-300 block">💡 玩家与 Agent 协同指南:</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  在 Co-Pilot 模式下，格子上的百分比代表 Agent 综合计算出的 “无伤战术期望值”。你可以自己决定是否去拾取绿色 💎 战术能量，或直接配合 Agent 突破敌方防线集火 Boss！
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
