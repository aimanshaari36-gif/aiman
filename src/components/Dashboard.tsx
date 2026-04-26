import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { Search, ChevronDown, Calendar, User, Target, ClipboardList, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface DiagnosticResult {
  id: string;
  studentName: string;
  date: string;
  level: string;
  score: string;
  answersSummary: string;
  // Fallbacks for old data
  namaPelajar?: string;
  tarikh?: string;
  tahap?: string;
  skor?: string;
  ringkasanJawapan?: string;
}

export default function Dashboard() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<DiagnosticResult | null>(null);

  useEffect(() => {
    const unsubscribe = db.subscribe('diagnosticResults', (data) => {
      setResults(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredResults = results.filter(r => 
    (r.studentName || r.namaPelajar || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.level || r.tahap || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase">Teacher Dashboard</h1>
          <p className="text-slate-400 mt-1 uppercase text-[10px] mono tracking-widest">Performance analysis and student diagnostic data.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search name or level..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#111] border border-[#333] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00e5ff] w-full md:w-64 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 rounded-2xl glass animate-pulse shadow-cyan-500/5" />
          ))}
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-cyan-900/30 glass">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-500">Student Name</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-500">Diagnostic Date</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-500">Understanding Capacity</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-500 text-center">Valence Score</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-500 text-right">Archive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 bg-slate-950/20">
              {filteredResults.map((result) => (
                <motion.tr 
                  layout
                  key={result.id} 
                  className="hover:bg-cyan-500/[0.03] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-cyan-500/30 transition-colors">
                        <User className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-sm font-semibold text-slate-200">{result.studentName || result.namaPelajar}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] mono text-slate-400">
                    <div className="flex items-center gap-2">
                       {result.date || result.tarikh}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      (result.level || result.tahap || '').includes('3') || (result.level || result.tahap || '').toLowerCase().includes('advanced') ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                      (result.level || result.tahap || '').includes('2') || (result.level || result.tahap || '').toLowerCase().includes('intermediate') ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      'bg-orange-500/10 text-orange-400 border-orange-500/30'
                    }`}>
                      {result.level || result.tahap}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-cyan-400 text-sm font-bold glow-cyan">
                    {result.score || result.skor}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedResult(selectedResult?.id === result.id ? null : result)}
                      className="text-[10px] font-bold px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all uppercase tracking-wider"
                    >
                      Open
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 glass rounded-2xl border-dashed border-cyan-900/30">
          <ClipboardList className="w-12 h-12 text-slate-800 mb-4" />
          <h3 className="text-slate-400 font-medium">No diagnostic records in database</h3>
          <p className="text-slate-600 text-xs uppercase mono tracking-widest mt-2">Waiting for data transmission...</p>
        </div>
      )}

      {/* Info Panel / Modal for Selected Result */}
      {selectedResult && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass rounded-2xl p-6 shadow-2xl relative overflow-hidden border-cyan-500/30"
         >
           <div className="absolute top-0 right-0 p-6">
             <button onClick={() => setSelectedResult(null)} className="text-slate-500 hover:text-cyan-400 transition-colors uppercase text-[10px] font-bold tracking-widest">[ Close Archive ]</button>
           </div>
           
           <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
               <Target className="w-6 h-6 text-cyan-400" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-white tracking-tight uppercase">Session Decryption: {selectedResult.studentName || selectedResult.namaPelajar}</h3>
               <p className="text-[10px] text-cyan-400 mono leading-none uppercase tracking-widest">Final Diagnostic Result</p>
             </div>
           </div>

           <div className="bg-slate-950/80 rounded-xl p-6 border border-slate-800 text-sm text-slate-300 leading-relaxed italic shadow-inner">
             {selectedResult.answersSummary || selectedResult.ringkasanJawapan}
           </div>

           <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 shadow-lg">
               <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1 mono">Cognitive Level</span>
               <span className="text-xs text-white font-bold">{selectedResult.level || selectedResult.tahap}</span>
             </div>
             <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 shadow-lg">
               <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1 mono">Electron Ratio</span>
               <span className="text-xs text-cyan-400 font-bold glow-cyan">{selectedResult.score || selectedResult.skor}</span>
             </div>
             <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 shadow-lg">
               <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1 mono">Timestamp</span>
               <span className="text-xs text-white">{selectedResult.date || selectedResult.tarikh}</span>
             </div>
             <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 shadow-lg">
               <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1 mono">SSA File ID</span>
               <span className="text-[8px] text-slate-600 font-mono truncate block">{selectedResult.id}</span>
             </div>
           </div>
         </motion.div>
      )}
    </div>
  );
}
