import React from 'react';
import { UserState } from '../types';
import { Bell, ChevronDown } from 'lucide-react';

interface NavbarProps {
  userState: UserState;
  onOpenPersonalCenter: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userState,
  onOpenPersonalCenter
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-900">
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Randseed Brand Logo & Starting Free Credit Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group"
          >
            {/* Randseed Flower Logo */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 p-0.5 shadow-xs flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C13.1 2 14 2.9 14 4V8.5C14.8 7.6 16.1 7 17.5 7C19.99 7 22 9.01 22 11.5C22 12.9 21.4 14.2 20.5 15H15.5C15.8 15.6 16 16.3 16 17C16 19.76 13.76 22 11 22C9.6 22 8.3 21.4 7.5 20.5V15.5C6.7 15.8 6 16 5.2 16C2.9 16 1 14.1 1 11.8C1 10.3 1.8 9 3 8.3V3.5C3 2.67 3.67 2 4.5 2C5.33 2 6 2.67 6 3.5V6.8C6.9 6.3 7.9 6 9 6H9.5C9.2 5.4 9 4.7 9 4C9 2.9 9.9 2 11 2H12Z"
                    fill="#4F46E5"
                  />
                </svg>
              </div>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Randseed
            </span>
          </a>

          {/* Free Credit Pill (matching original randseed.org light green pill) */}
          <button
            onClick={onOpenPersonalCenter}
            className="px-2.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md text-xs font-mono font-bold text-emerald-600 tabular-nums transition-colors"
          >
            {userState.credits.toLocaleString()} Credits
          </button>
        </div>

        {/* Right: User Avatar + Name (Click to open Personal Center Sidebar) & Bell */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenPersonalCenter}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all group"
            title="打开个人中心"
          >
            {/* User Avatar Circle */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-500 p-0.5 shadow-xs">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-black text-white">
                {(userState.username || 'G').slice(0, 1).toUpperCase()}
              </div>
            </div>

            {/* Username */}
            <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">
              {userState.username}
            </span>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={onOpenPersonalCenter}
            className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="个人中心与动态"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
