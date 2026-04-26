/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { auth, User } from './lib/firebase';
import Navigation from './components/Navigation';
import DiagnosticTab from './components/DiagnosticTab';
import TutorTab from './components/TutorTab';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import { motion, AnimatePresence } from 'motion/react';
import { FlaskConical } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'tutor' | 'dashboard'>('diagnostic');
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [studentName, setStudentName] = useState<string>('');
  const [isNameSet, setIsNameSet] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user && activeTab === 'dashboard') {
        setActiveTab('diagnostic');
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  const handleNameSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      setIsNameSet(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-[#e2e8f0] font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background ambient effect */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500 filter blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 filter blur-[120px]" />
      </div>

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLoginClick={() => setShowLogin(true)} 
      />

      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && user ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard />
            </motion.div>
          ) : activeTab === 'tutor' ? (
            <motion.div
              key="tutor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <TutorTab />
            </motion.div>
          ) : (
            <motion.div
              key="diagnostic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              {!isNameSet ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <div className="w-full max-w-md p-8 rounded-2xl glass shadow-lg shadow-cyan-500/5">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30 glow-cyan">
                        <FlaskConical className="w-12 h-12 text-cyan-400" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-2 text-white text-glow">Welcome</h2>
                    <p className="text-slate-400 text-center mb-8 text-sm">Please enter your name to begin the Organometallic Diagnostic Session.</p>
                    <form onSubmit={handleNameSubmit} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        className="w-full bg-cyan-500 text-slate-950 font-bold py-3 rounded-lg hover:bg-cyan-400 transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20"
                      >
                        START DIAGNOSTIC
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <DiagnosticTab studentName={studentName} onClearSession={() => {setIsNameSet(false); setStudentName('');}} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md relative z-10"
            >
              <LoginForm onSuccess={() => setShowLogin(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999]" style={{ backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
}
