"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Terminal, Loader2 } from "lucide-react";
import GlitchText from "./GlitchText";

export default function JarvisChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };
  const extremeCut = { clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 z-[9000] w-14 h-14 bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all hover:scale-110"
        style={cutCorners}
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] z-[9000] bg-black/80 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col font-mono"
            style={extremeCut}
          >
            {/* Header */}
            <div className="bg-cyan-950/50 border-b border-cyan-500/30 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <span className="font-bold tracking-widest text-cyan-400"><GlitchText text="J.A.R.V.I.S." /></span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20">
              {messages.length === 0 && (
                <div className="text-center text-cyan-500/50 text-xs tracking-widest mt-10 uppercase">
                  Awaiting query, Operative.
                </div>
              )}
              
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 text-xs leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-100' 
                      : 'bg-white/5 border border-white/10 text-gray-300'
                  }`} style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>
                    {m.role === 'assistant' && <p className="text-[9px] text-cyan-500 font-bold mb-1 tracking-widest">JARVIS</p>}
                    {m.role === 'user' && <p className="text-[9px] text-cyan-400 font-bold mb-1 tracking-widest text-right">YOU</p>}
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 text-cyan-500 flex items-center gap-2" style={cutCorners}>
                    <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-cyan-500/30 bg-black">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Query system database..."
                  className="flex-1 bg-transparent border border-cyan-500/30 text-white text-xs px-3 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()} 
                  className="bg-cyan-500 text-black p-2 disabled:opacity-50 hover:bg-cyan-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
