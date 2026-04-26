import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  content: string;
  image?: {
    data: string;
    mimeType: string;
  };
}

interface ChatInterfaceProps {
  systemInstruction: string;
  onSessionEnd?: (messages: Message[]) => void;
  botName: string;
  placeholder?: string;
}

export default function ChatInterface({ systemInstruction, onSessionEnd, botName, placeholder }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize chat with a welcome message or question from AI
  useEffect(() => {
    if (messages.length === 0) {
      handleSend("Ready to begin.");
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Sila lampirkan fail imej sahaja.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      // Remove data:image/...;base64, prefix
      const base64Data = base64String.split(',')[1];
      setSelectedImage({
        data: base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (customText?: string) => {
    const text = customText || input;
    if ((!text.trim() && !selectedImage) || isLoading) return;

    const currentImage = selectedImage;

    // Add user message to state (except for the initial invisible one)
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: text,
      image: currentImage || undefined
    }]);

    if (!customText) {
      setInput('');
      setSelectedImage(null);
    }
    
    setIsLoading(true);
    const textToSend = text;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Neural Link Offline: Key configuration missing.");
      }

      // Initialize AI right before call to ensure latest context/key
      const ai = new GoogleGenAI({ apiKey });
      
      // Build history
      const conversationHistory = messages.map(m => {
        const parts: any[] = [{ text: m.content }];
        if (m.image) {
          parts.push({
            inlineData: {
              mimeType: m.image.mimeType,
              data: m.image.data
            }
          });
        }
        return { role: m.role, parts };
      });

      const userParts: any[] = [{ text: textToSend }];
      if (currentImage) {
        userParts.push({
          inlineData: {
            mimeType: currentImage.mimeType,
            data: currentImage.data
          }
        });
      }

      const contents = [...conversationHistory, { role: 'user', parts: userParts }];

      // Using the models.generateContent API from the @google/genai skill
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text || "Neural Link Offline: Assessment data not received.";

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
      
      // Check if session ended
      const lowerText = responseText.toLowerCase();
      if (lowerText.includes("understanding level") || 
          lowerText.includes("level 1") || 
          lowerText.includes("level 2") || 
          lowerText.includes("level 3") ||
          lowerText.includes("final assessment") ||
          lowerText.includes("congratulate")) {
        if (onSessionEnd) {
          // Pass the updated history
          const updatedHistory: Message[] = [
            ...messages, 
            { role: 'user', content: textToSend, image: currentImage || undefined }, 
            { role: 'model', content: responseText }
          ];
          onSessionEnd(updatedHistory);
        }
      }

    } catch (error: any) {
      console.error("Neural Link Error:", error);
      let errorMessage = "Neural Link Offline: Connection to the Agency assessment module interrupted. Please ensure your network signal is stable.";
      
      if (error.message.includes("Key configuration missing")) {
        errorMessage = "Neural Link Offline: Key Configuration Missing. Please ensure the Agency Credentials are set in the platform secrets.";
      }

      setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] glass rounded-2xl overflow-hidden border border-cyan-900/30 shadow-2xl">
      {/* Header */}
      <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{botName}</h2>
            <p className="text-[10px] text-cyan-400 mono uppercase tracking-wider">Valence Stability Assessor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse glow-cyan" />
          <span className="text-[10px] text-slate-500 uppercase mono">Live Neural Link</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-950/50">
        <AnimatePresence initial={false}>
          {messages.filter(m => m.content !== "Ready to begin.").map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn("flex items-start gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
            >
              <div className={cn(
                "w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-[10px]",
                msg.role === 'user' ? "bg-cyan-600 text-slate-950" : "bg-slate-800 text-cyan-400"
              )}>
                {msg.role === 'user' ? 'ME' : 'AI'}
              </div>
              <div className={cn(
                "max-w-[80%] flex flex-col gap-2",
                msg.role === 'user' ? "items-end" : "items-start"
              )}>
                {msg.image && (
                  <div className="rounded-xl overflow-hidden border border-slate-700 max-w-sm">
                    <img 
                      src={`data:${msg.image.mimeType};base64,${msg.image.data}`} 
                      alt="Student uploaded" 
                      className="w-full h-auto"
                    />
                  </div>
                )}
                {msg.content && (
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed border shadow-lg shadow-black/20",
                    msg.role === 'user' 
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-50 rounded-tr-none" 
                      : "bg-slate-800/80 border-slate-700 text-slate-200 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-cyan-400/60 text-[10px] mono ml-12"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="tracking-widest uppercase">Processing Neural Signal...</span>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-800">
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 relative inline-block"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-cyan-500/50">
                <img 
                  src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                  alt="Selected preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-3 glass rounded-xl px-4 py-2 border border-slate-700/50"
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder || "Enter your response here..."}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-500 text-slate-200"
          />
          <button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
