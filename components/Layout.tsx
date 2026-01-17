
import React from 'react';
import { AppView } from '../types';
import { Home, Plus, BookOpen, Settings, Sprout, LayoutGrid } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onScan?: () => void;
}

export const BrandIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 54L83 67L68 94H32L17 67L50 54Z" fill="#10B981" />
    <path d="M50 54V80L17 67L50 54Z" fill="#34D399" />
    <path d="M50 80L83 67L50 54V80Z" fill="#059669" />
    <path d="M32 94L17 67L50 80L32 94Z" fill="#047857" />
    <path d="M68 94L83 67L50 80L68 94Z" fill="#065F46" />
    <path d="M50 54C50 45 48 38 52 30" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
    <path d="M52 30C52 30 45 15 65 5C65 5 72 20 52 30Z" fill="#10B981" />
    <path d="M52 30C52 30 50 45 70 35C70 35 75 20 52 30Z" fill="#34D399" />
  </svg>
);

const Logo: React.FC = () => (
  <div className="relative group">
    <div className="absolute inset-0 bg-emerald-500/20 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[22px] flex items-center justify-center shadow-xl relative overflow-hidden transition-all duration-300 group-hover:scale-105 border border-white/10 group-hover:shadow-2xl group-hover:shadow-emerald-500/10">
      <BrandIcon className="w-10 h-10 transition-transform duration-300 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent pointer-events-none"></div>
    </div>
  </div>
);

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, onScan }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-inherit shadow-2xl relative border-x border-slate-200/30 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-5 bg-white/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30 border-b border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <Logo />
          <div>
            <h1 className="text-2xl font-black leading-none font-display text-slate-900 tracking-tighter uppercase">Plant Triage</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              <p className="text-[9px] uppercase font-black tracking-[0.25em] text-slate-400">System Core v3.8.5</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onViewChange(currentView === AppView.SETTINGS ? AppView.HOME : AppView.SETTINGS)}
          className={`relative group w-12 h-12 rounded-[18px] transition-all duration-300 active:scale-90 flex items-center justify-center overflow-hidden shadow-sm ${currentView === AppView.SETTINGS ? 'bg-slate-900 border-slate-700 text-emerald-400 rotate-90 shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md'}`}
        >
          <div className="absolute top-0 right-0 p-1">
            <Sprout className={`w-3 h-3 text-emerald-500 transition-all duration-500 ${currentView === AppView.SETTINGS ? 'scale-110 opacity-100' : 'scale-0 opacity-0'}`} />
          </div>
          <Settings className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" />
        </button>
      </header>

      <main className="flex-1 relative">
        {children}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/90 backdrop-blur-2xl border-t border-slate-100/80 p-4 pb-8 flex items-center z-40 shadow-[0_-8px_32px_rgba(0,0,0,0.06)]">
        <div className="flex-1 flex justify-around pr-8">
          <button
            onClick={() => onViewChange(AppView.HOME)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${currentView === AppView.HOME ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-emerald-500'}`}
          >
            <Home className={`w-6 h-6 transition-all duration-300 ${currentView === AppView.HOME ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
          </button>
        </div>

        {/* Center Scan Button - Opens camera directly */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-4">
          <button
            onClick={onScan}
            className="group relative"
          >
            <div className="absolute inset-0 rounded-full blur-lg bg-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative bg-emerald-500 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95">
              <Plus className="w-7 h-7 text-white relative z-10" />
            </div>

            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Scan</span>
            </div>
          </button>
        </div>

        <div className="flex-1 flex justify-around pl-8">
          <button
            onClick={() => onViewChange(AppView.DIARY)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${currentView === AppView.DIARY ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-emerald-500'}`}
          >
            <BookOpen className={`w-6 h-6 transition-all duration-300 ${currentView === AppView.DIARY ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[8px] font-black uppercase tracking-widest">Log</span>
          </button>

          <button
            onClick={() => onViewChange(AppView.SETTINGS)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 md:hidden ${currentView === AppView.SETTINGS ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-emerald-500'}`}
          >
            <LayoutGrid className={`w-6 h-6 transition-all duration-300 ${currentView === AppView.SETTINGS ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[8px] font-black uppercase tracking-widest">Apps</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;

