import React, { useRef, useEffect, useState } from 'react';
import { GameItem, UserAgent } from '../types';
import { Bot, Play, Pause, RotateCcw, Zap, Sparkles, X, Shield, Swords, Flame, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface ArcadeGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameItem;
  agent: UserAgent;
  onGameVictory: (scoreGained: number) => void;
  initialMode?: 'auto' | 'copilot' | 'manual';
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  color: string;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Gem {
  x: number;
  y: number;
  val: number;
}

export const ArcadeGameModal: React.FC<ArcadeGameModalProps> = ({
  isOpen,
  onClose,
  game,
  agent,
  onGameVictory,
  initialMode = 'copilot'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playMode, setPlayMode] = useState<'auto' | 'copilot' | 'manual'>(initialMode);
  const [score, setScore] = useState<number>(0);
  const [kills, setKills] = useState<number>(0);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [gameLevel, setGameLevel] = useState<number>(1);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [agentLiveAction, setAgentLiveAction] = useState<string>('Agent scanning enemy threat vectors...');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Active game state refs for 60fps loop
  const stateRef = useRef({
    player: { x: 300, y: 220, radius: 12, speed: 4.5, vx: 0, vy: 0 },
    keys: { w: false, a: false, s: false, d: false },
    mouse: { x: 300, y: 220 },
    enemies: [] as Enemy[],
    bullets: [] as Bullet[],
    gems: [] as Gem[],
    lastSpawn: 0,
    lastShoot: 0,
    hp: 100,
    score: 0,
    kills: 0,
    level: 1,
    exp: 0,
    expToNext: 100,
    playMode: initialMode,
    isOver: false,
    agentAPM: 380
  });

  useEffect(() => {
    stateRef.current.playMode = playMode;
  }, [playMode]);

  useEffect(() => {
    if (!isOpen) return;

    stateRef.current.hp = 100;
    stateRef.current.score = 0;
    stateRef.current.kills = 0;
    stateRef.current.level = 1;
    stateRef.current.exp = 0;
    stateRef.current.enemies = [];
    stateRef.current.bullets = [];
    stateRef.current.gems = [];
    stateRef.current.isOver = false;
    setPlayerHp(100);
    setScore(0);
    setKills(0);
    setGameLevel(1);
    setIsGameOver(false);

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Keyboard handlers for manual control
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = true;
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = true;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = true;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = false;
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = false;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = false;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.mouse.x = e.clientX - rect.left;
      stateRef.current.mouse.y = e.clientY - rect.top;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    let lastTime = performance.now();

    // 60FPS Game Loop
    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const st = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background (Cyberpunk dark grid)
      ctx.fillStyle = '#090a10';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle neon grid lines
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (!st.isOver) {
        // 2. Player Movement logic
        if (st.playMode === 'auto') {
          // AI AGENT AUTONOMOUS CONTROL
          // Find nearest enemy and maintain safe kiting radius (120px)
          let targetVx = 0;
          let targetVy = 0;
          if (st.enemies.length > 0) {
            // Find closest enemy
            let closest = st.enemies[0];
            let minDist = 9999;
            for (const en of st.enemies) {
              const d = Math.hypot(en.x - st.player.x, en.y - st.player.y);
              if (d < minDist) {
                minDist = d;
                closest = en;
              }
            }

            // Kiting logic: If too close, retreat; if safe, circle and collect gems
            if (minDist < 120) {
              // Run away from closest enemy
              const angle = Math.atan2(closest.y - st.player.y, closest.x - st.player.x);
              targetVx = -Math.cos(angle) * st.player.speed;
              targetVy = -Math.sin(angle) * st.player.speed;
            } else if (st.gems.length > 0) {
              // Collect gems!
              const gem = st.gems[0];
              const angle = Math.atan2(gem.y - st.player.y, gem.x - st.player.x);
              targetVx = Math.cos(angle) * (st.player.speed * 0.8);
              targetVy = Math.sin(angle) * (st.player.speed * 0.8);
            }
          }

          st.player.x += targetVx;
          st.player.y += targetVy;
          setAgentLiveAction('🤖 Agent executing 450 APM perimeter kiting & gem retrieval...');
        } else {
          // Manual or Co-Pilot: Use WASD
          let vx = 0;
          let vy = 0;
          if (st.keys.w) vy -= 1;
          if (st.keys.s) vy += 1;
          if (st.keys.a) vx -= 1;
          if (st.keys.d) vx += 1;

          if (vx !== 0 && vy !== 0) {
            vx *= 0.7071;
            vy *= 0.7071;
          }
          st.player.x += vx * st.player.speed;
          st.player.y += vy * st.player.speed;

          if (st.playMode === 'copilot') {
            setAgentLiveAction('⚡ Co-Pilot active: Projecting safe perimeter & auto-targeting...');
          } else {
            setAgentLiveAction('🎮 Manual Mode: Full player control enabled.');
          }
        }

        // Clamp player inside canvas
        st.player.x = Math.max(st.player.radius, Math.min(width - st.player.radius, st.player.x));
        st.player.y = Math.max(st.player.radius, Math.min(height - st.player.radius, st.player.y));

        // 3. Spawning Enemies
        if (now - st.lastSpawn > Math.max(300, 1100 - st.level * 100)) {
          st.lastSpawn = now;
          // Spawn around edge
          const side = Math.floor(Math.random() * 4);
          let sx = 0;
          let sy = 0;
          if (side === 0) { sx = Math.random() * width; sy = -15; }
          else if (side === 1) { sx = width + 15; sy = Math.random() * height; }
          else if (side === 2) { sx = Math.random() * width; sy = height + 15; }
          else { sx = -15; sy = Math.random() * height; }

          const isBoss = Math.random() < 0.08 + st.level * 0.02;
          st.enemies.push({
            x: sx,
            y: sy,
            vx: 0,
            vy: 0,
            radius: isBoss ? 20 : 10,
            hp: isBoss ? 8 : 2,
            color: isBoss ? '#f43f5e' : '#a855f7'
          });
        }

        // 4. Auto-aim Lasers / Shooting
        if (now - st.lastShoot > 180) {
          st.lastShoot = now;
          // Target closest enemy
          if (st.enemies.length > 0) {
            let targetEn = st.enemies[0];
            let minDist = 9999;
            for (const en of st.enemies) {
              const d = Math.hypot(en.x - st.player.x, en.y - st.player.y);
              if (d < minDist) {
                minDist = d;
                targetEn = en;
              }
            }

            const angle = Math.atan2(targetEn.y - st.player.y, targetEn.x - st.player.x);
            const bSpeed = 9;

            // Triple laser shot if level >= 2
            if (st.level >= 2) {
              for (const offset of [-0.15, 0, 0.15]) {
                st.bullets.push({
                  x: st.player.x,
                  y: st.player.y,
                  vx: Math.cos(angle + offset) * bSpeed,
                  vy: Math.sin(angle + offset) * bSpeed,
                  radius: 3.5,
                  color: '#38bdf8'
                });
              }
            } else {
              st.bullets.push({
                x: st.player.x,
                y: st.player.y,
                vx: Math.cos(angle) * bSpeed,
                vy: Math.sin(angle) * bSpeed,
                radius: 4,
                color: '#38bdf8'
              });
            }
          }
        }

        // 5. Update & draw bullets
        for (let i = st.bullets.length - 1; i >= 0; i--) {
          const b = st.bullets[i];
          b.x += b.vx;
          b.y += b.vy;

          // Draw bullet with glow
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Check hit enemies
          let bulletRemoved = false;
          for (let j = st.enemies.length - 1; j >= 0; j--) {
            const en = st.enemies[j];
            if (Math.hypot(b.x - en.x, b.y - en.y) < b.radius + en.radius) {
              en.hp -= 1;
              bulletRemoved = true;

              if (en.hp <= 0) {
                // Drop gem
                st.gems.push({ x: en.x, y: en.y, val: 20 });
                st.enemies.splice(j, 1);
                st.kills += 1;
                st.score += 150;
                setKills(st.kills);
                setScore(st.score);
              }
              break;
            }
          }

          if (bulletRemoved || b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
            st.bullets.splice(i, 1);
          }
        }

        // 6. Update & draw enemies
        for (let i = st.enemies.length - 1; i >= 0; i--) {
          const en = st.enemies[i];
          const angle = Math.atan2(st.player.y - en.y, st.player.x - en.x);
          const eSpeed = 1.6 + st.level * 0.15;
          en.x += Math.cos(angle) * eSpeed;
          en.y += Math.sin(angle) * eSpeed;

          // Draw enemy
          ctx.beginPath();
          ctx.arc(en.x, en.y, en.radius, 0, Math.PI * 2);
          ctx.fillStyle = en.color;
          ctx.shadowColor = en.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Check collision with player
          if (Math.hypot(en.x - st.player.x, en.y - st.player.y) < en.radius + st.player.radius) {
            st.hp -= 15;
            setPlayerHp(Math.max(0, st.hp));
            st.enemies.splice(i, 1);

            if (st.hp <= 0) {
              st.isOver = true;
              setIsGameOver(true);
              setAgentLiveAction('💀 战机受损过载。Agent 正在复盘战斗数据...');
            }
          }
        }

        // 7. Update & draw gems
        for (let i = st.gems.length - 1; i >= 0; i--) {
          const g = st.gems[i];
          // Magnet pull if close
          const d = Math.hypot(g.x - st.player.x, g.y - st.player.y);
          if (d < 100) {
            g.x += (st.player.x - g.x) * 0.12;
            g.y += (st.player.y - g.y) * 0.12;
          }

          // Draw gem
          ctx.beginPath();
          ctx.arc(g.x, g.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (d < st.player.radius + 6) {
            st.gems.splice(i, 1);
            st.exp += g.val;
            st.score += 50;
            setScore(st.score);

            if (st.exp >= st.expToNext) {
              st.level += 1;
              st.exp = 0;
              st.expToNext = Math.floor(st.expToNext * 1.5);
              setGameLevel(st.level);
              st.hp = Math.min(100, st.hp + 20); // heal on level up
              setPlayerHp(st.hp);
            }
          }
        }

        // 8. Draw Co-Pilot Visual Guidance Lines (if in Co-Pilot mode)
        if (st.playMode === 'copilot' && st.enemies.length > 0) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(st.player.x, st.player.y, 110, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 9. Draw Player Hero
        ctx.beginPath();
        ctx.arc(st.player.x, st.player.y, st.player.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(st.player.x, st.player.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRestart = () => {
    stateRef.current.hp = 100;
    stateRef.current.score = 0;
    stateRef.current.kills = 0;
    stateRef.current.level = 1;
    stateRef.current.exp = 0;
    stateRef.current.enemies = [];
    stateRef.current.bullets = [];
    stateRef.current.gems = [];
    stateRef.current.isOver = false;
    setPlayerHp(100);
    setScore(0);
    setKills(0);
    setGameLevel(1);
    setIsGameOver(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Top Header Bar (CrazyGames Style Arcade Header) */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {game.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  {game.name}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  NEXT-GEN INSTANT PLAY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                AI Agent Gaming Arena · Real-time Co-Pilot &amp; Autonomous Play
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-950/80 hover:text-rose-400 transition-colors"
              title="Exit Game"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live In-Game HUD Bar */}
        <div className="px-5 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-medium">Control Mode:</span>
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setPlayMode('copilot')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 font-semibold ${
                  playMode === 'copilot'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>⚡ Co-Pilot Assist</span>
              </button>
              <button
                onClick={() => setPlayMode('auto')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 font-semibold ${
                  playMode === 'auto'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3 h-3 text-indigo-200" />
                <span>🤖 Auto-Pilot</span>
              </button>
              <button
                onClick={() => setPlayMode('manual')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 font-semibold ${
                  playMode === 'manual'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Swords className="w-3 h-3" />
                <span>🎮 Manual (WASD)</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">HP</span>
              <span className="text-rose-400 font-bold tabular-nums text-xs">{playerHp}/100</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">SCORE</span>
              <span className="text-emerald-400 font-bold tabular-nums text-xs">{score.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">KILLS</span>
              <span className="text-indigo-400 font-bold tabular-nums text-xs">{kills}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">LEVEL</span>
              <span className="text-amber-400 font-bold tabular-nums text-xs">Lv.{gameLevel}</span>
            </div>
          </div>
        </div>

        {/* The Game Canvas Container */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[380px] sm:min-h-[440px]">
          <canvas
            ref={canvasRef}
            width={760}
            height={440}
            className="w-full h-full max-h-[460px] object-contain cursor-crosshair"
          />

          {/* Live Agent HUD Telemetry Overlay (Top Left of Canvas) */}
          <div className="absolute top-3 left-3 pointer-events-none bg-slate-950/85 backdrop-blur-md border border-indigo-500/40 rounded-xl px-3 py-1.5 text-xs font-mono text-indigo-300 flex items-center gap-2.5 shadow-lg">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-[10px]">
                🤖
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-sans font-medium text-white">{agentLiveAction}</span>
            </div>
          </div>

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-4 text-2xl">
                💀
              </div>
              <h4 className="text-xl font-bold text-white mb-1">Combat Concluded</h4>
              <p className="text-xs text-slate-400 mb-4 font-mono">
                Final Score: {score.toLocaleString()} · Kills: {kills} · Level: Lv.{gameLevel}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={() => {
                    onGameVictory(score);
                    onClose();
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700"
                >
                  Save Report & Return
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Agent Co-Pilot Guidance Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-[11px] leading-snug">
              <strong>{agent.name}</strong>: Micro-kiting engine loaded. In Co-Pilot mode, stay inside the green target reticle for peak DPS!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
            <button
              onClick={() => {
                onGameVictory(score);
                onClose();
              }}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              Complete Session
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
