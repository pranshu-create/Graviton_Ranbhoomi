"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Home, Radio, AlertTriangle } from "lucide-react";

const TERMINAL_LINES = [
  { text: "> INITIALIZING SPATIAL NAVIGATION SYSTEM...", delay: 0 },
  { text: "> PARSING TARGET COORDINATES...", delay: 0.4 },
  { text: "> ERROR: SECTOR NOT FOUND IN NETWORK MAP", delay: 0.9, isError: true },
  { text: "> ATTEMPTING ALTERNATE ROUTE... FAILED", delay: 1.4, isError: true },
  { text: "> SIGNAL LOST. RETURNING TO SAFE COORDINATES.", delay: 1.9, isWarning: true },
];

const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function GlitchNumber({ digit }) {
  const [display, setDisplay] = useState(digit);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsGlitching(true);
        let count = 0;
        const scramble = setInterval(() => {
          setDisplay(GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]);
          count++;
          if (count > 6) {
            clearInterval(scramble);
            setDisplay(digit);
            setIsGlitching(false);
          }
        }, 50);
      }
    }, 2000 + Math.random() * 1500);
    return () => clearInterval(glitchInterval);
  }, [digit]);

  return (
    <span className="relative inline-block">
      <span
        className="relative z-10"
        style={{
          color: isGlitching ? "#ef4444" : undefined,
          textShadow: isGlitching
            ? "2px 2px 0 rgba(239,68,68,0.5), -2px -2px 0 rgba(77,184,255,0.5)"
            : undefined,
        }}
      >
        {display}
      </span>
      {isGlitching && (
        <>
          <span
            className="absolute inset-0 text-neon-cyan opacity-50 z-0 select-none"
            style={{ transform: "translate(-3px, 2px)", clipPath: "inset(30% 0 40% 0)" }}
          >
            {digit}
          </span>
          <span
            className="absolute inset-0 text-red-500 opacity-50 z-0 select-none"
            style={{ transform: "translate(3px, -2px)", clipPath: "inset(50% 0 20% 0)" }}
          >
            {digit}
          </span>
        </>
      )}
    </span>
  );
}

function RadarPulse() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-neon-cyan/10"
          initial={{ width: 80, height: 80, opacity: 0.6 }}
          animate={{ width: 500, height: 500, opacity: 0 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function NotFound() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    TERMINAL_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(i + 1);
        if (i === TERMINAL_LINES.length - 1) {
          setTimeout(() => setShowContent(true), 400);
        }
      }, line.delay * 1000);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center relative overflow-hidden px-4">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(77,184,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(77,184,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radar pulses centered */}
      <RadarPulse />

      {/* Scanline across screen */}
      <motion.div
        className="absolute left-0 w-full h-px bg-neon-cyan/10 pointer-events-none"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 text-center max-w-3xl w-full flex flex-col items-center">

        {/* Signal lost icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-16 h-16 border border-red-500/50 flex items-center justify-center mx-auto relative"
            style={{
              clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
              boxShadow: "0 0 30px rgba(239,68,68,0.3)",
            }}
          >
            <AlertTriangle className="w-7 h-7 text-red-500" />
            <motion.div
              className="absolute inset-0 border border-red-500/30"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
            />
          </div>
        </motion.div>

        {/* 404 Giant Number */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-display font-black text-[20vw] md:text-[15rem] leading-none tracking-tighter select-none relative"
          style={{
            color: "transparent",
            WebkitTextStroke: "2px rgba(77,184,255,0.3)",
            textShadow: "0 0 80px rgba(77,184,255,0.15)",
          }}
        >
          <GlitchNumber digit="4" />
          <GlitchNumber digit="0" />
          <GlitchNumber digit="4" />
        </motion.div>

        {/* Signal Not Found label */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative flex items-center justify-center w-full max-w-lg mx-auto mb-10"
        >
          <div className="w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent absolute" />
          <div className="bg-[#0B0C10] px-6 relative z-10 flex items-center gap-3">
            <Radio className="w-4 h-4 text-red-500" />
            <span className="font-mono text-xs text-red-400 tracking-[0.4em] uppercase">SIGNAL_NOT_FOUND</span>
            <Radio className="w-4 h-4 text-red-500" />
          </div>
        </motion.div>

        {/* Terminal Output */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-xl bg-black/80 border border-white/10 p-5 mb-10 text-left"
          style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
        >
          <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-mono text-[9px] text-gray-600 ml-2 tracking-widest">GRAVITON_NAV_SYSTEM v2.0</span>
          </div>
          {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`font-mono text-[10px] leading-relaxed ${
                line.isError ? "text-red-400" :
                line.isWarning ? "text-yellow-400" :
                "text-gray-500"
              }`}
            >
              {line.text}
              {i === visibleLines - 1 && visibleLines < TERMINAL_LINES.length && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="text-neon-cyan"
                > _</motion.span>
              )}
            </motion.p>
          ))}
        </motion.div>

        {/* Description */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 w-full"
            >
              <p className="font-mono text-xs text-gray-400 max-w-md mx-auto leading-relaxed tracking-wide">
                The coordinates you attempted to navigate to do not exist within the known Graviton network.
                The sector may have been decommissioned, relocated, or never existed.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-mono text-xs bg-neon-cyan/10 border border-neon-cyan text-neon-cyan px-8 py-3 hover:bg-neon-cyan hover:text-black transition-all duration-300 tracking-widest group"
                  style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                >
                  <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  RETURN TO BASE
                </Link>
                <Link
                  href="/comm-center"
                  className="flex items-center gap-2 font-mono text-xs border border-white/20 text-gray-400 px-8 py-3 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all duration-300 tracking-widest group"
                  style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                >
                  <Radio className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  COMM CENTER
                </Link>
              </div>

              {/* Footer text */}
              <p className="font-mono text-[9px] text-gray-700 uppercase tracking-[0.4em]">
                RANBHOOMI 2.0 — GRAVITON ROBOTICS // ERROR CODE: 404_SECTOR_VOID
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
