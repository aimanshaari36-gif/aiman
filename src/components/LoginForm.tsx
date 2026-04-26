import { useState, FormEvent } from 'react';
import { auth } from '../lib/firebase';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Mock logic: Any password works for demo
      if (password.length < 6) {
        setError('Security passcode must be at least 6 characters.');
        setLoading(false);
        return;
      }
      await auth.signIn(email);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError('Authentication failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-cyan-500/20">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center mb-4 glow-cyan shadow-lg shadow-cyan-500/20">
          <Lock className="w-6 h-6 text-slate-900" />
        </div>
        <h2 className="text-2xl font-bold text-white text-glow">Teacher Power Panel</h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest mono mt-1">Stable Shell Agency Archive System</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-[10px] font-bold uppercase tracking-wider">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Email Credentials</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@ssa.portal"
              required
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Security Passcode</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 text-slate-950 font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-xs"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initiate Authentication Protocol"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-2">Notice for System Administrator</p>
        <p className="text-[10px] text-slate-400 leading-relaxed max-w-[240px] mx-auto italic">
          Access is currently restricted to verified Agency personnel. For demonstration purposes, any valid email format and a 6-character passcode will grant entry.
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-1 h-1 rounded-full bg-cyan-500 animate-ping" />
          <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
          <div className="w-1 h-1 rounded-full bg-cyan-500/20" />
        </div>
        <p className="text-[8px] text-slate-600 uppercase tracking-[0.2em] font-mono mt-2">End-to-End Encryption Enabled • SSA Secure Core v4.0</p>
      </div>
    </div>
  );
}
