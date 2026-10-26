import React, { useState } from 'react';
import { UserState } from '../types';
import { AGENT_AVATAR_PRESETS } from '../data/games';
import {
  X,
  User,
  Coins,
  Bot,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Sparkles,
  Trophy,
  History,
  Edit2,
  Check
} from 'lucide-react';

interface PersonalCenterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userState: UserState;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onUpdateUsername: (newName: string) => void;
  onOpenAgentTab: (tab: 'chat' | 'evolution' | 'achievements' | 'log') => void;
}

export const PersonalCenterSidebar: React.FC<PersonalCenterSidebarProps> = ({
  isOpen,
  onClose,
  userState,
  onOpenAuth,
  onSignOut,
  onUpdateUsername,
  onOpenAgentTab
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftUser, setDraftUser] = useState(userState.username);

  if (!isOpen) return null;

  const currentAvatarPreset =
    AGENT_AVATAR_PRESETS.find((p) => p.id === userState.agent.avatarId) ||
    AGENT_AVATAR_PRESETS[0];

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftUser.trim()) {
      onUpdateUsername(draftUser.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      {/* Right Slide-Over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white border-l border-slate-200 text-slate-900 shadow-2xl flex flex-col justify-between overflow-y-auto">
          
          {/* Top Section */}
          <div className="p-5 space-y-5">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Personal Center</span>
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3.5">
                {/* User Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 via-indigo-500 to-emerald-400 p-0.5 shadow-sm shrink-0">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-lg font-black text-white">
                    {(userState.username || 'P').slice(0, 1).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {isEditingName ? (
                    <form onSubmit={handleSaveUser} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={draftUser}
                        onChange={(e) => setDraftUser(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-indigo-500 rounded-lg text-slate-900 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg bg-indigo-600 text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 truncate">
                        {userState.username}
                      </h3>
                      <button
                        onClick={() => {
                          setDraftUser(userState.username);
                          setIsEditingName(true);
                        }}
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                        title="Edit Username"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mt-1">
                    {userState.isRegistered ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Account
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Guest Account
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!userState.isRegistered && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Activate Account (Claim 1,000 Credits)</span>
                </button>
              )}
            </div>

            {/* Account Credits Balance */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Tactical Energy Credits</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                {userState.credits.toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1.5">Credits</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Powers AI game co-pilot, speedrun path simulations, and autonomous play.
              </p>
            </div>

            {/* Linked Agent Status Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Linked Combat Agent</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg shadow-2xs">
                  🤖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {userState.agent.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {userState.agent.avatarId === 'custom-prompt' ? 'Custom Prompt Unit' : currentAvatarPreset.name}
                  </div>
                </div>
              </div>

              {/* Quick Jump Buttons to Agent Tabs */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAgentTab('chat');
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200 text-center transition-colors"
                >
                  Tactical Chat
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAgentTab('evolution');
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200 text-center transition-colors"
                >
                  Capabilities
                </button>
              </div>
            </div>

            {/* Gameplay Stats Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Simulated Records</span>
              </span>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">24h Clear Rate</span>
                <span className="font-mono font-bold text-emerald-600">94.2%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Apex APM Execution</span>
                <span className="font-mono font-bold text-slate-900">450 APM</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Boss Mechanics Solved</span>
                <span className="font-mono font-bold text-purple-600">16 / 16</span>
              </div>
            </div>

          </div>

          {/* Bottom Section */}
          <div className="p-5 border-t border-slate-100 bg-white">
            {userState.isRegistered ? (
              <button
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Quick Sign In / Register</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
