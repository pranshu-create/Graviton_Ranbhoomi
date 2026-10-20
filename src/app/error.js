"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { motion } from "framer-motion";
import GlitchText from "@/components/GlitchText";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log privately to console or remote logging service without leaking stack trace to user
    console.error("[System Exception]", error);
  }, [error]);

  const cutCorners = { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center relative overflow-hidden px-4 text-center">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(239,68,68,1) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
        {/* Warning Icon Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 border border-red-500/50 flex items-center justify-center mb-8 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
          style={cutCorners}
        >
          <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
        </motion.div>

        {/* Heading */}
        <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-widest uppercase mb-4">
          SYSTEM <GlitchText text="ANOMALY" className="text-red-500" />
        </h1>

        <p className="font-mono text-xs text-red-400 tracking-[0.3em] uppercase mb-6">
          &gt; ERROR_CODE: 500_MAINFRAME_EXCEPTION
        </p>

        {/* Terminal Alert Box */}
        <div 
          className="w-full bg-black/80 border border-red-500/30 p-6 mb-8 text-left font-mono text-xs text-gray-400"
          style={cutCorners}
        >
          <p className="text-red-400 font-bold mb-2">&gt; DIAGNOSTIC REPORT:</p>
          <p className="leading-relaxed">
            An unexpected error occurred during operation processing. Sensitive details have been contained and logged securely.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => reset()}
            style={cutCorners}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black font-mono text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            RELOAD PROTOCOL
          </button>

          <Link
            href="/"
            style={cutCorners}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-gray-300 hover:text-white hover:border-white font-mono text-xs tracking-widest uppercase transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            RETURN TO BASE
          </Link>
        </div>

        <p className="mt-12 font-mono text-[9px] text-gray-700 tracking-[0.4em] uppercase">
          RANBHOOMI 2.0 // GRAVITON ROBOTICS
        </p>
      </div>
    </div>
  );
}
