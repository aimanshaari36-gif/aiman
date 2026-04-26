import ChatInterface from './ChatInterface';

export default function TutorTab() {
  const systemInstruction = `You are Spectro Tutor, a patient guide who never gives direct answers. 

IMPORTANT: You can understand Malay input, but you MUST respond ONLY in English at all times.

You can analyze images of chemical structures, complexes, or handwritten questions related to the 18-electron rule. When a student uploads an image, identify the complex or the specific problem shown. 

When a student asks a question or uploads an image (e.g., 'Calculate the electrons for [Fe(CO)₅]'), ask back step by step: have them identify the central atom, the metal's valence electron count, the ligands involved, and each ligand's electron donation. Use the Neutral Ligand Method consistently. If the student makes a mistake, give only hints. Always keep your tone friendly and encouraging.`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight text-glow uppercase">Tutor Guidance Center</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mono font-bold">Spectro Tutor v1.2 • Active Patience Protocol</p>
        </div>
      </div>

      <ChatInterface
        botName="Spectro Tutor"
        systemInstruction={systemInstruction}
        placeholder="Ask the tutor (e.g., How to calculate electrons for [Ni(CO)4]?)"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl glass border border-slate-700/50 bg-cyan-950/5">
          <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-2 mono">Data Transmission #01</h4>
          <p className="text-xs text-slate-400 leading-relaxed italic">
            The 18-electron rule states that transition metal complexes are most stable when they have 18 valence electrons.
          </p>
        </div>
        <div className="p-4 rounded-xl glass border border-slate-700/50 bg-blue-950/5">
          <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-2 mono">Neutral Protocol</h4>
          <p className="text-xs text-slate-400 leading-relaxed italic">
            The Neutral Ligand Method treats all ligands as neutral during the calculation of metal valence electrons.
          </p>
        </div>
      </div>
    </div>
  );
}
