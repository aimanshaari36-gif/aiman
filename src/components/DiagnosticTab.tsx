import { useState } from 'react';
import ChatInterface from './ChatInterface';
import { db, auth } from '../lib/firebase';
import { CheckCircle2, RotateCcw } from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleMockError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Mock DB Error: ', JSON.stringify(errInfo));
}
import { motion, AnimatePresence } from 'motion/react';

interface DiagnosticTabProps {
  studentName: string;
  onClearSession: () => void;
}

export default function DiagnosticTab({ studentName, onClearSession }: DiagnosticTabProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const systemInstruction = `You are Spectro Diagnostic, a knowledge assessor. Your mission is to diagnose the student's understanding level of the 18-Electron Rule. 

IMPORTANT: You can understand Malay input, but you MUST respond ONLY in English at all times.

Start by asking a basic question, for example: 'What do you understand about the 18-Electron Rule?'. Based on their response, ask 3-5 follow-up questions of increasing difficulty, covering carbonyl ligands, hapticity (η³, η⁵), and NO ligands (linear vs bent). If the student answers incorrectly, provide the correct explanation along with a worked calculation example. 

At the end of the session, you MUST provide a final summary with the following EXACT format:
---
FINAL ASSESSMENT
Level: [Level 1/2/3]
Score: [X/Y]
Summary: [Brief student summary]
---
Then congratulate them and state that their results have been sent to the SSA Agency.`;

  const handleSessionEnd = async (messages: any[]) => {
    // Only automatically save if it hasn't been saved yet
    if (isSaved || saveLoading) return;

    setSaveLoading(true);
    const collectionPath = 'diagnosticResults';
    try {
      const lastAiMessage = messages[messages.length - 1].content;
      
      // Flexible extraction for Level and Score
      const levelMatch = lastAiMessage.match(/(?:Level|Tahap)\s+(\d+[:\s\-\w]+)/i);
      const scoreMatch = lastAiMessage.match(/(?:score|skor)[:\s]+(\d+[\s]*\/[\s]*\d+)/i);
      
      const sessionData = {
        studentName: studentName,
        date: new Date().toLocaleString(),
        level: levelMatch ? levelMatch[0].trim() : "Diagnostic level captured in summary",
        score: scoreMatch ? scoreMatch[1].trim() : "Results in summary",
        answersSummary: lastAiMessage,
      };

      await db.add(collectionPath, sessionData);
      setIsSaved(true);
    } catch (error) {
      handleMockError(error, OperationType.WRITE, collectionPath);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight text-glow uppercase">Diagnostic Test: {studentName}</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mono font-bold">Identifying Valence Potential</p>
          </div>
        </div>
        <button
          onClick={onClearSession}
          className="text-[10px] px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg bg-red-500/5 hover:bg-red-500/20 font-bold uppercase tracking-widest transition-all"
        >
          <RotateCcw className="w-3 h-3 inline-block mr-1 group-hover:rotate-180 transition-transform" />
          CLEAR SESSION
        </button>
      </div>

      <ChatInterface
        botName="Spectro Diagnostic"
        systemInstruction={systemInstruction}
        onSessionEnd={handleSessionEnd}
        placeholder="Enter your response here..."
      />

      <AnimatePresence>
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center glow-cyan shadow-lg shadow-cyan-500/20">
              <CheckCircle2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h4 className="font-bold text-cyan-400 text-sm uppercase tracking-tight">Data Successfully Archived</h4>
              <p className="text-xs text-slate-400">Your diagnostic results have been recorded in the SSA core database.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
