import React from 'react';
import { Bot, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-500 py-6 border-t border-slate-900 pb-20 md:pb-6 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2 text-white font-black text-sm">
          <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-3 h-3" />
          </div>
          <span>RANDSEED GAMES</span>
          <span className="text-slate-600 font-normal ml-2">Next-Gen AI Gaming Arcade</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5 text-[11px] text-slate-400">
          <a href="#games-ranking" className="hover:text-white transition-colors">🔥 游戏大厅</a>
          <a href="#agent-nursery" className="hover:text-white transition-colors">🤖 Agent 工坊</a>
          <a href="#" className="hover:text-white transition-colors">服务条款</a>
          <a href="#" className="hover:text-white transition-colors">隐私政策</a>
        </div>

        <p className="text-[11px] text-slate-600">© 2026 Randseed. All rights reserved.</p>

      </div>
    </footer>
  );
};
