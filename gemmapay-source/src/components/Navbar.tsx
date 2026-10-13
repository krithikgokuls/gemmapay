import React from 'react';
import {
  FileText,
  Sparkles,
  Send,
  TrendingUp,
  ShieldCheck,
  Building2,
  Cpu,
} from 'lucide-react';
import { ModelEngineStatus } from '../types';

interface NavbarProps {
  activeTab: 'invoices' | 'create' | 'followups' | 'income' | 'privacy';
  setActiveTab: (tab: 'invoices' | 'create' | 'followups' | 'income' | 'privacy') => void;
  engineStatus: ModelEngineStatus | null;
  overdueCount: number;
  totalPendingDue: number;
  currency: string;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  engineStatus,
  overdueCount,
  totalPendingDue,
  currency,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Open-weight brand tag */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('invoices')}
              className="flex items-center space-x-2.5 text-left group transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition duration-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition">
                    GemmaPay
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Open-Weight
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  AI Freelance Invoicing &amp; Client Growth
                </p>
              </div>
            </button>

            {/* Gemma Status Pill */}
            <div
              onClick={() => setActiveTab('privacy')}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 hover:border-emerald-500/40 hover:text-white cursor-pointer transition"
              title="Powered by Google open-weight Gemma models with zero data training and zero cloud persistence."
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-200">Gemma 2</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">Zero Retention</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Cost: $0/mo</span>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Invoices</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Smart Create</span>
            </button>

            <button
              onClick={() => setActiveTab('followups')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer relative ${
                activeTab === 'followups'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden md:inline">Follow-Up Studio</span>
              <span className="md:hidden">Follow-Up</span>
              {overdueCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 ml-1">
                  {overdueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('income')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'income'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline">Income &amp; Growth</span>
              <span className="md:hidden">Income</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Privacy Vault</span>
            </button>
          </nav>

          {/* Right Actions: Business Profile & Pending Balance */}
          <div className="flex items-center space-x-2.5">
            {totalPendingDue > 0 && (
              <div className="hidden xl:flex flex-col text-right pr-2">
                <span className="text-[11px] text-slate-400 font-medium">To Collect</span>
                <span className="text-xs font-semibold text-amber-400">
                  {currency} {totalPendingDue.toLocaleString()}
                </span>
              </div>
            )}

            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition cursor-pointer"
              title="Configure your freelance business details, billing address, and payment links"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">My Business</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
