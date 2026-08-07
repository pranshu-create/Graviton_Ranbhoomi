"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlitchText from "@/components/GlitchText";

const bootLines = [
  "INITIALIZING KERNEL...",
  "LOADING CORE MODULES [OK]",
  "BYPASSING SECURITY PROTOCOLS...",
  "ESTABLISHING SECURE CONNECTION...",
  "GRAVITON HQ MAINFRAME REACHED.",
  "DECRYPTING PAYLOAD..."
];

export default function IntroCinematic() {
  const [showCinematic, setShowCinematic] = useState(false);
  const [phase, setPhase] = useState(0);
  const [bootText, setBootText] = useState([]);

  const handleSkip = () => {
    setShowCinematic(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeenIntro = sessionStorage.getItem("introPlayed");
      if (!hasSeenIntro) {
        setTimeout(() => {
          setShowCinematic(true);
        }, 0);
        sessionStorage.setItem("introPlayed", "true");
        
        // Boot sequence typing
        let lineIdx = 0;
        const bootInterval = setInterval(() => {
          if (lineIdx < bootLines.length) {
            setBootText(prev => [...prev, bootLines[lineIdx]]);
            lineIdx++;
          } else {
            clearInterval(bootInterval);
          }
        }, 300);

        // Sequence timing
        const t1 = setTimeout(() => setPhase(1), 2000); // Phase 1: GRAVITON ROBOTICS PRESENTS
        const t2 = setTimeout(() => setPhase(2), 3500); // Phase 2: RANBHOOMI 2.0
        const t3 = setTimeout(() => setPhase(3), 5500); // Phase 3: THE ARENA AWAKENS
        const t4 = setTimeout(() => handleSkip(), 8000); // Auto-end

        return () => {
          clearInterval(bootInterval);
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          clearTimeout(t4);
        };
      }
    }
  }, []);

  const cutCorners = { clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" };

  if (!showCinematic) return null;

  return (
    <AnimatePresence>
      {showCinematic && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#02050A] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Scanlines and Noise */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay z-0 pointer-events-none animate-glitch-anim"></div>
          
          {/* Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(102,252,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(102,252,241,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

          {/* Crosshairs & Borders */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-neon-cyan/20 w-full transform -translate-y-1/2 z-10"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-neon-cyan/20 h-full transform -translate-x-1/2 z-10"></div>
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-neon-cyan/50 z-10"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-neon-cyan/50 z-10"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-neon-cyan/50 z-10"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-neon-cyan/50 z-10"></div>
          
          {/* Boot Sequence Terminal (Phase 0) */}
          <AnimatePresence>
            {phase === 0 && (
              <motion.div 
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-10 left-10 text-left font-mono text-xs text-neon-cyan z-20"
              >
                {bootText.map((line, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-1"
                  >
                    &gt; {line}
                  </motion.div>
                ))}
                <span className="animate-pulse block mt-2 bg-neon-cyan w-3 h-4"></span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-20 text-center flex flex-col items-center justify-center min-h-[400px] w-full">
            
            {/* Phase 1: LOGO + PRESENTS */}
            <AnimatePresence>
              {phase >= 1 && phase < 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -50, filter: "blur(10px)", transition: { duration: 0.8 } }}
                  className="absolute flex flex-col items-center"
                >
                  <img src="/Raw.png" alt="Graviton" className="w-32 h-32 md:w-40 md:h-40 object-contain mb-8 animate-pulse drop-shadow-[0_0_20px_rgba(138,43,226,0.5)]" />
                  <p className="font-mono text-sm md:text-base text-gray-400 tracking-[0.5em] uppercase border-b border-white/20 pb-4 px-8">
                    GRAVITON ROBOTICS <span className="text-neon-cyan font-bold">PRESENTS</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase 2: RANBHOOMI */}
            <AnimatePresence>
              {phase >= 2 && phase < 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)", transition: { duration: 0.8 } }}
                  className="absolute mt-16 md:mt-40"
                >
                  <h1 className="font-display font-black text-6xl md:text-9xl text-white tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    RAN<span className="text-neon-cyan text-glow-cyan">BHOOMI</span>
                    <span className="block text-2xl md:text-4xl text-electric-purple mt-2 tracking-widest text-glow-purple">2.0</span>
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase 3: AWAKENS */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 2, filter: "blur(30px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  className="absolute flex flex-col items-center bg-black/50 p-6 md:p-12 border border-white/10 backdrop-blur-md shadow-[0_0_50px_rgba(102,252,241,0.2)] w-[90vw] md:w-auto"
                  style={cutCorners}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-[scan_2s_linear_infinite]"></div>
                  <h2 className="font-display font-black text-4xl md:text-7xl text-white uppercase tracking-widest leading-tight">
                    THE ARENA <br/>
                    <GlitchText text="AWAKENS" className="text-neon-cyan text-glow-cyan" />
                  </h2>
                  <div className="mt-8 flex gap-4 items-center">
                    <div className="w-12 h-px bg-white/30"></div>
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">SYSTEM ONLINE</span>
                    <div className="w-12 h-px bg-white/30"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Skip Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-10 z-30"
          >
            <button 
              onClick={handleSkip}
              className="px-6 py-3 bg-white/5 border border-white/20 text-gray-400 hover:text-neon-cyan hover:border-neon-cyan hover:bg-neon-cyan/10 hover:shadow-[0_0_15px_rgba(102,252,241,0.3)] font-mono text-[10px] md:text-xs tracking-[0.4em] uppercase transition-all duration-300"
              style={cutCorners}
            >
              SKIP SEQUENCE
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
