"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Target, ShieldAlert, Cpu } from "lucide-react";
import GlitchText from "@/components/GlitchText";
import { useState, useEffect } from "react";

export default function MissionBriefing({ event, onClose }) {
  const [phase, setPhase] = useState(0);
  const [typingText, setTypingText] = useState("");
  
  const missionText = event?.shortDescription || "INITIATING COMBAT PROTOCOLS...";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    let i = 0;
    let timer;
    if (phase >= 2) {
      timer = setInterval(() => {
        setTypingText(missionText.slice(0, i));
        i++;
        if (i > missionText.length) clearInterval(timer);
      }, 30);
    }
    
    return () => clearInterval(timer);
  }, [phase, missionText]);

  const cutCorners = { clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-50"
        >
          <X className="w-8 h-8" />
        </button>

        {phase === 0 && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-mono text-neon-cyan tracking-[0.5em] animate-pulse">DECRYPTING MISSION FILE...</p>
          </div>
        )}

        {phase === 1 && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center"
          >
            <ShieldAlert className="w-24 h-24 text-green-500 mb-4 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]" />
            <p className="font-display text-4xl text-green-500 tracking-widest uppercase">ACCESS GRANTED</p>
          </motion.div>
        )}

        {phase >= 2 && (
          <motion.div 
            initial={{ scale: 1.1, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl h-full max-h-[80vh] bg-[#02050A] border border-white/20 relative overflow-hidden flex flex-col md:flex-row"
            style={cutCorners}
          >
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
            
            {/* Left Col - Visuals */}
            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-white/10 relative p-8 flex flex-col justify-between z-20 bg-black/40">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>
              
              <div>
                <p className="font-mono text-xs text-neon-cyan tracking-[0.3em] uppercase mb-2">TARGET OPERATION</p>
                <h2 className="font-display font-black text-5xl md:text-6xl text-white uppercase tracking-tighter leading-none mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  <GlitchText text={event?.name || "UNKNOWN"} />
                </h2>
                <div className="flex gap-4">
                  <div className="bg-neon-cyan/10 border border-neon-cyan/30 px-3 py-1">
                    <span className="font-mono text-[10px] text-neon-cyan uppercase">CLASS: ALPHA</span>
                  </div>
                  <div className="bg-electric-purple/10 border border-electric-purple/30 px-3 py-1">
                    <span className="font-mono text-[10px] text-electric-purple uppercase">STATUS: LIVE</span>
                  </div>
                </div>
              </div>

              {/* Hologram abstract animation */}
              <div className="relative w-full aspect-square max-w-[300px] mx-auto my-8 border border-white/5 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-neon-cyan/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-4 border border-dashed border-electric-purple/40 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                <div className="absolute inset-10 border border-neon-cyan/40 rounded-full animate-pulse"></div>
                <Target className="w-12 h-12 text-neon-cyan opacity-50" />
                
                {/* Crosshairs */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-neon-cyan/20"></div>
                <div className="absolute left-0 right-0 top-1/2 h-px bg-neon-cyan/20"></div>
              </div>

            </div>

            {/* Right Col - Data */}
            <div className="w-full md:w-1/2 p-8 relative z-20 flex flex-col">
              <div className="flex items-center text-gray-500 font-mono text-xs mb-6 border-b border-white/10 pb-2">
                <Cpu className="w-4 h-4 mr-2" />
                <span>TERMINAL_LINK_ESTABLISHED // STREAMING_DATA</span>
              </div>
              
              <div className="flex-grow">
                <p className="font-mono text-sm text-neon-cyan mb-2 uppercase tracking-widest">&gt; MISSION_OBJECTIVE</p>
                <p className="font-mono text-sm text-gray-300 min-h-[100px] leading-relaxed">
                  {typingText}
                  <span className="inline-block w-2 h-4 bg-neon-cyan ml-1 animate-pulse"></span>
                </p>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-black/50 border border-white/10 p-4" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>
                    <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mb-1">TEAM SIZE</p>
                    <p className="font-display text-xl text-white">{event?.teamSize || "TBD"}</p>
                  </div>
                  <div className="bg-black/50 border border-white/10 p-4" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>
                    <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mb-1">PRIZE POOL</p>
                    <p className="font-display text-xl text-white">{event?.prizePool || "TBD"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-mono text-sm font-bold tracking-[0.2em] uppercase hover:bg-neon-cyan hover:text-black transition-all hover:shadow-[0_0_20px_rgba(102,252,241,0.6)] flex items-center justify-center gap-2"
                  style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}
                >
                  <Play className="w-4 h-4" /> ACCEPT MISSION
                </button>
              </div>
            </div>
            
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
