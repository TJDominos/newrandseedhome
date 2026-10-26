import React from 'react';
import { UserState } from '../types';
import { Bot, Gamepad2, User } from 'lucide-react';

interface BottomActionBarProps {
  userState: UserState;
  onScrollToAgent: () => void;
  onScrollToGames: () => void;
  onOpenPersonalCenter: () => void;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  userState,
  onScrollToAgent,
  onScrollToGames,
  onOpenPersonalCenter
}) => {
  return (
    <aside
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-4 py-2.5 lg:hidden"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onScrollToAgent}
          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Bot className="w-4 h-4 text-indigo-600" />
          <span className="truncate">{userState.agent.name}</span>
        </button>

        <button
          type="button"
          onClick={onScrollToGames}
          className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Games</span>
        </button>

        <button
          type="button"
          onClick={onOpenPersonalCenter}
          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <User className="w-4 h-4 text-emerald-600" />
          <span>Profile</span>
        </button>
      </div>
    </aside>
  );
};
