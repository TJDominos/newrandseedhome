import React, { useState } from 'react';
import { Bot, Sparkles, CheckCircle2, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (username: string, email: string) => void;
  initialPromptPending?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  initialPromptPending
}) => {
  const [username, setUsername] = useState('Bruce');
  const [email, setEmail] = useState('SnS.Bruce@gmail.com');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onRegisterSuccess(username || 'Player1', email || 'player@randseed.ai');
      onClose();
    }, 400);
  };

  const handleQuickDemoRegister = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onRegisterSuccess('Bruce', 'SnS.Bruce@gmail.com');
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-md">
            <Bot className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Activate Your Game Agent
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Register to authorize real-time tactical simulations and receive <strong>1,000 Energy Credits</strong> immediately!
          </p>
        </div>

        {/* Highlighted Benefits */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs space-y-2">
          {initialPromptPending && (
            <div className="p-2 bg-indigo-50/70 border border-indigo-200/60 rounded-lg text-indigo-900 mb-2">
              <span className="font-semibold block">Pending Directive:</span>
              <span className="italic truncate block">“{initialPromptPending}”</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>1,000 free tactical energy credits & starter talent points</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Custom prompt 3D avatar synthesizer & micro-execution unlocks</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Real-time Co-Pilot assist and autonomous play modes</span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Player Nickname
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
              placeholder="Bruce"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
              placeholder="SnS.Bruce@gmail.com"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Activating...' : 'Register & Activate Agent'}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoRegister}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200"
            >
              ⚡ Instant Demo Access (Account: Bruce)
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            By registering, you agree to our platform gaming terms.
          </p>
        </form>

      </div>
    </div>
  );
};
