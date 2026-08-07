"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal as TerminalIcon } from "lucide-react";

const TARGET_PHRASE = "RANBHOOMI PROTOCOL OMEGA INITIATED";

export default function HackMinigame({ onClose }) {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState("boot"); // boot, play, win, fail
  const [bootLog, setBootLog] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const inputRef = useRef(null);

  useEffect(() => {
    if (phase === "boot") {
      const logs = [
        "INITIALIZING NEURAL LINK...",
        "BYPASSING FIREWALL (LEVEL 4)...",
        "ACCESSING MAINFRAME BACKDOOR...",
        "DECRYPTING ARCHIVES...",
        "WARNING: UNAUTHORIZED ACCESS DETECTED",
        "INITIATING COUNTER-MEASURES..."
      ];
      
      let i = 0;
      const interval = setInterval(() => {
        const currentLog = logs[i];
        setBootLog(prev => [...prev, currentLog]);
        i++;
        if (i >= logs.length) {
          clearInterval(interval);
          setTimeout(() => setPhase("play"), 1000);
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "play") {
      inputRef.current?.focus();
      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          setTimeLeft(prev => {
            if (prev - 1 <= 0) {
              setPhase("fail");
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, timeLeft]);

  const handleChange = (e) => {
    const val = e.target.value.toUpperCase();
    setInput(val);
    if (val === TARGET_PHRASE) {
      setPhase("win");
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm font-mono text-green-500 selection:bg-green-500 selection:text-black"
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
        
        <div className="w-full max-w-3xl bg-[#051005] border-2 border-green-500 p-1 relative shadow-[0_0_50px_rgba(34,197,94,0.2)]">
          {/* Header */}
          <div className="bg-green-500 text-black flex items-center justify-between px-3 py-1 text-xs md:text-sm font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4" />
              <span>TERMINAL // ROOT ACCESS</span>
            </div>
            <button onClick={onClose} className="hover:bg-black hover:text-green-500 px-2 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-10 h-[60vh] flex flex-col overflow-y-auto relative scrollbar-hide">
            {phase === "boot" && (
              <div className="space-y-2 text-sm">
                {bootLog.map((log, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={log?.includes("WARNING") ? "text-red-500" : ""}
                  >
                    {"> "}{log}
                  </motion.div>
                ))}
                <span className="animate-pulse">_</span>
              </div>
            )}

            {phase === "play" && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                <div>
                  <h2 className="text-xl md:text-3xl font-bold mb-2">SYSTEM LOCKDOWN IMMINENT</h2>
                  <p className="text-green-600">ENTER OVERRIDE PHRASE TO ABORT:</p>
                </div>

                <div className="text-4xl md:text-5xl font-black text-red-500 tracking-widest animate-pulse">
                  00:{timeLeft.toString().padStart(2, '0')}
                </div>

                <div className="w-full max-w-lg space-y-2">
                  <p className="text-xs text-green-700 uppercase tracking-widest text-left">TARGET PHRASE:</p>
                  <div className="w-full border border-green-700 bg-black p-4 text-center tracking-widest opacity-50 select-none">
                    {TARGET_PHRASE}
                  </div>
                  
                  <div className="relative mt-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500">{">"}</span>
                    <input 
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={handleChange}
                      className="w-full bg-transparent border-2 border-green-500 text-green-500 p-4 pl-10 focus:outline-none focus:border-white focus:text-white transition-colors tracking-widest text-center uppercase"
                      spellCheck="false"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            )}

            {phase === "win" && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-widest">ACCESS GRANTED</h2>
                <p className="text-green-500 text-lg uppercase">System Lockdown Aborted. You are in.</p>
                <div className="mt-8 border border-green-500 p-4 inline-block bg-green-500/10">
                  <p className="text-xs text-green-600 mb-1">SECRET CLEARANCE CODE:</p>
                  <p className="text-2xl font-bold tracking-widest text-white">GRAVITON-X-99</p>
                </div>
                <button onClick={onClose} className="mt-8 px-8 py-3 bg-green-500 text-black font-bold hover:bg-white transition-colors uppercase tracking-widest">
                  EXIT TERMINAL
                </button>
              </div>
            )}

            {phase === "fail" && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-red-500 mb-2 tracking-widest">ACCESS DENIED</h2>
                <p className="text-red-400 text-lg uppercase">System Lockdown Initiated. IP Logged.</p>
                <button onClick={onClose} className="mt-8 px-8 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-colors uppercase tracking-widest">
                  CLOSE CONNECTION
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
