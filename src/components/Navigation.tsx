import { User, auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { LogIn, LogOut, LayoutDashboard, BrainCircuit, GraduationCap } from 'lucide-react';

interface NavigationProps {
  activeTab: 'diagnostic' | 'tutor' | 'dashboard';
  setActiveTab: (tab: 'diagnostic' | 'tutor' | 'dashboard') => void;
  user: User | null;
  onLoginClick: () => void;
}

export default function Navigation({ activeTab, setActiveTab, user, onLoginClick }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-8 border-b border-cyan-900/50 glass">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center glow-cyan shadow-lg shadow-cyan-500/20">
          <BrainCircuit className="w-6 h-6 text-slate-900" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-cyan-400 text-glow">SSA PORTAL</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 leading-none">Stable Shell Agency</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('diagnostic')}
          className={cn(
            "px-6 py-2 rounded-md text-sm font-semibold transition-all",
            activeTab === 'diagnostic' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:bg-slate-800"
          )}
        >
          <span className="hidden sm:inline">DIAGNOSTIC</span>
          <BrainCircuit className="w-4 h-4 sm:hidden" />
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={cn(
            "px-6 py-2 rounded-md text-sm font-semibold transition-all",
            activeTab === 'tutor' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:bg-slate-800"
          )}
        >
          <span className="hidden sm:inline">TUTOR HELP</span>
          <GraduationCap className="w-4 h-4 sm:hidden" />
        </button>
        {user && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "px-6 py-2 rounded-md text-sm font-semibold transition-all",
              activeTab === 'dashboard' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:bg-slate-800"
            )}
          >
            <span className="hidden sm:inline">TEACHER</span>
            <LayoutDashboard className="w-4 h-4 sm:hidden" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-[10px] mono text-slate-400 hidden lg:block uppercase tracking-wider">{user.email?.split('@')[0]}</span>
            <button
              onClick={() => auth.signOut()}
              className="p-2 rounded-full border border-slate-700 bg-slate-900 group hover:border-red-500/50 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-slate-300 group-hover:text-red-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-700 bg-slate-900 hover:border-cyan-500/50 transition-all group"
          >
            <span className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-cyan-500 shadow-[0_0_8px_rgba(100,116,139,0.5)] transition-all"></span>
            <span className="text-xs font-medium text-slate-300">Teacher Login</span>
          </button>
        )}
      </div>
    </nav>
  );
}
