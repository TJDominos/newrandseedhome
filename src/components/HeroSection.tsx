import React, { useState } from 'react';
import { UserState, ChatMessage } from '../types';
import { Bot, Sparkles, Send, ArrowRight, RefreshCw, Swords, Shield, Cpu } from 'lucide-react';

interface HeroSectionProps {
  userState: UserState;
  onOpenAuth: () => void;
  onRunSimulationShortcut: (gameId: string) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isAgentThinking: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  userState,
  onOpenAuth,
  onRunSimulationShortcut,
  messages,
  onSendMessage,
  isAgentThinking
}) => {
  const [inputVal, setInputVal] = useState('');

  const suggestedPrompts = [
    '帮我在赛博地牢中制定无伤过第3层Boss的连招策略',
    '在自走棋中推演针对刺客流的极限反制站位',
    '在无限塔防第20波优化迷宫堵口与冰火羁绊路线',
    '训练影之猎刃硬核动作 Agent 的 0.04s 弹刀时机'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSendMessage(inputVal.trim());
    setInputVal('');
  };

  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 overflow-hidden">
      {/* Background ambient subtle gradients */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-indigo-100/60 via-purple-50/30 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Value Proposition Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
          
          {/* Visitor Free Energy & Agent Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs text-indigo-700 font-medium mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Gaming Arena &amp; Strategy Nursery</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-emerald-600">
              {userState.isRegistered ? '已激活 1,000 战术推演能量' : '🎁 1,000 免费 Agent 训练能量待领取'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Train Your Gaming Agent.<br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              Crack Every Boss &amp; Stage.
            </span>
          </h1>

          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            这是一个可以用 Agent 玩游戏、深度养成动作与休闲策略专属 Agent 的平台。自己可以实际操作、实时指导 Agent 走位施法；通过系统培养，攻破各类高难关卡与 Boss 机制！
          </p>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-xs font-semibold text-indigo-600 mb-1 flex items-center gap-1">
                <Bot className="w-3.5 h-3.5" />
                <span>01. Autonomous Agent Play</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Agent 自动代打与极速刷图</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                高频运行数十万次对局推演，毫秒级规避弹幕陷阱，全自动摸索最优解与速通路径。
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-xs font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" />
                <span>02. Human In-The-Loop Co-Pilot</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">真人协同指导与实操操盘</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                随时输入战术指令控制走位偏好，在关键团战或 Boss 狂暴阶段随时接管手动操盘。
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-xs font-semibold text-purple-600 mb-1 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>03. Agent Nursery Evolution</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">深度养成与机制攻克</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                投喂实战录像日志，解锁天赋技能树（帧级弹反、风筝走位），攻克各类硬核游戏。
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Agent Command Console */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          
          {/* Console Header Bar */}
          <div className="px-5 py-3 bg-slate-900 text-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  {userState.isRegistered ? userState.agent.name : 'StrikerBot Assistant (Guest Preview)'}
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                    Online
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  {userState.isRegistered 
                    ? `Level ${userState.agent.level} ${userState.agent.title} · Style: ${userState.agent.tacticalStyle}`
                    : '1,000 免费训练能量待领取 · 输入战术指令即可体验'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!userState.isRegistered && (
                <button
                  onClick={onOpenAuth}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 rounded hover:bg-emerald-900 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>领取 1,000 能量</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Chat Stream & Responses */}
          <div className="p-4 sm:p-5 max-h-80 overflow-y-auto space-y-3 bg-slate-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'agent' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* If response requires auth to proceed (Visitor Registration Gate) */}
                  {msg.requiresAuth && !userState.isRegistered && (
                    <div className="mt-3 pt-3 border-t border-slate-100 bg-amber-50/70 -mx-2 px-3 py-2.5 rounded-lg border border-amber-200/60">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-amber-900 block">
                            🔒 需完成快速注册以授权 Agent 立即执行实盘计算
                          </span>
                          <span className="text-[11px] text-amber-700">
                            注册即领 1,000 免费推演能量，解锁专属战术养成工坊与高难关卡代打
                          </span>
                        </div>
                        <button
                          onClick={onOpenAuth}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded shadow-xs whitespace-nowrap transition-colors shrink-0"
                        >
                          立即注册激活
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action shortcut to run simulation */}
                  {msg.actionPayload && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        推演胜率: <strong className="text-emerald-600 font-mono">{msg.actionPayload.simulatedClearRate}</strong>
                      </span>
                      {msg.actionPayload.gameId && (
                        <button
                          onClick={() => onRunSimulationShortcut(msg.actionPayload!.gameId!)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        >
                          <span>进入战术协同沙盒</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isAgentThinking && (
              <div className="flex gap-3 items-center text-slate-500 text-xs py-2">
                <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span className="italic font-mono">Agent is evaluating battle telemetry, boss telegraphs, and optimal skill chains...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs text-slate-500">
            <span className="text-slate-400 shrink-0 font-medium">快捷战术:</span>
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors border border-slate-200/60 shrink-0 text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="向你的 Agent 下达战术指令（例：帮我在赛博地牢中寻找克制第3层Boss的连招、优化自走棋站位）..."
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isAgentThinking}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>下达指令</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};
